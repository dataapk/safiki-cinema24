
/* =========================================================
   SPORTS BET — CUSTOMER AFFILIATE PROGRAM
   File: affiliate-program.js

   Works with:
   - affiliate-program.html
   - affiliate-program.css

   Important:
   - Uses an existing Supabase client if available.
   - Does not create fake commission or payout data.
   - Does not mark payouts as paid from the browser.
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const AFFILIATE_DASHBOARD_CONFIG = {
    schema: "affiliate_program",

    // Existing application table confirmed in your setup.
    applicationsTable: "applications",

    // Do not guess the remaining table names until verified.
    currency: "USD",

    pageSize: 10
};


/* =========================================================
   2. DOM HELPERS
   ========================================================= */

const affiliateDOM = {
    get(id) {
        return document.getElementById(id);
    },

    all(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    },

    setText(id, value) {
        const element = this.get(id);

        if (element) {
            element.textContent =
                value === null || value === undefined || value === ""
                    ? "--"
                    : String(value);
        }
    },

    setValue(id, value) {
        const element = this.get(id);

        if (element) {
            element.value =
                value === null || value === undefined
                    ? ""
                    : String(value);
        }
    },

    show(element) {
        if (element) {
            element.hidden = false;
        }
    },

    hide(element) {
        if (element) {
            element.hidden = true;
        }
    }
};


/* =========================================================
   3. RUNTIME STATE
   ========================================================= */

const affiliateState = {
    currentUser: null,
    application: null,
    affiliate: null,

    referralPlayers: [],
    commissions: [],
    settlements: [],
    payouts: [],

    activeSection: "overview",

    referralsPage: 1,
    referralsPageSize: AFFILIATE_DASHBOARD_CONFIG.pageSize,

    commissionFilters: {
        startDate: "",
        endDate: "",
        status: "all"
    },

    referralFilters: {
        search: "",
        status: "all"
    },

    isLoading: false,
    initializationComplete: false
};


/* =========================================================
   4. SUPABASE CLIENT DISCOVERY
   ========================================================= */

/*
   Prefer the existing initialized client from your main account
   application. Do not put a service-role key in this file.

   Supported global client names:
   - window.supabaseClient
   - window.sbClient
   - window.supabase (only if it is an initialized client)

   If your account uses a different variable name, connect it
   here after checking the existing account JavaScript.
*/

function getAffiliateSupabaseClient() {
    const possibleClients = [
        window.supabaseClient,
        window.sbClient,
        window.supabase
    ];

    for (const client of possibleClients) {
        if (
            client &&
            client.auth &&
            typeof client.auth.getUser === "function" &&
            typeof client.from === "function"
        ) {
            return client;
        }
    }

    return null;
}


function getAffiliateSchema(client) {
    if (
        client &&
        typeof client.schema === "function"
    ) {
        return client.schema(
            AFFILIATE_DASHBOARD_CONFIG.schema
        );
    }

    return null;
}


/* =========================================================
   5. SAFE VALUE HELPERS
   ========================================================= */

function normalizeAffiliateStatus(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
}


function formatAffiliateCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return "--";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: AFFILIATE_DASHBOARD_CONFIG.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}


function formatAffiliateDate(value) {
    if (!value) {
        return "--";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "--";
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(date);
}


function escapeAffiliateHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]
    );
}


function normalizeStatusLabel(value) {
    const normalized = normalizeAffiliateStatus(value);

    if (!normalized) {
        return "Unknown";
    }

    return normalized
        .split("_")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}


function setFieldMessage(id, message, type = "") {
    const element = affiliateDOM.get(id);

    if (!element) {
        return;
    }

    element.textContent = message || "";
    element.classList.remove(
        "message-success",
        "message-error",
        "message-warning"
    );

    if (type === "success") {
        element.classList.add("message-success");
    } else if (type === "error") {
        element.classList.add("message-error");
    } else if (type === "warning") {
        element.classList.add("message-warning");
    }
}


/* =========================================================
   6. NOTIFICATIONS
   ========================================================= */

function showAffiliateNotice(
    title,
    message,
    type = "info"
) {
    const notice = affiliateDOM.get("affiliateNotice");

    if (!notice) {
        return;
    }

    const allowedTypes = [
        "success",
        "warning",
        "error",
        "info"
    ];

    const safeType = allowedTypes.includes(type)
        ? type
        : "info";

    notice.classList.remove(
        "notice-success",
        "notice-warning",
        "notice-error",
        "notice-info"
    );

    notice.classList.add(`notice-${safeType}`);

    affiliateDOM.setText(
        "affiliateNoticeTitle",
        title
    );

    affiliateDOM.setText(
        "affiliateNoticeMessage",
        message
    );

    const icon = affiliateDOM.get("affiliateNoticeIcon");

    if (icon) {
        const icons = {
            success: "✓",
            warning: "!",
            error: "×",
            info: "i"
        };

        icon.textContent = icons[safeType];
    }

    affiliateDOM.show(notice);
}


