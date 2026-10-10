
/* =========================================================
   PERSONAL AREA — COMPLETE JAVASCRIPT REPLACEMENT
   কাজ: Profile, Avatar, ID Verification, Face Detection,
   Address Documents এবং Profile Sidebar পরিচালনা করা।
   প্রয়োজন: Existing HTML + Initialized Supabase client.
   ========================================================= */

(() => {
    "use strict";

    // =====================================================
    // 01. CONFIGURATION — প্রয়োজনীয় Supabase সেটিংস
    // =====================================================

    const CONFIG = {
        table: "user_data",
        avatarBucket: "profile-avatars",
        idDocumentBucket: "id-verification",
        addressDocumentBucket: "proof-documents",
        maxFileSize: 5 * 1024 * 1024,
        imageTypes: ["image/jpeg", "image/png"],
        documentTypes: [
            "image/jpeg",
            "image/png",
            "application/pdf"
        ]
    };

    // =====================================================
    // 02. GLOBAL STATE — বর্তমান ইউজার ও ফাইলের অবস্থা
    // =====================================================

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

    let selectedAddressDocumentType = "";
    let addressDocument = null;

    let cameraStream = null;
    let faceDetectionInstance = null;
    let faceDetectionTimer = null;
    let faceDetectionBusy = false;
    let faceStableFrames = 0;
    let faceCaptureStarted = false;
    let faceDetectionScriptPromise = null;

    let idVerificationSubmitting = false;
    let idVerificationLocked = false;
    let idVerificationRecheckTimer = null;

    let frontObjectUrl = null;
    let backObjectUrl = null;
    let selfieObjectUrl = null;

    let verificationInitialized = false;

    // =====================================================
    // 03. COMMON HELPERS — HTML element ও status পরিচালনা
    // =====================================================

    const $ = (id) => document.getElementById(id);

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value ?? "";
    }

    function setInputValue(id, value) {
        const element = $(id);
        if (element) element.value = value ?? "";
    }

    function setHidden(id, hidden) {
        const element = $(id);
        if (element) element.hidden = Boolean(hidden);
    }

    function setMessage(id, message, type = "info") {
        const element = $(id);
        if (!element) return;

        element.textContent = message ?? "";
        element.dataset.state = type;
        element.setAttribute("role", "status");
    }

    function setStatus(id, message, type = "info") {
        setMessage(id, message, type);
    }

    function setButtonLoading(button, loading, loadingText = "Please wait...") {
        if (!button) return;

        if (loading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }

            button.textContent = loadingText;
            button.disabled = true;
            return;
        }

        if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }

    function safeFileName(name) {
        return String(name || "document")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .slice(-120);
    }

    function revokeObjectUrl(url) {
        if (url) URL.revokeObjectURL(url);
    }

    function normalizeStatus(value) {
        const status = String(value || "").trim().toLowerCase();

        if (["approved", "verified", "accepted"].includes(status)) {
            return "approved";
        }

        if (["pending", "pending verification", "under review"].includes(status)) {
            return "pending";
        }

        if (["rejected", "declined"].includes(status)) {
            return "rejected";
        }

        return "unverified";
    }

    // =====================================================
    // 04. SUPABASE AUTH — লগ-ইন ইউজার যাচাই
    // =====================================================

    function getSupabaseClient() {
        return window.supabaseClient ||
            (typeof supabaseClient !== "undefined"
                ? supabaseClient
                : null);
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

    // =====================================================
    // 05. PROFILE LOAD — Supabase থেকে ইউজারের তথ্য আনা
    // =====================================================

    async function getProfile() {
        const client = getSupabaseClient();
        const user = await getAuthenticatedUser();

        const { data, error } = await client
            .from(CONFIG.table)
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            throw new Error("Your user profile could not be found.");
        }

        currentUser = user;
        profileData = data;

        return profileData;
    }

    // =====================================================
    // 06. DATE FORMAT — সদস্য হওয়ার তারিখ সাজানো
    // =====================================================

    function formatMemberSince(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long"
        });
    }

    // =====================================================
    // 07. PERSONAL AREA SHOW/HIDE — প্যানেল খোলা ও বন্ধ
    // =====================================================

    function showPersonalArea() {
        const section = $("personal-area-section");

        if (section) section.style.display = "block";

        window.openPersonalTab("details");
    }

    function hidePersonalArea() {
        const section = $("personal-area-section");

        if (section) section.style.display = "none";

        window.stopFaceCamera();
    }

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

    // =====================================================
    // 08. TAB NAVIGATION — Details, Verification, Documents
    // =====================================================

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

   // =====================================================
// 09. PROFILE POPULATION — Personal Area-তে তথ্য দেখানো
// =====================================================

