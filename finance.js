
/* =========================================================
   FINANCE.JS
   Player Financial Management & Reporting
   Separate file — do not place inside admin.js.

   Responsibilities:
   1. Daily / Weekly NGR overview
   2. Player search and financial table
   3. Player Details report
   4. Daily, Weekly and Custom Date selection
   5. GGR, deductions, NGR and bonus reporting
   6. Deposit, withdrawal and balance reporting

   IMPORTANT:
   No database schema or backend API is assumed.
   Connect a verified data provider before displaying
   actual financial records.
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeFinance() {
        const root = document.getElementById("financeSection");

        if (!root || root.dataset.financeJsInitialized === "true") {
            return;
        }

        root.dataset.financeJsInitialized = "true";

        const $ = (id) => document.getElementById(id);

        const elements = {
            dailyNgr: $("financeDailyNgr"),
            weeklyNgr: $("financeWeeklyNgr"),

            searchForm: $("financeSearchForm"),
            searchInput: $("financeSearchInput"),
            searchMessage: $("financeSearchMessage"),
            resetSearch: $("financeResetSearch"),
            playerTable: $("financePlayerTableBody"),

            detailsPanel: $("financeDetailsPanel"),
            detailsTitle: $("financeDetailsTitle"),
            detailsPlayerId: $("financeDetailsPlayerId"),
            closeDetails: $("financeCloseDetails"),

            periodButtons: root.querySelectorAll(".finance-period-btn"),
            startDate: $("financeReportStart"),
            endDate: $("financeReportEnd"),
            endDateWrap: $("financeEndDateWrap"),
            applyDate: $("financeApplyDate"),

            reportPeriod: $("financeReportPeriod"),
            calculationStatus: $("financeCalculationStatus"),
            calculatedAt: $("financeCalculatedAt"),
            sourceReference: $("financeSourceReference")
        };

        let selectedPlayer = null;
        let selectedPeriod = "daily";
        let currentRequest = 0;

        /* =================================================
           DATA PROVIDER CONTRACT

           A separate integration layer can supply:

           window.financeDataProvider = {
               getOverview: async () => ({
                   dailyNgr: 120.50,
                   weeklyNgr: 840.25,
                   currency: "USD"
               }),

               searchPlayers: async (query) => [
                   {
                       userId: "USER_ID_FROM_DATABASE",
                       username: "USERNAME_FROM_DATABASE",
                       playerId: "PLAYER_ID_FROM_DATABASE",
                       todayDeposit: 100,
                       todayWithdrawal: 25,
                       todayNgr: 45,
                       currentBalance: 200,
                       currency: "USD"
                   }
               ],

               getPlayerReport: async (player, options) => ({
                   currency: "USD",
                   validBets: 500,
                   playerWin: 350,
                   playerLoss: 500,
                   ggr: 150,
                   bonusDeductions: 20,
                   otherDeductions: 5,
                   totalDeductions: 25,
                   ngr: 125,
                   successfulDeposit: 100,
                   successfulWithdrawal: 25,
                   pendingDeposit: 0,
                   pendingWithdrawal: 0,
                   reversedTransactions: 0,
                   currentBalance: 200,
                   bonusGranted: 20,
                   bonusUsed: 10,
                   bonusReversed: 0,
                   reportPeriod: "YYYY-MM-DD - YYYY-MM-DD",
                   calculationStatus: "Calculated",
                   calculatedAt: "ISO date or timestamp",
                   sourceReference: "Verified reference"
               })
           };

           The above is an interface example, not existing
           database code. Do not use sample values as live data.
        ================================================= */

        /* =================================================
           GENERAL HELPERS
        ================================================= */

        function getProvider() {
            return window.financeDataProvider || null;
        }

        function setText(element, value) {
            if (!element) return;

            element.textContent =
                value === null || value === undefined || value === ""
                    ? "—"
                    : String(value);
        }

        function setMessage(message) {
            setText(elements.searchMessage, message);
        }

        function localDateString(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        function parseDate(value) {
            if (!value) return null;

            const date = new Date(`${value}T12:00:00`);

            return Number.isNaN(date.getTime()) ? null : date;
        }

        function addDays(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);

            return result;
        }

        function formatMoney(value, currency) {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                !Number.isFinite(Number(value))
            ) {
                return "—";
            }

            const amount = Number(value);
            const currencyCode = currency || "USD";

            try {
                return new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: currencyCode,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(amount);
            } catch (error) {
                return `${currencyCode} ${amount.toFixed(2)}`;
            }
        }

        function formatNumber(value) {
            if (
                value === null ||
                value === undefined ||
                value === "" ||
                !Number.isFinite(Number(value))
            ) {
                return "—";
            }

            return new Intl.NumberFormat().format(Number(value));
        }

        function formatTimestamp(value) {
            if (!value) return "—";

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return String(value);
            }

            return date.toLocaleString();
        }

        function setLoading(button, loading, loadingText) {
            if (!button) return;

            if (loading) {
                if (!button.dataset.originalText) {
                    button.dataset.originalText = button.textContent.trim();
                }

                button.disabled = true;
                button.textContent = loadingText || "Loading...";
            } else {
                button.disabled = false;

                if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                    delete button.dataset.originalText;
                }
            }
        }

        function appendCell(row, value) {
            const cell = document.createElement("td");

            cell.textContent =
                value === null || value === undefined || value === ""
                    ? "—"
                    : String(value);

            row.appendChild(cell);

            return cell;
        }

        function renderEmptyTable(message) {
            if (!elements.playerTable) return;

            elements.playerTable.replaceChildren();

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.className = "finance-empty-state";
            cell.textContent = message;

            row.appendChild(cell);
            elements.playerTable.appendChild(row);
        }

        function showProviderUnavailable() {
            setMessage(
                "Finance data source is not connected. No live financial records are available."
            );
        }

        /* =================================================
           DAILY / WEEKLY OVERVIEW
        ================================================= */

        async function loadOverview() {
            const provider = getProvider();

            setText(elements.dailyNgr, "—");
            setText(elements.weeklyNgr, "—");

            if (!provider || typeof provider.getOverview !== "function") {
                return;
            }

            try {
                const overview = await provider.getOverview();

                if (!overview) return;

                const currency = overview.currency || "USD";

                if (
                    overview.dailyNgr !== null &&
                    overview.dailyNgr !== undefined
                ) {
                    setText(
                        elements.dailyNgr,
                        formatMoney(overview.dailyNgr, currency)
                    );
                }

                if (
                    overview.weeklyNgr !== null &&
                    overview.weeklyNgr !== undefined
                ) {
                    setText(
                        elements.weeklyNgr,
                        formatMoney(overview.weeklyNgr, currency)
                    );
                }
            } catch (error) {
                console.error(
                    "[Finance] Could not load revenue overview:",
                    error
                );

                setMessage("Unable to load the revenue overview.");
            }
        }

        /* =================================================
           PLAYER SEARCH
        ================================================= */

        async function searchPlayers(query) {
            const provider = getProvider();

            if (!provider || typeof provider.searchPlayers !== "function") {
                renderEmptyTable(
                    "Player search is waiting for a connected data source."
                );

                showProviderUnavailable();
                return;
            }

            const requestId = ++currentRequest;

            setLoading(
                elements.searchForm
                    ? elements.searchForm.querySelector('[type="submit"]')
                    : null,
                true,
                "Searching..."
            );

            setMessage("Searching player records...");

            renderEmptyTable("Loading player records...");

            try {
                const result = await provider.searchPlayers(query);

                if (requestId !== currentRequest) return;

                if (!Array.isArray(result)) {
                    throw new Error(
                        "The player search provider must return an array."
                    );
                }

                renderPlayers(result);

                if (result.length === 0) {
                    setMessage("No matching player records were found.");
                } else {
                    setMessage(
                        `${result.length} player record(s) found.`
                    );
                }
            } catch (error) {
                if (requestId !== currentRequest) return;

                console.error(
                    "[Finance] Player search failed:",
                    error
                );

                renderEmptyTable(
                    "Unable to load player records. Please try again."
                );

                setMessage("Player search failed.");
            } finally {
                if (requestId === currentRequest) {
                    setLoading(
                        elements.searchForm
                            ? elements.searchForm.querySelector(
                                '[type="submit"]'
                            )
                            : null,
                        false
                    );
                }
            }
        }

        function renderPlayers(players) {
            if (!elements.playerTable) return;

            elements.playerTable.replaceChildren();

            if (players.length === 0) {
                renderEmptyTable("No matching player records found.");
                return;
            }

            players.forEach((player) => {
                const row = document.createElement("tr");
                const currency = player.currency || "USD";

                appendCell(row, player.userId);
                appendCell(row, player.username);

                appendCell(
                    row,
                    formatMoney(player.todayDeposit, currency)
                );

                appendCell(
                    row,
                    formatMoney(player.todayWithdrawal, currency)
                );

                appendCell(
                    row,
                    formatMoney(player.todayNgr, currency)
                );

                appendCell(
                    row,
                    formatMoney(player.currentBalance, currency)
                );

                const actionCell = document.createElement("td");
                const detailsButton = document.createElement("button");

                detailsButton.type = "button";
                detailsButton.className = "finance-details-btn";
                detailsButton.textContent = "Details";

                detailsButton.addEventListener("click", () => {
                    openPlayerDetails(player);
                });

                actionCell.appendChild(detailsButton);
                row.appendChild(actionCell);

                elements.playerTable.appendChild(row);
            });
        }

        /* =================================================
           PLAYER DETAILS
        ================================================= */

        function openPlayerDetails(player) {
            if (!player) return;

            selectedPlayer = player;

            if (elements.detailsPanel) {
                elements.detailsPanel.hidden = false;
            }

            setText(
                elements.detailsTitle,
                player.username || "Player Financial Details"
            );

            setText(
                elements.detailsPlayerId,
                "Player ID: " +
                    (player.playerId || player.userId || "—")
            );

            clearReportValues();
            setPeriod("daily");

            loadPlayerReport();

            if (elements.detailsPanel) {
                elements.detailsPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }

        function closePlayerDetails() {
            selectedPlayer = null;

            currentRequest++;

            if (elements.detailsPanel) {
                elements.detailsPanel.hidden = true;
            }
        }

        /* =================================================
           REPORT FIELD MAPPING

           Only fields returned by the real provider are shown.
           Missing fields remain "—", not invented zero values.
        ================================================= */

        const reportFields = {
            financeValidBets: {
                key: "validBets",
                type: "number"
            },

            financeGgr: {
                key: "ggr",
                type: "money"
            },

            financeTotalDeductions: {
                key: "totalDeductions",
                type: "money"
            },

            financeReportNgr: {
                key: "ngr",
                type: "money"
            },

            financeDetailValidBets: {
                key: "validBets",
                type: "number"
            },

            financePlayerWin: {
                key: "playerWin",
                type: "money"
            },

            financePlayerLoss: {
                key: "playerLoss",
                type: "money"
            },

            financeDetailGgr: {
                key: "ggr",
                type: "money"
            },

            financeCalcGgr: {
                key: "ggr",
                type: "money"
            },

            financeBonusDeductions: {
                key: "bonusDeductions",
                type: "money"
            },

            financeOtherDeductions: {
                key: "otherDeductions",
                type: "money"
            },

            financeCalcNgr: {
                key: "ngr",
                type: "money"
            },

            financeSuccessfulDeposit: {
                key: "successfulDeposit",
                type: "money"
            },

            financeSuccessfulWithdrawal: {
                key: "successfulWithdrawal",
                type: "money"
            },

            financePendingDeposit: {
                key: "pendingDeposit",
                type: "money"
            },

            financePendingWithdrawal: {
                key: "pendingWithdrawal",
                type: "money"
            },

            financeReversedTransactions: {
                key: "reversedTransactions",
                type: "money"
            },

            financeReportBalance: {
                key: "currentBalance",
                type: "money"
            },

            financeBonusGranted: {
                key: "bonusGranted",
                type: "money"
            },

            financeBonusUsed: {
                key: "bonusUsed",
                type: "money"
            },

            financeBonusReversed: {
                key: "bonusReversed",
                type: "money"
            }
        };

        function clearReportValues() {
            Object.keys(reportFields).forEach((id) => {
                setText($(id), "—");
            });

            setText(elements.reportPeriod, "—");
            setText(elements.calculationStatus, "Not loaded");
            setText(elements.calculatedAt, "—");
            setText(elements.sourceReference, "—");
        }

        function renderReport(report) {
            if (!report) {
                clearReportValues();
                setText(elements.calculationStatus, "No report data");
                return;
            }

            const currency = report.currency || "USD";

            Object.entries(reportFields).forEach(([id, config]) => {
                const element = $(id);
                if (!element) return;

                const value = report[config.key];

                if (value === null || value === undefined || value === "") {
                    setText(element, "—");
                    return;
                }

                if (config.type === "money") {
                    setText(element, formatMoney(value, currency));
                } else {
                    setText(element, formatNumber(value));
                }
            });

            setText(elements.reportPeriod, report.reportPeriod);
            setText(
                elements.calculationStatus,
                report.calculationStatus || "—"
            );

            setText(
                elements.calculatedAt,
                formatTimestamp(report.calculatedAt)
            );

            setText(
                elements.sourceReference,
                report.sourceReference
            );
        }

        /* =================================================
           REPORT PERIOD SELECTION
        ================================================= */

        function setDefaultDates() {
            if (!elements.startDate || !elements.endDate) return;

            const today = new Date();

            elements.startDate.value = localDateString(today);
            elements.endDate.value = localDateString(today);
        }

        function setPeriod(period) {
            const allowedPeriods = ["daily", "weekly", "custom"];

            if (!allowedPeriods.includes(period)) {
                return;
            }

            selectedPeriod = period;

            elements.periodButtons.forEach((button) => {
                const active = button.dataset.period === period;

                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });

            if (elements.endDateWrap) {
                elements.endDateWrap.hidden = period !== "custom";
            }

            if (!elements.startDate || !elements.endDate) {
                return;
            }

            const start = parseDate(elements.startDate.value);

            if (!start) return;

            if (period === "daily") {
                elements.endDate.value = elements.startDate.value;
            }

            if (period === "weekly") {
                elements.endDate.value = localDateString(
                    addDays(start, 6)
                );
            }
        }

        function validateReportDates() {
            if (
                !elements.startDate ||
                !elements.endDate ||
                !elements.startDate.value ||
                !elements.endDate.value
            ) {
                setMessage("Please select the report date range.");
                return false;
            }

            if (!parseDate(elements.startDate.value)) {
                setMessage("The start date is invalid.");
                return false;
            }

            if (!parseDate(elements.endDate.value)) {
                setMessage("The end date is invalid.");
                return false;
            }

            if (elements.endDate.value < elements.startDate.value) {
                setMessage("End date cannot be earlier than start date.");
                return false;
            }

            if (
                selectedPeriod === "daily" &&
                elements.startDate.value !== elements.endDate.value
            ) {
                setMessage("A daily report must use the same start and end date.");
                return false;
            }

            if (selectedPeriod === "weekly") {
                const start = parseDate(elements.startDate.value);
                const expectedEnd = localDateString(addDays(start, 6));

                if (elements.endDate.value !== expectedEnd) {
                    setMessage(
                        "A seven-day report must cover the start date and the following six days."
                    );
                    return false;
                }
            }

            return true;
        }

        /* =================================================
           LOAD PLAYER REPORT
        ================================================= */

        async function loadPlayerReport() {
            if (!selectedPlayer) {
                setMessage("Select a player first.");
                return;
            }

            if (!validateReportDates()) {
                return;
            }

            const provider = getProvider();

            if (!provider || typeof provider.getPlayerReport !== "function") {
                clearReportValues();

                setText(
                    elements.calculationStatus,
                    "Data source not connected"
                );

                setMessage(
                    "Player report is waiting for the verified data source."
                );

                return;
            }

            const requestId = ++currentRequest;

            setText(elements.calculationStatus, "Loading...");
            setMessage("Loading player financial report...");

            try {
                const report = await provider.getPlayerReport(
                    selectedPlayer,
                    {
                        period: selectedPeriod,
                        startDate: elements.startDate.value,
                        endDate: elements.endDate.value
                    }
                );

                if (requestId !== currentRequest) return;

                renderReport(report);

                setMessage("Player report loaded.");
            } catch (error) {
                if (requestId !== currentRequest) return;

                console.error(
                    "[Finance] Player report failed:",
                    error
                );

                clearReportValues();

                setText(
                    elements.calculationStatus,
                    "Unable to load"
                );

                setMessage("Unable to load the player report.");
            }
        }

        /* =================================================
           EVENT LISTENERS
        ================================================= */

        if (elements.searchForm) {
            elements.searchForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const query = elements.searchInput
                    ? elements.searchInput.value.trim()
                    : "";

                if (!query) {
                    setMessage(
                        "Enter a User ID, Username or Player ID."
                    );

                    if (elements.searchInput) {
                        elements.searchInput.focus();
                    }

                    return;
                }

                closePlayerDetails();
                await searchPlayers(query);
            });
        }

        if (elements.resetSearch) {
            elements.resetSearch.addEventListener("click", () => {
                currentRequest++;

                if (elements.searchInput) {
                    elements.searchInput.value = "";
                }

                selectedPlayer = null;
                closePlayerDetails();

                setMessage("");

                renderEmptyTable(
                    "Search for a player to view financial records."
                );
            });
        }

        if (elements.closeDetails) {
            elements.closeDetails.addEventListener(
                "click",
                closePlayerDetails
            );
        }

        elements.periodButtons.forEach((button) => {
            button.addEventListener("click", () => {
                setPeriod(button.dataset.period);

                if (selectedPlayer) {
                    loadPlayerReport();
                }
            });
        });

        if (elements.startDate) {
            elements.startDate.addEventListener("change", () => {
                if (selectedPeriod === "daily") {
                    setPeriod("daily");
                } else if (selectedPeriod === "weekly") {
                    setPeriod("weekly");
                }
            });
        }

        if (elements.applyDate) {
            elements.applyDate.addEventListener("click", () => {
                if (!selectedPlayer) {
                    setMessage(
                        "Search for a player before loading a report."
                    );
                    return;
                }

                loadPlayerReport();
            });
        }

        /* =================================================
           INITIAL STATE
        ================================================= */

        setDefaultDates();
        setPeriod("daily");
        clearReportValues();

        renderEmptyTable(
            "Search for a player to view financial records."
        );

        loadOverview();

        console.info("[Finance] Finance UI initialized.");

    }

    /* Support both script loading orders. */
    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeFinance,
            { once: true }
        );
    } else {
        initializeFinance();
    }

})();
