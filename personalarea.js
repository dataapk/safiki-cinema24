
/* =========================================================
   PERSONAL AREA — COMPLETE JAVASCRIPT REPLACEMENT
   কাজ: Profile, Avatar, ID Verification, Face Detection,
   Address Documents এবং Profile Sidebar পরিচালনা করা।
   প্রয়োজন: Existing HTML + Initialized Supabase client.
   ======================================================== */

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

    maxFileSize: 2 * 1024 * 1024, // Maximum 2 MB

    fileSizeErrorMessage:
        "File size limit exceeded! Please upload a file smaller than 2 MB.",

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

    window.renderAddressVerificationStatus(
    profile.address_verification_status || "Not Verified"
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
    // 17. PRIVATE STORAGE UPLOAD — DG User ID অনুযায়ী
    // =====================================================

    async function uploadPrivateFile(bucket, folder, file) {
        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Supabase client is not initialized.");
        }

        validateDocument(file);

        // Load the current user's profile
        const profile = await getProfile();

        // Use the DG-prefixed ID from user_data
        const appUserId = profile.user_id;

        if (
            typeof appUserId !== "string" ||
            !/^DG\d+$/.test(appUserId)
        ) {
            throw new Error(
                "Your valid DG User ID could not be found."
            );
        }

        // Build a separate storage path for each user and document
        const path =
            `${appUserId}/${folder}/${Date.now()}-${safeFileName(file.name)}`;

        const { error } = await client.storage
            .from(bucket)
            .upload(path, file, {
                upsert: false,
                contentType: file.type
            });

        if (error) {
            throw error;
        }

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
    profile?.kyc_document_type || ""
).trim().toLowerCase();

    const hasFront = Boolean(profile?.id_front_part);
const hasSelfie = Boolean(profile?.live_selfie);