function populateProfile(profile) {
    if (!profile) return;

    setInputValue("profileFirstName", profile.first_name);
    setInputValue("profileLastName", profile.last_name);
    setInputValue("dateOfBirth", profile.date_of_birth);
    setInputValue("gender", profile.gender);

    setText("currentEmail", currentUser?.email || profile.email || "");

    setText(
        "memberSince",
        formatMemberSince(profile.created_at || currentUser?.created_at)
    );

    const avatar = $("profileAvatar");

    if (avatar) {
        avatar.onerror = () => avatar.removeAttribute("src");
        avatar.src = profile.avatar_url || "";
    }

    setInputValue("mobileNumber", profile.mobile_number || "");

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

    setText(
        "addressVerificationStatus",
        profile.address_verification_status || "Not submitted"
    );

    setEditMode(false);
    renderIdVerificationState(profile);
}
    // =====================================================
    // 10. PROFILE REFRESH — Supabase থেকে সর্বশেষ তথ্য আনা
    // =====================================================

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

    // =====================================================
    // 11. EDIT MODE — Profile field সম্পাদনা চালু/বন্ধ
    // =====================================================

    function setEditMode(enabled) {
    profileEditMode = enabled;

    ["profileFirstName", "profileLastName", "dateOfBirth", "gender"].forEach((id) => {
        const element = $(id);

            if (element) element.disabled = !enabled;
        });

        setText("editLabel", enabled ? "Editing" : "Edit details");

        const editButton = $("toggleEditBtn");

        if (editButton) {
            editButton.setAttribute("aria-pressed", String(enabled));
        }

        $("toggleTrack")?.classList.toggle("active", enabled);

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

    // =====================================================
    // 12. SAVE PROFILE — Personal details Supabase-এ সংরক্ষণ
    // =====================================================

    window.saveAllChanges = async function () {
        const client = getSupabaseClient();
        const button = $("saveChangesBtn");

        try {
            if (!currentUser) await getProfile();

            const firstName = $("profileFirstName")?.value.trim() || "";
const surname = $("profileLastName")?.value.trim() || "";
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
                delete button.dataset.originalText;
            }
        }
    };

    // =====================================================
    // 13. AVATAR — Profile photo upload ও URL সংরক্ষণ
    // =====================================================

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

            const path =
                `${currentUser.id}/${Date.now()}-${safeFileName(file.name)}`;

            const { error: uploadError } = await client.storage
                .from(CONFIG.avatarBucket)
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = client.storage
                .from(CONFIG.avatarBucket)
                .getPublicUrl(path);

            if (!data?.publicUrl) {
                throw new Error("Could not get the avatar URL.");
            }

            const { error } = await client
                .from(CONFIG.table)
                .update({
                    avatar_url: data.publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq("email", currentUser.email);

            if (error) throw error;

            profileData.avatar_url = data.publicUrl;

            if ($("profileAvatar")) {
                $("profileAvatar").src = data.publicUrl;
            }

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

    // =====================================================
    // 14. EMAIL CHANGE — নিরাপদ OTP backend এখনো প্রয়োজন
    // =====================================================

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

            if ($("saveNewEmailBtn")) {
                $("saveNewEmailBtn").disabled = true;
            }

            setMessage("emailChangeMessage", "");
        }
    };

    window.sendEmailOtp = async function () {
        const email = $("newEmailInput")?.value.trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage("emailChangeMessage", "Enter a valid new email.", "error");
            return;
        }

        if (email === currentUser?.email?.toLowerCase()) {
            setMessage(
                "emailChangeMessage",
                "This is already your current email.",
                "error"
            );
            return;
        }

        setMessage(
            "emailChangeMessage",
            "Secure email verification backend is not configured. No code was sent.",
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

    // =====================================================
    // 15. MOBILE CHANGE — SMS OTP backend প্রয়োজন
    // =====================================================

    window.toggleMobileChange = function () {
        const dropdown = $("mobileChangeDropdown");

        if (!dropdown) return;

        dropdown.hidden = !dropdown.hidden;

        if (!dropdown.hidden) {
            setInputValue("mobileOtpInput", "");
            setHidden("mobileVerifyRow", true);

            mobileVerified = false;
            pendingMobile = "";

            if ($("saveMobileBtn")) {
                $("saveMobileBtn").disabled = true;
            }

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

        setMessage(
            "mobileChangeMessage",
            "SMS verification is not configured. No OTP was sent.",
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

    // =====================================================
    // 16. FILE VALIDATION — Type ও 5 MB সীমা পরীক্ষা
    // =====================================================

    function validateDocument(file, allowedTypes = CONFIG.documentTypes) {
        if (!file) {
            throw new Error("Please choose a file.");
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error("Only the accepted file formats are allowed.");
        }

        if (file.size > CONFIG.maxFileSize) {
            throw new Error("Each file must be 5 MB or smaller.");
        }

        if (file.size === 0) {
            throw new Error("The selected file is empty.");
        }

        return true;
    }

    // =====================================================
    // 17. PRIVATE STORAGE UPLOAD — File path Supabase-এ রাখা
    // =====================================================

    async function uploadPrivateFile(bucket, folder, file) {
        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Supabase client is not initialized.");
        }

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

        return path;
    }

    // =====================================================
    // 18. ID STATUS BADGE — Unverified/Pending/Verified
    // =====================================================

    function updateIdStatusBadge(status) {
        const badge = $("idVerificationStatusBadge");

        if (!badge) return;

        const state = normalizeStatus(status);

        const labels = {
            unverified: "Unverified",
            pending: "Pending",
            approved: "Verified",
            rejected: "Rejected"
        };

        badge.textContent = labels[state];
        badge.dataset.status = state;
    }

    // =====================================================
    // 19. PROCESS ITEM — Verification step-এর অবস্থা
    // =====================================================

    function updateProcessItem(prefix, state, description) {
        const item = $(
            prefix === "idDocument"
                ? "processIdDocument"
                : prefix === "selfie"
                    ? "processSelfie"
                    : prefix === "addressProof"
                        ? "processAddressProof"
                        : "processAdminReview"
        );

        const labelId = {
            idDocument: "processIdDocumentStatus",
            selfie: "processSelfieStatus",
            addressProof: "processAddressProofStatus",
            adminReview: "processAdminReviewStatus"
        }[prefix];

        const badgeId = {
            idDocument: "processIdDocumentBadge",
            selfie: "processSelfieBadge",
            addressProof: "processAddressProofBadge",
            adminReview: "processAdminReviewBadge"
        }[prefix];

        if (item) item.dataset.state = state;

        setText(labelId, description);

        const badge = $(badgeId);

        if (badge) {
            badge.textContent = {
                approved: "Approved",
                pending: "Pending",
                rejected: "Rejected",
                not_required: "Not Required"
            }[state] || "Pending";
        }
    }

    // =====================================================
    // 20. ID FORM LOCK — Pending/Verified-তে editing বন্ধ
    // =====================================================

    function lockIdVerificationForm(locked) {
        idVerificationLocked = locked;

        [
            "idDocumentType",
            "idFrontFile",
            "idBackFile",
            "retakeIdFrontBtn",
            "retakeIdBackBtn",
            "startFaceCameraBtn",
            "retakeFacePhotoBtn",
            "stopFaceCameraBtn"
        ].forEach((id) => {
            const element = $(id);

            if (element) element.disabled = locked;
        });

        if (locked) {
            window.stopFaceCamera();
        }

        updateIdSubmitState();
    }

   // =====================================================
// 21. RENDER VERIFICATION — প্রকৃত submission অনুযায়ী UI
// =====================================================

// বাংলায়: শুধু status নয়, ID document-এর path-ও পরীক্ষা করা।
function getEffectiveIdVerificationState(profile) {
    const status = normalizeStatus(profile?.kyc_status);

    if (status === "approved" || status === "rejected") {
        return status;
    }

    if (status !== "pending") {
        return "unverified";
    }

    const documentType = String(
        profile?.id_document_type || ""
    ).trim().toLowerCase();

    const hasFront = Boolean(profile?.id_front_path);
    const hasSelfie = Boolean(profile?.face_photo_path);

    const hasBack =
        documentType === "passport" ||
        Boolean(profile?.id_back_path);

    // Pending status একা থাকলে submitted হিসেবে গণ্য হবে না।
    if (hasFront && hasBack && hasSelfie) {
        return "pending";
    }

    return "unverified";
}


// বাংলায়: কার্যকর status অনুযায়ী সঠিক verification UI দেখানো।
function renderIdVerificationState(profile) {
    const state = getEffectiveIdVerificationState(profile);

    updateIdStatusBadge(state);

    if (state === "approved") {
        setHidden("idVerificationForm", true);
        setHidden("verificationProcessSection", true);
        setHidden("idVerificationApprovedSection", false);

        lockIdVerificationForm(true);

        return;
    }

    if (state === "pending") {
        setHidden("idVerificationForm", true);
        setHidden("verificationProcessSection", false);
        setHidden("idVerificationApprovedSection", true);

        lockIdVerificationForm(true);

        updateProcessItem(
            "idDocument",
            "pending",
            "ID document submitted — Pending Review"
        );

        updateProcessItem(
            "selfie",
            "pending",
            "Selfie submitted — Pending Review"
        );

        updateProcessItem(
            "adminReview",
            "pending",
            "Waiting for administrator approval."
        );

        setText(
            "verificationProcessMessage",
            "Your ID verification is pending review."
        );

        setText(
            "idVerificationMessage",
            "Your verification has been submitted and is awaiting review."
        );

        return;
    }

    if (state === "rejected") {
        setHidden("idVerificationForm", false);
        setHidden("verificationProcessSection", false);
        setHidden("idVerificationApprovedSection", true);

        lockIdVerificationForm(false);

        setText(
            "verificationProcessMessage",
            "Your verification was rejected. Review the administrator's feedback before submitting again."
        );

        setText(
            "idVerificationMessage",
            "Your verification was rejected. Please review your documents and try again."
        );

        return;
    }

    // Unverified: ফর্ম ও Front/Back upload অপশন দেখানো।
    setHidden("idVerificationForm", false);
    setHidden("verificationProcessSection", true);
    setHidden("idVerificationApprovedSection", true);

    lockIdVerificationForm(false);

    updateIdSubmitState();
}

    // =====================================================
    // 22. SUBMIT BUTTON STATE — Required files অনুযায়ী চালু
    // =====================================================

    function updateIdSubmitState() {
        const type = $("idDocumentType")?.value || "";
        const backRequired = type !== "passport";

        const documentsReady =
            Boolean(type) &&
            Boolean(idFrontFile) &&
            (!backRequired || Boolean(idBackFile));

        const selfieReady = Boolean(facePhotoBlob);

        const button = $("submitIdVerificationBtn");
        const status = getEffectiveIdVerificationState(profileData);

        const canSubmit =
            documentsReady &&
            selfieReady &&
            !idVerificationSubmitting &&
            !idVerificationLocked &&
            !["pending", "approved"].includes(status);

        if (button) {
            button.disabled = !canSubmit;
        }
    }

    // =====================================================
    // 23. DOCUMENT TYPE FIRST — আগে ID type নির্বাচন করানো
    // =====================================================

    function requireDocumentType() {
        const type = $("idDocumentType")?.value;

        if (type) return true;

        setMessage(
            "idVerificationMessage",
            "Please select a document type first.",
            "error"
        );

        const select = $("idDocumentType");

        if (select) {
            select.focus();
            select.classList.add("id-document-type-error");

            select.addEventListener(
                "change",
                () => select.classList.remove("id-document-type-error"),
                { once: true }
            );
        }

        return false;
    }

    // =====================================================
    // 24. DOCUMENT TYPE CHANGE — Passport হলে Back বাদ
    // =====================================================

    function handleDocumentTypeChange() {
        const type = $("idDocumentType")?.value || "";
        const backCard = $("idBackUploadCard");
        const backInput = $("idBackFile");

        if (backCard) {
            backCard.hidden = type === "passport";
        }

        if (type === "passport") {
            idBackFile = null;

            if (backInput) backInput.value = "";

            revokeObjectUrl(backObjectUrl);
            backObjectUrl = null;

            const preview = $("idBackPreview");

            if (preview) {
                preview.removeAttribute("src");
                preview.hidden = true;
            }

            $("idBackUploadArea")?.classList.remove("has-preview");

            setText("idBackFileName", "Not required for passport");
            setStatus("idBackStatus", "Not required", "info");

            setHidden("retakeIdBackBtn", true);
        } else if (type) {
            setText("idBackFileName", idBackFile?.name || "Not Selected");

            if (!idBackFile) {
                setStatus("idBackStatus", "Not Selected");
            }
        }

        setMessage("idVerificationMessage", "");

        updateIdSubmitState();
    }

    // =====================================================
    // 25. PREVIEW CLEANUP — আগের image preview memory থেকে সরানো
    // =====================================================

    function clearDocumentPreview(inputId, previewId, areaId, fileNameId, statusId) {
        const input = $(inputId);
        const preview = $(previewId);

        if (input) input.value = "";

        if (preview) {
            preview.hidden = true;
            preview.removeAttribute("src");
        }

        $(areaId)?.classList.remove("has-preview");

        revokeObjectUrl(inputId === "idFrontFile" ? frontObjectUrl : backObjectUrl);

        if (inputId === "idFrontFile") {
            frontObjectUrl = null;
            idFrontFile = null;
        } else {
            backObjectUrl = null;
            idBackFile = null;
        }

        setText(fileNameId, "Not Selected");
        setStatus(statusId, "Not Selected");
        updateIdSubmitState();
    }

    // =====================================================
    // 26. FRONT/BACK PREVIEW — একই upload box-এ ছবি দেখানো
    // =====================================================

    function setupIdDocumentPreview(inputId, previewId, areaId, fileNameId, statusId, retakeButtonId) {
        const input = $(inputId);
        const preview = $(previewId);
        const area = $(areaId);
        const retakeButton = $(retakeButtonId);

        if (!input || !preview || !area) return;

        area.addEventListener("click", (event) => {
            if (idVerificationLocked) {
                event.preventDefault();
                return;
            }

            if (!requireDocumentType()) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            if (inputId === "idBackFile" && $("idDocumentType")?.value === "passport") {
                event.preventDefault();
                return;
            }
        });

        input.addEventListener("click", (event) => {
            if (idVerificationLocked || !requireDocumentType()) {
                event.preventDefault();
            }
        });

        input.addEventListener("change", () => {
            const file = input.files?.[0] || null;

            if (inputId === "idFrontFile") {
                idFrontFile = null;
            } else {
                idBackFile = null;
            }

            const previousUrl =
                inputId === "idFrontFile" ? frontObjectUrl : backObjectUrl;

            revokeObjectUrl(previousUrl);

            if (inputId === "idFrontFile") {
                frontObjectUrl = null;
            } else {
                backObjectUrl = null;
            }

            if (!file) {
                preview.hidden = true;
                preview.removeAttribute("src");
                area.classList.remove("has-preview");

                setText(fileNameId, "Not Selected");
                setStatus(statusId, "Not Selected");

                if (retakeButton) retakeButton.hidden = true;

                updateIdSubmitState();
                return;
            }

            if (!requireDocumentType()) {
                input.value = "";
                updateIdSubmitState();
                return;
            }

            try {
                validateDocument(file, CONFIG.imageTypes);
            } catch (error) {
                input.value = "";
                preview.hidden = true;
                preview.removeAttribute("src");
                area.classList.remove("has-preview");

                setText(fileNameId, "Not Selected");
                setStatus(statusId, error.message, "error");

                if (retakeButton) retakeButton.hidden = true;

                setMessage("idVerificationMessage", error.message, "error");

                updateIdSubmitState();
                return;
            }

            const objectUrl = URL.createObjectURL(file);

            preview.src = objectUrl;
            preview.hidden = false;
            area.classList.add("has-preview");

            if (inputId === "idFrontFile") {
                frontObjectUrl = objectUrl;
                idFrontFile = file;
            } else {
                backObjectUrl = objectUrl;
                idBackFile = file;
            }

            setText(fileNameId, file.name);
            setStatus(statusId, "Photo Selected — Ready to submit", "success");

            if (retakeButton) retakeButton.hidden = false;

            setMessage("idVerificationMessage", "");
            updateIdSubmitState();
        });

        retakeButton?.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (idVerificationLocked) return;
            if (!requireDocumentType()) return;

            input.click();
        });
    }

    // =====================================================
    // 27. LOAD MEDIAPIPE — Face Detection library লোড
    // =====================================================

    function loadFaceDetectionLibrary() {
        if (window.FaceDetection) {
            return Promise.resolve(window.FaceDetection);
        }

        if (faceDetectionScriptPromise) {
            return faceDetectionScriptPromise;
        }

        faceDetectionScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src =
                "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js";

            script.async = true;

            script.onload = () => {
                if (window.FaceDetection) {
                    resolve(window.FaceDetection);
                } else {
                    faceDetectionScriptPromise = null;
                    reject(new Error("MediaPipe Face Detection could not initialize."));
                }
            };

            script.onerror = () => {
                faceDetectionScriptPromise = null;
                reject(new Error("Could not load MediaPipe. Check your connection."));
            };

            document.head.appendChild(script);
        });

        return faceDetectionScriptPromise;
    }

    // =====================================================
    // 28. START FACE CAMERA — Camera ও face detection চালু
    // =====================================================

    window.startFaceCamera = async function () {
        if (idVerificationLocked) return;

        try {
            window.stopFaceCamera();

            faceCaptureStarted = false;
            faceStableFrames = 0;
            faceDetectionBusy = false;

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Camera access is unavailable. Please use HTTPS.");
            }

            setStatus(
                "faceCameraInstructions",
                "Loading face detection..."
            );

            setStatus(
                "faceVerificationStatus",
                "Loading face detection..."
            );

            const FaceDetection = await loadFaceDetectionLibrary();

            cameraStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            const video = $("faceCameraVideo");

            if (!video) {
                throw new Error("Camera preview element not found.");
            }

            video.srcObject = cameraStream;
            video.muted = true;
            video.playsInline = true;
            video.hidden = false;

            await video.play();

            setHidden("faceCameraPlaceholder", true);
            setHidden("faceCapturedPreview", true);
            setHidden("faceCameraGuide", false);
            setHidden("stopFaceCameraBtn", false);
            setHidden("startFaceCameraBtn", true);
            setHidden("retakeFacePhotoBtn", true);

            faceDetectionInstance = new FaceDetection({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
            });

            faceDetectionInstance.setOptions({
                model: "short",
                minDetectionConfidence: 0.8
            });

            faceDetectionInstance.onResults((results) => {
                if (faceCaptureStarted || !cameraStream) return;

                const detections = results?.detections || [];

                if (detections.length === 0) {
                    faceStableFrames = 0;

                    setStatus(
                        "faceCameraInstructions",
                        "Position your face inside the guide."
                    );

                    setStatus(
                        "faceVerificationStatus",
                        "Camera ready. Position your face inside the guide."
                    );

                    return;
                }

                if (detections.length !== 1) {
                    faceStableFrames = 0;

                    setStatus(
                        "faceCameraInstructions",
                        "Please make sure only one face is visible."
                    );

                    setStatus(
                        "faceVerificationStatus",
                        "Please make sure only one face is visible."
                    );

                    return;
                }

                faceStableFrames += 1;

                setStatus(
                    "faceCameraInstructions",
                    "Face detected. Hold still..."
                );

                setStatus(
                    "faceVerificationStatus",
                    "Face detected. Hold still..."
                );

                if (faceStableFrames >= 10) {
                    faceCaptureStarted = true;

                    if (faceDetectionTimer !== null) {
                        clearInterval(faceDetectionTimer);
                        faceDetectionTimer = null;
                    }

                    window.captureFacePhoto();
                }
            });

            setStatus(
                "faceCameraInstructions",
                "Camera ready. Position your face inside the guide."
            );

            faceDetectionTimer = window.setInterval(async () => {
                if (
                    faceDetectionBusy ||
                    faceCaptureStarted ||
                    !cameraStream ||
                    !faceDetectionInstance ||
                    video.readyState < 2 ||
                    !video.videoWidth ||
                    !video.videoHeight
                ) {
                    return;
                }

                faceDetectionBusy = true;

                try {
                    await faceDetectionInstance.send({ image: video });
                } catch (error) {
                    console.error("MediaPipe frame error:", error);

                    setStatus(
                        "faceVerificationStatus",
                        "Face detection encountered an error.",
                        "error"
                    );
                } finally {
                    faceDetectionBusy = false;
                }
            }, 200);

        } catch (error) {
            console.error("Start camera error:", error);

            window.stopFaceCamera();

            faceCaptureStarted = false;
            faceStableFrames = 0;

            setHidden("startFaceCameraBtn", false);
            setHidden("faceCameraPlaceholder", false);
            setHidden("faceCameraGuide", true);

            setStatus(
                "faceCameraInstructions",
                error.message || "Unable to start the camera.",
                "error"
            );

            setStatus(
                "faceVerificationStatus",
                error.message || "Unable to start the camera.",
                "error"
            );
        }
    };

    // =====================================================
    // 29. CAPTURE SELFIE — 10 stable frames পরে ছবি তোলা
    // =====================================================

    window.captureFacePhoto = async function () {
        const video = $("faceCameraVideo");
        const canvas = $("faceCaptureCanvas");

        if (
            !video ||
            !canvas ||
            !cameraStream ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            faceCaptureStarted = false;

            setStatus(
                "faceVerificationStatus",
                "Camera is not ready. Please try again.",
                "error"
            );

            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error("Could not prepare the selfie canvas.");
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (result) => result
                        ? resolve(result)
                        : reject(new Error("Could not capture the selfie.")),
                    "image/jpeg",
                    0.92
                );
            });

            facePhotoBlob = blob;

            revokeObjectUrl(selfieObjectUrl);
            selfieObjectUrl = URL.createObjectURL(blob);

            const preview = $("faceCapturedPreview");

            if (preview) {
                preview.src = selfieObjectUrl;
                preview.hidden = false;
            }

            const reference = $("faceCaptureReference");

            if (reference) reference.value = "captured";

            window.stopFaceCamera();

            setHidden("faceCameraVideo", true);
            setHidden("faceCameraPlaceholder", true);
            setHidden("faceCameraGuide", true);
            setHidden("startFaceCameraBtn", true);
            setHidden("stopFaceCameraBtn", true);
            setHidden("captureFaceBtn", true);
            setHidden("retakeFacePhotoBtn", false);

            setStatus(
                "faceCameraInstructions",
                "Selfie captured successfully.",
                "success"
            );

            setStatus(
                "faceVerificationStatus",
                "Selfie Captured Successfully",
                "success"
            );

            updateIdSubmitState();

            // IMPORTANT:
            // Selfie capture কখনোই স্বয়ংক্রিয়ভাবে Submit করবে না।
            // Submit button ব্যবহারকারী নিজে ক্লিক করবেন।

            if (!requireDocumentType()) return;

            const type = $("idDocumentType")?.value;
            const backRequired = type !== "passport";

            if (!idFrontFile || (backRequired && !idBackFile)) {
                setMessage(
                    "idVerificationMessage",
                    "Selfie captured. Upload the required ID documents to continue.",
                    "info"
                );
            } else {
                setMessage(
                    "idVerificationMessage",
                    "All required photos are ready. Click Submit for Verification.",
                    "success"
                );
            }

        } catch (error) {
            console.error("Selfie capture error:", error);

            faceCaptureStarted = false;

            setStatus(
                "faceVerificationStatus",
                error.message || "Could not capture the selfie.",
                "error"
            );

            setStatus(
                "faceCameraInstructions",
                error.message || "Could not capture the selfie.",
                "error"
            );

            setHidden("startFaceCameraBtn", false);
        }
    };

    // =====================================================
    // 30. STOP CAMERA — Camera stream ও MediaPipe বন্ধ
    // =====================================================

    window.stopFaceCamera = function () {
        if (faceDetectionTimer !== null) {
            clearInterval(faceDetectionTimer);
            faceDetectionTimer = null;
        }

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

        if (faceDetectionInstance) {
            try {
                faceDetectionInstance.close();
            } catch (error) {
                console.warn("Could not close Face Detection cleanly:", error);
            }

            faceDetectionInstance = null;
        }

        faceDetectionBusy = false;

        setHidden("stopFaceCameraBtn", true);
    };

    // =====================================================
    // 31. RETAKE SELFIE — নতুন selfie তোলার জন্য reset
    // =====================================================

    window.retakeFacePhoto = function () {
        if (idVerificationLocked) return;

        facePhotoBlob = null;
        faceCaptureStarted = false;
        faceStableFrames = 0;

        revokeObjectUrl(selfieObjectUrl);
        selfieObjectUrl = null;

        const preview = $("faceCapturedPreview");

        if (preview) {
            preview.removeAttribute("src");
            preview.hidden = true;
        }

        const reference = $("faceCaptureReference");

        if (reference) reference.value = "";

        setHidden("faceCameraPlaceholder", false);
        setHidden("faceCameraGuide", true);
        setHidden("startFaceCameraBtn", false);
        setHidden("retakeFacePhotoBtn", true);
        setHidden("stopFaceCameraBtn", true);

        setStatus(
            "faceCameraInstructions",
            "Press Start Verification to begin."
        );

        setStatus(
            "faceVerificationStatus",
            "Selfie Not Captured"
        );

        updateIdSubmitState();

        window.startFaceCamera();
    };

    // =====================================================
    // 32. SUBMIT ID VERIFICATION — নিজে ক্লিক করলে upload
    // =====================================================

    window.submitIdVerification = async function () {
        const button = $("submitIdVerificationBtn");

        if (idVerificationSubmitting || idVerificationLocked) return;

        if (!requireDocumentType()) return;

        const type = $("idDocumentType")?.value || "";
        const backRequired = type !== "passport";

        if (!idFrontFile) {
            setMessage(
                "idVerificationMessage",
                "Please upload the front side of your document.",
                "error"
            );
            return;
        }

        if (backRequired && !idBackFile) {
            setMessage(
                "idVerificationMessage",
                "Please upload the back side of your document.",
                "error"
            );
            return;
        }

        if (!facePhotoBlob) {
            setMessage(
                "idVerificationMessage",
                "Please complete the selfie capture first.",
                "error"
            );
            return;
        }

        try {
            validateDocument(idFrontFile, CONFIG.imageTypes);

            if (backRequired) {
                validateDocument(idBackFile, CONFIG.imageTypes);
            }

            if (facePhotoBlob.size > CONFIG.maxFileSize) {
                throw new Error("Selfie must be 5 MB or smaller.");
            }

        } catch (error) {
            setMessage("idVerificationMessage", error.message, "error");
            return;
        }

        idVerificationSubmitting = true;
        updateIdSubmitState();
        setButtonLoading(button, true, "Uploading...");

        let frontPath = null;
        let backPath = null;
        let selfiePath = null;

        try {
            const client = getSupabaseClient();

            if (!currentUser) await getProfile();

            if (!currentUser?.email) {
                throw new Error("Please log in before submitting verification.");
            }

            // Re-check status to prevent duplicate pending submissions.
            const { data: latestProfile, error: profileError } = await client
                .from(CONFIG.table)
                .select(
    "kyc_status, id_document_type, id_front_path, id_back_path, face_photo_path"
)
                .eq("email", currentUser.email)
                .maybeSingle();

            if (profileError) throw profileError;

            const latestStatus = getEffectiveIdVerificationState(latestProfile);

            if (["pending", "approved"].includes(latestStatus)) {
                profileData = { ...profileData, ...latestProfile };

                renderIdVerificationState(profileData);

                throw new Error(
                    latestStatus === "pending"
                        ? "Your verification is already pending review."
                        : "Your identity is already verified."
                );
            }

            frontPath = await uploadPrivateFile(
                CONFIG.idDocumentBucket,
                "front",
                idFrontFile
            );

            if (backRequired) {
                backPath = await uploadPrivateFile(
                    CONFIG.idDocumentBucket,
                    "back",
                    idBackFile
                );
            }

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

            const updates = {
                id_document_type: type,
                id_front_path: frontPath,
                id_back_path: backPath,
                face_photo_path: selfiePath,
                kyc_status: "Pending",
                updated_at: new Date().toISOString()
            };

            const { data, error } = await client
                .from(CONFIG.table)
                .update(updates)
                .eq("email", currentUser.email)
                .select()
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error(
                    "No profile row was updated. Check your user_data row and Supabase permissions."
                );
            }

            profileData = { ...profileData, ...data, ...updates };

            setStatus("idFrontStatus", "Uploaded securely", "success");

            setStatus(
                "idBackStatus",
                backPath ? "Uploaded securely" : "Not required for passport",
                "success"
            );

            setStatus(
                "faceVerificationStatus",
                "Selfie uploaded successfully",
                "success"
            );

            setMessage(
                "idVerificationMessage",
                "Verification submitted successfully — Pending Review.",
                "success"
            );

            setMessage(
                "personalDetailsMessage",
                "Identity verification submitted for review.",
                "success"
            );

            renderIdVerificationState(profileData);

        } catch (error) {
            console.error("ID submission error:", error);

            setMessage(
                "idVerificationMessage",
                error.message || "Could not submit identity documents.",
                "error"
            );

            // Failed uploads may leave unused objects in private storage.
            // They are not automatically deleted to avoid deleting files
            // that may already be referenced by another operation.

        } finally {
            idVerificationSubmitting = false;

            if (button) {
                delete button.dataset.originalText;
                button.textContent = "Submit for Verification";
            }

            updateIdSubmitState();
        }
    };

    // =====================================================
    // 33. VERIFY AGAIN — Approved হলে নতুন application শুরু
    // =====================================================

    window.verifyAgain = function () {
        if (normalizeStatus(profileData?.kyc_status) !== "approved") {
            return;
        }

        idFrontFile = null;
        idBackFile = null;
        facePhotoBlob = null;

        revokeObjectUrl(frontObjectUrl);
        revokeObjectUrl(backObjectUrl);
        revokeObjectUrl(selfieObjectUrl);

        frontObjectUrl = null;
        backObjectUrl = null;
        selfieObjectUrl = null;

        ["idFrontFile", "idBackFile"].forEach((id) => {
            if ($(id)) $(id).value = "";
        });

        ["idFrontPreview", "idBackPreview", "faceCapturedPreview"].forEach((id) => {
            const preview = $(id);

            if (preview) {
                preview.removeAttribute("src");
                preview.hidden = true;
            }
        });

        $("idFrontUploadArea")?.classList.remove("has-preview");
        $("idBackUploadArea")?.classList.remove("has-preview");

        setText("idFrontFileName", "Not Selected");
        setText("idBackFileName", "Not Selected");

        setStatus("idFrontStatus", "Not Selected");
        setStatus("idBackStatus", "Not Selected");
        setStatus("faceVerificationStatus", "Selfie Not Captured");

        setInputValue("faceCaptureReference", "");

        setInputValue("idDocumentType", "");

        const button = $("verifyAgainBtn");

        if (button) button.disabled = true;

        // The existing approval/history is not overwritten here.
        // The new application is saved only when the user submits.
        setHidden("idVerificationForm", false);
        setHidden("verificationProcessSection", true);
        setHidden("idVerificationApprovedSection", true);

        lockIdVerificationForm(false);

        setMessage(
            "idVerificationMessage",
            "Re-verification started. Choose your document type and submit updated photos.",
            "info"
        );

        updateIdStatusBadge("unverified");
        updateIdSubmitState();
    };

    // =====================================================
    // 34. VERIFY AGAIN BUTTON — HTML button-এর সঙ্গে সংযোগ
    // =====================================================

    $("verifyAgainBtn")?.addEventListener("click", () => {
        window.verifyAgain();
    });

    // =====================================================
    // 35. ADDRESS DOCUMENT TYPE — Proof document নির্বাচন
    // =====================================================

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

    // =====================================================
    // 36. ADDRESS FILE SELECTION — File type ও size যাচাই
    // =====================================================

    $("addressDocumentFile")?.addEventListener("change", (event) => {
        const file = event.target.files?.[0] || null;

        addressDocument = null;

        if (!file) {
            setText("addressDocumentFileName", "No file selected");
            setStatus("addressDocumentFileStatus", "Not uploaded");
            return;
        }

        try {
            validateDocument(file, CONFIG.documentTypes);
        } catch (error) {
            event.target.value = "";
            setText("addressDocumentFileName", "No file selected");
            setStatus("addressDocumentFileStatus", error.message, "error");
            return;
        }

        addressDocument = file;

        setText("addressDocumentFileName", file.name);

        setStatus(
            "addressDocumentFileStatus",
            "Selected — Ready to submit",
            "success"
        );
    });

    // =====================================================
    // 37. SAVE ADDRESS DOCUMENT — Address ও proof সংরক্ষণ
    // =====================================================

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
                throw new Error(
                    "Complete your address, city, postal code, and country."
                );
            }

            if (!selectedAddressDocumentType || !addressDocument) {
                throw new Error("Select a document type and choose a file.");
            }

            validateDocument(addressDocument, CONFIG.documentTypes);

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

            const { data, error } = await client
                .from(CONFIG.table)
                .update(updates)
                .eq("email", currentUser.email)
                .select()
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                throw new Error("Your address information could not be saved.");
            }

            profileData = { ...profileData, ...data, ...updates };

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
                delete button.dataset.originalText;
                button.textContent = "Save Documents";
                button.disabled = false;
            }
        }
    };

    // =====================================================
    // 38. INITIALIZE VERIFICATION — সব input handler bind করা
    // =====================================================

    function initializeVerification() {
        if (verificationInitialized) return;

        verificationInitialized = true;

        $("idDocumentType")?.addEventListener(
            "change",
            handleDocumentTypeChange
        );

        setupIdDocumentPreview(
            "idFrontFile",
            "idFrontPreview",
            "idFrontUploadArea",
            "idFrontFileName",
            "idFrontStatus",
            "retakeIdFrontBtn"
        );

        setupIdDocumentPreview(
            "idBackFile",
            "idBackPreview",
            "idBackUploadArea",
            "idBackFileName",
            "idBackStatus",
            "retakeIdBackBtn"
        );

        $("startFaceCameraBtn")?.addEventListener("click", () => {
            if (idVerificationLocked) return;
            window.startFaceCamera();
        });

        $("stopFaceCameraBtn")?.addEventListener("click", () => {
            window.stopFaceCamera();

            setHidden("startFaceCameraBtn", false);
            setHidden("faceCameraPlaceholder", false);
            setHidden("faceCameraGuide", true);

            setStatus(
                "faceVerificationStatus",
                "Camera stopped. Press Start Verification to continue."
            );
        });

        $("retakeFacePhotoBtn")?.addEventListener("click", () => {
            window.retakeFacePhoto();
        });

        $("submitIdVerificationBtn")?.addEventListener("click", () => {
            window.submitIdVerification();
        });

        // Keep hidden until the database confirms approval.
        setHidden("verificationProcessSection", true);
        setHidden("idVerificationApprovedSection", true);

        handleDocumentTypeChange();
        updateIdSubmitState();
    }

    // =====================================================
    // 39. INITIALIZE PERSONAL AREA — page load-এর প্রাথমিক কাজ
    // =====================================================

    function initializePersonalArea() {
        initializeVerification();

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

    // =====================================================
    // 40. PROFILE SIDEBAR — sidebar toggle/close
    // =====================================================

    window.toggleProfileSidebar = function (event) {
        if (event) event.stopPropagation();

        const sidebar = $("profile-sidebar");

        if (!sidebar) return;

        sidebar.classList.toggle("active");
    };

    window.closeProfileSidebar = function () {
        const sidebar = $("profile-sidebar");

        if (sidebar) sidebar.classList.remove("active");
    };

    // =====================================================
    // 41. SIDEBAR OUTSIDE CLICK — বাইরে ক্লিক করলে বন্ধ
    // =====================================================

    document.addEventListener("click", (event) => {
        const sidebar = $("profile-sidebar");

        if (!sidebar || !sidebar.classList.contains("active")) return;

        const button = event.target.closest(
            '#user-actions-area [onclick*="toggleProfileSidebar"]'
        );

        if (!sidebar.contains(event.target) && !button) {
            window.closeProfileSidebar();
        }
    });

    // =====================================================
    // 42. SIDEBAR ESCAPE KEY — Escape চাপলে বন্ধ
    // =====================================================

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            $("profile-sidebar")?.classList.contains("active")
        ) {
            window.closeProfileSidebar();
        }
    });

})();