function hideAffiliateNotice() {
    affiliateDOM.hide(
        affiliateDOM.get("affiliateNotice")
    );
}


function showAffiliateLoading(message) {
    affiliateState.isLoading = true;

    affiliateDOM.setText(
        "affiliateLoadingMessage",
        message || "Loading affiliate information..."
    );

    affiliateDOM.show(
        affiliateDOM.get("affiliateLoading")
    );
}


function hideAffiliateLoading() {
    affiliateState.isLoading = false;

    affiliateDOM.hide(
        affiliateDOM.get("affiliateLoading")
    );
}


function showAffiliateEmptyState(title, message) {
    affiliateDOM.setText(
        "affiliateEmptyTitle",
        title
    );

    affiliateDOM.setText(
        "affiliateEmptyMessage",
        message
    );

    affiliateDOM.show(
        affiliateDOM.get("affiliateGlobalEmptyState")
    );
}


function hideAffiliateEmptyState() {
    affiliateDOM.hide(
        affiliateDOM.get("affiliateGlobalEmptyState")
    );
}


/* =========================================================
   7. NAVIGATION
   ========================================================= */

const AFFILIATE_SECTIONS = [
    "overview",
    "referrals",
    "commissions",
    "settlements",
    "payouts",
    "profile"
];


function openAffiliateSection(sectionName) {
    if (!AFFILIATE_SECTIONS.includes(sectionName)) {
        return;
    }

    affiliateState.activeSection = sectionName;

    affiliateDOM.all(".affiliate-nav-item").forEach(button => {
        const isActive =
            button.dataset.section === sectionName;

        button.classList.toggle("active", isActive);

        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    AFFILIATE_SECTIONS.forEach(section => {
        const element = affiliateDOM.get(
            `section-${section}`
        );

        if (!element) {
            return;
        }

        const isActive = section === sectionName;

        element.hidden = !isActive;
        element.classList.toggle("active", isActive);
    });

    hideAffiliateEmptyState();

    window.scrollTo({
        top: 0,
        behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
            ? "auto"
            : "smooth"
    });
}


function initializeAffiliateNavigation() {
    affiliateDOM.all(".affiliate-nav-item").forEach(button => {
        button.addEventListener("click", () => {
            openAffiliateSection(
                button.dataset.section
            );
        });
    });

    affiliateDOM.all("[data-open-section]").forEach(button => {
        button.addEventListener("click", () => {
            openAffiliateSection(
                button.dataset.openSection
            );
        });
    });
}


/* =========================================================
   8. ACCOUNT STATUS DISPLAY
   ========================================================= */

function renderAffiliateAccountStatus(application, affiliate) {
    const applicationStatus = normalizeAffiliateStatus(
        application?.status
    );

    const affiliateStatus = normalizeAffiliateStatus(
        affiliate?.status
    );

    const isApproved =
        applicationStatus === "approved";

    const isRejected =
        applicationStatus === "rejected";

    const isPending =
        applicationStatus === "pending";

    const isActive =
        affiliateStatus === "active";

    const isSuspended =
        affiliateStatus === "suspended";

    const statusText = affiliate
        ? normalizeStatusLabel(affiliate.status)
        : application
            ? normalizeStatusLabel(application.status)
            : "Not Applied";

    let description = "";
    let noticeTitle = "";
    let noticeMessage = "";
    let noticeType = "info";

    if (isActive && isApproved) {
        description =
            "Your affiliate account is active.";

    } else if (isSuspended) {
        description =
            "Your affiliate account is currently suspended.";

        noticeTitle = "Affiliate account suspended";
        noticeMessage =
            "Affiliate services are unavailable while this account is suspended.";
        noticeType = "warning";

    } else if (isRejected) {
        description =
            "Your affiliate application was rejected.";

        noticeTitle = "Application rejected";
        noticeMessage =
            "Please contact the program administrator if you need clarification.";
        noticeType = "warning";

    } else if (isPending) {
        description =
            "Your application is waiting for administrator review.";

        noticeTitle = "Application pending";
        noticeMessage =
            "Your application has been received and is awaiting review.";
        noticeType = "info";

    } else if (isApproved && !affiliate) {
        description =
            "Your application is approved. Account activation details are not yet available.";

        noticeTitle = "Activation information unavailable";
        noticeMessage =
            "Your approval is recorded, but the active affiliate account details could not be confirmed.";
        noticeType = "warning";

    } else if (!application && !affiliate) {
        description =
            "No affiliate application or active affiliate record was found.";

        noticeTitle = "Affiliate account not found";
        noticeMessage =
            "If you have already applied, your account records or access permissions may need to be checked.";
        noticeType = "info";

    } else {
        description =
            "Your affiliate account information is being verified.";
    }

    affiliateDOM.setText(
        "affiliateStatusText",
        statusText
    );

    affiliateDOM.setText(
        "affiliateStatusDescription",
        description
    );

    affiliateDOM.setText(
        "affiliateAccountStatus",
        `Affiliate Center · ${statusText}`
    );

    const profileStatus = affiliateDOM.get(
        "profileAffiliateStatus"
    );

    if (profileStatus) {
        profileStatus.textContent = statusText;

        profileStatus.className = "status-badge";

        const statusClasses = [
            "active",
            "approved",
            "pending",
            "rejected",
            "suspended",
            "inactive"
        ];

        if (statusClasses.includes(applicationStatus)) {
            profileStatus.classList.add(
                `status-${applicationStatus}`
            );
        } else if (statusClasses.includes(affiliateStatus)) {
            profileStatus.classList.add(
                `status-${affiliateStatus}`
            );
        }
    }

    if (noticeTitle) {
        showAffiliateNotice(
            noticeTitle,
            noticeMessage,
            noticeType
        );
    } else {
        hideAffiliateNotice();
    }

    updateAffiliateActionAvailability();
}


/* =========================================================
   9. REFERRAL LINK AND CODE
   ========================================================= */

function getVerifiedReferralLink() {
    const affiliate = affiliateState.affiliate;

    if (!affiliate) {
        return "";
    }

    /*
       Use an explicitly stored referral URL only when it exists.
       The database field must be verified before relying on it.
    */

    const possibleLink =
        affiliate.referral_url ||
        affiliate.referral_link ||
        "";

    if (typeof possibleLink !== "string") {
        return "";
    }

    const trimmed = possibleLink.trim();

    if (!trimmed) {
        return "";
    }

    try {
        const url = new URL(trimmed);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
}


function getVerifiedAffiliateCode() {
    const affiliate = affiliateState.affiliate;

    if (!affiliate) {
        return "";
    }

    const code =
        affiliate.affiliate_code ||
        affiliate.referral_code ||
        "";

    return typeof code === "string"
        ? code.trim()
        : "";
}


function renderReferralLink() {
    const link = getVerifiedReferralLink();
    const code = getVerifiedAffiliateCode();

    affiliateDOM.setValue(
        "affiliateReferralLink",
        link
    );

    affiliateDOM.setText(
        "affiliateReferralCode",
        code || "Not assigned"
    );

    const linkButton = affiliateDOM.get(
        "copyReferralLinkBtn"
    );

    const codeButton = affiliateDOM.get(
        "copyAffiliateCodeBtn"
    );

    if (linkButton) {
        linkButton.disabled = !link;
    }

    if (codeButton) {
        codeButton.disabled = !code;
    }
}


async function copyAffiliateValue(value, messageId, label) {
    if (!value) {
        setFieldMessage(
            messageId,
            `${label} is not available yet.`,
            "warning"
        );

        return;
    }

    try {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(value);
        } else {
            const temporaryInput =
                document.createElement("textarea");

            temporaryInput.value = value;
            temporaryInput.setAttribute("readonly", "");

            temporaryInput.style.position = "fixed";
            temporaryInput.style.opacity = "0";

            document.body.appendChild(temporaryInput);

            temporaryInput.select();

            const copied = document.execCommand("copy");

            temporaryInput.remove();

            if (!copied) {
                throw new Error("Copy operation failed");
            }
        }

        setFieldMessage(
            messageId,
            `${label} copied successfully.`,
            "success"
        );

    } catch (error) {
        console.error(
            "Affiliate clipboard error:",
            error
        );

        setFieldMessage(
            messageId,
            `Unable to copy ${label.toLowerCase()}. Please copy it manually.`,
            "error"
        );
    }
}


function initializeAffiliateCopyButtons() {
    const linkButton = affiliateDOM.get(
        "copyReferralLinkBtn"
    );

    if (linkButton) {
        linkButton.addEventListener("click", () => {
            copyAffiliateValue(
                getVerifiedReferralLink(),
                "referralLinkMessage",
                "Referral link"
            );
        });
    }

    const codeButton = affiliateDOM.get(
        "copyAffiliateCodeBtn"
    );

    if (codeButton) {
        codeButton.addEventListener("click", () => {
            copyAffiliateValue(
                getVerifiedAffiliateCode(),
                "referralLinkMessage",
                "Affiliate code"
            );
        });
    }
}


/* =========================================================
   10. APPLICATION PROFILE
   ========================================================= */

function renderAffiliateProfile(application, affiliate, user) {
    const firstName =
        application?.first_name ||
        affiliate?.first_name ||
        "";

    const lastName =
        application?.last_name ||
        affiliate?.last_name ||
        "";

    const fullName =
        `${firstName} ${lastName}`.trim();

    affiliateDOM.setText(
        "profileAffiliateId",
        affiliate?.id || "--"
    );

    affiliateDOM.setText(
        "profileUserId",
        user?.id || "--"
    );

    affiliateDOM.setText(
        "profileFullName",
        fullName || "--"
    );

    affiliateDOM.setText(
        "profileEmail",
        user?.email ||
        application?.email ||
        affiliate?.email ||
        "--"
    );

    affiliateDOM.setText(
        "profileAffiliateCode",
        getVerifiedAffiliateCode() || "--"
    );

    affiliateDOM.setText(
        "profileCommissionRate",
        affiliate?.commission_rate !== null &&
        affiliate?.commission_rate !== undefined
            ? `${affiliate.commission_rate}%`
            : "--"
    );

    affiliateDOM.setText(
        "profileApplicationDate",
        formatAffiliateDate(application?.created_at)
    );

    affiliateDOM.setText(
        "profileApprovalDate",
        formatAffiliateDate(
            affiliate?.approved_at ||
            application?.reviewed_at ||
            application?.approved_at
        )
    );

    affiliateDOM.setText(
        "profilePromotionType",
        application?.link_category || "--"
    );

    affiliateDOM.setText(
        "profileContactPlatform",
        application?.contact_platform || "--"
    );

    let contactInformation = "--";

    if (
        application?.contact_platform === "telegram"
    ) {
        contactInformation =
            application.telegram_username || "--";

    } else if (
        application?.contact_platform === "whatsapp"
    ) {
        contactInformation =
            application.whatsapp_number || "--";
    }

    affiliateDOM.setText(
        "profileContactInformation",
        contactInformation
    );

    const promotionLinkElement = affiliateDOM.get(
        "profilePromotionLink"
    );

    if (promotionLinkElement) {
        const link = application?.promotion_link || "";

        try {
            const parsedURL = new URL(link);

            if (
                parsedURL.protocol === "https:" ||
                parsedURL.protocol === "http:"
            ) {
                promotionLinkElement.href = parsedURL.href;
                promotionLinkElement.textContent = parsedURL.href;
                promotionLinkElement.hidden = false;
            } else {
                promotionLinkElement.removeAttribute("href");
                promotionLinkElement.textContent = "Not available";
            }
        } catch {
            promotionLinkElement.removeAttribute("href");
            promotionLinkElement.textContent = "Not available";
        }
    }

    renderReferralLink();
}


/* =========================================================
   11. DASHBOARD PLACEHOLDER STATES
   ========================================================= */

function resetAffiliateSummary() {
    const ids = [
        "totalReferralsValue",
        "qualifiedPlayersValue",
        "totalCommissionValue",
        "availableBalanceValue",
        "commissionTotalEarned",
        "commissionPending",
        "commissionApproved",
        "commissionPaid",
        "payoutAvailableBalance",
        "payoutPendingAmount",
        "payoutTotalPaid"
    ];

    ids.forEach(id => {
        affiliateDOM.setText(id, "--");
    });
}


function renderEmptyTable(tbodyId, columns, message) {
    const tbody = affiliateDOM.get(tbodyId);

    if (!tbody) {
        return;
    }

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columns;
    cell.className = "table-empty";
    cell.textContent = message;

    row.appendChild(cell);
    tbody.replaceChildren(row);
}


function resetAffiliateTables() {
    renderEmptyTable(
        "recentReferralsTableBody",
        3,
        "Referral records are not available."
    );

    renderEmptyTable(
        "referralsTableBody",
        4,
        "Referral records are not available."
    );

    renderEmptyTable(
        "recentCommissionsTableBody",
        4,
        "Commission records are not available."
    );

    renderEmptyTable(
        "commissionsTableBody",
        5,
        "Commission records are not available."
    );

    renderEmptyTable(
        "settlementsTableBody",
        6,
        "Settlement records are not available."
    );

    renderEmptyTable(
        "payoutHistoryTableBody",
        5,
        "Payout records are not available."
    );

    affiliateDOM.setText(
        "referralsCountLabel",
        "0 records"
    );

    affiliateDOM.setText(
        "referralsPageLabel",
        "Page 1"
    );

    affiliateDOM.setText(
        "commissionsCountLabel",
        "0 records"
    );
}


/* =========================================================
   12. TABLE RENDERING
   ========================================================= */

function createTableCell(value, className = "") {
    const cell = document.createElement("td");

    cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "--"
            : String(value);

    if (className) {
        cell.className = className;
    }

    return cell;
}


function createStatusCell(status) {
    const cell = document.createElement("td");
    const badge = document.createElement("span");

    const normalized = normalizeAffiliateStatus(status);

    badge.className = "table-status";

    const allowedStatusClasses = [
        "active",
        "approved",
        "pending",
        "rejected",
        "suspended",
        "inactive",
        "qualified",
        "draft",
        "reviewed",
        "finalized",
        "paid",
        "processing",
        "reversed"
    ];

    if (allowedStatusClasses.includes(normalized)) {
        badge.classList.add(`status-${normalized}`);
    }

    badge.textContent = normalizeStatusLabel(status);

    cell.appendChild(badge);

    return cell;
}


function renderReferralRows(rows, tbodyId) {
    const tbody = affiliateDOM.get(tbodyId);

    if (!tbody) {
        return;
    }

    if (!rows.length) {
        renderEmptyTable(
            tbodyId,
            tbodyId === "recentReferralsTableBody" ? 3 : 4,
            "No referral records found."
        );

        return;
    }

    const fragment = document.createDocumentFragment();

    rows.forEach(player => {
        const row = document.createElement("tr");

        row.appendChild(
            createTableCell(
                player.player_id ||
                player.public_player_id ||
                player.id
            )
        );

        if (tbodyId === "recentReferralsTableBody") {
            row.appendChild(
                createTableCell(
                    formatAffiliateDate(
                        player.created_at ||
                        player.registered_at
                    )
                )
            );

            row.appendChild(
                createStatusCell(player.status)
            );

        } else {
            row.appendChild(
                createTableCell(
                    formatAffiliateDate(
                        player.created_at ||
                        player.registered_at
                    )
                )
            );

            row.appendChild(
                createTableCell(
                    player.eligible_activity ?? "--"
                )
            );

            row.appendChild(
                createStatusCell(player.status)
            );
        }

        fragment.appendChild(row);
    });

    tbody.replaceChildren(fragment);
}


function renderCommissionRows(rows, tbodyId) {
    const tbody = affiliateDOM.get(tbodyId);

    if (!tbody) {
        return;
    }

    if (!rows.length) {
        renderEmptyTable(
            tbodyId,
            tbodyId === "recentCommissionsTableBody" ? 4 : 5,
            "No commission records found."
        );

        return;
    }

    const fragment = document.createDocumentFragment();

    rows.forEach(commission => {
        const row = document.createElement("tr");

        row.appendChild(
            createTableCell(
                formatAffiliateDate(
                    commission.created_at ||
                    commission.commission_date
                )
            )
        );

        row.appendChild(
            createTableCell(
                commission.reference_id ||
                commission.reference ||
                commission.id
            )
        );

        if (tbodyId === "recentCommissionsTableBody") {
            row.appendChild(
                createTableCell(
                    formatAffiliateCurrency(
                        commission.amount
                    ),
                    "cell-highlight"
                )
            );

            row.appendChild(
                createStatusCell(commission.status)
            );

        } else {
            row.appendChild(
                createTableCell(
                    commission.commission_type ||
                    commission.level ||
                    "--"
                )
            );

            row.appendChild(
                createTableCell(
                    formatAffiliateCurrency(
                        commission.amount
                    ),
                    "cell-highlight"
                )
            );

            row.appendChild(
                createStatusCell(commission.status)
            );
        }

        fragment.appendChild(row);
    });

    tbody.replaceChildren(fragment);
}


/* =========================================================
   13. REFERRAL FILTERING AND PAGINATION
   ========================================================= */

function getFilteredReferrals() {
    const search = affiliateState.referralFilters.search
        .trim()
        .toLowerCase();

    const status = affiliateState.referralFilters.status;

    return affiliateState.referralPlayers.filter(player => {
        const playerId = String(
            player.player_id ||
            player.public_player_id ||
            player.id ||
            ""
        ).toLowerCase();

        const matchesSearch =
            !search || playerId.includes(search);

        const normalizedStatus = normalizeAffiliateStatus(
            player.status
        );

        const matchesStatus =
            status === "all" ||
            normalizedStatus === status;

        return matchesSearch && matchesStatus;
    });
}


function renderFilteredReferrals() {
    const filtered = getFilteredReferrals();

    const pageSize = affiliateState.referralsPageSize;

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    affiliateState.referralsPage = Math.min(
        affiliateState.referralsPage,
        totalPages
    );

    const start =
        (affiliateState.referralsPage - 1) * pageSize;

    const pageRows = filtered.slice(
        start,
        start + pageSize
    );

    renderReferralRows(
        pageRows,
        "referralsTableBody"
    );

    affiliateDOM.setText(
        "referralsCountLabel",
        `${filtered.length} record${filtered.length === 1 ? "" : "s"}`
    );

    affiliateDOM.setText(
        "referralsPageLabel",
        `Page ${affiliateState.referralsPage} of ${totalPages}`
    );

    const previousButton = affiliateDOM.get(
        "referralsPreviousBtn"
    );

    const nextButton = affiliateDOM.get(
        "referralsNextBtn"
    );

    if (previousButton) {
        previousButton.disabled =
            affiliateState.referralsPage <= 1;
    }

    if (nextButton) {
        nextButton.disabled =
            affiliateState.referralsPage >= totalPages;
    }
}


function initializeReferralFilters() {
    const searchInput = affiliateDOM.get(
        "referralSearchInput"
    );

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            affiliateState.referralFilters.search =
                searchInput.value;

            affiliateState.referralsPage = 1;

            renderFilteredReferrals();
        });
    }

    const statusFilter = affiliateDOM.get(
        "referralStatusFilter"
    );

    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            affiliateState.referralFilters.status =
                statusFilter.value;

            affiliateState.referralsPage = 1;

            renderFilteredReferrals();
        });
    }

    const previousButton = affiliateDOM.get(
        "referralsPreviousBtn"
    );

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            if (affiliateState.referralsPage > 1) {
                affiliateState.referralsPage--;

                renderFilteredReferrals();
            }
        });
    }

    const nextButton = affiliateDOM.get(
        "referralsNextBtn"
    );

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            const filtered = getFilteredReferrals();

            const totalPages = Math.max(
                1,
                Math.ceil(
                    filtered.length /
                    affiliateState.referralsPageSize
                )
            );

            if (affiliateState.referralsPage < totalPages) {
                affiliateState.referralsPage++;

                renderFilteredReferrals();
            }
        });
    }
}


