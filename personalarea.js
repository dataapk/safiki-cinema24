/* =========================================================
   PERSONAL AREA — COMPLETE JAVASCRIPT
   Requires: Existing HTML + initialized Supabase client
   ========================================================= */

(() => {
    "use strict";

    const supabase = window.supabaseClient;

    const CONFIG = {
        table: "user_data",

        // Change these only if your Supabase names are different.
        avatarBucket: "profile-avatars",
        idDocumentBucket: "id-verification",
        addressDocumentBucket: "proof-documents",

        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: [
            "image/jpeg",
            "image/png",
            "application/pdf"
        ]
    };

    let currentUser = null;
    let profileData = null;

    let profileEditMode = false;
    let emailVerified = false;
    let mobileVerified = false;

    let pendingEmail = "";
    let pendingMobile = "";

    let idFrontFile = null;
    let idBackFile = null;
    let facePhotoBlob = null;
    let addressDocument = null;

    let selectedAddressDocumentType = "";
    let cameraStream = null;

    const $ = (id) => document.getElementById(id);

    function setMessage(id, message, type = "info") {
        const element = $(id);
        if (!element) return;

        element.textContent = message;
        element.dataset.state = type;
        element.setAttribute("role", "status");
    }

    function setStatus(id, message, type = "info") {
        setMessage(id, message, type);
    }

    function setButtonLoading(button, loading, loadingText = "Please wait...") {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.disabled = true;
        } else {
            button.textContent =
                button.dataset.originalText || button.textContent;
            delete button.dataset.originalText;
            button.disabled = false;
        }
    }

    function getSupabaseClient() {
        return window.supabaseClient ||
            (typeof supabaseClient !== "undefined" ? supabaseClient : null);
    }

    async function getAuthenticatedUser() {
        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Supabase client is not initialized.");
        }

        const { data, error } = await client.auth.getUser();

        if (error) throw error;
        if (!data?.user) {
            throw new Error("Please log in to access your Personal Area.");
        }

        return data.user;
    }

    async function getProfile() {
        const client = getSupabaseClient();
        const user = await getAuthenticatedUser();

        const { data, error } = await client
            .from(CONFIG.table)
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

        if (error) throw error;

        currentUser = user;
        profileData = data || {};

        return profileData;
    }

    function formatMemberSince(value) {
        if (!value) return "—";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long"
        });
    }

    function setInputValue(id, value) {
        const element = $(id);
        if (element) element.value = value ?? "";
    }

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value ?? "";
    }

    function setHidden(id, hidden) {
        const element = $(id);
        if (element) element.hidden = hidden;
    }

    function showPersonalArea() {
        const section = $("personal-area-section");
        if (section) section.style.display = "block";

        openPersonalTab("details");
    }

    function hidePersonalArea() {
        const section = $("personal-area-section");
        if (section) section.style.display = "none";

        stopFaceCamera();
    }

    function populateProfile(profile) {
        setInputValue("firstName", profile.first_name);
        setInputValue("surname", profile.last_name);
        setInputValue("dateOfBirth", profile.date_of_birth);
        setInputValue("gender", profile.gender);

        setText("currentEmail", currentUser?.email || profile.email || "");
        setText("memberSince", formatMemberSince(
            profile.created_at || currentUser?.created_at
        ));

        const avatar = $("profileAvatar");
        if (avatar) {
            avatar.src = profile.avatar_url || "";
            avatar.onerror = () => {
                avatar.removeAttribute("src");
            };
        }

        const phone = profile.mobile_number || "";
        setInputValue("mobileNumber", phone);

        if (profile.mobile_country_code && $("mobileCountryCode")) {
            $("mobileCountryCode").value = profile.mobile_country_code;
        }

        setText(
            "mobileStatus",
            profile.mobile_verified ? "Verified" : "Not verified"
        );

        setText(
            "emailStatus",
            profile.email_verified ? "Verified" : "Current account email"
        );

        setInputValue("addressLine", profile.address);
        setInputValue("addressCity", profile.city);
        setInputValue("addressPostalCode", profile.postal_code);

        if (profile.country && $("addressCountry")) {
            $("addressCountry").value = profile.country;
        }

        if (profile.id_country && $("idCountry")) {
            $("idCountry").value = profile.id_country;
        }

        if (profile.id_document_type && $("idDocumentType")) {
            $("idDocumentType").value = profile.id_document_type;
        }

        setText(
            "idVerificationMessage",
            profile.kyc_status
                ? `Verification status: ${profile.kyc_status}`
                : "Your identity documents have not been submitted."
        );

        setText(
            "addressVerificationStatus",
            profile.address_verification_status || "Not submitted"
        );

        setEditMode(false);
    }

    async function refreshPersonalArea() {
        try {
            await getProfile();
            populateProfile(profileData);
            return true;
        } catch (error) {
            console.error("Personal Area load error:", error);
            setMessage(
                "personalDetailsMessage",
                error.message || "Could not load your profile.",
                "error"
            );
            return false;
        }
    }

    /* ---------------------------------------------------------
       OPEN / CLOSE / TABS
       --------------------------------------------------------- */

    window.openPersonalArea = async function () {
        showPersonalArea();

        const loaded = await refreshPersonalArea();

        if (!loaded) {
            setMessage(
                "personalDetailsMessage",
                "Please log in again, then reopen Personal Area.",
                "error"
            );
        }
    };

    window.closePersonalArea = function () {
        hidePersonalArea();
    };

    window.openPersonalTab = function (tab) {
        const sections = {
            details: "personaldetailsSection",
            verification: "idVerificationSection",
            documents: "proofDocumentsSection"
        };

        Object.entries(sections).forEach(([key, id]) => {
            const section = $(id);
            if (section) section.hidden = key !== tab;
        });

        document.querySelectorAll(".personal-tab-btn").forEach((button) => {
            const active = button.dataset.tab === tab;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
    };

    /* ---------------------------------------------------------
       PERSONAL DETAILS — EDIT / SAVE
       --------------------------------------------------------- */

    function setEditMode(enabled) {
        profileEditMode = enabled;

        ["firstName", "surname", "dateOfBirth", "gender"].forEach((id) => {
            const element = $(id);
            if (element) element.disabled = !enabled;
        });

        setText("editLabel", enabled ? "Editing" : "Edit details");

        const button = $("toggleEditBtn");
        if (button) {
            button.setAttribute("aria-pressed", String(enabled));
        }

        const track = $("toggleTrack");
        if (track) {
            track.classList.toggle("active", enabled);
        }

        const saveButton = $("saveChangesBtn");
        if (saveButton) saveButton.disabled = !enabled;
    }

    window.toggleEditMode = function () {
        if (!profileEditMode) {
            setEditMode(true);
            return;
        }

        if (profileData) populateProfile(profileData);
        setEditMode(false);
        setMessage("personalDetailsMessage", "Changes cancelled.");
    };

    window.saveAllChanges = async function () {
        const client = getSupabaseClient();
        const button = $("saveChangesBtn");

        try {
            if (!currentUser) await getProfile();

            const firstName = $("firstName")?.value.trim() || "";
            const surname = $("surname")?.value.trim() || "";
            const dateOfBirth = $("dateOfBirth")?.value || null;
            const gender = $("gender")?.value || null;

            if (!firstName) {
                throw new Error("Please enter your first name.");
            }

            if (dateOfBirth) {
                const date = new Date(`${dateOfBirth}T00:00:00`);
                if (Number.isNaN(date.getTime()) || date > new Date()) {
                    throw new Error("Please enter a valid date of birth.");
                }
            }

            setButtonLoading(button, true, "Saving...");

            const updates = {
                first_name: firstName,
                last_name: surname,
                date_of_birth: dateOfBirth,
                gender,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await client
                .from(CONFIG.table)
                .update(updates)
                .eq("email", currentUser.email)
                .select()
                .maybeSingle();

            if (error) throw error;

            profileData = { ...profileData, ...updates, ...(data || {}) };

            populateProfile(profileData);

            setMessage(
                "personalDetailsMessage",
                "Personal details saved successfully.",
                "success"
            );
        } catch (error) {
            console.error("Save profile error:", error);
            setMessage(
                "personalDetailsMessage",
                error.message || "Could not save your details.",
                "error"
            );
        } finally {
            if (button) {
                button.textContent = "Save Changes";
                button.disabled = !profileEditMode;
            }
        }
    };

    /* ---------------------------------------------------------
       AVATAR
       --------------------------------------------------------- */

    window.changeAvatar = function () {
        $("profileAvatarInput")?.click();
    };

    $("profileAvatarInput")?.addEventListener("change", async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setMessage(
                "personalDetailsMessage",
                "Choose a JPG, PNG, or WebP image.",
                "error"
            );
            event.target.value = "";
            return;
        }

        if (file.size > CONFIG.maxFileSize) {
            setMessage(
                "personalDetailsMessage",
                "Avatar image must be 5 MB or smaller.",
                "error"
            );
            event.target.value = "";
            return;
        }

        try {
            const client = getSupabaseClient();
            if (!currentUser) await getProfile();

            const path = `${currentUser.id}/${Date.now()}-${safeFileName(file.name)}`;
            const { error: uploadError } = await client.storage
                .from(CONFIG.avatarBucket)
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = client.storage
                .from(CONFIG.avatarBucket)
                .getPublicUrl(path);

            const avatarUrl = urlData?.publicUrl;
            if (!avatarUrl) {
                throw new Error("Could not get the avatar URL.");
            }

            const { error } = await client
                .from(CONFIG.table)
                .update({
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq("email", currentUser.email);

            if (error) throw error;

            profileData.avatar_url = avatarUrl;
            const avatar = $("profileAvatar");
            if (avatar) avatar.src = avatarUrl;

            setMessage(
                "personalDetailsMessage",
                "Profile photo updated.",
                "success"
            );
        } catch (error) {
            console.error("Avatar upload error:", error);
            setMessage(
                "personalDetailsMessage",
                error.message || "Avatar upload failed.",
                "error"
            );
        } finally {
            event.target.value = "";
        }
    });

    /* ---------------------------------------------------------
       EMAIL CHANGE
       Email OTP must be verified by a secure backend.
       --------------------------------------------------------- */

    window.toggleEmailChange = function () {
        const dropdown = $("emailChangeDropdown");
        if (!dropdown) return;

        dropdown.hidden = !dropdown.hidden;

        if (!dropdown.hidden) {
            setInputValue("newEmailInput", "");
            setInputValue("emailOtpInput", "");
            setHidden("emailVerifyRow", true);

            emailVerified = false;
            pendingEmail = "";

            const save = $("saveNewEmailBtn");
            if (save) save.disabled = true;

            setMessage("emailChangeMessage", "");
        }
    };

    window.sendEmailOtp = async function () {
        const newEmail = $("newEmailInput")?.value.trim().toLowerCase();

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setMessage("emailChangeMessage", "Enter a valid new email.", "error");
            return;
        }

        if (newEmail === currentUser?.email?.toLowerCase()) {
            setMessage(
                "emailChangeMessage",
                "This is already your current email.",
                "error"
            );
            return;
        }

        /*
         * SECURITY REQUIREMENT:
         * Connect this function to a server-side Supabase Edge Function
         * that sends a one-time code to the CURRENT email and stores
         * its hash, expiry, and attempt count securely.
         *
         * Do not generate or verify security codes in browser JavaScript.
         */
        setMessage(
            "emailChangeMessage",
            "Email verification backend is not configured yet. No code has been sent.",
            "error"
        );
    };

    window.verifyEmailOtp = async function () {
        setMessage(
            "emailChangeMessage",
            "Email OTP verification requires the secure verification backend.",
            "error"
        );
    };

    window.saveNewEmail = async function () {
        if (!emailVerified || !pendingEmail) {
            setMessage(
                "emailChangeMessage",
                "Verify the new email before saving.",
                "error"
            );
            return;
        }

        setMessage(
            "emailChangeMessage",
            "Connect the verified-email change flow to Supabase Auth before saving.",
            "error"
        );
    };

    /* ---------------------------------------------------------
       MOBILE NUMBER — OTP PREPARATION
       --------------------------------------------------------- */

    window.toggleMobileChange = function () {
        const dropdown = $("mobileChangeDropdown");
        if (!dropdown) return;

        dropdown.hidden = !dropdown.hidden;

        if (!dropdown.hidden) {
            setInputValue("mobileOtpInput", "");
            setHidden("mobileVerifyRow", true);

            mobileVerified = false;
            pendingMobile = "";

            const save = $("saveMobileBtn");
            if (save) save.disabled = true;

            setMessage("mobileChangeMessage", "");
        }
    };

    window.sendMobileOtp = async function () {
        const code = $("mobileCountryCode")?.value || "";
        const number = $("mobileNumber")?.value.trim() || "";

        if (!/^[0-9]{6,15}$/.test(number)) {
            setMessage(
                "mobileChangeMessage",
                "Enter a valid phone number using digits only.",
                "error"
            );
            return;
        }

        pendingMobile = `${code}${number}`;
        mobileVerified = false;

        /*
         * Connect to Supabase Phone Auth or an SMS provider.
         * Never claim an OTP was sent until the provider confirms it.
         */
        setMessage(
            "mobileChangeMessage",
            "SMS verification is not configured yet. No OTP has been sent.",
            "error"
        );
    };

    window.verifyMobileOtp = async function () {
        setMessage(
            "mobileChangeMessage",
            "Mobile OTP verification requires the SMS authentication service.",
            "error"
        );
    };

    window.saveMobileNumber = async function () {
        if (!mobileVerified || !pendingMobile) {
            setMessage(
                "mobileChangeMessage",
                "Verify your phone number before saving.",
                "error"
            );
            return;
        }

        setMessage(
            "mobileChangeMessage",
            "Connect the verified phone number to Supabase Auth before saving.",
            "error"
        );
    };

    /* ---------------------------------------------------------
       FILE HELPERS
       --------------------------------------------------------- */

    function safeFileName(name) {
        return String(name || "document")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .slice(-120);
    }

    function validateDocument(file) {
        if (!file) throw new Error("Please choose a file.");

        if (!CONFIG.allowedFileTypes.includes(file.type)) {
            throw new Error("Only JPG, PNG, and PDF files are allowed.");
        }

        if (file.size > CONFIG.maxFileSize) {
            throw new Error("Each file must be 5 MB or smaller.");
        }

        return true;
    }

    async function uploadPrivateFile(bucket, folder, file) {
        const client = getSupabaseClient();

        validateDocument(file);

        if (!currentUser) await getProfile();

        const path =
            `${currentUser.id}/${folder}/${Date.now()}-${safeFileName(file.name)}`;

        const { error } = await client.storage
            .from(bucket)
            .upload(path, file, {
                upsert: false,
                contentType: file.type
            });

        if (error) throw error;

        // Private bucket: store the object path, not a public URL.
        return path;
    }

    function showFileName(inputId, labelId) {
        $(inputId)?.addEventListener("change", (event) => {
            const file = event.target.files?.[0];
            if (labelId) {
                setText(labelId, file ? file.name : "No file selected");
            }
        });
    }

    /* ---------------------------------------------------------
       ID VERIFICATION — DOCUMENT SELECTION
       --------------------------------------------------------- */

    $("idFrontFile")?.addEventListener("change", (event) => {
        idFrontFile = event.target.files?.[0] || null;
        setText("idFrontFileName", idFrontFile?.name || "No file selected");
        setStatus(
            "idFrontStatus",
            idFrontFile ? "Selected — ready to submit" : "Not uploaded"
        );
        updateIdSubmitState();
    });

    $("idBackFile")?.addEventListener("change", (event) => {
        idBackFile = event.target.files?.[0] || null;
        setText("idBackFileName", idBackFile?.name || "No file selected");
        setStatus(
            "idBackStatus",
            idBackFile ? "Selected — ready to submit" : "Not uploaded"
        );
        updateIdSubmitState();
    });

    function updateIdSubmitState() {
        const type = $("idDocumentType")?.value;
        const frontRequired = Boolean(type);
        const backRequired = type !== "passport";

        const ready =
            frontRequired &&
            Boolean(idFrontFile) &&
            (!backRequired || Boolean(idBackFile)) &&
            Boolean($("idCountry")?.value);

        const button = $("submitIdVerificationBtn");
        if (button) button.disabled = !ready;
    }

    $("idDocumentType")?.addEventListener("change", () => {
        const type = $("idDocumentType").value;
        const backField = $("idBackFile")?.closest(".upload-field");

        if (backField) {
            backField.hidden = type === "passport";
        }

        if (type === "passport") {
            idBackFile = null;
            if ($("idBackFile")) $("idBackFile").value = "";
            setText("idBackFileName", "Not required for passport");
            setStatus("idBackStatus", "Not required");
        }

        updateIdSubmitState();
    });

    $("idCountry")?.addEventListener("change", updateIdSubmitState);

    /* ---------------------------------------------------------
       FACE CAMERA
       --------------------------------------------------------- */

    window.startFaceCamera = async function () {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Camera access is not supported by this browser.");
            }

            stopFaceCamera();

            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            const video = $("faceCameraVideo");
            if (!video) throw new Error("Camera preview element not found.");

            video.srcObject = cameraStream;
            video.hidden = false;

            await video.play();

            setHidden("faceCameraPlaceholder", true);
            setHidden("faceCameraGuide", false);
            setHidden("stopFaceCameraBtn", false);

            const captureButton = $("captureFaceBtn");
            if (captureButton) captureButton.disabled = false;

            setStatus(
                "faceVerificationStatus",
                "Camera ready. Position your face inside the guide."
            );
        } catch (error) {
            console.error("Camera error:", error);
            setStatus(
                "faceVerificationStatus",
                error.message || "Unable to access the camera.",
                "error"
            );
        }
    };

    window.captureFacePhoto = function () {
        const video = $("faceCameraVideo");
        const canvas = $("faceCaptureCanvas");

        if (!video || !canvas || !cameraStream) {
            setStatus("faceVerificationStatus", "Start the camera first.", "error");
            return;
        }

        if (!video.videoWidth || !video.videoHeight) {
            setStatus(
                "faceVerificationStatus",
                "Wait for the camera preview, then try again.",
                "error"
            );
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) {
                setStatus(
                    "faceVerificationStatus",
                    "Could not capture the photo.",
                    "error"
                );
                return;
            }

            facePhotoBlob = blob;

            const hiddenInput = $("faceCaptureReference");
            if (hiddenInput) hiddenInput.value = "captured";

            setStatus(
                "faceVerificationStatus",
                "Selfie captured. It will be submitted for manual Admin review.",
                "success"
            );

            updateIdSubmitState();
        }, "image/jpeg", 0.9);
    };

    window.stopFaceCamera = function () {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }

        const video = $("faceCameraVideo");
        if (video) {
            video.pause();
            video.srcObject = null;
            video.hidden = true;
        }

        setHidden("stopFaceCameraBtn", true);

        const captureButton = $("captureFaceBtn");
        if (captureButton) captureButton.disabled = true;
    };

    /* ---------------------------------------------------------
       SUBMIT ID VERIFICATION
       --------------------------------------------------------- */

    window.submitIdVerification = async function () {
        const button = $("submitIdVerificationBtn");

        try {
            const client = getSupabaseClient();

            if (!currentUser) await getProfile();

            const country = $("idCountry")?.value;
            const documentType = $("idDocumentType")?.value;

            if (!country || !documentType || !idFrontFile) {
                throw new Error("Choose a country, document type, and front file.");
            }

            if (documentType !== "passport" && !idBackFile) {
                throw new Error("Upload the back side of your document.");
            }

            validateDocument(idFrontFile);
            if (idBackFile) validateDocument(idBackFile);

            setButtonLoading(button, true, "Uploading...");

            const frontPath = await uploadPrivateFile(
                CONFIG.idDocumentBucket,
                "front",
                idFrontFile
            );

            let backPath = null;
            if (idBackFile) {
                backPath = await uploadPrivateFile(
                    CONFIG.idDocumentBucket,
                    "back",
                    idBackFile
                );
            }

            let selfiePath = null;

            if (facePhotoBlob) {
                const selfieFile = new File(
                    [facePhotoBlob],
                    `selfie-${Date.now()}.jpg`,
                    { type: "image/jpeg" }
                );

                selfiePath = await uploadPrivateFile(
                    CONFIG.idDocumentBucket,
                    "selfie",
                    selfieFile
                );
            }

            /*
             * This assumes the listed columns exist in user_data.
             * If ID documents are stored in a separate table, replace
             * this update with the actual table/column names.
             */
            const updates = {
                id_country: country,
                id_document_type: documentType,
                id_front_path: frontPath,
                id_back_path: backPath,
                face_photo_path: selfiePath,
                kyc_status: "Pending",
                updated_at: new Date().toISOString()
            };

            const { error } = await client
                .from(CONFIG.table)
                .update(updates)
                .eq("email", currentUser.email);

            if (error) throw error;

            profileData = { ...profileData, ...updates };

            setText(
                "idVerificationMessage",
                "Documents submitted successfully. Status: Pending Admin Review."
            );

            setStatus("idFrontStatus", "Uploaded securely", "success");
            setStatus(
                "idBackStatus",
                backPath ? "Uploaded securely" : "Not required"
            );

            setText("idUploadStep", "Documents submitted");
            setText(
                "faceMatchStep",
                selfiePath ? "Selfie submitted for manual review" : "Selfie not submitted"
            );
            setText("finalVerificationStep", "Pending Admin Review");

            setMessage(
                "personalDetailsMessage",
                "Identity verification submitted for review.",
                "success"
            );
        } catch (error) {
            console.error("ID submission error:", error);
            setMessage(
                "idVerificationMessage",
                error.message || "Could not submit identity documents.",
                "error"
            );
        } finally {
            if (button) {
                button.textContent = "Submit for Verification";
                button.disabled = false;
                updateIdSubmitState();
            }
        }
    };

    /* ---------------------------------------------------------
       PROOF DOCUMENTS — SELECT DOCUMENT TYPE
       --------------------------------------------------------- */

    window.selectAddressDocument = function (type) {
        const types = {
            utility_bill: {
                title: "Upload Utility Bill",
                description: "Choose a recent utility bill showing your address."
            },
            bank_statement: {
                title: "Upload Bank Statement",
                description: "Choose a bank statement showing your name and address."
            },
            official_document: {
                title: "Upload Official Address Document",
                description: "Choose an official document that confirms your address."
            }
        };

        if (!types[type]) return;

        selectedAddressDocumentType = type;
        addressDocument = null;

        document.querySelectorAll("[data-document-type]").forEach((card) => {
            const active = card.dataset.documentType === type;
            card.classList.toggle("selected", active);
            card.setAttribute("aria-pressed", String(active));
        });

        setText("addressDocumentUploadTitle", types[type].title);
        setText("addressDocumentUploadDescription", types[type].description);
        setText("addressDocumentFileName", "No file selected");
        setStatus("addressDocumentFileStatus", "Not uploaded");

        const input = $("addressDocumentFile");
        if (input) input.value = "";

        setHidden("addressDocumentUploadBox", false);
    };

    $("addressDocumentFile")?.addEventListener("change", (event) => {
        addressDocument = event.target.files?.[0] || null;

        setText(
            "addressDocumentFileName",
            addressDocument?.name || "No file selected"
        );

        setStatus(
            "addressDocumentFileStatus",
            addressDocument ? "Selected — ready to submit" : "Not uploaded"
        );
    });

    /* ---------------------------------------------------------
       SAVE ADDRESS + PROOF DOCUMENT
       --------------------------------------------------------- */

    window.saveAddressDocuments = async function () {
        const button = $("saveAddressDocumentsBtn");

        try {
            const client = getSupabaseClient();

            if (!currentUser) await getProfile();

            const address = $("addressLine")?.value.trim() || "";
            const city = $("addressCity")?.value.trim() || "";
            const postalCode = $("addressPostalCode")?.value.trim() || "";
            const country = $("addressCountry")?.value || "";

            if (!address || !city || !postalCode || !country) {
                throw new Error("Complete your address, city, postal code, and country.");
            }

            if (!selectedAddressDocumentType || !addressDocument) {
                throw new Error("Select a document type and choose a file.");
            }

            validateDocument(addressDocument);

            setButtonLoading(button, true, "Submitting...");

            const documentPath = await uploadPrivateFile(
                CONFIG.addressDocumentBucket,
                selectedAddressDocumentType,
                addressDocument
            );

            const updates = {
                address,
                city,
                postal_code: postalCode,
                country,
                address_document_type: selectedAddressDocumentType,
                address_document_path: documentPath,
                address_verification_status: "Pending Verification",
                updated_at: new Date().toISOString()
            };

            const { error } = await client
                .from(CONFIG.table)
                .update(updates)
                .eq("email", currentUser.email);

            if (error) throw error;

            profileData = { ...profileData, ...updates };

            setText("addressVerificationStatus", "Pending Verification");
            setStatus(
                "addressDocumentFileStatus",
                "Uploaded securely — Pending Verification",
                "success"
            );

            setMessage(
                "personalDetailsMessage",
                "Proof document submitted for verification.",
                "success"
            );
        } catch (error) {
            console.error("Address document error:", error);
            setMessage(
                "addressVerificationStatus",
                error.message || "Could not submit your proof document.",
                "error"
            );
        } finally {
            if (button) {
                button.textContent = "Save Documents";
                button.disabled = false;
            }
        }
    };

    /* ---------------------------------------------------------
       INITIALIZE
       --------------------------------------------------------- */

    function initializePersonalArea() {
        showFileName("idFrontFile", "idFrontFileName");
        showFileName("idBackFile", "idBackFileName");
        showFileName("addressDocumentFile", "addressDocumentFileName");

        setEditMode(false);
        setHidden("emailVerifyRow", true);
        setHidden("mobileVerifyRow", true);

        updateIdSubmitState();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializePersonalArea,
            { once: true }
        );
    } else {
        initializePersonalArea();
    }
})();