const hasBack =
    documentType === "passport" ||
    Boolean(profile?.id_back_part);
   
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

     
            // ==========================================
            // FILE SIZE VALIDATION — MAXIMUM 2 MB
            // ==========================================
            if (file.size > CONFIG.maxFileSize) {
                input.value = "";

                preview.hidden = true;
                preview.removeAttribute("src");
                area.classList.remove("has-preview");

                setText(fileNameId, "Not Selected");
                setStatus(
                    statusId,
                    CONFIG.fileSizeErrorMessage,
                    "error"
                );

                if (retakeButton) retakeButton.hidden = true;

                setMessage(
                    "idVerificationMessage",
                    CONFIG.fileSizeErrorMessage,
                    "error"
                );

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

   // ========================================
// FACE POSITION + SHARPNESS VALIDATION
// ========================================

function isFaceInsideRoundGuide(video, guide, box) {
    const videoRect = video.getBoundingClientRect();
    const guideRect = guide.getBoundingClientRect();

    if (
        !video.videoWidth ||
        !video.videoHeight ||
        !videoRect.width ||
        !videoRect.height
    ) {
        return false;
    }

    // Match normalized MediaPipe coordinates to the
    // visible video, including object-fit: cover.
    const style = window.getComputedStyle(video);
    const scale = style.objectFit === "cover"
        ? Math.max(
            videoRect.width / video.videoWidth,
            videoRect.height / video.videoHeight
        )
        : Math.min(
            videoRect.width / video.videoWidth,
            videoRect.height / video.videoHeight
        );

    const renderedWidth = video.videoWidth * scale;
    const renderedHeight = video.videoHeight * scale;

    const offsetX = (renderedWidth - videoRect.width) / 2;
    const offsetY = (renderedHeight - videoRect.height) / 2;

    let centerX = box.xCenter;

    // Account for a mirrored selfie preview.
    if (style.transform === "matrix(-1, 0, 0, 1, 0, 0)") {
        centerX = 1 - centerX;
    }

    const left = videoRect.left
        + centerX * video.videoWidth * scale
        - offsetX
        - (box.width * video.videoWidth * scale) / 2;

    const right = left + box.width * video.videoWidth * scale;

    const top = videoRect.top
        + box.yCenter * video.videoHeight * scale
        - offsetY
        - (box.height * video.videoHeight * scale) / 2;

    const bottom = top + box.height * video.videoHeight * scale;

    // Use the actual circular/elliptical guide boundary.
    const cx = (guideRect.left + guideRect.right) / 2;
    const cy = (guideRect.top + guideRect.bottom) / 2;
    const rx = guideRect.width / 2;
    const ry = guideRect.height / 2;

    if (!rx || !ry) return false;

    const corners = [
        [left, top],
        [right, top],
        [left, bottom],
        [right, bottom]
    ];

   return corners.every(([x, y]) => {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;

    return dx * dx + dy * dy <= 1.00;
});
}


// Check sharpness inside the detected face region.
function isFaceFrameSharp(video, box) {
    if (!box || !video.videoWidth || !video.videoHeight) {
        return false;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;

    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    if (!ctx) return false;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const sx = Math.max(
        0,
        (box.xCenter - box.width / 2) * vw
    );

    const sy = Math.max(
        0,
        (box.yCenter - box.height / 2) * vh
    );

    const sw = Math.min(
        box.width * vw,
        vw - sx
    );

    const sh = Math.min(
        box.height * vh,
        vh - sy
    );

    if (sw <= 0 || sh <= 0) return false;

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 96, 96);

    const { data } = ctx.getImageData(0, 0, 96, 96);
    const gray = new Float32Array(96 * 96);

    for (let i = 0; i < gray.length; i++) {
        const p = i * 4;

        gray[i] =
            0.299 * data[p] +
            0.587 * data[p + 1] +
            0.114 * data[p + 2];
    }

    let sum = 0;
    let sumSquares = 0;
    let count = 0;

    for (let y = 1; y < 95; y++) {
        for (let x = 1; x < 95; x++) {
            const i = y * 96 + x;

            const laplacian =
                gray[i - 96] +
                gray[i + 96] +
                gray[i - 1] +
                gray[i + 1] -
                4 * gray[i];

            sum += laplacian;
            sumSquares += laplacian * laplacian;
            count++;
        }
    }

    const variance = sumSquares / count
        - Math.pow(sum / count, 2);

    // Initial threshold; tune with real camera tests.
    return variance >= 15;
}

   // ========================================
// CHECK BOTH EYES ARE OPEN — Face Mesh
// ========================================

function areBothEyesOpen(landmarks) {
    if (!landmarks || landmarks.length < 478) {
        return false;
    }

    function distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function eyeAspectRatio(top1, top2, bottom1, bottom2, left, right) {
        const vertical1 = distance(
            landmarks[top1],
            landmarks[bottom1]
        );

        const vertical2 = distance(
            landmarks[top2],
            landmarks[bottom2]
        );

        const horizontal = distance(
            landmarks[left],
            landmarks[right]
        );

        if (!horizontal) return 0;

        return (vertical1 + vertical2) / (2 * horizontal);
    }

    // Left eye
    const leftEAR = eyeAspectRatio(
        159, 158, 145, 153, 33, 133
    );

    // Right eye
    const rightEAR = eyeAspectRatio(
        386, 385, 374, 380, 362, 263
    );

    // Initial threshold; calibrate using real camera tests.
    return leftEAR > 0.14 && rightEAR > 0.14;
}

   // ========================================
// LOAD MEDIAPIPE FACE MESH
// ========================================

window.loadFaceMeshLibrary = async function () {
    if (window.FaceMesh) {
        return window.FaceMesh;
    }

    if (window.faceMeshLibraryPromise) {
        return window.faceMeshLibraryPromise;
    }

    window.faceMeshLibraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";

        script.onload = () => {
            if (window.FaceMesh) {
                resolve(window.FaceMesh);
            } else {
                reject(new Error("Face Mesh library failed to load."));
            }
        };

        script.onerror = () => {
            window.faceMeshLibraryPromise = null;
            reject(new Error("Could not load Face Mesh library."));
        };

        document.head.appendChild(script);
    });

    return window.faceMeshLibraryPromise;
};

   // ========================================