/* =========================================================
   14. COMMISSION FILTERS
   ========================================================= */

function getFilteredCommissions() {
    const filters = affiliateState.commissionFilters;

    return affiliateState.commissions.filter(commission => {
        const status = normalizeAffiliateStatus(
            commission.status
        );

        const dateValue =
            commission.created_at ||
            commission.commission_date;

        const date = dateValue
            ? new Date(dateValue)
            : null;

        const validDate =
            date && !Number.isNaN(date.getTime());

        const matchesStatus =
            filters.status === "all" ||
            status === filters.status;

        const matchesStart =
            !filters.startDate ||
            (
                validDate &&
                date >= new Date(
                    `${filters.startDate}T00:00:00`
                )
            );

        const matchesEnd =
            !filters.endDate ||
            (
                validDate &&
                date <= new Date(
                    `${filters.endDate}T23:59:59.999`
                )
            );

        return (
            matchesStatus &&
            matchesStart &&
            matchesEnd
        );
    });
}


function initializeCommissionFilters() {
    const applyButton = affiliateDOM.get(
        "applyCommissionFiltersBtn"
    );

    if (!applyButton) {
        return;
    }

    applyButton.addEventListener("click", () => {
        affiliateState.commissionFilters = {
            startDate: affiliateDOM.get(
                "commissionStartDate"
            )?.value || "",

            endDate: affiliateDOM.get(
                "commissionEndDate"
            )?.value || "",

            status: affiliateDOM.get(
                "commissionStatusFilter"
            )?.value || "all"
        };

        const filtered = getFilteredCommissions();

        renderCommissionRows(
            filtered,
            "commissionsTableBody"
        );

        affiliateDOM.setText(
            "commissionsCountLabel",
            `${filtered.length} record${filtered.length === 1 ? "" : "s"}`
        );
    });
}


