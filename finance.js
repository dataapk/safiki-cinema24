
// =========================================================
// SAFIKI ADMIN — FINANCE.JS
// Deposit | Withdraw | Net Revenue
// UI interactions and data-provider integration hooks
// =========================================================

(function () {
    "use strict";

    const SECTION_ID = "financeSection";

    const state = {
        depositStatus: "all",
        withdrawStatus: "all",
        revenuePeriod: "today",
        depositPage: 1,
        withdrawPage: 1,
        revenuePage: 1,
        pageSize: 10,
        depositSearch: "",
        withdrawSearch: "",
        revenueSearch: "",
        depositWallet: "all",
        withdrawWallet: "all",
        depositDateFrom: "",
        depositDateTo: "",
        withdrawDateFrom: "",
        withdrawDateTo: "",
        revenueDateFrom: "",
        revenueDateTo: "",
        deposits: [],
        withdrawals: [],
        revenues: [],
        gamingHistory: [],
        initialized: false
    };

    const $ = (id) => document.getElementById(id);

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
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
            return `${number.toFixed(2)} ${currency}`;
        }
    }

    function formatNumber(value) {
        const number = Number(value);
        return Number.isFinite(number)
            ? number.toLocaleString("en-US", {
                maximumFractionDigits: 2
            })
            : "—";
    }

    function setText(id, value) {
        const element = $(id);
        if (element) element.textContent = value ?? "—";
    }

    function setMessage(id, message, type = "info") {
        const element = $(id);
        if (!element) return;

        element.textContent = message;
        element.dataset.type = type;
    }

    function getCurrency(record) {
        return record?.currency || "USD";
    }

    function amount(record) {
        const value = Number(record?.amount);
        return Number.isFinite(value) ? value : 0;
    }

    function normalizedStatus(record) {
        return String(record?.status || "unknown").toLowerCase();
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        return date.toLocaleString();
    }

    function isWithinDateRange(value, from, to) {
        if (!from && !to) return true;
        if (!value) return false;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;

        if (from) {
            const start = new Date(`${from}T00:00:00`);
            if (date < start) return false;
        }

        if (to) {
            const end = new Date(`${to}T23:59:59.999`);
            if (date > end) return false;
        }

        return true;
    }

    function matchesSearch(record, query) {
        if (!query) return true;

        const searchText = [
            record?.playerId,
            record?.userId,
            record?.username,
            record?.transactionId,
            record?.reference,
            record?.wallet
        ].join(" ").toLowerCase();

        return searchText.includes(query.toLowerCase());
    }

    function getRecordDate(record) {
        return record?.createdAt ||
            record?.requestDate ||
            record?.date ||
            record?.settledAt ||
            "";
    }

    function isSuccessfulDeposit(record) {
        return ["approved", "successful", "success", "completed"]
            .includes(normalizedStatus(record));
    }

    function isPaidWithdrawal(record) {
        return ["paid", "successful", "success", "completed"]
            .includes(normalizedStatus(record));
    }

    function sumAmounts(records, predicate = () => true) {
        return records.reduce((total, record) => {
            return predicate(record) ? total + amount(record) : total;
        }, 0);
    }

    function countRecords(records, predicate = () => true) {
        return records.filter(predicate).length;
    }

    function localDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function isToday(value) {
        if (!value) return false;

        const date = new Date(value);
        return !Number.isNaN(date.getTime()) &&
            localDateString(date) === localDateString();
    }

    // -----------------------------------------------------
    // FINANCE PANEL NAVIGATION
    // -----------------------------------------------------

    function activatePanel(panelId) {
        const validPanels = [
            "financeDepositPanel",
            "financeWithdrawPanel",
            "financeRevenuePanel"
        ];

        if (!validPanels.includes(panelId)) return;

        document.querySelectorAll(
            `#${SECTION_ID} .finance-panel-btn`
        ).forEach((button) => {
            const active =
                button.dataset.financePanel === panelId;

            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });

        validPanels.forEach((id) => {
            const panel = $(id);
            if (!panel) return;

            const active = id === panelId;
            panel.hidden = !active;
            panel.classList.toggle("active", active);
        });
    }

    function setupPanelNavigation() {
        document.querySelectorAll(
            `#${SECTION_ID} .finance-panel-btn`
        ).forEach((button) => {
            button.addEventListener("click", () => {
                activatePanel(button.dataset.financePanel);
            });
        });
    }

    // -----------------------------------------------------
    // WALLET FILTERS
    // Wallet options come from the connected data provider.
    // -----------------------------------------------------

    function populateWalletFilter(id, records) {
        const select = $(id);
        if (!select) return;

        const previousValue = select.value || "all";
        const wallets = [...new Set(
            records.map((record) => record?.wallet).filter(Boolean)
        )].sort();

        select.replaceChildren();

        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Wallets";
        select.appendChild(allOption);

        wallets.forEach((wallet) => {
            const option = document.createElement("option");
            option.value = wallet;
            option.textContent = wallet;
            select.appendChild(option);
        });

        select.value = wallets.includes(previousValue)
            ? previousValue
            : "all";
    }

    // -----------------------------------------------------
    // DEPOSIT SUMMARY
    // -----------------------------------------------------

    function renderDepositSummary() {
        const records = state.deposits;

        setText(
            "financeDepositTotalAmount",
            formatMoney(sumAmounts(records, isSuccessfulDeposit))
        );

        setText(
            "financeDepositPendingAmount",
            formatMoney(sumAmounts(
                records,
                (record) => normalizedStatus(record) === "pending"
            ))
        );

        setText(
            "financeDepositApprovedToday",
            formatMoney(sumAmounts(
                records,
                (record) =>
                    isSuccessfulDeposit(record) &&
                    isToday(getRecordDate(record))
            ))
        );

        setText("financeDepositRequestCount", formatNumber(records.length));

        setText(
            "financeTotalDeposit",
            formatMoney(sumAmounts(records, isSuccessfulDeposit))
        );

        setText(
            "financePendingDeposit",
            formatNumber(countRecords(
                records,
                (record) => normalizedStatus(record) === "pending"
            ))
        );
    }

    function getFilteredDeposits() {
        return state.deposits.filter((record) => {
            const statusMatches =
                state.depositStatus === "all" ||
                normalizedStatus(record) === state.depositStatus;

            const walletMatches =
                state.depositWallet === "all" ||
                record?.wallet === state.depositWallet;

            return statusMatches &&
                walletMatches &&
                matchesSearch(record, state.depositSearch) &&
                isWithinDateRange(
                    getRecordDate(record),
                    state.depositDateFrom,
                    state.depositDateTo
                );
        });
    }

    function renderDepositTable() {
        const body = $("financeDepositTableBody");
        if (!body) return;

        const records = getFilteredDeposits();
        const totalPages = Math.max(
            1,
            Math.ceil(records.length / state.pageSize)
        );

        state.depositPage = Math.min(state.depositPage, totalPages);

        const start = (state.depositPage - 1) * state.pageSize;
        const pageRecords = records.slice(
            start,
            start + state.pageSize
        );

        if (!pageRecords.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="9" class="finance-empty-state">
                        No deposit records found.
                    </td>
                </tr>
            `;
        } else {
            body.innerHTML = pageRecords.map((record) => {
                const id = escapeHTML(record?.id || record?.transactionId || "");
                const status = normalizedStatus(record);
                const statusClass = status === "pending"
                    ? "finance-status-pending"
                    : ["approved", "successful", "success", "completed"]
                        .includes(status)
                        ? "finance-status-approved"
                        : ["rejected", "failed"].includes(status)
                            ? "finance-status-rejected"
                            : "";

                return `
                    <tr>
                        <td>${escapeHTML(record?.playerId || record?.userId || "—")}</td>
                        <td>${escapeHTML(record?.username || "—")}</td>
                        <td>${escapeHTML(record?.wallet || "—")}</td>
                        <td>${escapeHTML(formatNumber(record?.amount))}</td>
                        <td>${escapeHTML(getCurrency(record))}</td>
                        <td>${escapeHTML(record?.reference || "—")}</td>
                        <td>${escapeHTML(formatDate(getRecordDate(record)))}</td>
                        <td>
                            <span class="finance-status ${statusClass}">
                                ${escapeHTML(status)}
                            </span>
                        </td>
                        <td>
                            <button type="button"
                                class="finance-action-btn"
                                data-deposit-view="${id}">
                                View
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        setText("financeDepositPageInfo",
            `Page ${state.depositPage} of ${totalPages}`);

        const previous = $("financeDepositPrevious");
        const next = $("financeDepositNext");

        if (previous) previous.disabled = state.depositPage <= 1;
        if (next) next.disabled = state.depositPage >= totalPages;
    }

    function openDepositDetails(id) {
        const record = state.deposits.find((item) =>
            String(item?.id || item?.transactionId || "") === String(id)
        );

        if (!record) return;

        state.selectedDepositId =
            record.id || record.transactionId;

        setText("financeDepositDetailId",
            record.id || record.transactionId || "—");
        setText("financeDepositDetailPlayerId",
            record.playerId || record.userId || "—");
        setText("financeDepositDetailUsername", record.username || "—");
        setText("financeDepositDetailAmount",
            formatMoney(record.amount, getCurrency(record)));
        setText("financeDepositDetailWallet", record.wallet || "—");
        setText("financeDepositDetailReference", record.reference || "—");
        setText("financeDepositDetailDate",
            formatDate(getRecordDate(record)));
        setText("financeDepositDetailStatus", normalizedStatus(record));

        const proof = $("financeDepositPaymentProof");
        if (proof) {
            proof.replaceChildren();

            if (record.paymentProofUrl) {
                const link = document.createElement("a");
                link.href = record.paymentProofUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = "View payment proof";
                proof.appendChild(link);
            } else {
                proof.textContent = "No payment proof available.";
            }
        }

        const pending = normalizedStatus(record) === "pending";
        const approve = $("financeDepositApproveBtn");
        const reject = $("financeDepositRejectBtn");

        if (approve) approve.hidden = !pending;
        if (reject) reject.hidden = !pending;

        const panel = $("financeDepositDetails");
        if (panel) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    // -----------------------------------------------------
    // WITHDRAW SUMMARY
    // -----------------------------------------------------

    function renderWithdrawSummary() {
        const records = state.withdrawals;

        setText(
            "financeWithdrawTotalAmount",
            formatMoney(sumAmounts(records, isPaidWithdrawal))
        );

        setText(
            "financeWithdrawPendingAmount",
            formatMoney(sumAmounts(
                records,
                (record) => normalizedStatus(record) === "pending"
            ))
        );

        setText(
            "financeWithdrawPaidToday",
            formatMoney(sumAmounts(
                records,
                (record) =>
                    isPaidWithdrawal(record) &&
                    isToday(record.paidAt || getRecordDate(record))
            ))
        );

        setText("financeWithdrawRequestCount", formatNumber(records.length));

        setText(
            "financeTotalWithdraw",
            formatMoney(sumAmounts(records, isPaidWithdrawal))
        );

        setText(
            "financePendingWithdraw",
            formatNumber(countRecords(
                records,
                (record) => normalizedStatus(record) === "pending"
            ))
        );
    }

    function getFilteredWithdrawals() {
        return state.withdrawals.filter((record) => {
            const statusMatches =
                state.withdrawStatus === "all" ||
                normalizedStatus(record) === state.withdrawStatus;

            const walletMatches =
                state.withdrawWallet === "all" ||
                record?.wallet === state.withdrawWallet;

            return statusMatches &&
                walletMatches &&
                matchesSearch(record, state.withdrawSearch) &&
                isWithinDateRange(
                    getRecordDate(record),
                    state.withdrawDateFrom,
                    state.withdrawDateTo
                );
        });
    }

    function renderWithdrawTable() {
        const body = $("financeWithdrawTableBody");
        if (!body) return;

        const records = getFilteredWithdrawals();
        const totalPages = Math.max(
            1,
            Math.ceil(records.length / state.pageSize)
        );

        state.withdrawPage = Math.min(state.withdrawPage, totalPages);

        const start = (state.withdrawPage - 1) * state.pageSize;
        const pageRecords = records.slice(start, start + state.pageSize);

        if (!pageRecords.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="9" class="finance-empty-state">
                        No withdrawal records found.
                    </td>
                </tr>
            `;
        } else {
            body.innerHTML = pageRecords.map((record) => {
                const id = escapeHTML(record?.id || record?.transactionId || "");
                const status = normalizedStatus(record);
                const statusClass = status === "pending"
                    ? "finance-status-pending"
                    : ["approved", "paid", "successful", "success", "completed"]
                        .includes(status)
                        ? "finance-status-approved"
                        : ["rejected", "failed"].includes(status)
                            ? "finance-status-rejected"
                            : "";

                return `
                    <tr>
                        <td>${escapeHTML(record?.playerId || record?.userId || "—")}</td>
                        <td>${escapeHTML(record?.username || "—")}</td>
                        <td>${escapeHTML(record?.wallet || "—")}</td>
                        <td>${escapeHTML(formatNumber(record?.amount))}</td>
                        <td>${escapeHTML(getCurrency(record))}</td>
                        <td>${escapeHTML(formatDate(getRecordDate(record)))}</td>
                        <td>
                            <span class="finance-status ${statusClass}">
                                ${escapeHTML(status)}
                            </span>
                        </td>
                        <td>${escapeHTML(record?.reference || "—")}</td>
                        <td>
                            <button type="button"
                                class="finance-action-btn"
                                data-withdraw-view="${id}">
                                Review
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        setText("financeWithdrawPageInfo",
            `Page ${state.withdrawPage} of ${totalPages}`);

        const previous = $("financeWithdrawPrevious");
        const next = $("financeWithdrawNext");

        if (previous) previous.disabled = state.withdrawPage <= 1;
        if (next) next.disabled = state.withdrawPage >= totalPages;
    }

    function openWithdrawDetails(id) {
        const record = state.withdrawals.find((item) =>
            String(item?.id || item?.transactionId || "") === String(id)
        );

        if (!record) return;

        state.selectedWithdrawId =
            record.id || record.transactionId;

        setText("financeWithdrawDetailId",
            record.id || record.transactionId || "—");
        setText("financeWithdrawDetailPlayerId",
            record.playerId || record.userId || "—");
        setText("financeWithdrawDetailUsername", record.username || "—");
        setText("financeWithdrawDetailAmount",
            formatMoney(record.amount, getCurrency(record)));
        setText("financeWithdrawDetailCurrency", getCurrency(record));
        setText("financeWithdrawDetailWallet", record.wallet || "—");
        setText("financeWithdrawDetailDate",
            formatDate(getRecordDate(record)));
        setText("financeWithdrawDetailStatus", normalizedStatus(record));
        setText("financeWithdrawDetailFee",
            formatMoney(record.fee || 0, getCurrency(record)));
        setText("financeWithdrawDetailNetPayout",
            formatMoney(
                record.netPayout ??
                (amount(record) - Number(record.fee || 0)),
                getCurrency(record)
            ));
        setText("financeWithdrawDetailReference", record.reference || "—");
        setText("financeWithdrawDetailBalance",
            record.playerBalance == null
                ? "Not available"
                : formatMoney(record.playerBalance, getCurrency(record)));

        const status = normalizedStatus(record);
        const actions = {
            approve: $("financeWithdrawApproveBtn"),
            reject: $("financeWithdrawRejectBtn"),
            paid: $("financeWithdrawMarkPaidBtn")
        };

        if (actions.approve) {
            actions.approve.hidden = status !== "pending";
        }

        if (actions.reject) {
            actions.reject.hidden = !["pending", "approved"].includes(status);
        }

        if (actions.paid) {
            actions.paid.hidden = status !== "approved";
        }

        const panel = $("financeWithdrawDetails");
        if (panel) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    // -----------------------------------------------------
    // NET REVENUE
    // -----------------------------------------------------

    function getRevenueDateRange() {
        const now = new Date();
        const today = localDateString(now);

        if (state.revenuePeriod === "custom") {
            return {
                from: state.revenueDateFrom,
                to: state.revenueDateTo
            };
        }

        if (state.revenuePeriod === "yesterday") {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);

            const date = localDateString(yesterday);
            return { from: date, to: date };
        }

        if (state.revenuePeriod === "7days") {
            const start = new Date(now);
            start.setDate(start.getDate() - 6);

            return { from: localDateString(start), to: today };
        }

        if (state.revenuePeriod === "30days") {
            const start = new Date(now);
            start.setDate(start.getDate() - 29);

            return { from: localDateString(start), to: today };
        }

        return { from: today, to: today };
    }

    function getFilteredRevenues() {
        const range = getRevenueDateRange();

        return state.revenues.filter((record) => {
            return matchesSearch(record, state.revenueSearch) &&
                isWithinDateRange(record?.periodDate || getRecordDate(record),
                    range.from, range.to);
        });
    }

    function renderRevenueSummary() {
        const records = getFilteredRevenues();

        const validBets = sumAmounts(records, (record) =>
            record?.settled === true ||
            record?.settlementStatus === "settled"
        );

        const winnings = sumAmounts(records, (record) =>
            record?.settled === true ||
            record?.settlementStatus === "settled"
        );

        const deductions = sumAmounts(records, () => true);

        // GGR/NGR should come from verified gaming records or the
        // backend's accounting calculation. Do not invent figures.
        const hasVerifiedSummary = records.some((record) =>
            record?.ggr != null && record?.ngr != null
        );

        const ggr = hasVerifiedSummary
            ? records.reduce((sum, record) => sum + Number(record.ggr || 0), 0)
            : null;

        const ngr = hasVerifiedSummary
            ? records.reduce((sum, record) => sum + Number(record.ngr || 0), 0)
            : null;

        setText("financeRevenueValidBets",
            records.length ? formatMoney(validBets) : "—");
        setText("financeRevenuePlayerWinnings",
            records.length ? formatMoney(winnings) : "—");
        setText("financeRevenueGgr",
            ggr == null ? "—" : formatMoney(ggr));
        setText("financeRevenueDeductions",
            records.length ? formatMoney(deductions) : "—");
        setText("financeRevenueNgr",
            ngr == null ? "—" : formatMoney(ngr));
    }

    function renderRevenueTable() {
        const body = $("financeRevenueTableBody");
        if (!body) return;

        const records = getFilteredRevenues();
        const totalPages = Math.max(
            1,
            Math.ceil(records.length / state.pageSize)
        );

        state.revenuePage = Math.min(state.revenuePage, totalPages);

        const start = (state.revenuePage - 1) * state.pageSize;
        const pageRecords = records.slice(start, start + state.pageSize);

        if (!pageRecords.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="8" class="finance-empty-state">
                        Verified revenue records are not available.
                    </td>
                </tr>
            `;
        } else {
            body.innerHTML = pageRecords.map((record) => {
                const id = escapeHTML(record?.playerId || record?.userId || "");
                return `
                    <tr>
                        <td>${escapeHTML(record?.playerId || record?.userId || "—")}</td>
                        <td>${escapeHTML(record?.username || "—")}</td>
                        <td>${escapeHTML(formatNumber(record?.validBets))}</td>
                        <td>${escapeHTML(formatNumber(record?.winnings))}</td>
                        <td>${escapeHTML(formatNumber(record?.ggr))}</td>
                        <td>${escapeHTML(formatNumber(record?.deductions))}</td>
                        <td>${escapeHTML(formatNumber(record?.ngr))}</td>
                        <td>
                            <button type="button"
                                class="finance-action-btn"
                                data-revenue-view="${id}">
                                View
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        }

        setText("financeRevenuePageInfo",
            `Page ${state.revenuePage} of ${totalPages}`);

        const previous = $("financeRevenuePrevious");
        const next = $("financeRevenueNext");

        if (previous) previous.disabled = state.revenuePage <= 1;
        if (next) next.disabled = state.revenuePage >= totalPages;
    }

    function openRevenueDetails(playerId) {
        const record = state.revenues.find((item) =>
            String(item?.playerId || item?.userId || "") === String(playerId)
        );

        if (!record) return;

        setText("financeRevenueDetailPlayerId",
            record.playerId || record.userId || "—");
        setText("financeRevenueDetailUsername", record.username || "—");
        setText("financeRevenueDetailPeriod",
            record.period || record.periodDate || "—");
        setText("financeRevenueDetailValidBets",
            formatMoney(record.validBets));
        setText("financeRevenueDetailWinnings",
            formatMoney(record.winnings));
        setText("financeRevenueDetailGgr", formatMoney(record.ggr));
        setText("financeRevenueDetailBonusDeductions",
            formatMoney(record.bonusDeductions));
        setText("financeRevenueDetailOtherDeductions",
            formatMoney(record.otherDeductions));
        setText("financeRevenueDetailTotalDeductions",
            formatMoney(record.deductions));
        setText("financeRevenueDetailNgr", formatMoney(record.ngr));
        setText("financeRevenueDetailDeposits",
            formatMoney(record.successfulDeposits));
        setText("financeRevenueDetailWithdrawals",
            formatMoney(record.successfulWithdrawals));
        setText("financeRevenueDetailBalance",
            record.currentBalance == null
                ? "—"
                : formatMoney(record.currentBalance));
        setText("financeRevenueDetailCalculationStatus",
            record.calculationStatus || "Not verified");
        setText("financeRevenueDetailCalculatedAt",
            formatDate(record.calculatedAt));
        setText("financeRevenueDetailSourceReference",
            record.sourceReference || "—");

        const historyBody = $("financeRevenueGamingHistoryBody");

        if (historyBody) {
            const history = state.gamingHistory.filter((item) =>
                String(item?.playerId || item?.userId || "") ===
                String(playerId)
            );

            if (!history.length) {
                historyBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="finance-empty-state">
                            No gaming history available.
                        </td>
                    </tr>
                `;
            } else {
                historyBody.innerHTML = history.map((item) => `
                    <tr>
                        <td>${escapeHTML(item.gameRoundId || item.roundId || "—")}</td>
                        <td>${escapeHTML(formatDate(item.betDate || item.createdAt))}</td>
                        <td>${escapeHTML(formatNumber(item.validBet))}</td>
                        <td>${escapeHTML(formatNumber(item.winnings))}</td>
                        <td>${escapeHTML(item.settlementStatus || "—")}</td>
                    </tr>
                `).join("");
            }
        }

        const panel = $("financeRevenueDetails");
        if (panel) {
            panel.hidden = false;
            panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }

    // -----------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------

    function changePage(type, direction) {
        const key = `${type}Page`;
        const records = type === "deposit"
            ? getFilteredDeposits()
            : type === "withdraw"
                ? getFilteredWithdrawals()
                : getFilteredRevenues();

        const totalPages = Math.max(
            1,
            Math.ceil(records.length / state.pageSize)
        );

        state[key] = Math.max(
            1,
            Math.min(totalPages, state[key] + direction)
        );

        if (type === "deposit") renderDepositTable();
        if (type === "withdraw") renderWithdrawTable();
        if (type === "revenue") renderRevenueTable();
    }

    // -----------------------------------------------------
    // FORM AND FILTER EVENTS
    // -----------------------------------------------------

    function setupDepositEvents() {
        $("financeDepositSearchForm")?.addEventListener("submit", (event) => {
            event.preventDefault();

            state.depositSearch =
                $("financeDepositSearch")?.value.trim() || "";
            state.depositWallet =
                $("financeDepositWalletFilter")?.value || "all";
            state.depositDateFrom =
                $("financeDepositDateFrom")?.value || "";
            state.depositDateTo =
                $("financeDepositDateTo")?.value || "";
            state.depositPage = 1;

            renderDepositTable();
        });

        $("financeDepositSearchForm")?.addEventListener("reset", () => {
            setTimeout(() => {
                state.depositSearch = "";
                state.depositWallet = "all";
                state.depositDateFrom = "";
                state.depositDateTo = "";
                state.depositStatus = "all";
                state.depositPage = 1;

                setActiveStatusButton("deposit", "all");
                renderDepositTable();
            }, 0);
        });

        document.querySelectorAll(
            "[data-deposit-status]"
        ).forEach((button) => {
            button.addEventListener("click", () => {
                state.depositStatus = button.dataset.depositStatus;
                state.depositPage = 1;
                setActiveStatusButton("deposit", state.depositStatus);
                renderDepositTable();
            });
        });

        $("financeDepositTableBody")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-deposit-view]");
            if (button) openDepositDetails(button.dataset.depositView);
        });

        $("financeDepositCloseDetails")?.addEventListener("click", () => {
            const panel = $("financeDepositDetails");
            if (panel) panel.hidden = true;
        });

        $("financeDepositPrevious")?.addEventListener("click", () =>
            changePage("deposit", -1)
        );

        $("financeDepositNext")?.addEventListener("click", () =>
            changePage("deposit", 1)
        );

        // These actions deliberately do not change financial records locally.
        // A verified backend endpoint and authorization are required.
        $("financeDepositApproveBtn")?.addEventListener("click", () => {
            setMessage(
                "financeDepositMessage",
                "Connect a secure, authorized backend action before approving deposits.",
                "warning"
            );
        });

        $("financeDepositRejectBtn")?.addEventListener("click", () => {
            setMessage(
                "financeDepositMessage",
                "Connect a secure, authorized backend action before rejecting deposits.",
                "warning"
            );
        });
    }

    function setupWithdrawEvents() {
        $("financeWithdrawSearchForm")?.addEventListener("submit", (event) => {
            event.preventDefault();

            state.withdrawSearch =
                $("financeWithdrawSearch")?.value.trim() || "";
            state.withdrawWallet =
                $("financeWithdrawWalletFilter")?.value || "all";
            state.withdrawDateFrom =
                $("financeWithdrawDateFrom")?.value || "";
            state.withdrawDateTo =
                $("financeWithdrawDateTo")?.value || "";
            state.withdrawPage = 1;

            renderWithdrawTable();
        });

        $("financeWithdrawSearchForm")?.addEventListener("reset", () => {
            setTimeout(() => {
                state.withdrawSearch = "";
                state.withdrawWallet = "all";
                state.withdrawDateFrom = "";
                state.withdrawDateTo = "";
                state.withdrawStatus = "all";
                state.withdrawPage = 1;

                setActiveStatusButton("withdraw", "all");
                renderWithdrawTable();
            }, 0);
        });

        document.querySelectorAll(
            "[data-withdraw-status]"
        ).forEach((button) => {
            button.addEventListener("click", () => {
                state.withdrawStatus = button.dataset.withdrawStatus;
                state.withdrawPage = 1;
                setActiveStatusButton("withdraw", state.withdrawStatus);
                renderWithdrawTable();
            });
        });

        $("financeWithdrawTableBody")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-withdraw-view]");
            if (button) openWithdrawDetails(button.dataset.withdrawView);
        });

        $("financeWithdrawCloseDetails")?.addEventListener("click", () => {
            const panel = $("financeWithdrawDetails");
            if (panel) panel.hidden = true;
        });

        $("financeWithdrawPrevious")?.addEventListener("click", () =>
            changePage("withdraw", -1)
        );

        $("financeWithdrawNext")?.addEventListener("click", () =>
            changePage("withdraw", 1)
        );

        $("financeWithdrawApproveBtn")?.addEventListener("click", () => {
            setMessage(
                "financeWithdrawMessage",
                "Connect a secure, authorized backend action before approving withdrawals.",
                "warning"
            );
        });

        $("financeWithdrawRejectBtn")?.addEventListener("click", () => {
            setMessage(
                "financeWithdrawMessage",
                "Connect a secure, authorized backend action before rejecting withdrawals.",
                "warning"
            );
        });

        $("financeWithdrawMarkPaidBtn")?.addEventListener("click", () => {
            setMessage(
                "financeWithdrawMessage",
                "Verify the payment and connect the authorized backend before marking it as paid.",
                "warning"
            );
        });
    }

    function setActiveStatusButton(type, status) {
        const selector = type === "deposit"
            ? "[data-deposit-status]"
            : "[data-withdraw-status]";

        document.querySelectorAll(selector).forEach((button) => {
            const active = type === "deposit"
                ? button.dataset.depositStatus === status
                : button.dataset.withdrawStatus === status;

            button.classList.toggle("active", active);
        });
    }

    function setupRevenueEvents() {
        document.querySelectorAll(
            "[data-revenue-period]"
        ).forEach((button) => {
            button.addEventListener("click", () => {
                state.revenuePeriod = button.dataset.revenuePeriod;
                state.revenuePage = 1;

                document.querySelectorAll(
                    "[data-revenue-period]"
                ).forEach((item) => {
                    item.classList.toggle("active", item === button);
                });

                const dateForm = $("financeRevenueDateForm");
                if (dateForm) {
                    dateForm.hidden =
                        state.revenuePeriod !== "custom";
                }

                renderRevenueSummary();
                renderRevenueTable();
            });
        });

        $("financeRevenueDateForm")?.addEventListener("submit", (event) => {
            event.preventDefault();

            state.revenueDateFrom =
                $("financeRevenueDateFrom")?.value || "";
            state.revenueDateTo =
                $("financeRevenueDateTo")?.value || "";
            state.revenuePage = 1;

            if (
                state.revenueDateFrom &&
                state.revenueDateTo &&
                state.revenueDateFrom > state.revenueDateTo
            ) {
                setMessage(
                    "financeRevenueMessage",
                    "Start date cannot be later than end date.",
                    "error"
                );
                return;
            }

            setMessage("financeRevenueMessage", "");
            renderRevenueSummary();
            renderRevenueTable();
        });

        $("financeRevenueSearchForm")?.addEventListener("submit", (event) => {
            event.preventDefault();

            state.revenueSearch =
                $("financeRevenueSearch")?.value.trim() || "";
            state.revenuePage = 1;

            renderRevenueSummary();
            renderRevenueTable();
        });

        $("financeRevenueSearchForm")?.addEventListener("reset", () => {
            setTimeout(() => {
                state.revenueSearch = "";
                state.revenuePage = 1;
                renderRevenueSummary();
                renderRevenueTable();
            }, 0);
        });

        $("financeRevenueTableBody")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-revenue-view]");
            if (button) openRevenueDetails(button.dataset.revenueView);
        });

        $("financeRevenueCloseDetails")?.addEventListener("click", () => {
            const panel = $("financeRevenueDetails");
            if (panel) panel.hidden = true;
        });

        $("financeRevenuePrevious")?.addEventListener("click", () =>
            changePage("revenue", -1)
        );

        $("financeRevenueNext")?.addEventListener("click", () =>
            changePage("revenue", 1)
        );

        $("financeRevenueExportBtn")?.addEventListener("click", () => {
            setMessage(
                "financeRevenueMessage",
                "Export is unavailable until verified revenue data is connected.",
                "warning"
            );
        });
    }

    // -----------------------------------------------------
    // PROVIDER INTEGRATION
    //
    // Optional interface expected:
    // window.financeDataProvider.getFinanceData()
    //
    // It should return:
    // {
    //   deposits: [],
    //   withdrawals: [],
    //   revenues: [],
    //   gamingHistory: []
    // }
    //
    // Connect this interface to your real authorized API.
    // Never trust browser-only financial calculations for payouts.
    // -----------------------------------------------------

    async function loadFinanceData() {
        const provider = window.financeDataProvider;

        if (!provider ||
            typeof provider.getFinanceData !== "function") {
            renderAll();

            setMessage(
                "financeDepositMessage",
                "Finance data source is not connected yet.",
                "info"
            );

            return;
        }

        try {
            const result = await provider.getFinanceData();

            state.deposits = Array.isArray(result?.deposits)
                ? result.deposits : [];

            state.withdrawals = Array.isArray(result?.withdrawals)
                ? result.withdrawals : [];

            state.revenues = Array.isArray(result?.revenues)
                ? result.revenues : [];

            state.gamingHistory = Array.isArray(result?.gamingHistory)
                ? result.gamingHistory : [];

            populateWalletFilter(
                "financeDepositWalletFilter",
                state.deposits
            );

            populateWalletFilter(
                "financeWithdrawWalletFilter",
                state.withdrawals
            );

            renderAll();
        } catch (error) {
            console.error("Finance data loading failed:", error);

            setMessage(
                "financeDepositMessage",
                "Unable to load finance records. Please check the data connection.",
                "error"
            );

            setMessage(
                "financeWithdrawMessage",
                "Unable to load finance records. Please check the data connection.",
                "error"
            );

            setMessage(
                "financeRevenueMessage",
                "Unable to load verified revenue records.",
                "error"
            );
        }
    }

    function renderAll() {
        renderDepositSummary();
        renderDepositTable();

        renderWithdrawSummary();
        renderWithdrawTable();

        renderRevenueSummary();
        renderRevenueTable();
    }

    function initialize() {
        if (state.initialized) return;

        const section = $(SECTION_ID);
        if (!section) return;

        state.initialized = true;

        setupPanelNavigation();
        setupDepositEvents();
        setupWithdrawEvents();
        setupRevenueEvents();

        renderAll();
        loadFinanceData();
    }

    // Expose a limited interface for integration and testing.
    window.SafikiFinance = {
        refresh: loadFinanceData,
        getState: () => ({
            depositCount: state.deposits.length,
            withdrawalCount: state.withdrawals.length,
            revenueCount: state.revenues.length
        }),
        activatePanel
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