/* =====================================================
   PROFILE SIDEBAR — TOGGLE / CLOSE
===================================================== */

window.toggleProfileSidebar = function(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const sidebar = document.getElementById("profile-sidebar");

    if (!sidebar) return;

    const isOpen = sidebar.classList.contains("active");

    if (isOpen) {
        sidebar.classList.remove("active");
    } else {
        sidebar.classList.add("active");
    }
};

window.openProfileSidebar = function() {
    const sidebar = document.getElementById("profile-sidebar");
    if (sidebar) sidebar.classList.add("active");
};

window.closeProfileSidebar = function() {
    const sidebar = document.getElementById("profile-sidebar");
    if (sidebar) sidebar.classList.remove("active");
};


/* =====================================================
   CLOSE ON OUTSIDE CLICK
===================================================== */

document.addEventListener("click", function(event) {
    const sidebar = document.getElementById("profile-sidebar");
    const profileButton = document.querySelector(
        "#user-actions-area .actions-box:last-child"
    );

    if (!sidebar || !profileButton) return;

    if (!sidebar.classList.contains("active")) return;

    if (
        sidebar.contains(event.target) ||
        profileButton.contains(event.target)
    ) {
        return;
    }

    sidebar.classList.remove("active");
});


/* =====================================================
   CLOSE ON ESCAPE
===================================================== */

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        window.closeProfileSidebar();
    }
});