/* =========================================================
   15. SETTLEMENT FILTERS
   ========================================================= */

function initializeSettlementFilters() {
    const periodFilter = affiliateDOM.get(
        "settlementPeriodFilter"
    );

    const statusFilter = affiliateDOM.get(
        "settlementStatusFilter"
    );

    const applyFilters = () => {
        const period = periodFilter?.value || "all";
        const status = statusFilter?.value || "all";

        const filtered = affiliateState.settlements.filter(item => {
            const matchesPeriod =
                period === "all" ||
                normalizeAffiliateStatus(item.period_type) === period;

            const matchesStatus =
                status === "all" ||
                normalizeAffiliateStatus(item.status) === status;

            return matchesPeriod && matchesStatus;
        });

        renderSettlementRows(filtered);
    };

    periodFilter?.addEventListener("change", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
}


function renderSettlementRows(rows) {
    const tbody = affiliateDOM.get(
        "settlementsTableBody"
    );

    if (!tbody) {
        return;
    }

    if (!rows.length) {
        renderEmptyTable(
            "settlementsTableBody",
            6,
            "No settlement records found."
        );

        return;
    }

    const fragment = document.createDocumentFragment();

    rows.forEach(item => {
        const row = document.createElement("tr");

        row.appendChild(
            createTableCell(
                item.id || item.settlement_id
            )
        );

        row.appendChild(
            createTableCell(
                item.period_label ||
                item.period ||
                item.period_type
            )
        );

        row.appendChild(
            createTableCell(
                formatAffiliateCurrency(
                    item.eligible_revenue
                )
            )
        );

        row.appendChild(
            createTableCell(
                formatAffiliateCurrency(
                    item.commission_amount
                )
            )
        );

        row.appendChild(
            createTableCell(
                formatAffiliateCurrency(
                    item.final_payable
                ),
                "cell-highlight"
            )
        );

        row.appendChild(
            createStatusCell(item.status)
        );

        fragment.appendChild(row);
    });

    tbody.replaceChildren(fragment);
}


/* =========================================================
   16. PAYOUT HISTORY
   ========================================================= */

function renderPayoutRows(rows) {
    const tbody = affiliateDOM.get(
        "payoutHistoryTableBody"
    );

    if (!tbody) {
        return;
    }

    if (!rows.length) {
        renderEmptyTable(
            "payoutHistoryTableBody",
            5,
            "No payout records found."
        );

        return;
    }

    const fragment = document.createDocumentFragment();

    rows.forEach(item => {
        const row = document.createElement("tr");

        row.appendChild(
            createTableCell(
                item.id || item.payout_id
            )
        );

        row.appendChild(
            createTableCell(
                formatAffiliateDate(
                    item.created_at ||
                    item.requested_at
                )
            )
        );

        row.appendChild(
            createTableCell(
                formatAffiliateCurrency(
                    item.amount
                ),
                "cell-highlight"
            )
        );

        row.appendChild(
            createTableCell(
                item.method ||
                item.payout_method
            )
        );

        row.appendChild(
            createStatusCell(item.status)
        );

        fragment.appendChild(row);
    });

    tbody.replaceChildren(fragment);
}


/* =========================================================
   17. PAYOUT FORM VALIDATION
   ========================================================= */

function updateAffiliateActionAvailability() {
    const activeAffiliate =
        normalizeAffiliateStatus(
            affiliateState.affiliate?.status
        ) === "active";

    const referralLinkButton = affiliateDOM.get(
        "copyReferralLinkBtn"
    );

    const referralCodeButton = affiliateDOM.get(
        "copyAffiliateCodeBtn"
    );

    const payoutButton = affiliateDOM.get(
        "submitPayoutRequestBtn"
    );

    const referralLink = getVerifiedReferralLink();
    const referralCode = getVerifiedAffiliateCode();

    if (referralLinkButton) {
        referralLinkButton.disabled =
            !activeAffiliate || !referralLink;
    }

    if (referralCodeButton) {
        referralCodeButton.disabled =
            !activeAffiliate || !referralCode;
    }

    /*
       Payout submission stays disabled until the verified payout
       RPC and its required database fields are integrated.
       Enabling a button must never imply that a payment can be
       safely processed.
    */

    if (payoutButton) {
        payoutButton.disabled = true;
    }
}


function initializeAffiliatePayoutForm() {
    const form = affiliateDOM.get(
        "affiliatePayoutForm"
    );

    if (!form) {
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const amount = Number(
            affiliateDOM.get("payoutAmount")?.value
        );

        const method = affiliateDOM.get(
            "payoutMethod"
        )?.value;

        const destination = affiliateDOM.get(
            "payoutDestination"
        )?.value.trim();

        if (!Number.isFinite(amount) || amount <= 0) {
            setFieldMessage(
                "payoutFormMessage",
                "Enter a valid withdrawal amount.",
                "error"
            );

            return;
        }

        if (!method) {
            setFieldMessage(
                "payoutFormMessage",
                "Select a payout method.",
                "error"
            );

            return;
        }

        if (!destination) {
            setFieldMessage(
                "payoutFormMessage",
                "Enter the required payout destination.",
                "error"
            );

            return;
        }

        setFieldMessage(
            "payoutFormMessage",
            "Payout submission is not connected yet. Your request has not been submitted.",
            "warning"
        );
    });
}


