/* =========================================================
   AFFILIATE PROGRAM DASHBOARD
   File: affiliate-program-dashboard.js

   Responsibilities:
   - Three-dot dropdown menu
   - Section navigation
   - Current-user affiliate application loading
   - Application status and profile display
   - Referral link/code copy actions
   - Table search, filters and pagination UI
   - Notifications and safe payout handling

   IMPORTANT:
   This file does not invent commission, referral or payout data.
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. CONFIGURATION
       ===================================================== */

    const CONFIG = {
        schema: "affiliate_program",
        applicationsTable: "applications",

        // Number of rows shown per page.
        pageSize: 10,

        // Do not enable payout submission until a real,
        // authenticated backend/RPC has been configured.
        payoutSubmissionEnabled: false
    };


    /* =====================================================
       2. DOM HELPERS
       ===================================================== */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const byId = (id) => document.getElementById(id);

    function setText(id, value, fallback = "—") {
        const element = byId(id);

        if (!element) {
            return;
        }

        element.textContent =
            value === null || value === undefined || value === ""
                ? fallback
                : String(value);
    }

    function setInputValue(id, value) {
        const element = byId(id);

        if (!element) {
            return;
        }

        element.value =
            value === null || value === undefined
                ? ""
                : String(value);
    }

    function setHidden(element, hidden) {
        if (!element) {
            return;
        }

        element.hidden = Boolean(hidden);
    }

    function normalizeStatus(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function humanize(value) {
        if (!value) {
            return "—";
        }

        return String(value)
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        }).format(date);
    }

    function safeEmail(value) {
        return typeof value === "string" ? value.trim() : "";
    }


    /* =====================================================
       3. SUPABASE CLIENT
       ===================================================== */

    function getSupabaseClient() {
        const candidates = [
            window.supabaseClient,
            window.sbClient,
            window.supabase
        ];

        for (const candidate of candidates) {
            if (
                candidate &&
                typeof candidate.auth?.getUser === "function" &&
                typeof candidate.from === "function"
            ) {
                return candidate;
            }
        }

        return null;
    }

    let supabaseClient = null;
    let currentUser = null;
    let currentApplication = null;

    let applicationLoadAttempted = false;
    let applicationLoadPromise = null;


    /* =====================================================
       4. NOTIFICATIONS
       ===================================================== */

    let noticeTimer = null;

    function showNotice(message, type = "info", title = "") {
        const notice = byId("affiliateNotice");

        if (!notice) {
            return;
        }

        const titleElement = byId("affiliateNoticeTitle");
        const messageElement = byId("affiliateNoticeMessage");
        const iconElement = byId("affiliateNoticeIcon");

        const types = {
            success: {
                title: "Success",
                icon: "✓"
            },

            error: {
                title: "Something went wrong",
                icon: "!"
            },

            warning: {
                title: "Notice",
                icon: "!"
            },

            info: {
                title: "Information",
                icon: "i"
            }
        };

        const config = types[type] || types.info;

        if (titleElement) {
            titleElement.textContent = title || config.title;
        }

        if (messageElement) {
            messageElement.textContent = String(message || "");
        }

        if (iconElement) {
            iconElement.textContent = config.icon;
        }

        notice.dataset.type = type;

        setHidden(notice, false);

        if (noticeTimer) {
            window.clearTimeout(noticeTimer);
        }

        noticeTimer = window.setTimeout(() => {
            setHidden(notice, true);
        }, 7000);
    }

    function closeNotice() {
        if (noticeTimer) {
            window.clearTimeout(noticeTimer);
            noticeTimer = null;
        }

        setHidden(byId("affiliateNotice"), true);
    }


    /* =====================================================
       5. LOADING AND EMPTY STATES
       ===================================================== */

    function setLoading(isLoading) {
        setHidden(byId("affiliateLoading"), !isLoading);
    }

    function showEmptyState(title, message) {
        setText(
            "affiliateEmptyTitle",
            title,
            "Information not available"
        );

        setText(
            "affiliateEmptyMessage",
            message,
            "Affiliate account information is not available."
        );

        setHidden(byId("affiliateEmptyState"), false);
    }

    function hideEmptyState() {
        setHidden(byId("affiliateEmptyState"), true);
    }


    /* =====================================================
       6. ACCOUNT STATUS
       ===================================================== */

    function getStatusPresentation(status) {
        const normalized = normalizeStatus(status);

        switch (normalized) {
            case "approved":
            case "active":
                return {
                    label: "Approved",
                    description:
                        "Your affiliate application has been approved.",
                    className: "approved",
                    stepClass: "is-complete"
                };

            case "pending":
            case "under_review":
            case "under review":
                return {
                    label: "Pending Review",
                    description:
                        "Your affiliate application is waiting for review.",
                    className: "pending",
                    stepClass: ""
                };

            case "rejected":
            case "declined":
                return {
                    label: "Rejected",
                    description:
                        "Your affiliate application was not approved.",
                    className: "rejected",
                    stepClass: "is-error"
                };

            default:
                return {
                    label: status ? humanize(status) : "Not Available",
                    description:
                        "Your affiliate account status could not be confirmed.",
                    className: "",
                    stepClass: ""
                };
        }
    }

    function updateAccountStatus(status) {
        const presentation = getStatusPresentation(status);

        const accountStatus = byId("affiliateAccountStatus");
        const profileStatusBadge = byId("affiliateProfileStatusBadge");

        setText("affiliateStatusText", presentation.label);
        setText("profileAffiliateStatus", presentation.label);
        setText("affiliateStatusDescription", presentation.description);

        if (accountStatus) {
            accountStatus.classList.remove(
                "approved",
                "pending",
                "rejected",
                "is-approved",
                "is-pending",
                "is-rejected"
            );

            if (presentation.className) {
                accountStatus.classList.add(presentation.className);
            }
        }

        if (profileStatusBadge) {
            profileStatusBadge.classList.remove(
                "approved",
                "pending",
                "rejected",
                "is-approved",
                "is-pending",
                "is-rejected"
            );

            if (presentation.className) {
                profileStatusBadge.classList.add(
                    presentation.className
                );
            }

            profileStatusBadge.textContent = presentation.label;
        }

        const applicationStep = byId("overviewApplicationStatus");

        if (applicationStep) {
            applicationStep.textContent = presentation.label;

            applicationStep.classList.remove(
                "is-complete",
                "completed",
                "approved",
                "is-error",
                "rejected"
            );

            if (presentation.stepClass) {
                applicationStep.classList.add(
                    presentation.stepClass
                );
            }
        }

        const referralStep = byId("overviewReferralStatus");

        if (referralStep) {
            if (normalizeStatus(status) === "approved") {
                referralStep.textContent =
                    "Affiliate approval confirmed";

                referralStep.classList.add("is-complete");
            } else {
                referralStep.textContent =
                    "Available after account approval";

                referralStep.classList.remove("is-complete");
            }
        }

        const referralLink = byId("affiliateReferralLink");
        const referralCode = byId("affiliateReferralCode");

        const isApproved = normalizeStatus(status) === "approved";

        if (referralLink) {
            referralLink.disabled = !isApproved;
        }

        if (referralCode) {
            referralCode.disabled = !isApproved;
        }
    }


    /* =====================================================
       7. THREE-DOT DROPDOWN
       ===================================================== */

    const menuToggle = byId("affiliateMenuToggle");
    const dropdownMenu = byId("affiliateDropdownMenu");

    function isMenuOpen() {
        return Boolean(
            menuToggle &&
            menuToggle.getAttribute("aria-expanded") === "true"
        );
    }

    function openMenu() {
        if (!menuToggle || !dropdownMenu) {
            return;
        }

        setHidden(dropdownMenu, false);
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close account menu");
    }

    function closeMenu() {
        if (!menuToggle || !dropdownMenu) {
            return;
        }

        setHidden(dropdownMenu, true);
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open account menu");
    }

    function toggleMenu() {
        if (isMenuOpen()) {
            closeMenu();
        } else {
            openMenu();
        }
    }


    /* =====================================================
       8. SECTION NAVIGATION
       ===================================================== */

    const SECTION_TITLES = {
        overview: "Account Overview",
        referrals: "My Referrals",
        commissions: "Commission History",
        settlements: "Settlements",
        payouts: "Payout Requests",
        profile: "Affiliate Profile"
    };

    let activeSection = "overview";

    function navigateToSection(sectionName, options = {}) {
        const section = String(sectionName || "").trim();

        if (!Object.prototype.hasOwnProperty.call(
            SECTION_TITLES,
            section
        )) {
            return false;
        }

        const targetSection = byId(`section-${section}`);

        if (!targetSection) {
            return false;
        }

        activeSection = section;

        $$(".affiliate-section[data-page]").forEach(element => {
            const isActive = element.dataset.page === section;

            setHidden(element, !isActive);

            element.classList.toggle("active", isActive);
        });

        $$(".affiliate-dropdown-item[data-section]").forEach(button => {
            const isActive = button.dataset.section === section;

            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        setText(
            "affiliateWelcomeTitle",
            SECTION_TITLES[section],
            "Account Overview"
        );

        closeMenu();

        if (options.scroll !== false) {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches
                    ? "auto"
                    : "smooth"
            });
        }

        return true;
    }

    function initializeNavigation() {
        if (menuToggle) {
            menuToggle.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                toggleMenu();
            });
        }

        if (dropdownMenu) {
            dropdownMenu.addEventListener("click", event => {
                const button = event.target.closest(
                    ".affiliate-dropdown-item[data-section]"
                );

                if (!button) {
                    return;
                }

                navigateToSection(button.dataset.section);
            });
        }

        document.addEventListener("click", event => {
            if (!isMenuOpen()) {
                return;
            }

            const menuContainer = $(".affiliate-menu-container");

            if (
                menuContainer &&
                !menuContainer.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        $$("[data-open-section]").forEach(button => {
            button.addEventListener("click", () => {
                navigateToSection(button.dataset.openSection);
            });
        });

        const backButton = byId("backToAccountBtn");

        if (backButton) {
            backButton.addEventListener("click", () => {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    showNotice(
                        "There is no previous page in this browsing session.",
                        "info"
                    );
                }
            });
        }

        navigateToSection("overview", {
            scroll: false
        });
    }


    /* =====================================================
       9. APPLICATION DATA HELPERS
       ===================================================== */

    function getApplicationName(application) {
        const firstName = String(
            application.first_name || ""
        ).trim();

        const lastName = String(
            application.last_name || ""
        ).trim();

        return [firstName, lastName]
            .filter(Boolean)
            .join(" ");
    }

    function getApplicationContact(application) {
        const platform = normalizeStatus(
            application.contact_platform
        );

        if (platform === "telegram") {
            return application.telegram_username || "";
        }

        if (platform === "whatsapp") {
            return application.whatsapp_number || "";
        }

        return (
            application.telegram_username ||
            application.whatsapp_number ||
            ""
        );
    }

    function getPromotionType(application) {
        return (
            application.link_category ||
            application.promotion_type ||
            ""
        );
    }


    /* =====================================================
       10. PROFILE RENDERING
       ===================================================== */

    function renderApplicationProfile(application, user) {
        if (!application) {
            return;
        }

        const fullName = getApplicationName(application);

        setText(
            "profileAffiliateId",
            application.affiliate_id ||
            application.id ||
            ""
        );

        setText(
            "profileUserId",
            application.player_id ||
            ""
        );

        setText(
            "profileFirstName",
            application.first_name ||
            ""
        );

        setText(
            "profileLastName",
            application.last_name ||
            ""
        );

        setText(
            "profileFullName",
            fullName
        );

        setText(
            "profileEmail",
            application.email ||
            user?.email ||
            ""
        );

        setText(
            "profileAffiliateCode",
            application.affiliate_code ||
            application.referral_code ||
            ""
        );

        setText(
            "profileCommissionRate",
            application.commission_rate !== null &&
            application.commission_rate !== undefined
                ? `${application.commission_rate}%`
                : ""
        );

        setText(
            "profileApplicationDate",
            formatDate(
                application.created_at ||
                application.application_date
            )
        );

        setText(
            "profileApprovalDate",
            formatDate(
                application.approved_at ||
                application.approval_date
            )
        );

        setText(
            "profilePromotionType",
            humanize(getPromotionType(application))
        );

        setText(
            "profileContactPlatform",
            humanize(application.contact_platform)
        );

        setText(
            "profileContactInformation",
            getApplicationContact(application)
        );

        setText(
            "profilePromotionLink",
            application.promotion_link ||
            ""
        );

        /*
         * Use only an explicit referral URL stored by the backend.
         * Do not construct a tracking URL without knowing the
         * actual referral route and parameter format.
         */
        const referralURL =
            application.referral_url ||
            application.affiliate_link ||
            "";

        const referralCode =
            application.referral_code ||
            application.affiliate_code ||
            "";

        setInputValue(
            "affiliateReferralLink",
            referralURL
        );

        setInputValue(
            "affiliateReferralCode",
            referralCode
        );

        const copyLinkButton = byId("copyReferralLinkBtn");
        const copyCodeButton = byId("copyAffiliateCodeBtn");

        const approved =
            normalizeStatus(application.status) === "approved";

        if (copyLinkButton) {
            copyLinkButton.disabled =
                !approved || !referralURL;
        }

        if (copyCodeButton) {
            copyCodeButton.disabled =
                !approved || !referralCode;
        }

        updateAccountStatus(application.status);
        updateOverviewSteps(application);
    }


    /* =====================================================
       11. OVERVIEW STEP STATUSES
       ===================================================== */

    function updateOverviewSteps(application) {
        const status = normalizeStatus(application.status);
        const approved = status === "approved";

        const referralStatus = byId(
            "overviewReferralStatus"
        );

        const activityStatus = byId(
            "overviewReferralActivityStatus"
        );

        const commissionStatus = byId(
            "overviewCommissionStatus"
        );

        const payoutStatus = byId(
            "overviewPayoutStatus"
        );

        if (referralStatus) {
            referralStatus.textContent = approved
                ? "Affiliate approval confirmed"
                : "Available after approval";

            referralStatus.classList.toggle(
                "is-complete",
                approved
            );
        }

        if (activityStatus) {
            activityStatus.textContent =
                "Awaiting verified referral records";
        }

        if (commissionStatus) {
            commissionStatus.textContent =
                "Awaiting commission records";
        }

        if (payoutStatus) {
            payoutStatus.textContent =
                "Awaiting settlement and payout records";
        }
    }


    /* =====================================================
       12. CLEAR UNAVAILABLE DATA
       ===================================================== */

    function clearUnavailableAccountData() {
        const numericFields = [
            "totalReferralsValue",
            "qualifiedPlayersValue",
            "totalCommissionValue",
            "availableBalanceValue",

            "commissionTotalEarned",
            "commissionPending",
            "commissionApproved",
            "commissionPaid",

            "historyTotalEarned",
            "historyPending",
            "historyApproved",
            "historyPaid",

            "payoutAvailableBalance",
            "payoutPendingAmount",
            "payoutTotalPaid"
        ];

        numericFields.forEach(id => {
            setText(id, "—");
        });

        const referralURL = byId("affiliateReferralLink");
        const referralCode = byId("affiliateReferralCode");

        if (referralURL) {
            referralURL.value = "";
        }

        if (referralCode) {
            referralCode.value = "";
        }

        const copyLinkButton = byId("copyReferralLinkBtn");
        const copyCodeButton = byId("copyAffiliateCodeBtn");

        if (copyLinkButton) {
            copyLinkButton.disabled = true;
        }

        if (copyCodeButton) {
            copyCodeButton.disabled = true;
        }

        setText(
            "overviewReferralsTableBody",
            ""
        );

        renderEmptyTable(
            "overviewReferralsTableBody",
            4,
            "Referral information is not available."
        );

        renderEmptyTable(
            "referralsTableBody",
            5,
            "Referral records are not available."
        );

        renderEmptyTable(
            "commissionsTableBody",
            5,
            "Commission records are not available."
        );

        renderEmptyTable(
            "settlementsTableBody",
            5,
            "Settlement records are not available."
        );

        renderEmptyTable(
            "payoutsTableBody",
            5,
            "Payout records are not available."
        );
    }


    /* =====================================================
       13. TABLE HELPERS
       ===================================================== */

    function renderEmptyTable(bodyId, columnCount, message) {
        const body = byId(bodyId);

        if (!body) {
            return;
        }

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = columnCount;
        cell.className = "table-empty";
        cell.textContent = message;

        row.appendChild(cell);

        body.replaceChildren(row);
    }

    function getRowSearchText(row) {
        return row.textContent
            .trim()
            .toLowerCase();
    }

    function initializeTableFilter({
        searchId,
        statusId,
        bodyId,
        columnCount,
        statusColumnIndex = -1,
        emptyMessage
    }) {
        const searchInput = byId(searchId);
        const statusSelect = byId(statusId);
        const tableBody = byId(bodyId);

        if (!tableBody) {
            return;
        }

        function applyFilters() {
            const searchTerm = String(
                searchInput?.value || ""
            ).trim().toLowerCase();

            const statusTerm = normalizeStatus(
                statusSelect?.value || ""
            );

            const rows = Array.from(
                tableBody.querySelectorAll("tr")
            );

            let visibleRows = 0;

            rows.forEach(row => {
                if (row.querySelector(".table-empty")) {
                    return;
                }

                const textMatches =
                    !searchTerm ||
                    getRowSearchText(row).includes(searchTerm);

                let statusMatches = true;

                if (
                    statusTerm &&
                    statusColumnIndex >= 0 &&
                    row.cells[statusColumnIndex]
                ) {
                    statusMatches = normalizeStatus(
                        row.cells[statusColumnIndex].textContent
                    ).includes(statusTerm);
                }

                const isVisible =
                    textMatches && statusMatches;

                row.hidden = !isVisible;

                if (isVisible) {
                    visibleRows += 1;
                }
            });

            const hasDataRows = rows.some(row =>
                !row.querySelector(".table-empty")
            );

            if (hasDataRows && visibleRows === 0) {
                let emptyRow = tableBody.querySelector(
                    "[data-filter-empty='true']"
                );

                if (!emptyRow) {
                    emptyRow = document.createElement("tr");
                    emptyRow.dataset.filterEmpty = "true";

                    const cell = document.createElement("td");
                    cell.colSpan = columnCount;
                    cell.className = "table-empty";

                    emptyRow.appendChild(cell);
                    tableBody.appendChild(emptyRow);
                }

                emptyRow.cells[0].textContent =
                    "No records match your filters.";

                emptyRow.hidden = false;
            } else {
                const filterEmpty = tableBody.querySelector(
                    "[data-filter-empty='true']"
                );

                if (filterEmpty) {
                    filterEmpty.hidden = true;
                }
            }

            if (!hasDataRows && emptyMessage) {
                renderEmptyTable(
                    bodyId,
                    columnCount,
                    emptyMessage
                );
            }
        }

        searchInput?.addEventListener(
            "input",
            applyFilters
        );

        statusSelect?.addEventListener(
            "change",
            applyFilters
        );
    }


    /* =====================================================
       14. PAGINATION UI
       ===================================================== */

    function initializePagination({
        bodyId,
        previousButtonId,
        nextButtonId,
        infoId,
        pageSize = CONFIG.pageSize
    }) {
        const body = byId(bodyId);
        const previousButton = byId(previousButtonId);
        const nextButton = byId(nextButtonId);
        const info = byId(infoId);

        if (!body) {
            return;
        }

        let currentPage = 0;

        function getDataRows() {
            return Array.from(body.querySelectorAll("tr"))
                .filter(row =>
                    !row.querySelector(".table-empty") &&
                    row.dataset.filterEmpty !== "true"
                );
        }

        function renderPage() {
            const rows = getDataRows();
            const totalRows = rows.length;

            const totalPages = Math.max(
                1,
                Math.ceil(totalRows / pageSize)
            );

            currentPage = Math.min(
                currentPage,
                totalPages - 1
            );

            rows.forEach((row, index) => {
                const start = currentPage * pageSize;
                const end = start + pageSize;

                row.hidden = index < start || index >= end;
            });

            if (info) {
                if (totalRows === 0) {
                    info.textContent = "No records available";
                } else {
                    const start =
                        currentPage * pageSize + 1;

                    const end = Math.min(
                        (currentPage + 1) * pageSize,
                        totalRows
                    );

                    info.textContent =
                        `${start}–${end} of ${totalRows}`;
                }
            }

            if (previousButton) {
                previousButton.disabled = currentPage <= 0;
            }

            if (nextButton) {
                nextButton.disabled =
                    currentPage >= totalPages - 1 ||
                    totalRows === 0;
            }
        }

        previousButton?.addEventListener("click", () => {
            if (currentPage > 0) {
                currentPage -= 1;
                renderPage();
            }
        });

        nextButton?.addEventListener("click", () => {
            const totalPages = Math.ceil(
                getDataRows().length / pageSize
            );

            if (currentPage < totalPages - 1) {
                currentPage += 1;
                renderPage();
            }
        });

        renderPage();

        return {
            refresh: renderPage
        };
    }


    /* =====================================================
       15. COPY REFERRAL LINK / CODE
       ===================================================== */

    async function copyText(value, successMessage) {
        const text = String(value || "").trim();

        if (!text) {
            showNotice(
                "There is no referral information available to copy.",
                "warning"
            );

            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const temporaryInput =
                    document.createElement("textarea");

                temporaryInput.value = text;
                temporaryInput.setAttribute("readonly", "");
                temporaryInput.style.position = "fixed";
                temporaryInput.style.opacity = "0";

                document.body.appendChild(temporaryInput);
                temporaryInput.select();

                const copied = document.execCommand("copy");

                temporaryInput.remove();

                if (!copied) {
                    throw new Error("Copy command failed.");
                }
            }

            showNotice(
                successMessage,
                "success"
            );
        } catch (error) {
            console.error(
                "[Affiliate Dashboard] Copy failed:",
                error
            );

            showNotice(
                "Unable to copy automatically. Please select and copy the text manually.",
                "error"
            );
        }
    }

    function initializeCopyActions() {
        byId("copyReferralLinkBtn")?.addEventListener(
            "click",
            () => {
                copyText(
                    byId("affiliateReferralLink")?.value,
                    "Referral link copied."
                );
            }
        );

        byId("copyAffiliateCodeBtn")?.addEventListener(
            "click",
            () => {
                copyText(
                    byId("affiliateReferralCode")?.value,
                    "Affiliate code copied."
                );
            }
        );
    }


    /* =====================================================
       16. LOAD CURRENT USER'S APPLICATION
       ===================================================== */

    async function getAuthenticatedUser() {
        if (!supabaseClient) {
            throw new Error(
                "Supabase client not found. Initialize the existing Supabase client before loading this dashboard."
            );
        }

        const { data, error } =
            await supabaseClient.auth.getUser();

        if (error) {
            throw error;
        }

        if (!data?.user) {
            return null;
        }

        return data.user;
    }

    async function fetchCurrentApplication(user) {
        /*
         * This query is scoped to the currently authenticated user.
         * Row Level Security should also restrict access on Supabase.
         *
         * The browser must use only the existing publishable/anon key.
         * Never put a service-role key in this file.
         */

        const query = supabaseClient
            .schema(CONFIG.schema)
            .from(CONFIG.applicationsTable)
            .select("*")
            .eq("auth_user_id", user.id)
            .limit(1);

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        if (!Array.isArray(data) || data.length === 0) {
            return null;
        }

        return data[0];
    }

    async function loadAffiliateApplication() {
        if (applicationLoadPromise) {
            return applicationLoadPromise;
        }

        applicationLoadPromise = (async () => {
            setLoading(true);
            hideEmptyState();

            try {
                currentUser = await getAuthenticatedUser();

                if (!currentUser) {
                    currentApplication = null;

                    clearUnavailableAccountData();

                    updateAccountStatus("");

                    setText(
                        "affiliateStatusText",
                        "Not Signed In"
                    );

                    showEmptyState(
                        "Sign in required",
                        "Please sign in to the customer account associated with your affiliate application."
                    );

                    return;
                }

                currentApplication =
                    await fetchCurrentApplication(currentUser);

                if (!currentApplication) {
                    clearUnavailableAccountData();

                    updateAccountStatus("");

                    showEmptyState(
                        "Affiliate application not found",
                        "No affiliate application was found for the current signed-in account. If you have already submitted one, confirm that you are using the same account."
                    );

                    return;
                }

                renderApplicationProfile(
                    currentApplication,
                    currentUser
                );

                hideEmptyState();

                const status = normalizeStatus(
                    currentApplication.status
                );

                if (status === "approved") {
                    setText(
                        "overviewApplicationStatus",
                        "Application approved"
                    );
                } else if (status === "pending") {
                    setText(
                        "overviewApplicationStatus",
                        "Application pending review"
                    );
                }

            } catch (error) {
                console.error(
                    "[Affiliate Dashboard] Application load failed:",
                    error
                );

                clearUnavailableAccountData();

                showEmptyState(
                    "Unable to load account information",
                    "The affiliate account could not be loaded. Check the Supabase connection, schema permissions and Row Level Security policies."
                );

                showNotice(
                    "Affiliate account information could not be loaded. Please try again later.",
                    "error"
                );

            } finally {
                applicationLoadAttempted = true;
                setLoading(false);
                applicationLoadPromise = null;
            }
        })();

        return applicationLoadPromise;
    }


    /* =====================================================
       17. AUTH STATE CHANGES
       ===================================================== */

    function initializeAuthListener() {
        if (!supabaseClient?.auth?.onAuthStateChange) {
            return;
        }

        supabaseClient.auth.onAuthStateChange(
            (event, session) => {
                if (
                    event === "SIGNED_OUT" ||
                    !session?.user
                ) {
                    currentUser = null;
                    currentApplication = null;

                    clearUnavailableAccountData();

                    updateAccountStatus("");

                    setText(
                        "affiliateStatusText",
                        "Not Signed In"
                    );

                    showEmptyState(
                        "Sign in required",
                        "Sign in to view your affiliate account information."
                    );

                    return;
                }

                if (
                    event === "SIGNED_IN" ||
                    event === "USER_UPDATED" ||
                    event === "TOKEN_REFRESHED"
                ) {
                    /*
                     * Do not query Supabase inside the auth callback.
                     * Schedule the data load after the callback returns.
                     */
                    window.setTimeout(() => {
                        loadAffiliateApplication();
                    }, 0);
                }
            }
        );
    }


    /* =====================================================
       18. PAYOUT FORM SAFETY
       ===================================================== */

    function initializePayoutForm() {
        const form = byId("affiliatePayoutForm");
        const submitButton = byId("submitPayoutRequestBtn");

        if (!form || !submitButton) {
            return;
        }

        /*
         * This dashboard does not yet have a verified payout RPC.
         * Keep payout submission disabled rather than pretending
         * that a request was submitted.
         */

        submitButton.disabled =
            !CONFIG.payoutSubmissionEnabled;

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!CONFIG.payoutSubmissionEnabled) {
                setText(
                    "payoutFormMessage",
                    "Payout requests are not enabled yet. A secure backend submission process must be configured first."
                );

                showNotice(
                    "Payout submission is not available yet.",
                    "warning"
                );

                return;
            }

            /*
             * Do not enable this option alone.
             * Implement and verify the authenticated backend/RPC
             * request before setting payoutSubmissionEnabled=true.
             */
            showNotice(
                "Payout submission requires the configured backend.",
                "warning"
            );
        });
    }


    /* =====================================================
       19. SEARCH AND FILTER INITIALIZATION
       ===================================================== */

    function initializeFilters() {
        initializeTableFilter({
            searchId: "referralSearchInput",
            statusId: "referralStatusFilter",
            bodyId: "referralsTableBody",
            columnCount: 5,
            statusColumnIndex: 2,
            emptyMessage: "Referral records are not available."
        });

        initializeTableFilter({
            searchId: "commissionSearchInput",
            statusId: "commissionStatusFilter",
            bodyId: "commissionsTableBody",
            columnCount: 5,
            statusColumnIndex: 3,
            emptyMessage: "Commission records are not available."
        });
    }

    function initializePaginationControls() {
        initializePagination({
            bodyId: "referralsTableBody",
            previousButtonId: "referralsPrevPageBtn",
            nextButtonId: "referralsNextPageBtn",
            infoId: "referralsPaginationInfo"
        });

        initializePagination({
            bodyId: "commissionsTableBody",
            previousButtonId: "commissionsPrevPageBtn",
            nextButtonId: "commissionsNextPageBtn",
            infoId: "commissionsPaginationInfo"
        });
    }


    /* =====================================================
       20. INITIALIZE DASHBOARD
       ===================================================== */

    async function initializeDashboard() {
        initializeNavigation();

        initializeCopyActions();

        initializePayoutForm();

        initializeFilters();

        initializePaginationControls();

        byId("closeAffiliateNoticeBtn")?.addEventListener(
            "click",
            closeNotice
        );

        clearUnavailableAccountData();

        setLoading(true);

        supabaseClient = getSupabaseClient();

        if (!supabaseClient) {
            setLoading(false);

            updateAccountStatus("");

            setText(
                "affiliateStatusText",
                "Connection Required"
            );

            showEmptyState(
                "Supabase connection not found",
                "The dashboard could not find the existing initialized Supabase client. Make sure your main application initializes it before this script runs."
            );

            console.error(
                "[Affiliate Dashboard] No initialized Supabase client was found. Expected window.supabaseClient, window.sbClient or window.supabase."
            );

            return;
        }

        initializeAuthListener();

        await loadAffiliateApplication();

        console.info(
            "[Affiliate Dashboard] Initialized.",
            {
                authenticated: Boolean(currentUser),
                applicationFound: Boolean(currentApplication),
                applicationLoadAttempted
            }
        );
    }


    /* =====================================================
       21. STARTUP
       ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard,
            { once: true }
        );
    } else {
        initializeDashboard();
    }


    /* =====================================================
       22. OPTIONAL PUBLIC METHODS
       ===================================================== */

    window.affiliateProgramDashboard = {
        navigateToSection,

        reload: loadAffiliateApplication,

        getCurrentApplication() {
            return currentApplication
                ? { ...currentApplication }
                : null;
        },

        getActiveSection() {
            return activeSection;
        }
    };

})();
