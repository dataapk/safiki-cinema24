/* =========================================================
   SAFIKI ADMIN — AFFILIATE CENTER
   File: affiliate.js

   Supabase schema: affiliate_program
   Client: window.supabaseClient

   Uses the existing affiliate_program schema.
   Does not modify public.user_data or its triggers.

   SECURITY:
   - Browser-side admin checks are not sufficient by themselves.
   - Enable appropriate Supabase RLS policies.
   - Financial processing must use authorized server functions.
========================================================= */

(function () {
    "use strict";

    const CONFIG = {
        rootSelector: "#affiliateSection",
        schema: "affiliate_program",
        pageSize: 20,
        applicationLimit: 500,
        affiliateLimit: 1000,

        tables: {
            admins: "admins",
            applications: "applications",
            affiliates: "affiliates",
            referrals: "referrals",
            commissions: "commissions",
            payouts: "payouts",
            settings: "settings",
            auditLog: "audit_log"
        },

        functions: {
            saveCommissionSettings: "",
            calculateDailyCommission: "",
            settleWeeklyCommission: "",
            processPayout: ""
        }
    };

    const root = document.querySelector(CONFIG.rootSelector);

    if (!root) {
        console.warn(
            "Affiliate Center: #affiliateSection was not found."
        );
        return;
    }

    const state = {
        initialized: false,
        loading: false,
        adminId: null,

        affiliates: [],
        applications: [],
        referrals: [],

        selectedAffiliate: null,
        selectedApplication: null,

        affiliateSearchTerm: "",
        applicationSearchTerm: "",
        referralSearchTerm: "",

        affiliatePage: 1,
        applicationPage: 1,
        referralPage: 1
    };

    const $ = (selector, parent = root) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = root) =>
        Array.from(parent.querySelectorAll(selector));

    const byId = (id) => document.getElementById(id);

    /* =====================================================
       01. HELPERS
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function normalize(value) {
        return String(value ?? "").trim().toLowerCase();
    }

    function formatNumber(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) return "—";

        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2
        }).format(number);
    }

    function formatMoney(value, currency = "USD") {
        const number = Number(value);

        if (!Number.isFinite(number)) return "—";

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

        if (Number.isNaN(date.getTime())) return "—";

        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short"
        }).format(date);
    }

    function getFullName(record) {
        return [
            record?.first_name,
            record?.last_name
        ].filter(Boolean).join(" ").trim() || "—";
    }

    function showElement(element) {
        if (!element) return;

        element.hidden = false;
        element.style.removeProperty("display");
    }

    function hideElement(element) {
        if (element) element.hidden = true;
    }

    function setText(id, value) {
        const element = byId(id);

        if (element) {
            element.textContent =
                value === null || value === undefined || value === ""
                    ? "—"
                    : String(value);
        }
    }

    function setButtonLoading(button, loading, text = "Please wait…") {
        if (!button) return;

        if (loading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }

            button.disabled = true;
            button.textContent = text;
            button.setAttribute("aria-busy", "true");
        } else {
            button.disabled = false;

            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }

            button.removeAttribute("aria-busy");
        }
    }

    function setLoading(loading) {
        state.loading = Boolean(loading);

        root.classList.toggle("affc-is-loading", state.loading);
        root.setAttribute(
            "aria-busy",
            state.loading ? "true" : "false"
        );
    }

    /* =====================================================
       02. MESSAGES
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
       03. SUPABASE
    ===================================================== */

    function getClient() {
        return window.supabaseClient || null;
    }

    function getTable(tableName) {
        const client = getClient();

        if (!client) {
            throw new Error(
                "Supabase client missing. Initialize window.supabaseClient first."
            );
        }

        return client
            .schema(CONFIG.schema)
            .from(tableName);
    }

    async function getCurrentUser() {
        const client = getClient();

        if (!client) {
            throw new Error("Supabase client is not configured.");
        }

        const { data, error } = await client.auth.getUser();

        if (error) throw error;

        if (!data?.user) {
            throw new Error("Please sign in to the admin account.");
        }

        return data.user;
    }

    async function requireAdmin() {
        const user = await getCurrentUser();

        const { data, error } = await getTable(CONFIG.tables.admins)
            .select("user_id, role, is_active")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        if (!data || data.is_active !== true) {
            throw new Error(
                "Access denied. An active Affiliate Center admin account is required."
            );
        }

        state.adminId = user.id;

        return data;
    }

    async function selectRows(tableName, options = {}) {
        let query = getTable(tableName).select(
            options.select || "*"
        );

        if (typeof options.filter === "function") {
            query = options.filter(query);
        }

        if (options.orderBy) {
            query = query.order(options.orderBy, {
                ascending: options.ascending !== false
            });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return Array.isArray(data) ? data : [];
    }

    async function invokeFunction(functionKey, payload) {
        const client = getClient();
        const functionName = CONFIG.functions[functionKey];

        if (!client) {
            throw new Error("Supabase client is not configured.");
        }

        if (!functionName) {
            throw new Error(
                `The server function "${functionKey}" has not been configured.`
            );
        }

        const { data, error } = await client.functions.invoke(
            functionName,
            { body: payload }
        );

        if (error) throw error;

        return data;
    }

    /* =====================================================
       04. AUDIT LOG
       Audit writes use the existing audit_log columns.
       RLS must restrict writes to authorized administrators.
    ===================================================== */

    async function writeAudit(action, entityType, entityId, details = {}) {
        const { error } = await getTable(CONFIG.tables.auditLog)
            .insert({
                actor_user_id: state.adminId,
                action,
                entity_type: entityType,
                entity_id: entityId || null,
                details
            });

        if (error) {
            console.error("Audit log write failed:", error);

            throw new Error(
                "The operation's audit record could not be saved. Check audit_log permissions."
            );
        }
    }

    /* =====================================================
       05. MAIN NAVIGATION
    ===================================================== */

    function initializeMainNavigation() {
        const buttons = $$(".affc-nav-button");

        buttons.forEach(button => {
            button.addEventListener("click", () => {
                const target =
                    button.dataset.target ||
                    button.getAttribute("aria-controls");

                if (!target) return;

                const panel = byId(target.replace(/^#/, ""));

                if (!panel || !root.contains(panel)) {
                    showMessage("The requested panel was not found.", "error");
                    return;
                }

                buttons.forEach(item => {
                    const active = item === button;

                    item.classList.toggle("is-active", active);
                    item.setAttribute(
                        "aria-selected",
                        String(active)
                    );
                    item.setAttribute(
                        "aria-pressed",
                        String(active)
                    );
                });

                $$(".affc-main-panel").forEach(item => {
                    item.hidden = item !== panel;
                });

                showElement(panel);
                panel.scrollIntoView({
                    behavior: "auto",
                    block: "start"
                });
            });
        });

        const initial =
            buttons.find(button =>
                button.classList.contains("is-active")
            ) || buttons[0];

        if (initial) initial.click();
    }

    function initializeSubNavigation(buttonSelector, panelSelector, navSelector) {
        $$(buttonSelector).forEach(button => {
            button.addEventListener("click", () => {
                const target =
                    button.dataset.target ||
                    button.getAttribute("aria-controls");

                if (!target) return;

                const panel = byId(target.replace(/^#/, ""));

                if (!panel || !root.contains(panel)) {
                    showMessage("The requested panel was not found.", "error");
                    return;
                }

                const nav = button.closest(navSelector);

                if (!nav) return;

                $$(buttonSelector, nav).forEach(item => {
                    item.classList.toggle("is-active", item === button);
                    item.setAttribute(
                        "aria-selected",
                        String(item === button)
                    );
                });

                const container = nav.parentElement;

                $$(panelSelector, container).forEach(item => {
                    item.hidden = item !== panel;
                });

                showElement(panel);
            });
        });
    }

    /* =====================================================
       06. PAGINATION
    ===================================================== */

    function pageItems(items, page) {
        const start = (page - 1) * CONFIG.pageSize;

        return items.slice(start, start + CONFIG.pageSize);
    }

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

        const safePage = Math.min(
            Math.max(currentPage, 1),
            totalPages
        );

        container.innerHTML = `
            <button
                type="button"
                class="affc-btn affc-btn-secondary"
                data-affc-page="${escapeHTML(type)}"
                data-page="${safePage - 1}"
                ${safePage <= 1 ? "disabled" : ""}>
                Previous
            </button>

            <span>
                Page ${safePage} of ${totalPages}
                · ${formatNumber(total)} records
            </span>

            <button
                type="button"
                class="affc-btn affc-btn-secondary"
                data-affc-page="${escapeHTML(type)}"
                data-page="${safePage + 1}"
                ${safePage >= totalPages ? "disabled" : ""}>
                Next
            </button>
        `;
    }

    function changePage(type, page) {
        const next = Number(page);

        if (!Number.isInteger(next) || next < 1) return;

        if (type === "affiliate") {
            state.affiliatePage = next;
            renderAffiliateList();
        } else if (type === "application") {
            state.applicationPage = next;
            renderApplicationList();
        } else if (type === "referral") {
            state.referralPage = next;
            renderReferralList();
        }
    }

    /* =====================================================
       07. AFFILIATES
    ===================================================== */

    function affiliateName(affiliate) {
        const application = state.applications.find(item =>
            item.auth_user_id === affiliate.auth_user_id
        );

        return application ? getFullName(application) : "—";
    }

    function affiliateEmail(affiliate) {
        const application = state.applications.find(item =>
            item.auth_user_id === affiliate.auth_user_id
        );

        return application?.email || "—";
    }

    function renderAffiliateList() {
        const container = $("#affcAffiliateListBody");

        if (!container) return;

        const term = state.affiliateSearchTerm;

        const filtered = state.affiliates.filter(affiliate => {
            const text = normalize([
                affiliate.id,
                affiliate.affiliate_id,
                affiliate.auth_user_id,
                affiliate.player_id,
                affiliate.status,
                affiliateEmail(affiliate),
                affiliateName(affiliate)
            ].join(" "));

            return !term || text.includes(term);
        });

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / CONFIG.pageSize)
        );

        state.affiliatePage = Math.min(
            state.affiliatePage,
            totalPages
        );

        const items = pageItems(filtered, state.affiliatePage);

        if (!items.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="affc-empty-cell">
                        No affiliate records found.
                    </td>
                </tr>
            `;
        } else {
            container.innerHTML = items.map(affiliate => {
                const status = normalize(affiliate.status);

                const statusClass =
                    status === "active" || status === "approved"
                        ? "affc-status-approved"
                        : status === "pending"
                            ? "affc-status-pending"
                            : "affc-status-review";

                return `
                    <tr>
                        <td>${escapeHTML(affiliate.affiliate_id || "—")}</td>
                        <td>${escapeHTML(affiliateName(affiliate))}</td>
                        <td>${escapeHTML(affiliateEmail(affiliate))}</td>
                        <td>
                            <span class="affc-status ${statusClass}">
                                ${escapeHTML(affiliate.status || "Unknown")}
                            </span>
                        </td>
                        <td>${escapeHTML(formatDate(affiliate.created_at))}</td>
                        <td>
                            <button
                                type="button"
                                class="affc-btn affc-btn-secondary"
                                data-affc-action="view-affiliate"
                                data-affc-id="${escapeHTML(affiliate.id)}">
                                Details
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        renderPagination(
            "affcAffiliatePagination",
            filtered.length,
            state.affiliatePage,
            "affiliate"
        );
    }

    async function loadAffiliates() {
        state.affiliates = await selectRows(CONFIG.tables.affiliates, {
            orderBy: "created_at",
            ascending: false,
            limit: CONFIG.affiliateLimit
        });

        state.affiliatePage = 1;
        renderAffiliateList();
    }

    function openAffiliateDetails(identifier) {
        const affiliate = state.affiliates.find(item =>
            normalize(item.id) === normalize(identifier) ||
            normalize(item.affiliate_id) === normalize(identifier)
        );

        if (!affiliate) {
            showMessage("Affiliate record not found.", "error");
            return;
        }

        state.selectedAffiliate = affiliate;

        setText("affcSelectedAffiliateId", affiliate.affiliate_id);
        setText("affcSelectedAffiliateEmail", affiliateEmail(affiliate));
        setText("affcSelectedAffiliateName", affiliateName(affiliate));
        setText("affcSelectedAffiliateStatus", affiliate.status);
        setText("affcCommissionAffiliateId", affiliate.affiliate_id);

        showElement($("#affcAffiliateDetails"));

        loadReferralList(affiliate).catch(error => {
            console.error(error);
            showMessage("Could not load referral records.", "warning");
        });
    }

    /* =====================================================
       08. APPLICATIONS
    ===================================================== */

    async function loadApplications() {
        const container = $("#affcApplicationListBody");

        if (container) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="affc-empty-cell">
                        Loading applications…
                    </td>
                </tr>
            `;
        }

        state.applications = await selectRows(
            CONFIG.tables.applications,
            {
                orderBy: "created_at",
                ascending: false,
                limit: CONFIG.applicationLimit
            }
        );

        state.applicationPage = 1;
        renderApplicationList();
    }

    function renderApplicationList() {
        const container = $("#affcApplicationListBody");

        if (!container) return;

        const term = state.applicationSearchTerm;

        const filtered = state.applications.filter(application => {
            const text = normalize([
                application.id,
                application.auth_user_id,
                application.email,
                application.first_name,
                application.last_name,
                application.player_id,
                application.status
            ].join(" "));

            return !term || text.includes(term);
        });

        const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / CONFIG.pageSize)
        );

        state.applicationPage = Math.min(
            state.applicationPage,
            totalPages
        );

        const items = pageItems(filtered, state.applicationPage);

        if (!items.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="affc-empty-cell">
                        ${term
                            ? "No matching application found."
                            : "No application records are available."}
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

        container.innerHTML = items.map(application => {
            const status = normalize(application.status);

            const statusClass =
                status === "approved"
                    ? "affc-status-approved"
                    : status === "rejected"
                        ? "affc-status-rejected"
                        : "affc-status-pending";

            return `
                <tr>
                    <td>${escapeHTML(application.id)}</td>
                    <td>${escapeHTML(application.auth_user_id)}</td>
                    <td>${escapeHTML(application.email)}</td>
                    <td>${escapeHTML(getFullName(application))}</td>
                    <td>
                        <span class="affc-status ${statusClass}">
                            ${escapeHTML(application.status || "Unknown")}
                        </span>
                    </td>
                    <td>${escapeHTML(formatDate(application.created_at))}</td>
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
            filtered.length,
            state.applicationPage,
            "application"
        );
    }

    function openApplicationDetails(identifier) {
        const application = state.applications.find(item =>
            normalize(item.id) === normalize(identifier)
        );

        if (!application) {
            showMessage("Application not found.", "error");
            return;
        }

        state.selectedApplication = application;

        const panel = $("#affcApplicationDetails");

        if (!panel) {
            showMessage(
                "The application details panel is missing from admin.html.",
                "warning"
            );
            return;
        }

        const playerVerified = application.player_id_verified === true;
        const status = normalize(application.status);
        const isPending = status === "pending";

        panel.innerHTML = `
            <div class="affc-details-header">
                <div>
                    <h4>Application Details</h4>
                    <p>Review the application before making a decision.</p>
                </div>
            </div>

            <div class="affc-details-grid">
                ${detailField("Application ID", application.id)}
                ${detailField("User ID", application.auth_user_id)}
                ${detailField("Affiliate ID", application.affiliate_id)}
                ${detailField("Email", application.email)}
                ${detailField("First Name", application.first_name)}
                ${detailField("Last Name", application.last_name)}
                ${detailField("Promotion Link", application.promotion_link)}
                ${detailField("Link Category", application.link_category)}
                ${detailField("Contact Platform", application.contact_platform)}
                ${detailField("Telegram", application.telegram_username)}
                ${detailField("WhatsApp", application.whatsapp_number)}
                ${detailField("Player ID", application.player_id)}
                ${detailField(
                    "Player ID Verified",
                    playerVerified ? "Verified" : "Not verified"
                )}
                ${detailField("Status", application.status)}
                ${detailField("Review Notes", application.review_notes)}
                ${detailField("Submitted", formatDate(application.created_at))}
            </div>

            ${isPending ? `
                <div class="affc-row-actions" style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
                    <button
                        type="button"
                        class="affc-btn affc-btn-secondary"
                        data-affc-action="verify-player"
                        data-affc-id="${escapeHTML(application.id)}"
                        ${playerVerified ? "disabled" : ""}>
                        ${playerVerified ? "Player ID Verified" : "Verify Player ID"}
                    </button>

                    <button
                        type="button"
                        class="affc-btn affc-btn-primary"
                        data-affc-action="approve-application"
                        data-affc-id="${escapeHTML(application.id)}"
                        ${playerVerified ? "" : "disabled"}>
                        Approve
                    </button>

                    <button
                        type="button"
                        class="affc-btn affc-btn-secondary"
                        data-affc-action="reject-application"
                        data-affc-id="${escapeHTML(application.id)}">
                        Reject
                    </button>
                </div>

                ${!playerVerified ? `
                    <p class="affc-description">
                        Verify the Player ID before approving this application.
                    </p>
                ` : ""}
            ` : `
                <p class="affc-description">
                    This application has already been reviewed.
                </p>
            `}
        `;

        showElement(panel);
        panel.scrollIntoView({
            behavior: "auto",
            block: "start"
        });
    }

    function detailField(label, value) {
        return `
            <div class="affc-detail-item">
                <span>${escapeHTML(label)}</span>
                <strong>${escapeHTML(value ?? "—")}</strong>
            </div>
        `;
    }

    async function verifyPlayerId(identifier) {
        const application = state.applications.find(item =>
            normalize(item.id) === normalize(identifier)
        );

        if (!application) {
            throw new Error("Application not found.");
        }

        if (normalize(application.status) !== "pending") {
            throw new Error("Only pending applications can be verified.");
        }

        if (!application.player_id || !application.player_id.trim()) {
            throw new Error("This application has no Player ID.");
        }

        const confirmed = window.confirm(
            "Confirm that you have checked this Player ID against the trusted player records?"
        );

        if (!confirmed) return;

        /*
         * Manual verification must only be used after an actual
         * check against your authoritative player system.
         */
        const { data, error } = await getTable(CONFIG.tables.applications)
            .update({
                player_id_verified: true,
                updated_at: new Date().toISOString()
            })
            .eq("id", application.id)
            .eq("status", "pending")
            .select("*")
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            throw new Error(
                "The application was not updated. Check permissions and its current status."
            );
        }

        await writeAudit(
            "player_id_verified",
            "application",
            application.id,
            {
                player_id: application.player_id
            }
        );

        await loadApplications();
        openApplicationDetails(application.id);

        showMessage("Player ID verification saved.", "success");
    }

    async function approveApplication(identifier) {
        const application = state.applications.find(item =>
            normalize(item.id) === normalize(identifier)
        );

        if (!application) {
            throw new Error("Application not found.");
        }

        if (normalize(application.status) !== "pending") {
            throw new Error("Only pending applications can be approved.");
        }

        if (application.player_id_verified !== true) {
            throw new Error("Verify the Player ID before approval.");
        }

        if (!application.auth_user_id) {
            throw new Error("The application has no authenticated user ID.");
        }

        const rateInput = $("#affcApprovalCommissionRate");
        const configuredRate = rateInput
            ? Number(rateInput.value)
            : NaN;

        if (
            !Number.isFinite(configuredRate) ||
            configuredRate < 0 ||
            configuredRate > 100
        ) {
            showMessage(
                "Enter a valid commission rate between 0 and 100 in #affcApprovalCommissionRate before approving.",
                "warning"
            );
            return;
        }

        const confirmed = window.confirm(
            "Approve this application and create the affiliate record?"
        );

        if (!confirmed) return;

        /*
         * IMPORTANT:
         * This client-side flow is not an atomic transaction.
         * Production approval should be moved to a secured RPC
         * that validates the admin and creates the affiliate,
         * updates the application and writes the audit log atomically.
         */

        const affiliateId = application.affiliate_id ||
            (
                "SAF-" +
                (window.crypto?.randomUUID
                    ? window.crypto.randomUUID().replace(/-/g, "").slice(0, 12)
                    : Date.now().toString(36).toUpperCase())
            );

        const { data: existing, error: existingError } =
            await getTable(CONFIG.tables.affiliates)
                .select("id, affiliate_id, auth_user_id")
                .eq("auth_user_id", application.auth_user_id)
                .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
            throw new Error(
                "An affiliate record already exists for this user. Review the existing record before proceeding."
            );
        }

        const { data: affiliate, error: affiliateError } =
            await getTable(CONFIG.tables.affiliates)
                .insert({
                    affiliate_id: affiliateId,
                    application_id: application.id,
                    auth_user_id: application.auth_user_id,
                    player_id: application.player_id,
                    commission_rate: configuredRate,
                    status: "active",
                    approved_by: state.adminId,
                    approved_at: new Date().toISOString()
                })
                .select("*")
                .single();

        if (affiliateError) throw affiliateError;

        const { error: applicationError } =
            await getTable(CONFIG.tables.applications)
                .update({
                    status: "approved",
                    affiliate_id: affiliateId,
                    reviewed_by: state.adminId,
                    reviewed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq("id", application.id)
                .eq("status", "pending");

        if (applicationError) {
            console.error(
                "Application status update failed after affiliate insert:",
                applicationError
            );

            showMessage(
                "Affiliate record was created, but application status could not be updated. An administrator must reconcile this record.",
                "error"
            );

            return;
        }

        await writeAudit(
            "application_approved",
            "application",
            application.id,
            {
                affiliate_id: affiliate.affiliate_id,
                commission_rate: configuredRate
            }
        );

        await refreshAffiliateCenter();

        showMessage("Application approved.", "success");
    }

    async function rejectApplication(identifier) {
        const application = state.applications.find(item =>
            normalize(item.id) === normalize(identifier)
        );

        if (!application) {
            throw new Error("Application not found.");
        }

        if (normalize(application.status) !== "pending") {
            throw new Error("Only pending applications can be rejected.");
        }

        const reason = window.prompt(
            "Enter the reason for rejecting this application:"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            showMessage("A rejection reason is required.", "warning");
            return;
        }

        const { data, error } = await getTable(CONFIG.tables.applications)
            .update({
                status: "rejected",
                review_notes: reason.trim(),
                reviewed_by: state.adminId,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", application.id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            throw new Error(
                "The application was not updated. It may have already been reviewed."
            );
        }

        await writeAudit(
            "application_rejected",
            "application",
            application.id,
            {
                reason: reason.trim()
            }
        );

        await refreshAffiliateCenter();

        showMessage("Application rejected.", "success");
    }

    /* =====================================================
       09. REFERRALS
       Existing schema has referred_player_id, not email.
       Email is not fabricated or inferred.
    ===================================================== */

    async function loadReferralList(affiliate) {
        const container = $("#affcReferralListBody");

        if (!container) return;

        const { data, error } = await getTable(CONFIG.tables.referrals)
            .select("*")
            .eq("affiliate_id", affiliate.id)
            .order("created_at", { ascending: false })
            .limit(500);

        if (error) {
            /*
             * Some schemas may relate referrals by affiliate_id text
             * instead of the affiliate UUID. Do not silently guess
             * another relationship when this query fails.
             */
            container.innerHTML = `
                <tr>
                    <td colspan="2" class="affc-empty-cell">
                        Referral relationship could not be loaded.
                        Check whether referrals.affiliate_id stores the affiliate UUID
                        or the affiliate_id text value.
                    </td>
                </tr>
            `;

            throw error;
        }

        state.referrals = Array.isArray(data) ? data : [];
        state.referralPage = 1;
        state.referralSearchTerm = "";

        const input = $("#affcReferralSearchInput");
        if (input) input.value = "";

        renderReferralList();
    }

    function renderReferralList() {
        const container = $("#affcReferralListBody");

        if (!container) return;

        const term = state.referralSearchTerm;

        const filtered = state.referrals.filter(referral => {
            const text = normalize([
                referral.referred_player_id,
                referral.status,
                referral.attribution_source
            ].join(" "));

            return !term || text.includes(term);
        });

        const items = pageItems(filtered, state.referralPage);

        if (!items.length) {
            container.innerHTML = `
                <tr>
                    <td colspan="2" class="affc-empty-cell">
                        No referral records found.
                    </td>
                </tr>
            `;
        } else {
            container.innerHTML = items.map(referral => `
                <tr>
                    <td>${escapeHTML(referral.referred_player_id || "—")}</td>
                    <td>${escapeHTML(referral.status || "—")}</td>
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

    /* =====================================================
       10. COMMISSION SETTINGS
    ===================================================== */

    async function saveCommissionSettings(form) {
        const affiliateId =
            $("#affcCommissionAffiliateId", form)?.value?.trim() ||
            $("#affcCommissionAffiliateId")?.value?.trim() ||
            "";

        const input =
            $("#affcCommissionPercentage", form) ||
            $("#affcCommissionPercentage");

        const rate = input ? Number(input.value) : NaN;

        if (!affiliateId) {
            throw new Error("Select an affiliate first.");
        }

        if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
            throw new Error("Enter a commission rate between 0 and 100.");
        }

        const result = await invokeFunction(
            "saveCommissionSettings",
            {
                affiliate_id: affiliateId,
                commission_rate: rate
            }
        );

        showMessage(
            result?.message || "Commission settings saved by the server.",
            "success"
        );
    }

    function initializeCommissionSettings() {
        const form = $("#affcCommissionSettingsForm");

        if (!form) return;

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const button = $("button[type='submit']", form);
            setButtonLoading(button, true, "Saving…");

            try {
                await saveCommissionSettings(form);
            } catch (error) {
                console.error(error);
                showMessage(error.message || "Could not save commission settings.", "error");
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       11. DAILY COMMISSION
    ===================================================== */

    async function calculateDailyCommission(form) {
        const affiliateId =
            $("#affcDailyAffiliateId", form)?.value?.trim() || "";

        const periodStart =
            $("#affcDailyPeriodStart", form)?.value || "";

        const periodEnd =
            $("#affcDailyPeriodEnd", form)?.value || "";

        if (!periodStart || !periodEnd) {
            throw new Error("Choose both reporting dates.");
        }

        if (periodStart >= periodEnd) {
            throw new Error("The end date must be after the start date.");
        }

        const result = await invokeFunction(
            "calculateDailyCommission",
            {
                affiliate_id: affiliateId || null,
                period_start: periodStart,
                period_end: periodEnd
            }
        );

        renderFinancialResult("affcDailyCalculationResult", result);

        showMessage(
            result?.message || "Server calculation completed.",
            "success"
        );
    }

    function initializeDailyCalculation() {
        const form = $("#affcDailyCalculationForm");

        if (!form) return;

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const button = $("button[type='submit']", form);
            setButtonLoading(button, true, "Calculating…");

            try {
                await calculateDailyCommission(form);
            } catch (error) {
                console.error(error);
                showMessage(error.message || "Daily calculation failed.", "error");
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       12. WEEKLY SETTLEMENT
    ===================================================== */

    async function settleWeeklyCommission(form) {
        const periodStart =
            $("#affcWeeklyPeriodStart", form)?.value || "";

        const periodEnd =
            $("#affcWeeklyPeriodEnd", form)?.value || "";

        if (!periodStart || !periodEnd) {
            throw new Error("Choose the weekly settlement dates.");
        }

        if (periodStart >= periodEnd) {
            throw new Error("The end date must be after the start date.");
        }

        const result = await invokeFunction(
            "settleWeeklyCommission",
            {
                period_start: periodStart,
                period_end: periodEnd
            }
        );

        renderFinancialResult("affcWeeklySettlementResult", result);

        showMessage(
            result?.message || "Server settlement completed.",
            "success"
        );
    }

    function initializeWeeklySettlement() {
        const form = $("#affcWeeklySettlementForm");

        if (!form) return;

        form.addEventListener("submit", async event => {
            event.preventDefault();

            const button = $("button[type='submit']", form);
            setButtonLoading(button, true, "Processing…");

            try {
                await settleWeeklyCommission(form);
            } catch (error) {
                console.error(error);
                showMessage(error.message || "Weekly settlement failed.", "error");
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       13. FINANCIAL RESULTS
    ===================================================== */

    function renderFinancialResult(containerId, result) {
        const container = byId(containerId);

        if (!container) return;

        if (!result || typeof result !== "object") {
            container.textContent = "No summary was returned by the server.";
            showElement(container);
            return;
        }

        const fields = [
            ["Period Start", "period_start"],
            ["Period End", "period_end"],
            ["Total Deposits", "total_deposits"],
            ["Eligible Bets", "eligible_bets"],
            ["Player Wins", "player_wins"],
            ["Player Losses", "player_losses"],
            ["Net Revenue", "net_revenue"],
            ["Commission Rate", "commission_rate"],
            ["Commission Amount", "commission_amount"],
            ["Status", "status"]
        ].filter(([, key]) =>
            Object.prototype.hasOwnProperty.call(result, key)
        );

        if (!fields.length) {
            container.textContent =
                "The server response contains no recognized summary fields.";
            showElement(container);
            return;
        }

        const currency = result.currency || "USD";

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
                    } else if (
                        key === "period_start" ||
                        key === "period_end"
                    ) {
                        value = formatDate(value);
                    }

                    return detailField(label, value);
                }).join("")}
            </div>
        `;

        showElement(container);
    }

    /* =====================================================
       14. OVERVIEW
    ===================================================== */

    function resetOverviewValues() {
        [
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
        ].forEach(id => setText(id, "—"));
    }

    async function loadOverview() {
        resetOverviewValues();

        const notice = $("#affcOverviewNotice");

        if (notice) {
            notice.textContent =
                "Financial overview totals require a verified, authorized server-side summary function.";
            showElement(notice);
        }

        /*
         * Do not invent totals or calculate financial values from
         * unknown columns. A secure overview RPC can be added once
         * its actual function name and response fields are confirmed.
         */
    }

    /* =====================================================
       15. REFRESH
    ===================================================== */

    async function refreshAffiliateCenter() {
        if (state.loading) return;

        setLoading(true);
        hideMessage();

        try {
            await requireAdmin();

            await Promise.all([
                loadAffiliates(),
                loadApplications(),
                loadOverview()
            ]);

            showMessage("Affiliate Center refreshed.", "success");
        } catch (error) {
            console.error("Affiliate Center refresh failed:", error);
            showMessage(
                error.message || "Could not refresh Affiliate Center.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    function initializeRefreshButton() {
        const button = $("#refreshAffiliateDataBtn");

        if (!button) return;

        button.addEventListener("click", async () => {
            setButtonLoading(button, true, "Refreshing…");

            try {
                await refreshAffiliateCenter();
            } finally {
                setButtonLoading(button, false);
            }
        });
    }

    /* =====================================================
       16. SEARCH
    ===================================================== */

    function initializeSearch() {
        const affiliateInput = $("#affcAffiliateSearch");
        const affiliateForm = $("#affcSearchForm");

        if (affiliateInput) {
            affiliateInput.addEventListener("input", () => {
                state.affiliateSearchTerm = normalize(affiliateInput.value);
                state.affiliatePage = 1;
                renderAffiliateList();
            });
        }

        if (affiliateForm) {
            affiliateForm.addEventListener("submit", event => {
                event.preventDefault();

                const term = normalize(affiliateInput?.value);

                if (!term) {
                    showMessage("Enter an Affiliate ID, User ID, or email.", "warning");
                    return;
                }

                const match = state.affiliates.find(affiliate => {
                    const searchable = [
                        affiliate.id,
                        affiliate.affiliate_id,
                        affiliate.auth_user_id,
                        affiliateEmail(affiliate)
                    ];

                    return searchable.some(value =>
                        normalize(value) === term
                    );
                });

                if (match) {
                    showMessage("Affiliate found.", "success");
                    openAffiliateDetails(match.id);
                } else {
                    showMessage("No matching affiliate found.", "warning");
                }
            });
        }

        const applicationInput = $("#affcApplicationSearch");

        if (applicationInput) {
            applicationInput.addEventListener("input", () => {
                state.applicationSearchTerm =
                    normalize(applicationInput.value);

                state.applicationPage = 1;
                renderApplicationList();
            });

            const form = applicationInput.closest("form");

            if (form) {
                form.addEventListener("submit", event => {
                    event.preventDefault();
                });
            }
        }

        const referralInput = $("#affcReferralSearchInput");

        if (referralInput) {
            referralInput.addEventListener("input", () => {
                state.referralSearchTerm = normalize(referralInput.value);
                state.referralPage = 1;
                renderReferralList();
            });

            const form = referralInput.closest("form");

            if (form) {
                form.addEventListener("submit", event => {
                    event.preventDefault();
                });
            }
        }
    }

    /* =====================================================
       17. DELEGATED BUTTON ACTIONS
    ===================================================== */

    function initializeDelegatedActions() {
        root.addEventListener("click", async event => {
            const actionButton = event.target.closest("[data-affc-action]");

            if (actionButton && root.contains(actionButton)) {
                const action = actionButton.dataset.affcAction;
                const identifier = actionButton.dataset.affcId;

                setButtonLoading(actionButton, true, "Please wait…");

                try {
                    if (action === "view-affiliate") {
                        openAffiliateDetails(identifier);
                    } else if (action === "view-application") {
                        openApplicationDetails(identifier);
                    } else if (action === "verify-player") {
                        await verifyPlayerId(identifier);
                    } else if (action === "approve-application") {
                        await approveApplication(identifier);
                    } else if (action === "reject-application") {
                        await rejectApplication(identifier);
                    } else if (action === "refresh") {
                        await refreshAffiliateCenter();
                    } else if (action === "process-payout") {
                        await processPayout(identifier);
                    }
                } catch (error) {
                    console.error("Affiliate action failed:", error);
                    showMessage(error.message || "The action failed.", "error");
                } finally {
                    setButtonLoading(actionButton, false);
                }

                return;
            }

            const pageButton = event.target.closest("[data-affc-page]");

            if (pageButton && root.contains(pageButton)) {
                changePage(
                    pageButton.dataset.affcPage,
                    pageButton.dataset.page
                );
            }
        });
    }

    /* =====================================================
       18. PAYOUT
    ===================================================== */

    async function processPayout(identifier) {
        if (!identifier) {
            throw new Error("A payout request ID is required.");
        }

        const confirmed = window.confirm(
            "Submit this payout for secure server-side processing?"
        );

        if (!confirmed) return;

        const result = await invokeFunction(
            "processPayout",
            { payout_id: identifier }
        );

        showMessage(
            result?.message || "Payout request processed by the server.",
            "success"
        );

        await refreshAffiliateCenter();
    }

    /* =====================================================
       19. INITIALIZATION
    ===================================================== */

    async function initialize() {
        if (state.initialized) return;

        state.initialized = true;

        initializeMainNavigation();

        initializeSubNavigation(
            ".affc-detail-nav-button",
            ".affc-detail-panel",
            ".affc-details-navigation"
        );

        initializeSubNavigation(
            ".affc-settings-nav-button",
            ".affc-settings-panel",
            ".affc-settings-navigation"
        );

        initializeSearch();
        initializeRefreshButton();
        initializeDelegatedActions();
        initializeCommissionSettings();
        initializeDailyCalculation();
        initializeWeeklySettlement();

        setLoading(true);

        try {
            await requireAdmin();

            await Promise.all([
                loadAffiliates(),
                loadApplications(),
                loadOverview()
            ]);

            console.log("SAFIKI AFFILIATE CENTER INITIALIZED");
        } catch (error) {
            console.error("Affiliate Center initialization failed:", error);

            showMessage(
                error.message ||
                "Affiliate Center could not be initialized. Check Supabase configuration and permissions.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    /* =====================================================
       20. PUBLIC API
    ===================================================== */

    window.AffiliateCenter = {
        refresh: refreshAffiliateCenter,
        loadAffiliates,
        loadApplications,
        openAffiliateDetails,
        openApplicationDetails,

        getState() {
            return {
                activeAdminId: state.adminId,
                selectedAffiliate: state.selectedAffiliate,
                selectedApplication: state.selectedApplication,
                affiliateCount: state.affiliates.length,
                applicationCount: state.applications.length,
                loading: state.loading
            };
        }
    };

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