// INITIALIZE FACE MESH EYE DETECTION
// ========================================

window.initFaceMesh = async function () {
    const FaceMesh = await window.loadFaceMeshLibrary();

    const mesh = new FaceMesh({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    mesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    mesh.onResults((results) => {
        const faces = results?.multiFaceLandmarks || [];

        if (faces.length !== 1) {
            window.faceEyesOpen = false;
            return;
        }

        window.faceEyesOpen = areBothEyesOpen(faces[0]);
    });

    window.faceMeshInstance = mesh;
    window.faceEyesOpen = false;

    return mesh;
};

    // =====================================================
    // 28. START FACE CAMERA — Camera ও face detection চালু
    // =====================================================

    window.startFaceCamera = async function () {
        if (idVerificationLocked) return;

        try {
    window.stopFaceCamera();

    // ========================================
    // RESET SCAN BAR WHEN CAMERA STARTS
    // ========================================

    const scanner = document.querySelector(".face-camera-preview");
    const scanBar = $("scanBar");

    if (scanner) {
        scanner.dataset.scanState = "scanning";
    }

    if (scanBar) {
        scanBar.style.animation = "";
        scanBar.style.top = "";
        scanBar.style.transform = "";
        scanBar.style.opacity = "";
    }

    // Continue existing camera reset logic
    faceCaptureStarted = false;
    faceStableFrames = 0;
    faceDetectionBusy = false;
   window.lastFaceBoundingBox = null;

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

           // Initialize eye detection before allowing capture.
window.faceEyesOpen = false;
await window.initFaceMesh();

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
    const video = $("faceCameraVideo");
    const guide = document.querySelector(".face-scanner-ring");

    if (!video || !guide) return;

    if (detections.length !== 1) {
        faceStableFrames = 0;

        const message = detections.length === 0
            ? "Position your full face inside the round guide."
            : "Only one face is allowed.";

        setStatus("faceCameraInstructions", message);
        setStatus("faceVerificationStatus", message);
        return;
    }

    const box = detections[0].boundingBox;

if (!box) {
    faceStableFrames = 0;
    return;
}

window.lastFaceBoundingBox = box;

    if (!box) {
        faceStableFrames = 0;
        return;
    }

    // 1. Reject faces outside the circular guide.
    if (!isFaceInsideRoundGuide(video, guide, box)) {
        faceStableFrames = 0;

        setStatus(
            "faceCameraInstructions",
            "Move your full face inside the round guide."
        );

        setStatus(
            "faceVerificationStatus",
            "Face is outside the guide. No photo taken."
        );

        return;
    }

    // 2. Reject blurry face frames.
    if (!isFaceFrameSharp(video, box)) {
        faceStableFrames = 0;

        setStatus(
            "faceCameraInstructions",
            "Hold still. Make sure your face is clear and well lit."
        );

        setStatus(
            "faceVerificationStatus",
            "Waiting for a clear, sharp face..."
        );

        return;
    }

   if (!window.faceEyesOpen) {
    faceStableFrames = 0;

    setStatus(
        "faceCameraInstructions",
        "Please open both eyes and look at the camera."
    );

    setStatus(
        "faceVerificationStatus",
        "Waiting for both eyes to be open..."
    );

    return;
}


    // 3. Require consecutive valid frames.
    faceStableFrames++;

    setStatus(
        "faceCameraInstructions",
        faceStableFrames < 8
            ? "Face aligned. Hold still..."
            : "Face accepted. Capturing photo..."
    );

    setStatus(
        "faceVerificationStatus",
        faceStableFrames < 8
            ? "Checking face position and clarity..."
            : "Face position accepted."
    );

    // Eight valid frames at a 200 ms interval
    // gives approximately 1.6 seconds of validation.
    if (faceStableFrames < 8 || faceCaptureStarted) {
        return;
    }

    faceCaptureStarted = true;

    // Keep the detection timer running until the
    // capture succeeds; a rejected frame can retry.
    window.captureFacePhoto();
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
                   if (window.faceMeshInstance) {
    await window.faceMeshInstance.send({ image: video });
}
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
// 29. CAPTURE SELFIE — Capture once and stop scan bar
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

       // Revalidate the latest detected face before capture.
const guide = document.querySelector(".face-scanner-ring");
const lastDetectionsBox = window.lastFaceBoundingBox;

if (
    !guide ||
    !lastDetectionsBox ||
    !isFaceInsideRoundGuide(video, guide, lastDetectionsBox) ||
    !isFaceFrameSharp(video, lastDetectionsBox)
) {
    faceCaptureStarted = false;
    faceStableFrames = 0;

    setStatus(
        "faceCameraInstructions",
        "Keep your full face inside the round guide and hold still."
    );

    setStatus(
        "faceVerificationStatus",
        "Photo not captured. Please align your face again."
    );

    return;
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

// ========================================
// STOP SCAN BAR AFTER SUCCESSFUL CAPTURE
// ========================================

const scanner = document.querySelector(".face-camera-preview");
const scanBar = $("scanBar");

// Set scanner state to success
if (scanner) {
    scanner.dataset.scanState = "success";
}

// Stop the scan bar at the bottom
if (scanBar) {
    scanBar.style.animation = "none";
    scanBar.style.top = "calc(100% - 4px)";
    scanBar.style.transform = "translateY(-50%)";
    scanBar.style.opacity = "1";
}

// Stop camera after capturing the photo
window.stopFaceCamera();

// Update camera and button visibility
setHidden("faceCameraVideo", true);
setHidden("faceCameraPlaceholder", true);
setHidden("faceCameraGuide", true);
setHidden("startFaceCameraBtn", true);
setHidden("stopFaceCameraBtn", true);
setHidden("captureFaceBtn", true);
setHidden("retakeFacePhotoBtn", false);

// Update capture status
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
// 32. SUBMIT ID VERIFICATION — Supabase Private Storage
// =====================================================

window.submitIdVerification = async function () {
    const button = $("submitIdVerificationBtn");

    if (idVerificationSubmitting || idVerificationLocked) return;

    if (!requireDocumentType()) return;

    const type = $("idDocumentType")?.value || "";
    const backRequired = type !== "passport";

    // Validate required documents
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

    // Validate file types and sizes
    try {
        validateDocument(idFrontFile, CONFIG.imageTypes);

        if (backRequired) {
            validateDocument(idBackFile, CONFIG.imageTypes);
        }

        if (facePhotoBlob.size > CONFIG.maxFileSize) {
            throw new Error("Selfie must be 2 MB or smaller.");
        }
    } catch (error) {
        setMessage(
            "idVerificationMessage",
            error.message || "Please check your document files.",
            "error"
        );
        return;
    }

    idVerificationSubmitting = true;
    updateIdSubmitState();

    if (button) {
        setButtonLoading(button, true, "Uploading...");
    }

    let frontPath = null;
    let backPath = null;
    let selfiePath = null;

    try {
        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Supabase client is not initialized.");
        }

        // Load the logged-in user's profile
        const profile = await getProfile();

        if (!currentUser?.id || !currentUser?.email) {
            throw new Error(
                "Please log in before submitting verification."
            );
        }

        if (!profile?.user_id) {
            throw new Error("Your DG User ID could not be found.");
        }

        // Check existing verification status
        const { data: latestProfile, error: profileError } =
            await client
                .from(CONFIG.table)
                .select(
   "user_id, auth_user_id, kyc_status, kyc_document_type, id_front_part, id_back_part, live_selfie"
)
                .eq("auth_user_id", currentUser.id)
                .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        if (!latestProfile) {
            throw new Error(
                "Your user profile could not be found."
            );
        }

        const latestStatus =
            getEffectiveIdVerificationState(latestProfile);

        if (["pending", "approved"].includes(latestStatus)) {
            profileData = {
                ...profileData,
                ...latestProfile
            };

            renderIdVerificationState(profileData);

            throw new Error(
                latestStatus === "pending"
                    ? "Your verification is already pending review."
                    : "Your identity is already verified."
            );
        }

        // All ID verification files belong in this private bucket.
        const bucket = CONFIG.idDocumentBucket;

        if (bucket !== "id-verification") {
            throw new Error(
                "The ID verification bucket configuration is incorrect."
            );
        }

        // Upload front ID
        frontPath = await uploadPrivateFile(
            bucket,
            "front",
            idFrontFile
        );

        // Upload back ID when required
        if (backRequired) {
            backPath = await uploadPrivateFile(
                bucket,
                "back",
                idBackFile
            );
        }

        // Convert selfie Blob to an image file
        const selfieFile = new File(
            [facePhotoBlob],
            `selfie-${Date.now()}.jpg`,
            { type: "image/jpeg" }
        );

        // Upload selfie
        selfiePath = await uploadPrivateFile(
            bucket,
            "selfie",
            selfieFile
        );

        // Save uploaded file paths and KYC status
const updates = {
    kyc_document_type: type,
    id_front_part: frontPath,
    id_back_part: backPath,
    live_selfie: selfiePath,
    kyc_status: "Pending",
    updated_at: new Date().toISOString()
};
        const { data, error } = await client
            .from(CONFIG.table)
            .update(updates)
            .eq("auth_user_id", currentUser.id)
            .select()
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            throw new Error(
                "The files were uploaded, but your verification record was not updated. Check your user_data UPDATE policy."
            );
        }

        // Update local profile state
        profileData = {
            ...profileData,
            ...data,
            ...updates
        };

        // Update document statuses
        setStatus(
            "idFrontStatus",
            "Uploaded securely",
            "success"
        );

        setStatus(
            "idBackStatus",
            backPath
                ? "Uploaded securely"
                : "Not required for passport",
            "success"
        );

        setStatus(
            "faceVerificationStatus",
            "Selfie uploaded successfully",
            "success"
        );

        // Show success messages
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
            error.message ||
                "Could not submit identity documents. Please try again.",
            "error"
        );

    } finally {
        idVerificationSubmitting = false;

        if (button) {
            delete button.dataset.originalText;
            button.textContent = "SUBMIT FOR VERIFICATION";
        }

        updateIdSubmitState();
    }
};



/* =====================================================
   36. ADDRESS VERIFICATION STATUS — Proof of Address
===================================================== */

window.renderAddressVerificationStatus = function (status) {
    const section = document.getElementById("proofDocumentsSection");
    if (!section) return;

    const badge = document.getElementById("addressVerificationStatus");
    const description = document.getElementById("addressVerificationDescription");
    const verifyAgainSection = document.getElementById("verifyAgainSection");

    const normalized = String(status || "Not Verified")
        .trim()
        .toLowerCase();

const isPending =
    normalized === "pending" ||
    normalized === "pending verification";

const isVerified =
    normalized === "approved" ||
    normalized === "verified";

const isRejected = normalized === "rejected";

   
    // ADDRESS VERIFIED MESSAGE
    const addressVerifiedMessage = document.getElementById(
        "addressVerifiedMessage"
    );

    if (addressVerifiedMessage) {
        addressVerifiedMessage.hidden =
            normalized !== "approved" &&
            normalized !== "verified";
    }

const editing = window.addressVerificationEditing === true;

// Lock / Unlock logic
const isLocked =
    isPending ||
    isVerified ||
    (isRejected && !editing);



    // STATUS BADGE
    if (badge) {
        badge.classList.remove(
            "status-pending",
            "status-verified",
            "status-rejected"
        );

        if (isPending) {
            badge.textContent = "Pending";
            badge.classList.add("status-pending");
        } else if (isVerified) {
            badge.textContent = "Verified";
            badge.classList.add("status-verified");
        } else if (isRejected) {
            badge.textContent = "Rejected";
            badge.classList.add("status-rejected");
        } else {
            badge.textContent = "Not Verified";
        }
    }

    // DESCRIPTION
    if (description) {
        if (isPending) {
            description.textContent =
                "Your address verification is under review.";
        } else if (isVerified) {
            description.textContent =
                "Your address verification has been successfully verified.";
        } else if (isRejected && !editing) {
            description.textContent =
                "Your address verification was rejected. Please verify again.";
        } else if (isRejected && editing) {
            description.textContent =
                "Please update your address information and submit a new document.";
        } else {
            description.textContent =
                "Enter your residential address and upload one accepted document as proof of address.";
        }
    }

    // ADDRESS AND COUNTRY LOCK / UNLOCK
    const addressField = document.getElementById("addressLine");
    const countryField = document.getElementById("addressCountry");

    if (addressField) addressField.disabled = isLocked;
    if (countryField) countryField.disabled = isLocked;

    // DOCUMENT FORM SHOW / HIDE
    const documentCards = section.querySelector(".address-document-cards");
    const uploadBox = document.getElementById("addressDocumentUploadBox");
    const submitButton = document.getElementById("saveAddressDocumentsBtn");

    const showForm = !isLocked;

    if (documentCards) documentCards.hidden = !showForm;
    if (uploadBox) uploadBox.hidden = !showForm;
    if (submitButton) submitButton.hidden = !showForm;

    // VERIFY AGAIN BUTTON
    if (verifyAgainSection) {
        verifyAgainSection.hidden = !(isRejected && !editing);
    }
};


/* =====================================================
   VERIFY AGAIN — Reset to Not Verified and unlock form
===================================================== */

window.verifyAddressAgain = function () {
    // Unlock the address verification form
    window.addressVerificationEditing = true;

    // Clear the previously selected document
    const fileInput = document.getElementById("addressDocumentFile");
    if (fileInput) {
        fileInput.value = "";
    }

    // Display Not Verified and unlock the form
    window.renderAddressVerificationStatus("Not Verified");
};


   
    // =====================================================
    // REFRESH ID VERIFICATION STATUS — Latest Supabase Data
    // =====================================================

    async function refreshIdVerificationStatus() {
        try {
            const supabase = getSupabaseClient();

            if (!supabase) {
                console.error("Supabase client is not available.");
                return;
            }

            // Get the currently logged-in user
            let authUserId = currentUser?.id;

            if (!authUserId) {
                const {
                    data: authData,
                    error: authError
                } = await supabase.auth.getUser();

                if (authError || !authData?.user) {
                    console.error(
                        "Unable to get logged-in user:",
                        authError
                    );
                    return;
                }

                authUserId = authData.user.id;
            }

            // Fetch the latest ID verification data from Supabase
            const {
                data: latestProfile,
                error: profileError
            } = await supabase
                .from(CONFIG.table)
                .select(`
                    user_id,
                    auth_user_id,
                    kyc_status,
                    kyc_document_type,
                    id_front_part,
                    id_back_part,
                    live_selfie
                `)
                .eq("auth_user_id", authUserId)
                .maybeSingle();

            if (profileError) {
                console.error(
                    "Unable to refresh ID verification status:",
                    profileError
                );
                return;
            }

            if (!latestProfile) {
                console.error(
                    "ID verification profile was not found."
                );
                return;
            }

            
            // Update the latest profile data from Supabase
            profileData = {
                ...(profileData || {}),
                ...latestProfile
            };

            // Update ID verification UI
            renderIdVerificationState(profileData);

            // Update approved verification details dynamically
            const kycStatus = normalizeStatus(
                latestProfile.kyc_status
            );

            const isApproved = kycStatus === "approved";

            const hasSelfie = Boolean(
                latestProfile.live_selfie
            );

            const selfieStatus = document.getElementById(
                "approvedSelfieStatus"
            );

            const selfieItem = document.getElementById(
                "approvedSelfie"
            );

            const selfieLabel = selfieItem?.querySelector(
                ".approved-status-label"
            );

            if (selfieStatus && selfieItem && selfieLabel) {
                if (isApproved && hasSelfie) {
                    selfieStatus.textContent = "Approved";
                    selfieLabel.textContent = "Approved";
                    selfieItem.dataset.state = "approved";
                } else if (hasSelfie) {
                    selfieStatus.textContent = "Pending Review";
                    selfieLabel.textContent = "Pending Review";
                    selfieItem.dataset.state = "pending";
                } else {
                    selfieStatus.textContent = "Not Submitted";
                    selfieLabel.textContent = "Not Submitted";
                    selfieItem.dataset.state = "unverified";
                }
            }

            // Update Personal Menu status
            const menuStatus = document.getElementById(
                "profileUserVerificationStatus"
            );

            if (menuStatus) {
                menuStatus.textContent = isApproved
                    ? "Verified"
                    : "Not Verified";
            }


            console.log(
                "ID verification status refreshed:",
                latestProfile.kyc_status
            );

        } catch (error) {
            console.error(
                "Unexpected ID verification refresh error:",
                error
            );
        }
    }

   // Refresh status when the user returns to the page
window.addEventListener("focus", function () {
    refreshIdVerificationStatus();
});

document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        refreshIdVerificationStatus();
    }
});

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

    const addressField = $("addressLine");
    const countryField = $("addressCountry");

    const address = String(addressField?.value || "").trim();
    const country = String(countryField?.value || "").trim();

    // Clear previous validation highlights
    [addressField, countryField].forEach((field) => {
        if (field) {
            field.style.borderColor = "";
            field.style.outline = "";
        }
    });

    let firstInvalidField = null;

    // Address is required before selecting a document
    if (!address && addressField) {
        addressField.style.borderColor = "#e6c84f";
addressField.style.outline = "1px solid #e6c84f";
addressField.style.backgroundColor = "#fffbea";
        firstInvalidField = addressField;
    }

    // Country is required before selecting a document
    if (!country && countryField) {
        ccountryField.style.borderColor = "#e6c84f";
countryField.style.outline = "1px solid #e6c84f";
countryField.style.backgroundColor = "#fffbea";

        if (!firstInvalidField) {
            firstInvalidField = countryField;
        }
    }

    // Stop document selection if either field is empty
    if (!address || !country) {
        firstInvalidField?.focus();

        setMessage(
            "personalDetailsMessage",
            "Please enter your address and select your country before choosing a document.",
            "error"
        );

        return;
    }

    // Both required fields are valid
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

    setMessage("personalDetailsMessage", "", "");
};


  //  টাইপ বা সিলেক্ট করলেই হাইলাইট সরাত
