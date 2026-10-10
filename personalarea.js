/* =========================================================
   ID VERIFICATION — COMPLETE JAVASCRIPT
   Features:
   1. Document type selection
   2. Front / Back photo upload and preview
   3. Passport back-side handling
   4. Camera and selfie capture
   5. Manual submission to Supabase
   6. Unverified / Pending / Verified states
   7. Verify Again
   8. Restore status after page reload
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. CONFIGURATION — START
    ===================================================== */

    const IDV_CONFIG = {
        table: "user_data",
        storageBucket: "id-verification",
        maxFileSize: 5 * 1024 * 1024,
        allowedTypes: ["image/jpeg", "image/png"],
        cameraWidth: 640,
        cameraHeight: 480,
        cameraFacingMode: "user",

        // Database column names used by this workflow.
        columns: {
            email: "email",
            status: "kyc_status",
            documentType: "id_document_type",
            frontPath: "id_front_path",
            backPath: "id_back_path",
            selfiePath: "selfie_path",
            submittedAt: "kyc_submitted_at"
        }
    };

    /* =====================================================
       CONFIGURATION — END
    ===================================================== */


    /* =====================================================
       2. STATE — START
    ===================================================== */

    const state = {
        supabase: null,
        user: null,
        profile: null,

        frontFile: null,
        backFile: null,
        selfieBlob: null,
        selfieObjectUrl: null,

        cameraStream: null,
        cameraReady: false,
        isSubmitting: false,
        isLoading: false,
        isReverification: false,
        isPending: false,
        isVerified: false,

        faceDetectionInterval: null,
        faceDetection: null,
        faceDetectionReady: false,
        faceStableFrames: 0,
        faceDetectionBusy: false,

        previousSubmitButtonText: null
    };

    /* =====================================================
       STATE — END
    ===================================================== */


    /* =====================================================
       3. HTML ELEMENT REFERENCES — START
    ===================================================== */

    const el = {};

    function cacheElements() {
        const ids = [
            "idVerificationSection",
            "idVerificationDescription",
            "idVerificationStatusBadge",

            "idVerificationForm",
            "idDocumentType",

            "idFrontUploadCard",
            "idFrontUploadArea",
            "idFrontFile",
            "idFrontPreview",
            "idFrontFileName",
            "idFrontStatus",
            "retakeIdFrontBtn",

            "idBackUploadCard",
            "idBackUploadArea",
            "idBackFile",
            "idBackPreview",
            "idBackFileName",
            "idBackStatus",
            "retakeIdBackBtn",
            "idBackSideHint",

            "faceCameraPreview",
            "faceCameraVideo",
            "faceCapturedPreview",
            "faceCaptureCanvas",
            "faceCameraPlaceholder",
            "faceCameraGuide",
            "faceCameraInstructions",
            "startFaceCameraBtn",
            "captureFaceBtn",
            "retakeFacePhotoBtn",
            "stopFaceCameraBtn",
            "faceVerificationStatus",
            "faceCaptureReference",

            "idVerificationFormMessage",
            "submitIdVerificationBtn",

            "idVerificationPendingSection",
            "submittedIdDocumentStatus",
            "submittedSelfieStatus",

            "verificationProcessSection",
            "processIdDocument",
            "processIdDocumentStatus",
            "processIdDocumentBadge",
            "processSelfie",
            "processSelfieStatus",
            "processSelfieBadge",
            "processAdminReview",
            "processAdminReviewStatus",
            "processAdminReviewBadge",

            "idVerificationApprovedSection",
            "identityVerifiedDescription",
            "approvedIdDocument",
            "approvedIdDocumentStatus",
            "approvedSelfie",
            "approvedSelfieStatus",
            "approvedAdminReview",
            "approvedAdminReviewStatus",

            "verifyAgainSection",
            "verifyAgainBtn"
        ];

        ids.forEach(function (id) {
            el[id] = document.getElementById(id);
        });
    }

    function getSupabaseClient() {
        return window.supabaseClient || window.supabase || null;
    }

    function requireElement(id) {
        if (!el[id]) {
            console.error("[ID Verification] Missing HTML element:", id);
            return false;
        }

        return true;
    }

    /* =====================================================
       HTML ELEMENT REFERENCES — END
    ===================================================== */


    /* =====================================================
       4. GENERAL UI HELPERS — START
    ===================================================== */

    function setHidden(element, hidden) {
        if (!element) return;

        element.hidden = Boolean(hidden);

        if (hidden) {
            element.setAttribute("hidden", "");
        } else {
            element.removeAttribute("hidden");
        }
    }

    function setMessage(message, type) {
        const box = el.idVerificationFormMessage;

        if (!box) return;

        if (!message) {
            box.textContent = "";
            box.removeAttribute("data-type");
            setHidden(box, true);
            return;
        }

        box.textContent = message;

        if (type) {
            box.dataset.type = type;
        } else {
            box.removeAttribute("data-type");
        }

        setHidden(box, false);
    }

    function setStatusBadge(status, text) {
        const badge = el.idVerificationStatusBadge;

        if (!badge) return;

        badge.dataset.status = status;
        badge.textContent = text;
    }

    function normalizeStatus(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
    }

    function isApprovedStatus(status) {
        const value = normalizeStatus(status);

        return [
            "approved",
            "verified",
            "complete",
            "completed"
        ].includes(value);
    }

    function isPendingStatus(status) {
        const value = normalizeStatus(status);

        return [
            "pending",
            "pendingverification",
            "underreview",
            "inreview",
            "submitted"
        ].includes(value);
    }

    function isRejectedStatus(status) {
        const value = normalizeStatus(status);

        return [
            "rejected",
            "declined",
            "denied"
        ].includes(value);
    }

    function setButtonLoading(button, loading, loadingText) {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText || "Please wait...";
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        } else {
            button.textContent =
                button.dataset.originalText ||
                button.textContent;

            delete button.dataset.originalText;
            button.removeAttribute("aria-busy");
        }
    }

    function formatError(error) {
        if (!error) return "An unexpected error occurred.";

        return error.message ||
            error.error_description ||
            String(error);
    }

    /* =====================================================
       GENERAL UI HELPERS — END
    ===================================================== */


    /* =====================================================
       5. CURRENT USER AND PROFILE — START
    ===================================================== */

    async function getAuthenticatedUser() {
        const client = state.supabase;

        if (!client || !client.auth) {
            throw new Error(
                "Supabase client is not configured. Check window.supabaseClient."
            );
        }

        const result = await client.auth.getUser();

        if (result.error) {
            throw result.error;
        }

        if (!result.data || !result.data.user) {
            throw new Error("Please log in before verifying your identity.");
        }

        return result.data.user;
    }

    async function loadUserProfile() {
        const client = state.supabase;
        const email = state.user && state.user.email;

        if (!email) {
            throw new Error("The logged-in account has no email address.");
        }

        const result = await client
            .from(IDV_CONFIG.table)
            .select("*")
            .eq(IDV_CONFIG.columns.email, email)
            .maybeSingle();

        if (result.error) {
            throw result.error;
        }

        if (!result.data) {
            throw new Error(
                "Your user_data profile was not found. Check the profile record before submitting."
            );
        }

        state.profile = result.data;

        return result.data;
    }

    /* =====================================================
       CURRENT USER AND PROFILE — END
    ===================================================== */


    /* =====================================================
       6. FILE VALIDATION — START
    ===================================================== */

    function validateImageFile(file) {
        if (!file) {
            return {
                valid: false,
                message: "Please choose a photo first."
            };
        }

        if (!IDV_CONFIG.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: "Only JPEG and PNG photos are allowed."
            };
        }

        if (file.size > IDV_CONFIG.maxFileSize) {
            return {
                valid: false,
                message: "The photo must be 5 MB or smaller."
            };
        }

        return {
            valid: true,
            message: ""
        };
    }

    function makeSafeFileName(fileName) {
        return String(fileName || "document")
            .normalize("NFKD")
            .replace(/[^\w.-]+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^[_\.]+|[_\.]+$/g, "")
            .slice(-100) || "document";
    }

    function createStoragePath(file, category) {
        const email = String(state.user.email || "user")
            .toLowerCase();

        const safeEmail = email.replace(/[^a-z0-9@._-]/g, "_");
        const fileName = makeSafeFileName(file.name);
        const uniqueId =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now() + "_" + Math.random().toString(36).slice(2);

        return safeEmail +
            "/" +
            category +
            "/" +
            uniqueId +
            "_" +
            fileName;
    }

    /* =====================================================
       FILE VALIDATION — END
    ===================================================== */


    /* =====================================================
       7. DOCUMENT TYPE — START
    ===================================================== */

    function getSelectedDocumentType() {
        return el.idDocumentType
            ? el.idDocumentType.value
            : "";
    }

    function isPassportSelected() {
        return getSelectedDocumentType() === "passport";
    }

    function updateDocumentTypeUI() {
        const type = getSelectedDocumentType();
        const passport = type === "passport";

        if (el.idBackUploadCard) {
            setHidden(el.idBackUploadCard, passport);
        }

        if (el.idBackSideHint) {
            el.idBackSideHint.textContent = passport
                ? "Passport হলে Back Side প্রয়োজন হবে না।"
                : "Passport হলে Back Side প্রয়োজন হবে না।";
        }

        if (!type) {
            if (el.idFrontFileName) {
                el.idFrontFileName.textContent = "Not Selected";
            }

            if (el.idBackFileName) {
                el.idBackFileName.textContent = "Not Selected";
            }
        }

        updateSubmitButtonState();
    }

    function requireDocumentType() {
        if (getSelectedDocumentType()) {
            return true;
        }

        setMessage(
            "Select document type first.",
            "error"
        );

        if (el.idDocumentType) {
            el.idDocumentType.focus();
        }

        return false;
    }

    function handleDocumentTypeChange() {
        const passport = isPassportSelected();

        if (passport) {
            clearDocumentSelection("back");
        }

        updateDocumentTypeUI();
        updateSubmitButtonState();
    }

    /* =====================================================
       DOCUMENT TYPE — END
    ===================================================== */


    /* =====================================================
       8. DOCUMENT IMAGE PREVIEW — START
    ===================================================== */

    function clearDocumentPreview(side) {
        const isFront = side === "front";

        const input = isFront ? el.idFrontFile : el.idBackFile;
        const preview = isFront ? el.idFrontPreview : el.idBackPreview;
        const area = isFront ? el.idFrontUploadArea : el.idBackUploadArea;
        const fileName = isFront ? el.idFrontFileName : el.idBackFileName;
        const status = isFront ? el.idFrontStatus : el.idBackStatus;
        const retake = isFront ? el.retakeIdFrontBtn : el.retakeIdBackBtn;

        if (input) input.value = "";

        if (preview) {
            if (preview.dataset.objectUrl) {
                URL.revokeObjectURL(preview.dataset.objectUrl);
                delete preview.dataset.objectUrl;
            }

            preview.removeAttribute("src");
            setHidden(preview, true);
        }

        if (area) {
            area.classList.remove("has-preview");
        }

        if (fileName) {
            fileName.textContent = "Not Selected";
        }

        if (status) {
            status.textContent = "Not Selected";
            status.dataset.status = "empty";
        }

        if (retake) {
            setHidden(retake, true);
        }

        if (isFront) {
            state.frontFile = null;
        } else {
            state.backFile = null;
        }
    }

    function clearDocumentSelection(side) {
        clearDocumentPreview(side);
    }

    function displayDocumentPreview(side, file) {
        const isFront = side === "front";

        const preview = isFront ? el.idFrontPreview : el.idBackPreview;
        const area = isFront ? el.idFrontUploadArea : el.idBackUploadArea;
        const fileName = isFront ? el.idFrontFileName : el.idBackFileName;
        const status = isFront ? el.idFrontStatus : el.idBackStatus;
        const retake = isFront ? el.retakeIdFrontBtn : el.retakeIdBackBtn;

        if (!preview || !area) return;

        if (preview.dataset.objectUrl) {
            URL.revokeObjectURL(preview.dataset.objectUrl);
        }

        const objectUrl = URL.createObjectURL(file);

        preview.src = objectUrl;
        preview.dataset.objectUrl = objectUrl;
        preview.alt = isFront
            ? "Selected ID front photo"
            : "Selected ID back photo";

        setHidden(preview, false);
        area.classList.add("has-preview");

        if (fileName) {
            fileName.textContent = file.name;
        }

        if (status) {
            status.textContent = "Photo Selected";
            status.dataset.status = "selected";
        }

        if (retake) {
            setHidden(retake, false);
        }
    }

    function handleDocumentFileChange(side, event) {
        const input = event.target;
        const file = input.files && input.files[0];

        if (!requireDocumentType()) {
            input.value = "";
            clearDocumentPreview(side);
            updateSubmitButtonState();
            return;
        }

        if (side === "back" && isPassportSelected()) {
            input.value = "";
            clearDocumentPreview("back");
            updateSubmitButtonState();
            return;
        }

        if (!file) return;

        const validation = validateImageFile(file);

        if (!validation.valid) {
            input.value = "";
            clearDocumentPreview(side);

            setMessage(validation.message, "error");
            updateSubmitButtonState();
            return;
        }

        setMessage("", "");

        if (side === "front") {
            state.frontFile = file;
        } else {
            state.backFile = file;
        }

        displayDocumentPreview(side, file);
        updateSubmitButtonState();
    }

    function attachDocumentUploadHandlers() {
        if (el.idFrontFile) {
            el.idFrontFile.addEventListener("click", function (event) {
                if (!requireDocumentType()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });

            el.idFrontFile.addEventListener("change", function (event) {
                handleDocumentFileChange("front", event);
            });
        }

        if (el.idBackFile) {
            el.idBackFile.addEventListener("click", function (event) {
                if (!requireDocumentType() || isPassportSelected()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });

            el.idBackFile.addEventListener("change", function (event) {
                handleDocumentFileChange("back", event);
            });
        }

        if (el.idFrontUploadArea) {
            el.idFrontUploadArea.addEventListener("click", function (event) {
                if (!requireDocumentType()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }

        if (el.idBackUploadArea) {
            el.idBackUploadArea.addEventListener("click", function (event) {
                if (!requireDocumentType() || isPassportSelected()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
        }

        if (el.retakeIdFrontBtn) {
            el.retakeIdFrontBtn.addEventListener("click", function () {
                if (!requireDocumentType()) return;

                if (el.idFrontFile) {
                    el.idFrontFile.click();
                }
            });
        }

        if (el.retakeIdBackBtn) {
            el.retakeIdBackBtn.addEventListener("click", function () {
                if (!requireDocumentType() || isPassportSelected()) return;

                if (el.idBackFile) {
                    el.idBackFile.click();
                }
            });
        }

        if (el.idDocumentType) {
            el.idDocumentType.addEventListener(
                "change",
                handleDocumentTypeChange
            );
        }
    }

    /* =====================================================
       DOCUMENT IMAGE PREVIEW — END
    ===================================================== */


    /* =====================================================
       9. CAMERA HELPERS — START
    ===================================================== */

    function setFaceStatus(message, status) {
        if (!el.faceVerificationStatus) return;

        el.faceVerificationStatus.textContent = message;
        el.faceVerificationStatus.dataset.status = status || "empty";
    }

    function stopFaceDetection() {
        if (state.faceDetectionInterval) {
            clearInterval(state.faceDetectionInterval);
            state.faceDetectionInterval = null;
        }

        state.faceStableFrames = 0;
        state.faceDetectionBusy = false;
    }

    function stopFaceCamera() {
        stopFaceDetection();

        if (state.cameraStream) {
            state.cameraStream.getTracks().forEach(function (track) {
                track.stop();
            });

            state.cameraStream = null;
        }

        state.cameraReady = false;

        if (el.faceCameraVideo) {
            el.faceCameraVideo.pause();
            el.faceCameraVideo.srcObject = null;
            setHidden(el.faceCameraVideo, true);
        }

        if (el.faceCameraGuide) {
            setHidden(el.faceCameraGuide, true);
        }

        if (el.stopFaceCameraBtn) {
            setHidden(el.stopFaceCameraBtn, true);
        }

        if (el.captureFaceBtn) {
            setHidden(el.captureFaceBtn, true);
            el.captureFaceBtn.disabled = true;
        }

        if (el.startFaceCameraBtn) {
            setHidden(el.startFaceCameraBtn, false);
        }

        if (
            el.faceCapturedPreview &&
            el.faceCapturedPreview.getAttribute("src")
        ) {
            setHidden(el.faceCapturedPreview, false);

            if (el.faceCameraPlaceholder) {
                setHidden(el.faceCameraPlaceholder, true);
            }
        } else if (el.faceCameraPlaceholder) {
            setHidden(el.faceCameraPlaceholder, false);
        }
    }

    async function startFaceCamera() {
        if (state.isSubmitting || state.isPending || state.isVerified) {
            return;
        }

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            setFaceStatus(
                "Camera access is unavailable in this browser or context.",
                "error"
            );
            return;
        }

        if (state.cameraStream) {
            stopFaceCamera();
        }

        try {
            setFaceStatus("Starting camera...", "empty");

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: IDV_CONFIG.cameraFacingMode,
                    width: {
                        ideal: IDV_CONFIG.cameraWidth
                    },
                    height: {
                        ideal: IDV_CONFIG.cameraHeight
                    }
                }
            });

            state.cameraStream = stream;

            if (!el.faceCameraVideo) {
                stopFaceCamera();
                throw new Error("The camera video element is missing.");
            }

            el.faceCameraVideo.srcObject = stream;
            setHidden(el.faceCameraVideo, false);
            setHidden(el.faceCameraPlaceholder, true);
            setHidden(el.faceCapturedPreview, true);
            setHidden(el.faceCameraGuide, false);
            setHidden(el.startFaceCameraBtn, true);
            setHidden(el.stopFaceCameraBtn, false);
            setHidden(el.captureFaceBtn, false);

            await el.faceCameraVideo.play();

            state.cameraReady = true;

            if (el.faceCameraInstructions) {
                el.faceCameraInstructions.textContent =
                    "Position your face clearly in the camera.";
            }

            setFaceStatus(
                "Camera is ready. Keep your face steady.",
                "success"
            );

            startFaceDetection();

        } catch (error) {
            stopFaceCamera();

            console.error("[ID Verification] Camera error:", error);

            setFaceStatus(
                "Unable to start the camera. Allow camera permission and try again. " +
                formatError(error),
                "error"
            );
        }
    }

    /* =====================================================
       CAMERA HELPERS — END
    ===================================================== */


    /* =====================================================
       10. OPTIONAL FACE DETECTION — START
       Uses an existing MediaPipe FaceLandmarker if loaded.
       Camera capture remains usable if the library is absent.
    ===================================================== */

    function getFaceLandmarker() {
        if (window.faceLandmarker) {
            return window.faceLandmarker;
        }

        if (window.faceDetectionLandmarker) {
            return window.faceDetectionLandmarker;
        }

        return null;
    }

    function startFaceDetection() {
        stopFaceDetection();

        const landmarker = getFaceLandmarker();

        if (!landmarker || !el.faceCameraVideo) {
            setFaceStatus(
                "Camera ready. Position your face and capture the selfie.",
                "success"
            );
            return;
        }

        state.faceDetection = landmarker;

        state.faceDetectionInterval = setInterval(async function () {
            if (
                !state.cameraReady ||
                state.faceDetectionBusy ||
                !el.faceCameraVideo ||
                el.faceCameraVideo.readyState < 2
            ) {
                return;
            }

            state.faceDetectionBusy = true;

            try {
                const result = landmarker.detectForVideo(
                    el.faceCameraVideo,
                    performance.now()
                );

                const faces =
                    result &&
                    result.faceLandmarks
                        ? result.faceLandmarks.length
                        : 0;

                if (faces === 1) {
                    state.faceStableFrames += 1;
                } else {
                    state.faceStableFrames = 0;
                }

                if (faces === 0) {
                    setFaceStatus(
                        "No face detected. Position your face inside the camera.",
                        "empty"
                    );
                } else if (faces > 1) {
                    setFaceStatus(
                        "More than one face detected. Make sure only you are in the frame.",
                        "error"
                    );
                } else if (state.faceStableFrames >= 10) {
                    setFaceStatus(
                        "One face detected. You can capture your selfie.",
                        "success"
                    );
                } else {
                    setFaceStatus(
                        "Face detected. Keep still for a moment.",
                        "success"
                    );
                }

            } catch (error) {
                console.warn(
                    "[ID Verification] Face detection error:",
                    error
                );
            } finally {
                state.faceDetectionBusy = false;
            }
        }, 200);
    }

    /* =====================================================
       OPTIONAL FACE DETECTION — END
    ===================================================== */


    /* =====================================================
       11. SELFIE CAPTURE AND RETAKE — START
    ===================================================== */

    function clearSelfie() {
        state.selfieBlob = null;

        if (state.selfieObjectUrl) {
            URL.revokeObjectURL(state.selfieObjectUrl);
            state.selfieObjectUrl = null;
        }

        if (el.faceCapturedPreview) {
            el.faceCapturedPreview.removeAttribute("src");
            setHidden(el.faceCapturedPreview, true);
        }

        if (el.faceCameraPlaceholder) {
            setHidden(el.faceCameraPlaceholder, false);
        }

        if (el.faceCaptureCanvas) {
            const context = el.faceCaptureCanvas.getContext("2d");

            if (context) {
                context.clearRect(
                    0,
                    0,
                    el.faceCaptureCanvas.width,
                    el.faceCaptureCanvas.height
                );
            }
        }

        if (el.startFaceCameraBtn) {
            setHidden(el.startFaceCameraBtn, false);
        }

        if (el.retakeFacePhotoBtn) {
            setHidden(el.retakeFacePhotoBtn, true);
        }

        setFaceStatus("Selfie not captured yet.", "empty");
    }

    async function captureFacePhoto() {
        if (!state.cameraReady || !state.cameraStream) {
            setFaceStatus(
                "Start the camera before capturing a selfie.",
                "error"
            );
            return;
        }

        const video = el.faceCameraVideo;
        const canvas = el.faceCaptureCanvas;

        if (!video || !canvas) {
            setFaceStatus(
                "The camera preview or capture canvas is missing.",
                "error"
            );
            return;
        }

        if (
            video.videoWidth <= 0 ||
            video.videoHeight <= 0
        ) {
            setFaceStatus(
                "Camera is not ready yet. Please wait and try again.",
                "error"
            );
            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Unable to access the capture canvas.");
            }

            context.drawImage(
                video,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const blob = await new Promise(function (resolve, reject) {
                canvas.toBlob(
                    function (result) {
                        if (!result) {
                            reject(new Error("Could not capture the selfie."));
                            return;
                        }

                        resolve(result);
                    },
                    "image/jpeg",
                    0.9
                );
            });

            if (blob.size > IDV_CONFIG.maxFileSize) {
                throw new Error(
                    "The captured selfie is larger than 5 MB."
                );
            }

            clearSelfie();

            state.selfieBlob = blob;
            state.selfieObjectUrl = URL.createObjectURL(blob);

            if (el.faceCapturedPreview) {
                el.faceCapturedPreview.src = state.selfieObjectUrl;
                setHidden(el.faceCapturedPreview, false);
            }

            if (el.faceCameraPlaceholder) {
                setHidden(el.faceCameraPlaceholder, true);
            }

            stopFaceCamera();

            if (el.startFaceCameraBtn) {
                setHidden(el.startFaceCameraBtn, true);
            }

            if (el.retakeFacePhotoBtn) {
                setHidden(el.retakeFacePhotoBtn, false);
            }

            setFaceStatus(
                "✓ Selfie Captured Successfully",
                "success"
            );

            if (el.faceCameraInstructions) {
                el.faceCameraInstructions.textContent =
                    "Your selfie has been captured. You can retake it if needed.";
            }

            updateSubmitButtonState();

        } catch (error) {
            console.error(
                "[ID Verification] Selfie capture error:",
                error
            );

            setFaceStatus(
                formatError(error),
                "error"
            );
        }
    }

    async function retakeSelfie() {
        if (state.isSubmitting || state.isPending || state.isVerified) {
            return;
        }

        clearSelfie();
        updateSubmitButtonState();

        await startFaceCamera();
    }

    /* =====================================================
       SELFIE CAPTURE AND RETAKE — END
    ===================================================== */


    /* =====================================================
       12. SUBMIT BUTTON STATE — START
       IMPORTANT: Never submit automatically.
    ===================================================== */

    function areRequiredDocumentsReady() {
        if (!getSelectedDocumentType()) {
            return false;
        }

        if (!state.frontFile) {
            return false;
        }

        if (!isPassportSelected() && !state.backFile) {
            return false;
        }

        if (!state.selfieBlob) {
            return false;
        }

        return true;
    }

    function updateSubmitButtonState() {
        const button = el.submitIdVerificationBtn;

        if (!button) return;

        const canSubmit =
            areRequiredDocumentsReady() &&
            !state.isSubmitting &&
            !state.isLoading &&
            !state.isPending &&
            (!state.isVerified || state.isReverification);

        button.disabled = !canSubmit;
    }

    /* =====================================================
       SUBMIT BUTTON STATE — END
    ===================================================== */


    /* =====================================================
       13. STORAGE UPLOAD — START
    ===================================================== */

    async function uploadPrivateFile(file, category) {
        const client = state.supabase;

        if (!file) {
            throw new Error("A required file is missing.");
        }

        const path = createStoragePath(file, category);

        const result = await client.storage
            .from(IDV_CONFIG.storageBucket)
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || "image/jpeg"
            });

        if (result.error) {
            throw result.error;
        }

        return result.data.path;
    }

    /* =====================================================
       STORAGE UPLOAD — END
    ===================================================== */


    /* =====================================================
       14. SUBMIT ID VERIFICATION — START
       Only the user's manual form submission calls this.
    ===================================================== */

    async function submitIdVerification(event) {
        event.preventDefault();

        if (state.isSubmitting || state.isLoading || state.isPending) {
            return;
        }

        if (state.isVerified && !state.isReverification) {
            return;
        }

        if (!requireDocumentType()) {
            return;
        }

        if (!areRequiredDocumentsReady()) {
            setMessage(
                "Please select the required ID photos and capture your selfie before submitting.",
                "error"
            );
            return;
        }

        const frontValidation = validateImageFile(state.frontFile);

        if (!frontValidation.valid) {
            setMessage(frontValidation.message, "error");
            return;
        }

        if (!isPassportSelected()) {
            const backValidation = validateImageFile(state.backFile);

            if (!backValidation.valid) {
                setMessage(backValidation.message, "error");
                return;
            }
        }

        if (!state.selfieBlob) {
            setMessage("Please capture your selfie first.", "error");
            return;
        }

        state.isSubmitting = true;

        const button = el.submitIdVerificationBtn;

        if (button) {
            button.dataset.originalText = button.textContent;
            button.textContent = "Submitting...";
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        }

        let frontPath;
        let backPath = null;
        let selfiePath;

        try {
            setMessage("Uploading your documents securely...", "");

            // Upload front photo.
            frontPath = await uploadPrivateFile(
                state.frontFile,
                "front"
            );

            // Passport does not require a back photo.
            if (!isPassportSelected()) {
                backPath = await uploadPrivateFile(
                    state.backFile,
                    "back"
                );
            }

            // Upload captured selfie.
            const selfieFile = new File(
                [state.selfieBlob],
                "selfie.jpg",
                {
                    type: "image/jpeg",
                    lastModified: Date.now()
                }
            );

            selfiePath = await uploadPrivateFile(
                selfieFile,
                "selfie"
            );

            const updatePayload = {
                [IDV_CONFIG.columns.status]: "Pending",
                [IDV_CONFIG.columns.documentType]: getSelectedDocumentType(),
                [IDV_CONFIG.columns.frontPath]: frontPath,
                [IDV_CONFIG.columns.backPath]: backPath,
                [IDV_CONFIG.columns.selfiePath]: selfiePath,
                [IDV_CONFIG.columns.submittedAt]: new Date().toISOString()
            };

            const result = await state.supabase
                .from(IDV_CONFIG.table)
                .update(updatePayload)
                .eq(IDV_CONFIG.columns.email, state.user.email)
                .select()
                .maybeSingle();

            if (result.error) {
                throw result.error;
            }

            if (!result.data) {
                throw new Error(
                    "The submission could not be confirmed. Check your user_data update policy and profile email."
                );
            }

            state.profile = result.data;
            state.isPending = true;
            state.isVerified = false;
            state.isReverification = false;

            stopFaceCamera();
            renderVerificationState("pending");

            setMessage("", "");

        } catch (error) {
            console.error(
                "[ID Verification] Submission failed:",
                error
            );

            setMessage(
                "Submission failed: " + formatError(error),
                "error"
            );

        } finally {
            state.isSubmitting = false;

            if (button) {
                button.removeAttribute("aria-busy");

                button.textContent =
                    button.dataset.originalText ||
                    "SUBMIT FOR VERIFICATION";

                delete button.dataset.originalText;
            }

            updateSubmitButtonState();
        }
    }

    /* =====================================================
       SUBMIT ID VERIFICATION — END
    ===================================================== */


    /* =====================================================
       15. PENDING PROCESS UI — START
    ===================================================== */

    function renderPendingState() {
        setStatusBadge("pending", "Pending");

        if (el.idVerificationDescription) {
            el.idVerificationDescription.textContent =
                "Your documents have been submitted for review.";
        }

        setHidden(el.idVerificationForm, true);
        setHidden(el.idVerificationPendingSection, false);
        setHidden(el.verificationProcessSection, false);
        setHidden(el.idVerificationApprovedSection, true);

        if (el.submittedIdDocumentStatus) {
            el.submittedIdDocumentStatus.textContent =
                "Submitted successfully";
        }

        if (el.submittedSelfieStatus) {
            el.submittedSelfieStatus.textContent =
                "Submitted successfully";
        }

        if (el.processIdDocument) {
            el.processIdDocument.dataset.state = "pending";
        }

        if (el.processIdDocumentStatus) {
            el.processIdDocumentStatus.textContent =
                "Submitted · Awaiting review";
        }

        if (el.processIdDocumentBadge) {
            el.processIdDocumentBadge.textContent = "Submitted";
        }

        if (el.processSelfie) {
            el.processSelfie.dataset.state = "pending";
        }

        if (el.processSelfieStatus) {
            el.processSelfieStatus.textContent =
                "Submitted · Awaiting review";
        }

        if (el.processSelfieBadge) {
            el.processSelfieBadge.textContent = "Submitted";
        }

        if (el.processAdminReview) {
            el.processAdminReview.dataset.state = "pending";
        }

        if (el.processAdminReviewStatus) {
            el.processAdminReviewStatus.textContent =
                "Admin-এর সিদ্ধান্তের অপেক্ষায়।";
        }

        if (el.processAdminReviewBadge) {
            el.processAdminReviewBadge.textContent = "Pending";
        }

        if (el.submitIdVerificationBtn) {
            el.submitIdVerificationBtn.disabled = true;
        }

        stopFaceCamera();
    }

    /* =====================================================
       PENDING PROCESS UI — END
    ===================================================== */


    /* =====================================================
       16. VERIFIED UI — START
    ===================================================== */

    function renderVerifiedState() {
        setStatusBadge("verified", "Verified");

        if (el.idVerificationDescription) {
            el.idVerificationDescription.textContent =
                "Your identity verification has been approved.";
        }

        if (el.identityVerifiedDescription) {
            el.identityVerifiedDescription.textContent =
                "Your submitted documents have been approved by the administrator.";
        }

        if (el.approvedIdDocumentStatus) {
            el.approvedIdDocumentStatus.textContent = "Approved";
        }

        if (el.approvedSelfieStatus) {
            el.approvedSelfieStatus.textContent = "Reviewed";
        }

        if (el.approvedAdminReviewStatus) {
            el.approvedAdminReviewStatus.textContent = "Approved";
        }

        if (el.approvedIdDocument) {
            el.approvedIdDocument.dataset.state = "approved";
        }

        if (el.approvedSelfie) {
            el.approvedSelfie.dataset.state = "approved";
        }

        if (el.approvedAdminReview) {
            el.approvedAdminReview.dataset.state = "approved";
        }

        setHidden(el.idVerificationForm, true);
        setHidden(el.idVerificationPendingSection, true);
        setHidden(el.verificationProcessSection, true);
        setHidden(el.idVerificationApprovedSection, false);
        setHidden(el.verifyAgainSection, false);

        if (el.submitIdVerificationBtn) {
            el.submitIdVerificationBtn.disabled = true;
        }

        stopFaceCamera();
    }

    /* =====================================================
       VERIFIED UI — END
    ===================================================== */


    /* =====================================================
       17. UNVERIFIED UI — START
    ===================================================== */

    function renderUnverifiedState() {
        setStatusBadge("unverified", "Unverified");

        if (el.idVerificationDescription) {
            el.idVerificationDescription.textContent =
                "Verify your identity using an accepted identification document.";
        }

        setHidden(el.idVerificationForm, false);
        setHidden(el.idVerificationPendingSection, true);
        setHidden(el.verificationProcessSection, true);
        setHidden(el.idVerificationApprovedSection, true);

        updateDocumentTypeUI();
        updateSubmitButtonState();
    }

    /* =====================================================
       UNVERIFIED UI — END
    ===================================================== */


    /* =====================================================
       18. VERIFY AGAIN — START
       Existing database approval is not changed until submission.
    ===================================================== */

    function handleVerifyAgain() {
        if (state.isSubmitting || state.isPending) {
            return;
        }

        state.isReverification = true;
        state.isVerified = false;
        state.isPending = false;

        clearDocumentSelection("front");
        clearDocumentSelection("back");
        clearSelfie();

        if (el.idDocumentType) {
            el.idDocumentType.value = "";
        }

        setMessage("", "");

        renderUnverifiedState();

        if (el.idVerificationSection) {
            el.idVerificationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    /* =====================================================
       VERIFY AGAIN — END
    ===================================================== */


    /* =====================================================
       19. RESTORE UI FROM SUPABASE — START
    ===================================================== */

    function renderVerificationState(status) {
        if (isApprovedStatus(status)) {
            state.isVerified = true;
            state.isPending = false;
            state.isReverification = false;

            renderVerifiedState();
            return;
        }

        if (isPendingStatus(status)) {
            state.isPending = true;
            state.isVerified = false;
            state.isReverification = false;

            renderPendingState();
            return;
        }

        state.isPending = false;
        state.isVerified = false;

        renderUnverifiedState();
    }

    async function refreshVerificationStatus() {
        try {
            await loadUserProfile();

            const status =
                state.profile[IDV_CONFIG.columns.status];

            renderVerificationState(status);

        } catch (error) {
            console.error(
                "[ID Verification] Status refresh failed:",
                error
            );

            setMessage(
                "Unable to load verification status: " + formatError(error),
                "error"
            );
        }
    }

    /* =====================================================
       RESTORE UI FROM SUPABASE — END
    ===================================================== */


    /* =====================================================
       20. CAMERA EVENT HANDLERS — START
    ===================================================== */

    function attachCameraHandlers() {
        if (el.startFaceCameraBtn) {
            el.startFaceCameraBtn.addEventListener(
                "click",
                startFaceCamera
            );
        }

        if (el.captureFaceBtn) {
            el.captureFaceBtn.addEventListener(
                "click",
                captureFacePhoto
            );
        }

        if (el.stopFaceCameraBtn) {
            el.stopFaceCameraBtn.addEventListener(
                "click",
                function () {
                    stopFaceCamera();

                    setFaceStatus(
                        "Camera stopped. Start verification to try again.",
                        "empty"
                    );
                }
            );
        }

        if (el.retakeFacePhotoBtn) {
            el.retakeFacePhotoBtn.addEventListener(
                "click",
                retakeSelfie
            );
        }
    }

    /* =====================================================
       CAMERA EVENT HANDLERS — END
    ===================================================== */


    /* =====================================================
       21. FORM EVENT HANDLERS — START
    ===================================================== */

    function attachFormHandlers() {
        if (el.idVerificationForm) {
            el.idVerificationForm.addEventListener(
                "submit",
                submitIdVerification
            );
        }

        if (el.verifyAgainBtn) {
            el.verifyAgainBtn.addEventListener(
                "click",
                handleVerifyAgain
            );
        }
    }

    /* =====================================================
       FORM EVENT HANDLERS — END
    ===================================================== */


    /* =====================================================
       22. INITIALIZATION — START
    ===================================================== */

    async function initIdVerification() {
        cacheElements();

        const requiredIds = [
            "idVerificationSection",
            "idVerificationForm",
            "idVerificationStatusBadge",
            "idDocumentType",
            "idFrontFile",
            "idBackFile",
            "faceCameraVideo",
            "faceCaptureCanvas",
            "submitIdVerificationBtn",
            "verificationProcessSection",
            "idVerificationApprovedSection",
            "verifyAgainBtn"
        ];

        const missing = requiredIds.filter(function (id) {
            return !el[id];
        });

        if (missing.length) {
            console.error(
                "[ID Verification] HTML is missing required elements:",
                missing
            );

            return;
        }

        state.supabase = getSupabaseClient();

        if (!state.supabase) {
            setMessage(
                "Supabase client not found. Ensure window.supabaseClient is initialized before this script.",
                "error"
            );

            renderUnverifiedState();
            return;
        }

        attachDocumentUploadHandlers();
        attachCameraHandlers();
        attachFormHandlers();

        renderUnverifiedState();

        state.isLoading = true;
        updateSubmitButtonState();

        try {
            state.user = await getAuthenticatedUser();

            await loadUserProfile();

            renderVerificationState(
                state.profile[IDV_CONFIG.columns.status]
            );

        } catch (error) {
            console.error(
                "[ID Verification] Initialization failed:",
                error
            );

            setMessage(
                "Unable to initialize ID Verification: " +
                formatError(error),
                "error"
            );

        } finally {
            state.isLoading = false;
            updateSubmitButtonState();
        }
    }

    /* =====================================================
       INITIALIZATION — END
    ===================================================== */


    /* =====================================================
       23. PUBLIC FUNCTIONS — START
       These allow other page scripts to refresh status.
    ===================================================== */

    window.refreshIdVerificationStatus = refreshVerificationStatus;

    window.stopIdVerificationCamera = stopFaceCamera;

    /* =====================================================
       PUBLIC FUNCTIONS — END
    ===================================================== */


    /* =====================================================
       24. START AFTER DOM IS READY
    ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initIdVerification,
            { once: true }
        );
    } else {
        initIdVerification();
    }

    /* =====================================================
       ID VERIFICATION — COMPLETE
    ===================================================== */

})();