/* =========================================================
   18. APPLICATION DATA LOADING
   ========================================================= */

async function loadCurrentAffiliateApplication(client, user) {
    const schemaClient = getAffiliateSchema(client);

    if (!schemaClient) {
        throw new Error(
            "The affiliate_program schema client is unavailable."
        );
    }

    /*
       Only load the current user's application.
       RLS must enforce the same restriction on the server.
    */

    const { data, error } = await schemaClient
        .from(AFFILIATE_DASHBOARD_CONFIG.applicationsTable)
        .select("*")
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) {
        throw error;
    }

    return Array.isArray(data) && data.length
        ? data[0]
        : null;
}


/* =========================================================
   19. AFFILIATE RECORD LOADING
   ========================================================= */

/*
   The approved-affiliate table and its exact columns have not
   been confirmed yet. Do not guess a table name or silently
   treat an application as an activated affiliate.

   Once the real table is confirmed, this function will query
   the current user's affiliate record using its verified schema.
*/

async function loadCurrentAffiliateRecord(client, user) {
    void client;
    void user;

    return null;
}


/* =========================================================
   20. MAIN DATA REFRESH
   ========================================================= */

async function refreshAffiliateDashboard() {
    const client = getAffiliateSupabaseClient();

    resetAffiliateSummary();
    resetAffiliateTables();

    affiliateState.application = null;
    affiliateState.affiliate = null;
    affiliateState.referralPlayers = [];
    affiliateState.commissions = [];
    affiliateState.settlements = [];
    affiliateState.payouts = [];

    renderReferralLink();

    if (!client) {
        affiliateDOM.setText(
            "affiliateStatusText",
            "Connection Required"
        );

        affiliateDOM.setText(
            "affiliateStatusDescription",
            "The existing account Supabase client has not been detected."
        );

        showAffiliateNotice(
            "Account connection required",
            "This page needs the initialized Supabase client from your existing customer account. No account data has been loaded.",
            "warning"
        );

        updateAffiliateActionAvailability();

        return;
    }

    showAffiliateLoading(
        "Checking your account and affiliate application..."
    );

    hideAffiliateEmptyState();

    try {
        const {
            data: userResult,
            error: userError
        } = await client.auth.getUser();

        if (userError) {
            throw userError;
        }

        const user = userResult?.user || null;

        if (!user) {
            affiliateState.currentUser = null;

            affiliateDOM.setText(
                "affiliateStatusText",
                "Login Required"
            );

            affiliateDOM.setText(
                "affiliateStatusDescription",
                "Sign in to your customer account to view affiliate information."
            );

            showAffiliateNotice(
                "Please sign in",
                "Your affiliate dashboard requires an authenticated customer account.",
                "warning"
            );

            updateAffiliateActionAvailability();

            return;
        }

        affiliateState.currentUser = user;

        const application =
            await loadCurrentAffiliateApplication(
                client,
                user
            );

        const affiliate =
            await loadCurrentAffiliateRecord(
                client,
                user
            );

        affiliateState.application = application;
        affiliateState.affiliate = affiliate;

        renderAffiliateAccountStatus(
            application,
            affiliate
        );

        renderAffiliateProfile(
            application,
            affiliate,
            user
        );

        renderReferralLink();

        if (!application && !affiliate) {
            showAffiliateEmptyState(
                "Affiliate application not found",
                "No application or affiliate record was found for this account. If you have already applied, check the database access policies and account records."
            );
        }

    } catch (error) {
        console.error(
            "Affiliate dashboard loading error:",
            error
        );

        showAffiliateNotice(
            "Unable to load affiliate information",
            error?.message ||
                "A database or permission error occurred while loading your affiliate account.",
            "error"
        );

        affiliateDOM.setText(
            "affiliateStatusText",
            "Data Unavailable"
        );

        affiliateDOM.setText(
            "affiliateStatusDescription",
            "Please try again later or contact support."
        );

    } finally {
        hideAffiliateLoading();
        affiliateState.initializationComplete = true;
    }
}


