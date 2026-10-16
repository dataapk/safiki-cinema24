
/* =========================================================
   SAFIKI ADMIN — AFFILIATE CENTER
   File: affiliate.js

   HTML: admin.html
   CSS: affiliate.css
   Supabase client: window.supabaseClient

   IMPORTANT:
   - No fake affiliate records or financial totals.
   - Configure real table names before enabling data loading.
   - Final commission calculations and payouts must be
     verified by trusted server-side functions.
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       01. CONFIGURATION
       Set these values to match your actual Supabase schema.
    ===================================================== */

    const CONFIG = {
        rootSelector: "#affiliateSection",

        /*
         * Leave table names empty until you confirm the
         * actual Supabase table and column names.
         *
         * Example:
         * tables: {
         *   affiliates: "your_real_affiliate_table",
         *   applications: "your_real_application_table"
         * }
         */

        tables: {
            affiliates: "",
            applications: "",
            referrals: "",
            deposits: "",
            bets: "",
            results: "",
            commissions: "",
            payouts: ""
        },

        /*
         * Final financial operations must be implemented as
         * secure Supabase Edge Functions or database RPCs.
         *
         * Set each name only after the server-side function
         * exists and has authorization checks.
         */

        functions: {
            saveCommissionSettings: "",
            calculateDailyCommission: "",
            settleWeeklyCommission: "",
            processPayout: ""
        },

        pageSize: 20
    };

    const root = document.querySelector(CONFIG.rootSelector);

    if (!root) {
        console.warn(
            "Affiliate Center: #affiliateSection was not found."
        );
        return;
    }

    /* =====================================================
       02. STATE
    ===================================================== */

    const state = {
        activeMainPanel: null,
        activeDetailPanel: null,
        activeSettingsPanel: null,

        selectedAffiliate: null,
        selectedApplication: null,

        affiliates: [],
        applications: [],
        referrals: [],

        affiliateSearchTerm: "",
        referralSearchTerm: "",

        affiliatePage: 1,
        applicationPage: 1,
        referralPage: 1,

        loading: false,
        initialized: false
    };

    const $ = (selector, parent = root) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = root) =>
        Array.from(parent.querySelectorAll(selector));

    const byId = (id) =>
        document.getElementById(id);

    /* =====================================================
       03. SAFE HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function normalize(value) {
        return String(value ?? "")
            .trim()
            .toLowerCase();
    }

    function formatNumber(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "—";
        }

        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2
        }).format(number);
    }

    function formatMoney(value, currency = "USD") {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "—";
        }

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
                maximumFractionDigits: 2
            }).format(number);
        } catch {
            return `${currency} ${formatNumber(number)}`;
        }
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function getValue(object, key, fallback = "—") {
        if (!object || object[key] === null ||
            object[key] === undefined || object[key] === "") {
            return fallback;
        }

        return object[key];
    }

    function setText(id, value) {
        const element = byId(id);

        if (element) {
            element.textContent =
                value === null || value === undefined
                    ? "—"
                    : String(value);
        }
    }

    function setHTML(id, html) {
        const element = byId(id);

        if (element) {
            element.innerHTML = html;
        }
    }

    function showElement(element) {
        if (!element) return;

        element.hidden = false;
        element.style.removeProperty("display");
    }

    function hideElement(element) {
        if (!element) return;

        element.hidden = true;
    }

    function setButtonLoading(button, loading, loadingText = "Please wait…") {
        if (!button) return;

        if (loading) {
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        } else {
            button.textContent =
                button.dataset.originalText ||
                button.textContent;

            delete button.dataset.originalText;

            button.disabled = false;
            button.removeAttribute("aria-busy");
        }
    }

    /* =====================================================
       04. MESSAGES
    ===================================================== */

    function showMessage(message, type = "info") {
        const element =
            $("#affcGlobalMessage") ||
            $("#affiliateGlobalMessage");

        if (!element) {
            console.info("Affiliate Center:", message);
            return;
        }

        element.textContent = String(message ?? "");

        element.classList.remove(
            "is-success",
            "is-error",
            "is-warning"
        );

        if (type === "success") {
            element.classList.add("is-success");
        } else if (type === "error") {
            element.classList.add("is-error");
        } else if (type === "warning") {
            element.classList.add("is-warning");
        }

        showElement(element);
    }

    function hideMessage() {
        const element =
            $("#affcGlobalMessage") ||
            $("#affiliateGlobalMessage");

        if (!element) return;

        hideElement(element);
        element.textContent = "";
        element.classList.remove(
            "is-success",
            "is-error",
            "is-warning"
        );
    }

    function showInlineMessage(container, message, type = "info") {
        if (!container) return;

        let element = $(".affc-inline-message", container);

        if (!element) {
            element = document.createElement("div");
            element.className = "affc-inline-message";
            element.setAttribute("role", "status");
            container.prepend(element);
        }

        element.textContent = String(message ?? "");

        element.classList.remove(
            "is-success",
            "is-error",
            "is-warning"
        );

        if (type === "success") {
            element.classList.add("is-success");
        } else if (type === "error") {
            element.classList.add("is-error");
        } else if (type === "warning") {
            element.classList.add("is-warning");
        }

        showElement(element);
    }

    /* =====================================================
       05. SUPABASE CLIENT
    ===================================================== */

    function getSupabaseClient() {
        /*
         * Expected:
         * window.supabaseClient = createClient(URL, ANON_KEY)
         *
         * Use only the public anon/publishable key in browser
         * code. Never put the Supabase service-role key here.
         */

        return window.supabaseClient || null;
    }

    function getConfiguredTable(key) {
        return String(CONFIG.tables[key] || "").trim();
    }

    function getConfiguredFunction(key) {
        return String(CONFIG.functions[key] || "").trim();
    }

    async function selectRows(tableKey, options = {}) {
        const client = getSupabaseClient();
        const table = getConfiguredTable(tableKey);

        if (!client) {
            throw new Error(
                "Supabase client is not configured. " +
                "Set window.supabaseClient before loading affiliate.js."
            );
        }

        if (!table) {
            throw new Error(
                `Supabase table "${tableKey}" is not configured yet.`
            );
        }

        let query = client
            .from(table)
            .select(options.select || "*", {
                count: options.count ? "exact" : undefined
            });

        if (typeof options.applyFilters === "function") {
            query = options.applyFilters(query);
        }

        if (options.orderBy) {
            query = query.order(options.orderBy, {
                ascending: options.ascending !== false
            });
        }

        if (Number.isInteger(options.limit) && options.limit > 0) {
            query = query.limit(options.limit);
        }

        const { data, error, count } = await query;

        if (error) {
            throw error;
        }

        return {
            data: Array.isArray(data) ? data : [],
            count
        };
    }

    async function invokeConfiguredFunction(functionKey, payload) {
        const client = getSupabaseClient();
        const functionName = getConfiguredFunction(functionKey);

        if (!client) {
            throw new Error(
                "Supabase client is not configured."
            );
        }

        if (!functionName) {
            throw new Error(
                `Server-side function "${functionKey}" is not configured.`
            );
        }

        const { data, error } = await client.functions.invoke(
            functionName,
            { body: payload }
        );

        if (error) {
            throw error;
        }

        return data;
    }

    /* =====================================================
       06. LOADING STATE
    ===================================================== */

    function setLoading(loading) {
        state.loading = Boolean(loading);

        root.classList.toggle(
            "affc-is-loading",
            state.loading
        );

        root.setAttribute(
            "aria-busy",
            state.loading ? "true" : "false"
        );
    }

    /* =====================================================
       07. MAIN NAVIGATION
    ===================================================== */

    function getMainNavigationButtons() {
        return $$(".affc-nav-button");
    }

    function getMainPanel(button) {
        const target =
            button.dataset.target ||
            button.getAttribute("aria-controls");

        if (!target) return null;

        const id = target.replace(/^#/, "");

        return byId(id);
    }

    function activateMainPanel(button, options = {}) {
        if (!button) return;

        const targetPanel = getMainPanel(button);

        if (!targetPanel || !root.contains(targetPanel)) {
            showMessage(
                "This panel could not be found. Check the button's data-target value.",
                "error"
            );
            return;
        }

        hideMessage();

        state.activeMainPanel = targetPanel.id;

        getMainNavigationButtons().forEach((item) => {
            const active = item === button;

            item.classList.toggle("is-active", active);
            item.setAttribute(
                "aria-selected",
                active ? "true" : "false"
            );

            item.setAttribute(
                "aria-pressed",
                active ? "true" : "false"
            );
        });

        $$(".affc-main-panel").forEach((panel) => {
            const active = panel === targetPanel;

            panel.hidden = !active;

            if (active) {
                panel.style.removeProperty("display");
            }
        });

        showElement(targetPanel);

        if (!options.skipFocus) {
            targetPanel.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }
    }

    function initializeMainNavigation() {
        const buttons = getMainNavigationButtons();

        buttons.forEach((button) => {
            button.addEventListener("click", function () {
                activateMainPanel(button);
            });
        });

        const activeButton =
            buttons.find((button) =>
                button.classList.contains("is-active")
            ) || buttons[0];

        if (activeButton) {
            activateMainPanel(activeButton, {
                skipFocus: true
            });
        }
    }

    /* =====================================================
       08. AFFILIATE DETAIL NAVIGATION
    ===================================================== */

    function initializeDetailNavigation() {
        $$(".affc-detail-nav-button").forEach((button) => {
            button.addEventListener("click", function () {
                const target =
                    button.dataset.target ||
                    button.getAttribute("aria-controls");

                if (!target) return;

                const targetId = target.replace(/^#/, "");
                const panel = byId(targetId);

                if (!panel || !root.contains(panel)) {
                    showMessage(
                        "The requested affiliate detail panel was not found.",
                        "error"
                    );
                    return;
                }

                const navigation = button.closest(
                    ".affc-details-navigation"
                );

                if (!navigation) return;

                $$(".affc-detail-nav-button", navigation)
                    .forEach((item) => {
                        const active = item === button;

                        item.classList.toggle("is-active", active);
                        item.setAttribute(
                            "aria-selected",
                            active ? "true" : "false"
                        );
                    });

                const detailsContainer =
                    navigation.parentElement;

                $$(".affc-detail-panel", detailsContainer)
                    .forEach((item) => {
                        item.hidden = item !== panel;
                    });

                showElement(panel);
                state.activeDetailPanel = panel.id;
            });
        });
    }

    function initializeSettingsNavigation() {
        $$(".affc-settings-nav-button").forEach((button) => {
            button.addEventListener("click", function () {
                const target =
                    button.dataset.target ||
                    button.getAttribute("aria-controls");

                if (!target) return;

                const targetId = target.replace(/^#/, "");
                const panel = byId(targetId);

                if (!panel || !root.contains(panel)) {
                    showMessage(
                        "The requested settings panel was not found.",
                        "error"
                    );
                    return;
                }

                const navigation = button.closest(
                    ".affc-settings-navigation"
                );

                if (!navigation) return;

                $$(".affc-settings-nav-button", navigation)
                    .forEach((item) => {
                        const active = item === button;

                        item.classList.toggle("is-active", active);
                        item.setAttribute(
                            "aria-selected",
                            active ? "true" : "false"
                        );
                    });

                const container = navigation.parentElement;

                $$(".affc-settings-panel", container)
                    .forEach((item) => {
                        item.hidden = item !== panel;
                    });

                showElement(panel);
                state.activeSettingsPanel = panel.id;
            });
        });
    }

    /* =====================================================
       09. AFFILIATE SEARCH
    ===================================================== */

    function affiliateMatches(affiliate, term) {
        if (!term) return true;

        const searchable = [
            affiliate.id,
            affiliate.affiliate_id,
            affiliate.user_id,
            affiliate.email,
            affiliate.name,
            affiliate.full_name,
            affiliate.status
        ].map(normalize).join(" ");

        return searchable.includes(term);
    }

    function findAffiliateByIdentifier(identifier) {
        const term = normalize(identifier);

        if (!term) return null;

        return state.affiliates.find((affiliate) => {
            return [
                affiliate.id,
                affiliate.affiliate_id,
                affiliate.user_id,
                affiliate.email
            ].some((value) => normalize(value) === term);
        }) || null;
    }

    function renderAffiliateSearchResult(affiliate) {
        const container = $("#affcAffiliateSearchResult");

        if (!container) return;

        if (!affiliate) {
            container.replaceChildren();
            hideElement(container);
            return;
        }

        container.innerHTML = `
            <div class="affc-search-result-info">
                <span>Affiliate ID</span>
                <strong>${escapeHTML(
                    affiliate.affiliate_id ||
                    affiliate.user_id ||
                    affiliate.id
                )}</strong>
                <span>${escapeHTML(
                    affiliate.email || "Email unavailable"
                )}</span>
            </div>
            <button
                type="button"
                class="affc-btn affc-btn-primary"
                data-affc-action="view-affiliate"
                data-affc-id="${escapeHTML(
                    affiliate.id ||
                    affiliate.affiliate_id ||
                    affiliate.user_id
                )}">
                Details
            </button>
        `;

        showElement(container);
    }

    function initializeAffiliateSearch() {
        const form = $("#affcAffiliateSearchForm");
        const input = $("#affcAffiliateSearchInput");

        if (!form || !input) return;

        input.addEventListener("input", function () {
            state.affiliateSearchTerm = normalize(input.value);
            state.affiliatePage = 1;

            renderAffiliateList();
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const term = normalize(input.value);

            if (!term) {
                showMessage(
                    "Enter an Affiliate ID, User ID, or email to search.",
                    "warning"
                );
                return;
            }

            const match = findAffiliateByIdentifier(term);

            if (match) {
                renderAffiliateSearchResult(match);
                showMessage(
                    "Affiliate found. Select Details to view the record.",
                    "success"
                );
            } else {
                renderAffiliateSearchResult(null);
                showMessage(
                    "No matching affiliate was found in the loaded records.",
                    "warning"
                );
            }

           } else {
    renderAffiliateSearchResult(null);

    showMessage(
        "No aff user ID found.",
        "warning"
    );
}
        });
    }

    /* =====================================================
       10. AFFILIATE LIST
    ===================================================== */

    function getAffiliateListContainer() {
        return $("#affcAffiliateListBody");
    }

    function getPageItems(items, page) {
        const pageSize = CONFIG.pageSize;
        const start = (page - 1) * pageSize;

        return items.slice(start, start + pageSize);
    }

    function renderAffiliateList() {
        const container = getAffiliateListContainer();

        if (!container) return;

        const term = state.affiliateSearchTerm;

        const filtered = state.affiliates.filter((affiliate) =>
            affiliateMatches(affiliate, term)
        );

        const pageItems = getPageItems(
            filtered,
            state.affiliatePage
        );

        if (!pageItems.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="affc-empty-cell">
                        No affiliate records are available for this search.
                    </td>
                </tr>
            `;

            renderPagination(
                "affcAffiliatePagination",
                filtered.length,
                state.affiliatePage,
                "affiliate"
            );

            return;
        }

        container.innerHTML = pageItems.map((affiliate) => {
            const identifier =
                affiliate.affiliate_id ||
                affiliate.user_id ||
                affiliate.id;

            const status = normalize(affiliate.status);
            const statusClass = status === "active" ||
                status === "approved"
                    ? "affc-status-approved"
                    : status === "pending"
                        ? "affc-status-pending"
                        : "affc-status-review";

            return `
                <tr>
                    <td>${escapeHTML(identifier)}</td>
                    <td>${escapeHTML(
                        affiliate.name ||
                        affiliate.full_name ||
                        "—"
                    )}</td>
                    <td>${escapeHTML(affiliate.email || "—")}</td>
                    <td>
                        <span class="affc-status ${statusClass}">
                            ${escapeHTML(affiliate.status || "Unknown")}
                        </span>
                    </td>
                    <td>${formatDate(
                        affiliate.created_at ||
                        affiliate.createdAt
                    )}</td>
                    <td>
                        <div class="affc-row-actions">
                            <button
                                type="button"
                                class="affc-btn affc-btn-secondary"
                                data-affc-action="view-affiliate"
                                data-affc-id="${escapeHTML(
                                    affiliate.id ||
                                    affiliate.affiliate_id ||
                                    affiliate.user_id
                                )}">
                                Details
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        renderPagination(
            "affcAffiliatePagination",
            filtered.length,
            state.affiliatePage,
            "affiliate"
        );
    }

    /* =====================================================
       11. PAGINATION
    ===================================================== */

    function renderPagination(containerId, total, currentPage, type) {
        const container = byId(containerId);

        if (!container) return;

        const totalPages = Math.max(
            1,
            Math.ceil(total / CONFIG.pageSize)
        );

        if (totalPages <= 1) {
            container.replaceChildren();
            return;
        }

        container.innerHTML = `
            <button
                type="button"
                class="affc-btn affc-btn-secondary"
                data-affc-page="${type}"
                data-page="${currentPage - 1}"
                ${currentPage <= 1 ? "disabled" : ""}>
                Previous
            </button>

            <span>
                Page ${currentPage} of ${totalPages}
                · ${formatNumber(total)} records
            </span>

            <button
                type="button"
                class="affc-btn affc-btn-secondary"
                data-affc-page="${type}"
                data-page="${currentPage + 1}"
                ${currentPage >= totalPages ? "disabled" : ""}>
                Next
            </button>
        `;
    }

    function changePage(type, page) {
        const nextPage = Number(page);

        if (!Number.isInteger(nextPage) || nextPage < 1) {
            return;
        }

        if (type === "affiliate") {
            state.affiliatePage = nextPage;
            renderAffiliateList();
        } else if (type === "application") {
            state.applicationPage = nextPage;
            renderApplicationList();
        } else if (type === "referral") {
            state.referralPage = nextPage;
            renderReferralList();
        }
    }

    /* =====================================================
       12. AFFILIATE DETAILS
    ===================================================== */

    function getAffiliateStableId(affiliate) {
        return String(
            affiliate?.id ??
            affiliate?.affiliate_id ??
            affiliate?.user_id ??
            ""
        );
    }

    function openAffiliateDetails(identifier) {
        const wanted = normalize(identifier);

        const affiliate = state.affiliates.find((item) => {
            return [
                item.id,
                item.affiliate_id,
                item.user_id
            ].some((value) => normalize(value) === wanted);
        });

        if (!affiliate) {
            showMessage(
                "The affiliate record could not be found in the loaded list.",
                "error"
            );
            return;
        }

        state.selectedAffiliate = affiliate;

        setText(
            "affcSelectedAffiliateId",
            affiliate.affiliate_id ||
            affiliate.user_id ||
            affiliate.id
        );

        setText(
            "affcSelectedAffiliateEmail",
            affiliate.email || "—"
        );

        setText(
            "affcSelectedAffiliateName",
            affiliate.name ||
            affiliate.full_name ||
            "—"
        );

        setText(
            "affcSelectedAffiliateStatus",
            affiliate.status || "Unknown"
        );

        const details = $("#affcAffiliateDetails");

        if (details) {
            showElement(details);
            details.scrollIntoView({
                behavior: "auto",
                block: "start"
            });
        }

        const settingsAffiliateId =
            $("#affcCommissionAffiliateId");

        if (settingsAffiliateId) {
            settingsAffiliateId.value =
                affiliate.affiliate_id ||
                affiliate.user_id ||
                affiliate.id ||
                "";
        }

        loadReferralList(affiliate).catch((error) => {
            console.error("Referral loading failed:", error);
            showMessage(
                "Affiliate details opened, but the referral list could not be loaded. Check the referral table configuration.",
                "warning"
            );
        });

        hideMessage();
    }

    /* =====================================================
       13. REFERRAL LIST
       Referral table should display only User ID and email.
    ===================================================== */

    async function loadReferralList(affiliate) {
        const container = $("#affcReferralListBody");

        if (!container) return;

        const table = getConfiguredTable("referrals");

        if (!table) {
            container.innerHTML = `
                <tr>
                    <td colspan="2" class="affc-empty-cell">
                        Configure the real referral table and its relationship
                        to the selected affiliate before loading referrals.
                    </td>
                </tr>
            `;
            return;
        }

        const client = getSupabaseClient();

        if (!client) {
            throw new Error("Supabase client is not configured.");
        }

        /*
         * Relationship/filter column names are deliberately
         * not guessed. Set the correct referral relationship
         * in your actual schema before implementing this query.
         */

        container.innerHTML = `
            <tr>
                <td colspan="2" class="affc-empty-cell">
                    Referral relationship mapping is not configured.
                </td>
            </tr>
        `;

        state.referrals = [];
        state.referralPage = 1;

        const searchInput = $("#affcReferralSearchInput");

        if (searchInput) {
            searchInput.value = "";
        }

        state.referralSearchTerm = "";

        // No query is run with an assumed column name.
    }

    function renderReferralList() {
        const container = $("#affcReferralListBody");

        if (!container) return;

        const term = state.referralSearchTerm;

        const filtered = state.referrals.filter((referral) => {
            const text = normalize(
                `${referral.user_id || ""} ${referral.email || ""}`
            );

            return !term || text.includes(term);
        });

        const pageItems = getPageItems(
            filtered,
            state.referralPage
        );

        if (!pageItems.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="2" class="affc-empty-cell">
                        No referral records are available.
                    </td>
                </tr>
            `;
        } else {
            container.innerHTML = pageItems.map((referral) => `
                <tr>
                    <td>${escapeHTML(referral.user_id || "—")}</td>
                    <td>${escapeHTML(referral.email || "—")}</td>
                </tr>
            `).join("");
        }

        renderPagination(
            "affcReferralPagination",
            filtered.length,
            state.referralPage,
            "referral"
        );
    }

    function initializeReferralSearch() {
        const input = $("#affcReferralSearchInput");

        if (!input) return;

        input.addEventListener("input", function () {
            state.referralSearchTerm = normalize(input.value);
            state.referralPage = 1;
            renderReferralList();
        });
    }

    /* =====================================================
       14. APPLICATIONS
    ===================================================== */

    async function loadApplications() {
        const container = $("#affcApplicationListBody");

        if (!container) return;

        container.innerHTML = `
            <tr>
                <td colspan="7" class="affc-empty-cell">
                    Application data has not been loaded.
                </td>
            </tr>
        `;

        const table = getConfiguredTable("applications");

        if (!table) {
            showInlineMessage(
                container.closest(".affc-table-container") ||
                container.parentElement,
                "Configure the real application table and column mapping before loading applications.",
                "warning"
            );
            return;
        }

        const result = await selectRows("applications", {
            orderBy: "created_at",
            ascending: false,
            limit: 500
        });

        state.applications = result.data;
        state.applicationPage = 1;

        renderApplicationList();
    }

    function renderApplicationList() {
        const container = $("#affcApplicationListBody");

        if (!container) return;

        const pageItems = getPageItems(
            state.applications,
            state.applicationPage
        );

        if (!pageItems.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="affc-empty-cell">
                        No application records are available.
                    </td>
                </tr>
            `;

            renderPagination(
                "affcApplicationPagination",
                0,
                1,
                "application"
            );

            return;
        }

        container.innerHTML = pageItems.map((application) => {
            const status = normalize(application.status);

            const statusClass = status === "approved"
                ? "affc-status-approved"
                : status === "rejected"
                    ? "affc-status-rejected"
                    : "affc-status-pending";

            return `
                <tr>
                    <td>${escapeHTML(
                        application.id || "—"
                    )}</td>
                    <td>${escapeHTML(
                        application.user_id || "—"
                    )}</td>
                    <td>${escapeHTML(
                        application.email || "—"
                    )}</td>
                    <td>${escapeHTML(
                        application.name ||
                        application.full_name ||
                        "—"
                    )}</td>
                    <td>
                        <span class="affc-status ${statusClass}">
                            ${escapeHTML(
                                application.status || "Unknown"
                            )}
                        </span>
                    </td>
                    <td>${formatDate(application.created_at)}</td>
                    <td>
                        <button
                            type="button"
                            class="affc-btn affc-btn-secondary"
                            data-affc-action="view-application"
                            data-affc-id="${escapeHTML(application.id)}">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        renderPagination(
            "affcApplicationPagination",
            state.applications.length,
            state.applicationPage,
            "application"
        );
    }

    function openApplicationDetails(identifier) {
        const wanted = normalize(identifier);

        const application = state.applications.find((item) =>
            normalize(item.id) === wanted
        );

        if (!application) {
            showMessage(
                "Application not found in the loaded records.",
                "error"
            );
            return;
        }

        state.selectedApplication = application;

        const panel = $("#affcApplicationDetails");

        if (!panel) {
            showMessage(
                "Application details panel is missing from the HTML.",
                "warning"
            );
            return;
        }

        const fields = [
            ["Application ID", application.id],
            ["User ID", application.user_id],
            ["Email", application.email],
            ["Name", application.name || application.full_name],
            ["Status", application.status],
            ["Submitted", formatDate(application.created_at)]
        ];

        panel.innerHTML = `
            <div class="affc-details-header">
                <div>
                    <h4>Application Details</h4>
                    <p>Review the selected application.</p>
                </div>
            </div>

            <div class="affc-details-grid">
                ${fields.map(([label, value]) => `
                    <div class="affc-detail-item">
                        <span>${escapeHTML(label)}</span>
                        <strong>${escapeHTML(value ?? "—")}</strong>
                    </div>
                `).join("")}
            </div>

            <p class="affc-description">
                Approve or reject actions must be implemented through
                a server-side function with admin authorization.
            </p>
        `;

        showElement(panel);
        panel.scrollIntoView({
            behavior: "auto",
            block: "start"
        });
    }

    /* =====================================================
       15. INDIVIDUAL COMMISSION SETTINGS
    ===================================================== */

    async function saveCommissionSettings(form) {
        const affiliateIdInput =
            $("#affcCommissionAffiliateId", form) ||
            $("#affcCommissionAffiliateId");

        if (!affiliateIdInput || !affiliateIdInput.value.trim()) {
            showMessage(
                "Select an affiliate before saving commission settings.",
                "warning"
            );
            return;
        }

        const percentageInput =
            $("#affcCommissionPercentage", form) ||
            $("#affcCommissionPercentage");

        const percentage = percentageInput
            ? Number(percentageInput.value)
            : NaN;

        if (!Number.isFinite(percentage) ||
            percentage < 0 ||
            percentage > 100) {
            showMessage(
                "Enter a valid commission percentage between 0 and 100.",
                "warning"
            );
            return;
        }

        const payload = {
            affiliate_id: affiliateIdInput.value.trim(),
            commission_percentage: percentage
        };

        /*
         * The server must verify:
         * - The current user is an authorized administrator.
         * - The affiliate exists.
         * - The percentage is permitted.
         * - An audit record is written.
         */

        try {
            await invokeConfiguredFunction(
                "saveCommissionSettings",
                payload
            );

            showMessage(
                "Commission settings saved successfully.",
                "success"
            );
        } catch (error) {
            console.error(
                "Saving commission settings failed:",
                error
            );

            showMessage(
                error.message ||
                "Commission settings were not saved. Configure the secure server-side function first.",
                "error"
            );
        }
    }

    function initializeCommissionSettings() {
        const form = $("#affcCommissionSettingsForm");

        if (!form) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const button = $("button[type='submit']", form);

            setButtonLoading(button, true, "Saving…");

            try {
                await saveCommissionSettings(form);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       16. DAILY COMMISSION CALCULATION
    ===================================================== */

    async function calculateDailyCommission(form) {
        const affiliateId =
            $("#affcDailyAffiliateId", form)?.value?.trim() || "";

        const periodStart =
            $("#affcDailyPeriodStart", form)?.value || "";

        const periodEnd =
            $("#affcDailyPeriodEnd", form)?.value || "";

        if (!periodStart || !periodEnd) {
            showMessage(
                "Choose the start and end of the reporting period.",
                "warning"
            );
            return;
        }

        if (new Date(periodStart) >= new Date(periodEnd)) {
            showMessage(
                "The end of the reporting period must be after its start.",
                "warning"
            );
            return;
        }

        const payload = {
            affiliate_id: affiliateId || null,
            period_start: periodStart,
            period_end: periodEnd
        };

        /*
         * The server-side function should calculate the
         * configured 24-hour window using the authoritative
         * database timestamp/timezone.
         *
         * It must use verified deposits, eligible bets, player
         * wins/losses, reversals, and the affiliate's assigned
         * commission rules. Withdrawals should not be treated
         * as deposits or net gaming revenue.
         */

        try {
            const result = await invokeConfiguredFunction(
                "calculateDailyCommission",
                payload
            );

            renderFinancialResult(
                "affcDailyCalculationResult",
                result
            );

            showMessage(
                "Daily calculation completed by the server.",
                "success"
            );
        } catch (error) {
            console.error(
                "Daily calculation failed:",
                error
            );

            showMessage(
                error.message ||
                "Daily calculation is unavailable. Configure the secure server-side function first.",
                "error"
            );
        }
    }

    function initializeDailyCalculation() {
        const form = $("#affcDailyCalculationForm");

        if (!form) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const button = $("button[type='submit']", form);

            setButtonLoading(button, true, "Calculating…");

            try {
                await calculateDailyCommission(form);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       17. WEEKLY SETTLEMENT
    ===================================================== */

    async function settleWeeklyCommission(form) {
        const periodStart =
            $("#affcWeeklyPeriodStart", form)?.value || "";

        const periodEnd =
            $("#affcWeeklyPeriodEnd", form)?.value || "";

        if (!periodStart || !periodEnd) {
            showMessage(
                "Choose the weekly settlement period.",
                "warning"
            );
            return;
        }

        if (new Date(periodStart) >= new Date(periodEnd)) {
            showMessage(
                "The weekly period end must be after its start.",
                "warning"
            );
            return;
        }

        const payload = {
            period_start: periodStart,
            period_end: periodEnd
        };

        /*
         * The server must verify the period, commission ledger,
         * previous settlements, idempotency, admin permissions,
         * and whether the balance is eligible for settlement.
         */

        try {
            const result = await invokeConfiguredFunction(
                "settleWeeklyCommission",
                payload
            );

            renderFinancialResult(
                "affcWeeklySettlementResult",
                result
            );

            showMessage(
                "Weekly settlement request completed by the server.",
                "success"
            );
        } catch (error) {
            console.error(
                "Weekly settlement failed:",
                error
            );

            showMessage(
                error.message ||
                "Weekly settlement is unavailable. Configure the secure server-side function first.",
                "error"
            );
        }
    }

    function initializeWeeklySettlement() {
        const form = $("#affcWeeklySettlementForm");

        if (!form) return;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const button = $("button[type='submit']", form);

            setButtonLoading(button, true, "Processing…");

            try {
                await settleWeeklyCommission(form);
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       18. PAYOUT ACTION
    ===================================================== */

    async function processPayout(identifier) {
        if (!identifier) {
            showMessage(
                "A payout request ID is required.",
                "warning"
            );
            return;
        }

        const confirmed = window.confirm(
            "Send this payout request for secure server-side processing?"
        );

        if (!confirmed) return;

        try {
            await invokeConfiguredFunction(
                "processPayout",
                { payout_id: identifier }
            );

            showMessage(
                "Payout request processed by the server.",
                "success"
            );

            await refreshAffiliateCenter();
        } catch (error) {
            console.error("Payout processing failed:", error);

            showMessage(
                error.message ||
                "Payout processing is unavailable. Configure the secure server-side function first.",
                "error"
            );
        }
    }

    /* =====================================================
       19. FINANCIAL RESULT DISPLAY
    ===================================================== */

    function renderFinancialResult(containerId, result) {
        const container = byId(containerId);

        if (!container) return;

        if (!result || typeof result !== "object") {
            container.textContent =
                "The server returned no financial summary.";
            showElement(container);
            return;
        }

        /*
         * Render only values returned by the trusted server.
         * This function does not calculate commissions.
         */

        const allowedFields = [
            ["Period Start", "period_start"],
            ["Period End", "period_end"],
            ["Total Deposits", "total_deposits"],
            ["Eligible Bets", "eligible_bets"],
            ["Player Wins", "player_wins"],
            ["Player Losses", "player_losses"],
            ["Net Revenue", "net_revenue"],
            ["Commission Rate", "commission_rate"],
            ["Commission Amount", "commission_amount"],
            ["Settlement Status", "status"]
        ];

        const currency = result.currency || "USD";

        const fields = allowedFields.filter(([, key]) =>
            Object.prototype.hasOwnProperty.call(result, key)
        );

        if (!fields.length) {
            container.textContent =
                "The server response contains no recognized summary fields.";
            showElement(container);
            return;
        }

        container.innerHTML = `
            <div class="affc-details-grid">
                ${fields.map(([label, key]) => {
                    let value = result[key];

                    if ([
                        "total_deposits",
                        "eligible_bets",
                        "player_wins",
                        "player_losses",
                        "net_revenue",
                        "commission_amount"
                    ].includes(key)) {
                        value = formatMoney(value, currency);
                    } else if (key === "commission_rate") {
                        value = `${formatNumber(value)}%`;
                    } else if (key === "period_start" ||
                               key === "period_end") {
                        value = formatDate(value);
                    }

                    return `
                        <div class="affc-detail-item">
                            <span>${escapeHTML(label)}</span>
                            <strong>${escapeHTML(value ?? "—")}</strong>
                        </div>
                    `;
                }).join("")}
            </div>
        `;

        showElement(container);
    }

    /* =====================================================
       20. OVERVIEW DATA
    ===================================================== */

    function resetOverviewValues() {
        const ids = [
            "affcTotalAffiliates",
            "affcActiveAffiliates",
            "affcPendingApplications",
            "affcTotalReferrals",
            "affcTodayDeposits",
            "affcTodayWin",
            "affcTodayLoss",
            "affcTodayNetResult",
            "affcPendingPayouts",
            "affcTotalCommission"
        ];

        ids.forEach((id) => setText(id, "—"));
    }

    async function loadOverview() {
        /*
         * Overview metrics are intentionally not calculated
         * from guessed columns or unrelated tables.
         *
         * Prefer a secured server-side summary endpoint that
         * returns verified metrics for the selected period.
         */

        const summaryElement = $("#affcOverviewNotice");

        if (summaryElement) {
            summaryElement.textContent =
                "Overview totals will appear after the verified Supabase schema and secure summary function are configured.";
            showElement(summaryElement);
        }

        resetOverviewValues();
    }

    /* =====================================================
       21. LOAD AFFILIATE RECORDS
    ===================================================== */

    async function loadAffiliates() {
        const table = getConfiguredTable("affiliates");

        if (!table) {
            state.affiliates = [];
            renderAffiliateList();

            const container = getAffiliateListContainer();

            if (container) {
                container.innerHTML = `
                    <tr>
                        <td colspan="6" class="affc-empty-cell">
                            Configure the real affiliate table and its
                            column mapping to display affiliate records.
                        </td>
                    </tr>
                `;
            }

            return;
        }

        const result = await selectRows("affiliates", {
            orderBy: "created_at",
            ascending: false,
            limit: 1000
        });

        state.affiliates = result.data;
        state.affiliatePage = 1;

        renderAffiliateList();
    }

    /* =====================================================
       22. REFRESH
    ===================================================== */

    async function refreshAffiliateCenter() {
        if (state.loading) return;

        hideMessage();
        setLoading(true);

        try {
            await Promise.all([
                loadAffiliates(),
                loadOverview()
            ]);

            showMessage(
                "Affiliate Center refreshed. Any unconfigured data sources remain unavailable.",
                "success"
            );
        } catch (error) {
            console.error(
                "Affiliate Center refresh failed:",
                error
            );

            showMessage(
                error.message ||
                "Could not refresh Affiliate Center data.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    function initializeRefreshButton() {
        const button = $("#refreshAffiliateDataBtn");

        if (!button) return;

        button.addEventListener("click", async function () {
            setButtonLoading(button, true, "Refreshing…");

            try {
                await refreshAffiliateCenter();
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       23. DELEGATED ACTIONS
    ===================================================== */

    function initializeDelegatedActions() {
        root.addEventListener("click", async function (event) {
            const actionButton = event.target.closest(
                "[data-affc-action]"
            );

            if (actionButton && root.contains(actionButton)) {
                const action = actionButton.dataset.affcAction;
                const identifier = actionButton.dataset.affcId;

                if (action === "view-affiliate") {
                    openAffiliateDetails(identifier);
                    return;
                }

                if (action === "view-application") {
                    openApplicationDetails(identifier);
                    return;
                }

                if (action === "refresh") {
                    await refreshAffiliateCenter();
                    return;
                }

                if (action === "process-payout") {
                    await processPayout(identifier);
                    return;
                }
            }

            const pageButton = event.target.closest(
                "[data-affc-page]"
            );

            if (pageButton && root.contains(pageButton)) {
                changePage(
                    pageButton.dataset.affcPage,
                    pageButton.dataset.page
                );
            }
        });
    }

    /* =====================================================
       24. FORM INITIALIZATION
    ===================================================== */

    function initializeForms() {
        initializeAffiliateSearch();
        initializeReferralSearch();
        initializeCommissionSettings();
        initializeDailyCalculation();
        initializeWeeklySettlement();
    }

    /* =====================================================
       25. INITIALIZATION
    ===================================================== */

    async function initialize() {
        if (state.initialized) return;

        state.initialized = true;

        initializeMainNavigation();
        initializeDetailNavigation();
        initializeSettingsNavigation();

        initializeForms();
        initializeRefreshButton();
        initializeDelegatedActions();

        await loadOverview();

        /*
         * Do not automatically query unknown tables.
         * If real table names have been configured, load the
         * affiliate list; otherwise show a clear setup state.
         */

        if (getConfiguredTable("affiliates")) {
            try {
                await loadAffiliates();
            } catch (error) {
                console.error(
                    "Affiliate list initialization failed:",
                    error
                );

                showMessage(
                    error.message ||
                    "Affiliate records could not be loaded.",
                    "error"
                );
            }
        } else {
            renderAffiliateList();
        }

        console.log("SAFIKI AFFILIATE CENTER INITIALIZED");
    }

    /* =====================================================
       26. PUBLIC API
       Optional access for other Admin scripts.
    ===================================================== */

    window.AffiliateCenter = {
        refresh: refreshAffiliateCenter,

        loadAffiliates,
        loadApplications,

        openAffiliateDetails,
        openApplicationDetails,

        getState: function () {
            return {
                activeMainPanel: state.activeMainPanel,
                selectedAffiliate: state.selectedAffiliate,
                selectedApplication: state.selectedApplication,
                affiliateCount: state.affiliates.length,
                applicationCount: state.applications.length,
                loading: state.loading
            };
        }
    };

    /* =====================================================
       27. START WHEN DOM IS READY
    ===================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

})();

// Prevent Affiliate Search from reloading the dashboard
document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("affcAffiliateSearchForm");

    if (!searchForm) return;

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
    });
});