// Clear address validation highlight when corrected
["addressLine", "addressCountry"].forEach((id) => {
    const field = $(id);
    if (!field) return;

    const clearHighlight = () => {
        const hasValue = field.value.trim() !== "";

        if (hasValue) {
            field.style.borderColor = "";
            field.style.outline = "";
            field.style.backgroundColor = "";
        }
    };

    field.addEventListener("input", clearHighlight);
    field.addEventListener("change", clearHighlight);
});
   


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
    // 37. SAVE ADDRESS DOCUMENT — Proof of Address
    // =====================================================

    window.saveAddressDocuments = async function () {
        const button = $("saveAddressDocumentsBtn");

        
try {
    const client = getSupabaseClient();

    if (!currentUser) await getProfile();

    // Validate Address and Country BEFORE uploading
    const address = String($("addressLine")?.value || "").trim();
    const country = String($("addressCountry")?.value || "").trim();

    if (!address || !country) {
        if (!address) {
            const field = $("addressLine");
            if (field) {
                field.style.borderColor = "#e6c84f";
                field.style.backgroundColor = "#fffbea";
                field.focus();
            }
        }

        if (!country) {
            const field = $("addressCountry");
            if (field) {
                field.style.borderColor = "#e6c84f";
                field.style.backgroundColor = "#fffbea";

                if (address) field.focus();
            }
        }

        throw new Error("Please enter your address and select your country.");
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
        address: address,
        country: country,
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
                throw new Error("Your address document could not be saved.");
            }

            profileData = {
                ...profileData,
                ...data,
                ...updates
            };

            // Lock the address verification form after successful submission
window.addressVerificationEditing = false;

window.renderAddressVerificationStatus("Pending Verification");

setMessage(
    "personalDetailsMessage",
    "Proof document submitted for verification.",
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