/* =========================================================
   21. BACK TO ACCOUNT
   ========================================================= */

function initializeBackToAccountButton() {
    const button = affiliateDOM.get(
        "backToAccountBtn"
    );

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        /*
           Set this to the actual customer account route once
           your existing account page URL is confirmed.
        */

        const accountURL =
            button.dataset.accountUrl ||
            "";

        if (!accountURL) {
            showAffiliateNotice(
                "Account page not configured",
                "The customer account destination has not been configured yet.",
                "warning"
            );

            return;
        }

        window.location.assign(accountURL);
    });
}


/* =========================================================
   22. CLOSE NOTIFICATION
   ========================================================= */

function initializeNoticeControls() {
    const button = affiliateDOM.get(
        "closeAffiliateNoticeBtn"
    );

    if (button) {
        button.addEventListener(
            "click",
            hideAffiliateNotice
        );
    }
}


/* =========================================================
   23. INITIALIZE DASHBOARD
   ========================================================= */

async function initializeAffiliateDashboard() {
    affiliateDOM.setText(
        "affiliateCurrentYear",
        new Date().getFullYear()
    );

    initializeAffiliateNavigation();
    initializeAffiliateCopyButtons();
    initializeReferralFilters();
    initializeCommissionFilters();
    initializeSettlementFilters();
    initializeAffiliatePayoutForm();
    initializeBackToAccountButton();
    initializeNoticeControls();

    resetAffiliateSummary();
    resetAffiliateTables();

    await refreshAffiliateDashboard();
}


/* =========================================================
   24. START
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeAffiliateDashboard,
        { once: true }
    );
} else {
    initializeAffiliateDashboard();
}


/* =========================================================
   25. OPTIONAL PUBLIC REFRESH
   ========================================================= */

window.refreshAffiliateDashboard =
    refreshAffiliateDashboard;

