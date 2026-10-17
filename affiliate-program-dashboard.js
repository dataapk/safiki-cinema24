/* =========================================================
   AFFILIATE DASHBOARD - affiliate.js
   THEME: DEEP GREEN + YELLOW + WHITE

   FEATURES:
   1. Navigation Menu
   2. Earnings Summary
   3. Refresh Statistics
   4. Date Range & Currency Filters
   5. Conversion Statistics
   6. Registration Statistics
   7. State Summary
   8. Supabase Integration Adapter
   9. Native Canvas Charts
========================================================= */

"use strict";

/* =========================================================
   1. CONFIGURATION
========================================================= */

const AFFILIATE_CONFIG = {
    schema: "affiliate_program",


    getSupabaseClient() {
        const client = window.supabaseClient || window.supabase;

        if (
            client &&
            typeof client.from === "function" &&
            client.auth
        ) {
            return client;
        }

        return null;
    },

   
tables: {
    affiliates: "affiliates",
    commissions: "commissions",
    payouts: "payouts",
    referrals: "referrals"
},


    // Your affiliate commission data is expected to be
    // stored in USD unless your database specifies otherwise.
    baseCurrency: "USD",

    /*
       Configure these exchange rates using trusted,
       current rates before enabling currency conversion.

       Example structure:
       exchangeRates: {
           BDT: 1,
           USD: YOUR_CURRENT_BDT_TO_USD_RATE,
           EUR: YOUR_CURRENT_BDT_TO_EUR_RATE
       }

       Null means conversion is not configured.
    */

    exchangeRates: {
        BDT: 1,
        USD: null,
        EUR: null
    },

    currencySymbols: {
        BDT: "৳",
        USD: "$",
        EUR: "€"
    },

    currencyLocales: {
        BDT: "en-BD",
        USD: "en-US",
        EUR: "de-DE"
    },

    refreshInterval: 60000,

    // Optional: change this if your application stores
    // the affiliate ID under another property.
    affiliateIdColumn: "affiliate_id",

    // Commission amounts are counted only when their
    // status is approved/paid, unless you change this.
    eligibleCommissionStatuses: [
        "approved",
        "paid"
    ]
};


/* =========================================================
   2. DASHBOARD STATE
========================================================= */

const AffiliateDashboard = {
    initialized: false,
    loading: false,
    refreshTimer: null,

    user: null,
    affiliate: null,

    commissions: [],
    payouts: [],
    referrals: [],

    // Optional supplemental statistics from your backend.
    // These are not automatically assumed to exist in
    // affiliate_referrals.
    trackingStatistics: null,

    currency: "BDT",
    timeInterval: "1month",

    customStartDate: null,
    customEndDate: null,

    conversionPeriod: "month",
    registrationPeriod: "month",
    summaryPeriod: "currentMonth",

    filters: {
        viewClicks: true,
        directClicks: true,
        registrations: true,
        newDeposits: true,
        commissionAmount: true
    },

    lastUpdated: null,
    error: null
};


/* =========================================================
   3. DOM HELPERS
========================================================= */

function affiliateElement(id) {
    return document.getElementById(id);
}

function affiliateSetText(id, text) {
    const element = affiliateElement(id);

    if (element) {
        element.textContent = String(text);
    }
}

function affiliateSetStatus(message, type = "info") {
    const element = affiliateElement("refreshStatus");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.dataset.status = type;

    element.style.color =
        type === "error"
            ? "#d93636"
            : type === "success"
                ? "#12834a"
                : "";
}

function affiliateEscapeText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function affiliateNormalizeStatus(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function affiliateNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
}

function affiliateDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function affiliateStartOfDay(date = new Date()) {
    const result = new Date(date);

    result.setHours(0, 0, 0, 0);

    return result;
}

function affiliateStartOfMonth(date = new Date()) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );
}

function affiliateAddDays(date, days) {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
}

function affiliateFormatDate(date) {
    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}




async function loadHeaderAffiliateId() {
    const idElement = document.getElementById("headerAffiliateId");

    if (!idElement) return;

    const client = window.supabaseClient;

    if (!client || !client.auth) {
        idElement.textContent = "Unavailable";
        return;
    }

    try {
        const {
            data: { user },
            error: authError
        } = await client.auth.getUser();

        if (authError || !user) {
            window.location.replace("/affiliate-login.html");
            return;
        }

        const { data: affiliate, error } = await client
            .schema("affiliate_program")
            .from("affiliates")
            .select("affiliate_id, status")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        if (
            !affiliate ||
            String(affiliate.status || "").toLowerCase() !== "active"
        ) {
            idElement.textContent = "Unavailable";
            return;
        }

        idElement.textContent = affiliate.affiliate_id;
    } catch (error) {
        console.error(
            "[Affiliate Dashboard] Could not load Affiliate ID:",
            error
        );

        idElement.textContent = "Unavailable";
    }
}

loadHeaderAffiliateId();



/* =========================================================
   4. CURRENCY FORMATTING
========================================================= */

function affiliateGetExchangeRate(currency) {
    return AFFILIATE_CONFIG.exchangeRates[currency] ?? null;
}

function affiliateConvertAmount(amount, currency) {
    const rate = affiliateGetExchangeRate(currency);

    if (rate === null || !Number.isFinite(Number(rate))) {
        return null;
    }

    return affiliateNumber(amount) * Number(rate);
}

function affiliateFormatMoney(amount, currency = AffiliateDashboard.currency) {
    const convertedAmount = affiliateConvertAmount(
        amount,
        currency
    );

    if (convertedAmount === null) {
        return "Rate unavailable";
    }

    try {
        return new Intl.NumberFormat(
            AFFILIATE_CONFIG.currencyLocales[currency] || "en",
            {
                style: "currency",
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(convertedAmount);
    } catch (error) {
        const symbol =
            AFFILIATE_CONFIG.currencySymbols[currency] || "";

        return symbol + convertedAmount.toFixed(2);
    }
}


/* =========================================================
   5. NAVIGATION MENU
========================================================= */

function affiliateInitializeMenu() {
    const menuButton = affiliateElement("menuToggle");
    const menu = affiliateElement("navigationMenu");

    if (!menuButton || !menu) {
        return;
    }

    function setMenuOpen(open) {
        menu.hidden = !open;

        menuButton.setAttribute(
            "aria-expanded",
            String(open)
        );

        menuButton.setAttribute(
            "aria-label",
            open ? "Close menu" : "Open menu"
        );
    }

    menuButton.addEventListener("click", () => {
        const isOpen =
            menuButton.getAttribute("aria-expanded") === "true";

        setMenuOpen(!isOpen);
    });

    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    document.addEventListener("click", event => {
        if (
            !menu.hidden &&
            !menu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            setMenuOpen(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    setMenuOpen(false);
}


/* =========================================================
   6. PERIOD HELPERS
========================================================= */

function affiliateGetPeriodRange(period) {
    const now = new Date();
    const today = affiliateStartOfDay(now);

    switch (period) {
        case "week":
        case "7days":
            return {
                start: affiliateAddDays(today, -6),
                end: now
            };

        case "month":
        case "1month":
            return {
                start: affiliateStartOfMonth(now),
                end: now
            };

        case "6months":
            return {
                start: new Date(
                    now.getFullYear(),
                    now.getMonth() - 5,
                    1
                ),
                end: now
            };

        case "yesterday": {
            const yesterday = affiliateAddDays(today, -1);

            return {
                start: yesterday,
                end: today
            };
        }

        case "today":
            return {
                start: today,
                end: now
            };

        case "last7days":
            return {
                start: affiliateAddDays(today, -6),
                end: now
            };

        case "currentMonth":
            return {
                start: affiliateStartOfMonth(now),
                end: now
            };

        case "previousMonth":
            return {
                start: new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                ),
                end: affiliateStartOfMonth(now)
            };

        case "all":
            return {
                start: null,
                end: now
            };

        default:
            return {
                start: affiliateStartOfMonth(now),
                end: now
            };
    }
}

function affiliateIsInRange(value, range) {
    const date = affiliateDate(value);

    if (!date) {
        return false;
    }

    if (range.start && date < range.start) {
        return false;
    }

    if (range.end && date > range.end) {
        return false;
    }

    return true;
}

function affiliateGetCommissionDate(record) {
    return (
        record.period_end ||
        record.created_at ||
        record.period_start ||
        record.updated_at ||
        null
    );
}

function affiliateGetReferralDate(record) {
    return (
        record.created_at ||
        record.registered_at ||
        record.created_on ||
        null
    );
}


/* =========================================================
   7. COMMISSION CALCULATIONS
========================================================= */

function affiliateIsEligibleCommission(record) {
    const status = affiliateNormalizeStatus(record.status);

    return AFFILIATE_CONFIG.eligibleCommissionStatuses
        .includes(status);
}

function affiliateGetCommissionAmount(record) {
    return affiliateNumber(record.commission_amount);
}

function affiliateSumCommissions(records) {
    return records
        .filter(affiliateIsEligibleCommission)
        .reduce((total, record) => {
            return total + affiliateGetCommissionAmount(record);
        }, 0);
}

function affiliateGetCommissionsInRange(range) {
    return AffiliateDashboard.commissions.filter(record => {
        return affiliateIsInRange(
            affiliateGetCommissionDate(record),
            range
        );
    });
}

function affiliateGetTodayCommission() {
    const range = affiliateGetPeriodRange("today");

    return affiliateSumCommissions(
        affiliateGetCommissionsInRange(range)
    );
}

function affiliateGetYesterdayCommission() {
    const range = affiliateGetPeriodRange("yesterday");

    return affiliateSumCommissions(
        affiliateGetCommissionsInRange(range)
    );
}

function affiliateGetCurrentMonthCommission() {
    const range = affiliateGetPeriodRange("currentMonth");

    return affiliateSumCommissions(
        affiliateGetCommissionsInRange(range)
    );
}

function affiliateGetThirtyDaysCommission() {
    const range = {
        start: affiliateAddDays(
            affiliateStartOfDay(new Date()),
            -29
        ),
        end: new Date()
    };

    return affiliateSumCommissions(
        affiliateGetCommissionsInRange(range)
    );
}


/* =========================================================
   8. AVAILABLE BALANCE CALCULATION
========================================================= */

/*
   Available to Withdraw is calculated from approved
   commissions minus completed payouts.

   IMPORTANT:
   Your payout schema must use compatible status and amount
   fields for this calculation to match your real wallet.
*/

function affiliateGetCompletedPayoutAmount() {
    return AffiliateDashboard.payouts
        .filter(record => {
            const status = affiliateNormalizeStatus(record.status);

            return [
                "paid",
                "completed",
                "success"
            ].includes(status);
        })
        .reduce((total, record) => {
            return total + affiliateNumber(record.amount);
        }, 0);
}

function affiliateGetAvailableBalance() {
    const lifetimeCommission = affiliateSumCommissions(
        AffiliateDashboard.commissions
    );

    const completedPayouts =
        affiliateGetCompletedPayoutAmount();

    return Math.max(
        0,
        lifetimeCommission - completedPayouts
    );
}

function affiliateRenderEarnings() {
    const available = affiliateGetAvailableBalance();

    const yesterday = affiliateGetYesterdayCommission();

    const currentMonth =
        affiliateGetCurrentMonthCommission();

    const thirtyDays =
        affiliateGetThirtyDaysCommission();

    const total = affiliateSumCommissions(
        AffiliateDashboard.commissions
    );

    affiliateSetText(
        "availableToWithdraw",
        affiliateFormatMoney(available)
    );

    affiliateSetText(
        "yesterdayCommission",
        affiliateFormatMoney(yesterday)
    );

    affiliateSetText(
        "currentMonthCommission",
        affiliateFormatMoney(currentMonth)
    );

    affiliateSetText(
        "thirtyDaysCommission",
        affiliateFormatMoney(thirtyDays)
    );

    affiliateSetText(
        "totalCommission",
        affiliateFormatMoney(total)
    );
}


/* =========================================================
   9. SUPABASE DATA LOADING
========================================================= */

/*
   Expected existing tables:
       affiliates
       affiliate_commissions
       affiliate_payouts
       affiliate_referrals

   Expected relationship:
       affiliates.user_id = authenticated user ID

   Expected commission fields include:
       affiliate_id
       commission_amount
       status
       period_start
       period_end
       created_at

   Expected payout fields include:
       affiliate_id
       amount
       status
       created_at

   Adapt the column names below if your actual schema
   differs. RLS policies must permit the authenticated
   affiliate to read only their own records.
*/

async function affiliateFetchRows(
    client,
    tableName,
    affiliateId
) {
    const column = AFFILIATE_CONFIG.affiliateIdColumn;

    const result = await client
        .from(tableName)
        .select("*")
        .eq(column, affiliateId);

    if (result.error) {
        throw result.error;
    }

    return Array.isArray(result.data)
        ? result.data
        : [];
}


async function affiliateLoadSupabaseData() {
    const client = AFFILIATE_CONFIG.getSupabaseClient();

    if (!client) {
        throw new Error(
            "Supabase client not found. Configure your existing client before loading affiliate data."
        );
    }

    const authResult = await client.auth.getUser();

    if (authResult.error) {
        throw authResult.error;
    }

    const user = authResult.data?.user;

    if (!user) {
        throw new Error(
            "Please sign in to view your affiliate dashboard."
        );
    }

    AffiliateDashboard.user = user;

    // Find the affiliate record using the authenticated user's ID.
    const affiliateResult = await client
        .from(AFFILIATE_CONFIG.tables.affiliates)
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (affiliateResult.error) {
        throw affiliateResult.error;
    }

    const affiliate = affiliateResult.data;

    if (!affiliate) {
        throw new Error(
            "No affiliate account was found for this user."
        );
    }

    AffiliateDashboard.affiliate = affiliate;

    // Get the affiliate ID from the returned database record.
    const affiliateId = affiliate.affiliate_id;

    if (!affiliateId) {
        throw new Error(
            "The affiliate account is missing its affiliate_id."
        );
    }

    const results = await Promise.all([
        affiliateFetchRows(
            client,
            AFFILIATE_CONFIG.tables.commissions,
            affiliateId
        ),

        affiliateFetchRows(
            client,
            AFFILIATE_CONFIG.tables.payouts,
            affiliateId
        ),

        affiliateFetchRows(
            client,
            AFFILIATE_CONFIG.tables.referrals,
            affiliateId
        )
    ]);

    AffiliateDashboard.commissions = results[0];
    AffiliateDashboard.payouts = results[1];
    AffiliateDashboard.referrals = results[2];

    AffiliateDashboard.error = null;

    return {
        affiliate,
        commissions: results[0],
        payouts: results[1],
        referrals: results[2]
    };
}



/* =========================================================
   10. DATE FILTER VALIDATION
========================================================= */

function affiliateValidateDateRange() {
    const interval = affiliateElement("timeInterval");

    if (!interval || interval.value !== "custom") {
        return true;
    }

    const startInput = affiliateElement("startDate");
    const endInput = affiliateElement("endDate");

    const startValue = startInput?.value;
    const endValue = endInput?.value;

    if (!startValue || !endValue) {
        affiliateSetStatus(
            "Please select both a start date and an end date.",
            "error"
        );

        return false;
    }

    if (startValue > endValue) {
        affiliateSetStatus(
            "Start Date cannot be later than End Date.",
            "error"
        );

        return false;
    }

    AffiliateDashboard.customStartDate =
        new Date(`${startValue}T00:00:00`);

    AffiliateDashboard.customEndDate =
        new Date(`${endValue}T23:59:59.999`);

    return true;
}

function affiliateGetDashboardDateRange() {
    if (
        AffiliateDashboard.timeInterval === "custom" &&
        AffiliateDashboard.customStartDate &&
        AffiliateDashboard.customEndDate
    ) {
        return {
            start: AffiliateDashboard.customStartDate,
            end: AffiliateDashboard.customEndDate
        };
    }

    return affiliateGetPeriodRange(
        AffiliateDashboard.timeInterval
    );
}


/* =========================================================
   11. CURRENCY AND INTERVAL CONTROLS
========================================================= */

function affiliateInitializeFilters() {
    const interval = affiliateElement("timeInterval");
    const currency = affiliateElement("currencySelect");

    const customRange = affiliateElement("customDateRange");

    const startDate = affiliateElement("startDate");
    const endDate = affiliateElement("endDate");

    const applyButton = affiliateElement("applyStatistics");

    if (interval && customRange) {
        interval.addEventListener("change", () => {
            customRange.hidden = interval.value !== "custom";

            AffiliateDashboard.timeInterval = interval.value;

            if (interval.value === "custom") {
                const today = new Date();
                const todayString = [
                    today.getFullYear(),
                    String(today.getMonth() + 1).padStart(2, "0"),
                    String(today.getDate()).padStart(2, "0")
                ].join("-");

                if (startDate) {
                    startDate.max = todayString;
                }

                if (endDate) {
                    endDate.max = todayString;
                }
            }
        });
    }

    if (startDate && endDate) {
        startDate.addEventListener("change", () => {
            endDate.min = startDate.value || "";
        });

        endDate.addEventListener("change", () => {
            startDate.max = endDate.value || "";
        });
    }

    if (currency) {
        currency.addEventListener("change", () => {
            const selectedCurrency = currency.value;

            if (
                !Object.prototype.hasOwnProperty.call(
                    AFFILIATE_CONFIG.exchangeRates,
                    selectedCurrency
                )
            ) {
                affiliateSetStatus(
                    "This currency is not configured.",
                    "error"
                );

                currency.value = AffiliateDashboard.currency;

                return;
            }

            const rate = affiliateGetExchangeRate(
                selectedCurrency
            );

            if (rate === null) {
                affiliateSetStatus(
                    `Configure a current ${selectedCurrency} exchange rate before using this currency.`,
                    "error"
                );

                currency.value = AffiliateDashboard.currency;

                return;
            }

            AffiliateDashboard.currency = selectedCurrency;

            affiliateRenderAll();
        });
    }

    if (applyButton) {
        applyButton.addEventListener("click", () => {
            if (!affiliateValidateDateRange()) {
                return;
            }

            if (interval) {
                AffiliateDashboard.timeInterval = interval.value;
            }

            affiliateRenderAll();

            affiliateSetStatus(
                "Statistics filters applied.",
                "success"
            );
        });
    }
}


/* =========================================================
   12. PERIOD SELECTORS
========================================================= */

function affiliateInitializePeriodSelectors() {
    const conversionPeriod =
        affiliateElement("conversionPeriod");

    const registrationPeriod =
        affiliateElement("registrationPeriod");

    const summaryPeriod =
        affiliateElement("summaryPeriod");

    if (conversionPeriod) {
        conversionPeriod.addEventListener("change", () => {
            AffiliateDashboard.conversionPeriod =
                conversionPeriod.value;

            affiliateRenderConversionChart();
        });
    }

    if (registrationPeriod) {
        registrationPeriod.addEventListener("change", () => {
            AffiliateDashboard.registrationPeriod =
                registrationPeriod.value;

            affiliateRenderRegistrationChart();
        });
    }

    if (summaryPeriod) {
        summaryPeriod.addEventListener("change", () => {
            AffiliateDashboard.summaryPeriod =
                summaryPeriod.value;

            affiliateRenderStateSummary();
        });
    }
}


/* =========================================================
   13. CHECKBOX CONTROLS
========================================================= */

function affiliateInitializeChartToggles() {
    const toggleMap = {
        viewClicksToggle: "viewClicks",
        directClicksToggle: "directClicks",
        registrationsToggle: "registrations",
        newDepositsToggle: "newDeposits",
        commissionAmountToggle: "commissionAmount"
    };

    Object.entries(toggleMap).forEach(([id, key]) => {
        const input = affiliateElement(id);

        if (!input) {
            return;
        }

        AffiliateDashboard.filters[key] = input.checked;

        input.addEventListener("change", () => {
            AffiliateDashboard.filters[key] = input.checked;

            if (
                key === "viewClicks" ||
                key === "directClicks"
            ) {
                affiliateRenderConversionChart();
            } else {
                affiliateRenderRegistrationChart();
            }
        });
    });
}


/* =========================================================
   14. CHART DATA HELPERS
========================================================= */

function affiliateGetChartRange(period) {
    return affiliateGetPeriodRange(period);
}

function affiliateGetDailyLabels(range) {
    if (!range.start || !range.end) {
        return [];
    }

    const labels = [];

    const current = affiliateStartOfDay(range.start);
    const end = affiliateStartOfDay(range.end);

    while (current <= end && labels.length < 370) {
        labels.push({
            date: new Date(current),
            label: new Intl.DateTimeFormat("en", {
                day: "2-digit",
                month: "short"
            }).format(current)
        });

        current.setDate(current.getDate() + 1);
    }

    return labels;
}

function affiliateGetRecordDay(record, dateGetter) {
    const date = affiliateDate(dateGetter(record));

    if (!date) {
        return null;
    }

    const day = affiliateStartOfDay(date);

    return [
        day.getFullYear(),
        String(day.getMonth() + 1).padStart(2, "0"),
        String(day.getDate()).padStart(2, "0")
    ].join("-");
}

function affiliateDayKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function affiliateGroupByDay(records, dateGetter, valueGetter) {
    const result = {};

    records.forEach(record => {
        const day = affiliateGetRecordDay(record, dateGetter);

        if (!day) {
            return;
        }

        result[day] =
            (result[day] || 0) + valueGetter(record);
    });

    return result;
}

function affiliateGetFilteredCommissions(period) {
    const range = affiliateGetChartRange(period);

    return affiliateGetCommissionsInRange(range);
}


/* =========================================================
   15. NATIVE CANVAS CHART RENDERER
========================================================= */

function affiliateDrawLineChart(containerId, series, labels) {
    const container = affiliateElement(containerId);

    if (!container) {
        return;
    }

    container.replaceChildren();

    if (!labels.length || !series.length) {
        const placeholder = document.createElement("p");

        placeholder.className = "chart-placeholder";
        placeholder.textContent =
            "No statistics available for this period.";

        container.appendChild(placeholder);

        return;
    }

    const canvas = document.createElement("canvas");

    canvas.setAttribute("role", "img");
    canvas.setAttribute(
        "aria-label",
        "Affiliate statistics line chart"
    );

    canvas.style.width = "100%";
    canvas.style.height = "260px";
    canvas.style.display = "block";

    container.appendChild(canvas);

    const context = canvas.getContext("2d");

    if (!context) {
        container.textContent = "Chart could not be displayed.";
        return;
    }

    const cssWidth = Math.max(
        280,
        container.clientWidth - 36
    );

    const cssHeight = 260;

    const pixelRatio = Math.max(
        1,
        window.devicePixelRatio || 1
    );

    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);

    context.scale(pixelRatio, pixelRatio);

    const width = cssWidth;
    const height = cssHeight;

    const padding = {
        top: 22,
        right: 16,
        bottom: 38,
        left: 42
    };

    const plotWidth =
        width - padding.left - padding.right;

    const plotHeight =
        height - padding.top - padding.bottom;

    const allValues = series.flatMap(item => item.values);

    const maximum = Math.max(1, ...allValues);

    const colors = [
        "#07543b",
        "#d4b600",
        "#4e9b70"
    ];

    // Background
    context.fillStyle = "#ffffff";

    context.fillRect(0, 0, width, height);

    // Horizontal grid and Y-axis labels
    context.font = "11px Arial";
    context.textAlign = "right";
    context.textBaseline = "middle";

    for (let i = 0; i <= 4; i++) {
        const y =
            padding.top + (plotHeight / 4) * i;

        const value = maximum * (1 - i / 4);

        context.beginPath();
        context.strokeStyle = "#e7eee8";
        context.lineWidth = 1;

        context.moveTo(padding.left, y);
        context.lineTo(width - padding.right, y);

        context.stroke();

        context.fillStyle = "#75847b";

        context.fillText(
            Number(value.toFixed(2)).toString(),
            padding.left - 8,
            y
        );
    }

    // X-axis labels
    const labelStep = Math.max(
        1,
        Math.ceil(labels.length / 7)
    );

    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillStyle = "#75847b";

    labels.forEach((label, index) => {
        if (
            index % labelStep !== 0 &&
            index !== labels.length - 1
        ) {
            return;
        }

        const x =
            padding.left +
            (labels.length <= 1
                ? plotWidth / 2
                : (index / (labels.length - 1)) * plotWidth);

        context.fillText(
            label,
            x,
            height - padding.bottom + 12
        );
    });

    // Data lines
    series.forEach((item, seriesIndex) => {
        const color = colors[seriesIndex % colors.length];

        const values = item.values;

        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 2.5;
        context.lineJoin = "round";
        context.lineCap = "round";

        values.forEach((value, index) => {
            const x =
                padding.left +
                (values.length <= 1
                    ? plotWidth / 2
                    : (index / (values.length - 1)) * plotWidth);

            const y =
                padding.top +
                plotHeight -
                (Math.max(0, value) / maximum) * plotHeight;

            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });

        context.stroke();

        // Point markers
        values.forEach((value, index) => {
            const x =
                padding.left +
                (values.length <= 1
                    ? plotWidth / 2
                    : (index / (values.length - 1)) * plotWidth);

            const y =
                padding.top +
                plotHeight -
                (Math.max(0, value) / maximum) * plotHeight;

            context.beginPath();

            context.fillStyle = "#ffffff";
            context.strokeStyle = color;
            context.lineWidth = 2;

            context.arc(x, y, 3, 0, Math.PI * 2);

            context.fill();
            context.stroke();
        });
    });

    // Legend
    let legendX = padding.left;
    const legendY = 10;

    context.font = "11px Arial";
    context.textAlign = "left";
    context.textBaseline = "middle";

    series.forEach((item, index) => {
        const color = colors[index % colors.length];

        context.fillStyle = color;

        context.fillRect(
            legendX,
            legendY - 4,
            9,
            9
        );

        context.fillStyle = "#18372b";

        context.fillText(
            item.name,
            legendX + 14,
            legendY
        );

        legendX +=
            context.measureText(item.name).width + 35;
    });
}


/* =========================================================
   16. CONVERSION STATISTICS
========================================================= */

/*
   Conversion tracking requires actual tracking data.

   This adapter expects optional records with fields such as:
       date / created_at
       clicks
       direct_clicks

   These values are not fabricated when no tracking source
   is configured.
*/

function affiliateGetTrackingRecords() {
    const source = AffiliateDashboard.trackingStatistics;

    if (Array.isArray(source)) {
        return source;
    }

    if (source && Array.isArray(source.daily)) {
        return source.daily;
    }

    return [];
}

function affiliateRenderConversionChart() {
    const period = AffiliateDashboard.conversionPeriod;

    const range = affiliateGetChartRange(period);

    const labels = affiliateGetDailyLabels(range);

    const trackingRecords = affiliateGetTrackingRecords();

    const hasTrackingData = trackingRecords.length > 0;

    if (!hasTrackingData) {
        const container = affiliateElement("conversionChart");

        if (container) {
            container.replaceChildren();

            const message = document.createElement("p");

            message.className = "chart-placeholder";
            message.textContent =
                "Conversion statistics require connected click-tracking data.";

            container.appendChild(message);
        }

        return;
    }

    const filteredRecords = trackingRecords.filter(record => {
        return affiliateIsInRange(
            record.date || record.created_at,
            range
        );
    });

    const clicksByDay = affiliateGroupByDay(
        filteredRecords,
        record => record.date || record.created_at,
        record => affiliateNumber(record.clicks)
    );

    const directClicksByDay = affiliateGroupByDay(
        filteredRecords,
        record => record.date || record.created_at,
        record => affiliateNumber(record.direct_clicks)
    );

    const series = [];

    if (AffiliateDashboard.filters.viewClicks) {
        series.push({
            name: "View Clicks",
            values: labels.map(item => {
                return clicksByDay[affiliateDayKey(item.date)] || 0;
            })
        });
    }

    if (AffiliateDashboard.filters.directClicks) {
        series.push({
            name: "Direct Links",
            values: labels.map(item => {
                return directClicksByDay[affiliateDayKey(item.date)] || 0;
            })
        });
    }

    affiliateDrawLineChart(
        "conversionChart",
        series,
        labels.map(item => item.label)
    );
}


/* =========================================================
   17. REGISTRATION STATISTICS
========================================================= */

function affiliateGetRegistrationRecords(range) {
    return AffiliateDashboard.referrals.filter(record => {
        return affiliateIsInRange(
            affiliateGetReferralDate(record),
            range
        );
    });
}

function affiliateGetReferralDepositAmount(record) {
    return affiliateNumber(
        record.new_deposit_amount ??
        record.deposit_amount ??
        0
    );
}

function affiliateRenderRegistrationChart() {
    const period = AffiliateDashboard.registrationPeriod;

    const range = affiliateGetChartRange(period);

    const labels = affiliateGetDailyLabels(range);

    const referrals = affiliateGetRegistrationRecords(range);

    const registrationsByDay = affiliateGroupByDay(
        referrals,
        affiliateGetReferralDate,
        () => 1
    );

    const depositsByDay = affiliateGroupByDay(
        referrals.filter(record => {
            return affiliateGetReferralDepositAmount(record) > 0;
        }),
        affiliateGetReferralDate,
        () => 1
    );

    const commissionsByDay = affiliateGroupByDay(
        affiliateGetFilteredCommissions(period),
        affiliateGetCommissionDate,
        affiliateGetCommissionAmount
    );

    const series = [];

    if (AffiliateDashboard.filters.registrations) {
        series.push({
            name: "Registrations",
            values: labels.map(item => {
                return registrationsByDay[
                    affiliateDayKey(item.date)
                ] || 0;
            })
        });
    }

    if (AffiliateDashboard.filters.newDeposits) {
        series.push({
            name: "New Deposits",
            values: labels.map(item => {
                return depositsByDay[
                    affiliateDayKey(item.date)
                ] || 0;
            })
        });
    }

    if (AffiliateDashboard.filters.commissionAmount) {
        series.push({
            name: "Commission Amount",
            values: labels.map(item => {
                return commissionsByDay[
                    affiliateDayKey(item.date)
                ] || 0;
            })
        });
    }

    affiliateDrawLineChart(
        "registrationChart",
        series,
        labels.map(item => item.label)
    );
}


/* =========================================================
   18. STATE SUMMARY
========================================================= */

function affiliateGetSummaryRecords(period) {
    const range = affiliateGetPeriodRange(period);

    return AffiliateDashboard.commissions.filter(record => {
        return affiliateIsInRange(
            affiliateGetCommissionDate(record),
            range
        );
    });
}

function affiliateBuildSummaryRow(label, value) {
    const row = document.createElement("div");

    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.flexWrap = "wrap";
    row.style.gap = "12px";
    row.style.padding = "13px 5px";
    row.style.borderBottom = "1px solid #e1e9e2";

    const title = document.createElement("span");

    title.textContent = label;
    title.style.color = "#75847b";
    title.style.fontSize = "12px";
    title.style.fontWeight = "650";

    const amount = document.createElement("strong");

    amount.textContent = value;
    amount.style.color = "#063b2b";
    amount.style.fontSize = "14px";
    amount.style.fontWeight = "850";
    amount.style.overflowWrap = "anywhere";

    row.append(title, amount);

    return row;
}

function affiliateRenderStateSummary() {
    const container = affiliateElement("stateSummaryContent");

    if (!container) {
        return;
    }

    container.replaceChildren();

    const period = AffiliateDashboard.summaryPeriod;

    const records = affiliateGetSummaryRecords(period);

    const eligibleRecords = records.filter(
        affiliateIsEligibleCommission
    );

    const commissionTotal =
        affiliateSumCommissions(records);

    const pendingTotal = records
        .filter(record => {
            return affiliateNormalizeStatus(record.status) === "pending";
        })
        .reduce((total, record) => {
            return total + affiliateGetCommissionAmount(record);
        }, 0);

    const rejectedTotal = records
        .filter(record => {
            return affiliateNormalizeStatus(record.status) === "rejected";
        })
        .reduce((total, record) => {
            return total + affiliateGetCommissionAmount(record);
        }, 0);

    const periodRange = affiliateGetPeriodRange(period);

    const header = document.createElement("div");

    header.style.marginBottom = "12px";
    header.style.color = "#75847b";
    header.style.fontSize = "12px";

    header.textContent =
        `${affiliateFormatDate(periodRange.start)} – ` +
        `${affiliateFormatDate(periodRange.end)}`;

    container.appendChild(header);

    const summaryRows = [
        [
            "Approved Commission",
            affiliateFormatMoney(commissionTotal)
        ],
        [
            "Pending Commission",
            affiliateFormatMoney(pendingTotal)
        ],
        [
            "Rejected Commission",
            affiliateFormatMoney(rejectedTotal)
        ],
        [
            "Approved Commission Records",
            String(eligibleRecords.length)
        ],
        [
            "Total Commission Records",
            String(records.length)
        ]
    ];

    summaryRows.forEach(([label, value]) => {
        container.appendChild(
            affiliateBuildSummaryRow(label, value)
        );
    });

    if (records.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "summary-placeholder";
        emptyMessage.style.marginTop = "18px";

        emptyMessage.textContent =
            "No commission records were found for this period.";

        container.appendChild(emptyMessage);
    }
}


/* =========================================================
   19. RENDER ALL DASHBOARD SECTIONS
========================================================= */

function affiliateRenderAll() {
    affiliateRenderEarnings();

    affiliateRenderConversionChart();

    affiliateRenderRegistrationChart();

    affiliateRenderStateSummary();
}


/* =========================================================
   20. REFRESH BUTTON
========================================================= */

async function affiliateRefreshDashboard(
    showStatus = true
) {
    if (AffiliateDashboard.loading) {
        return;
    }

    const refreshButton =
        affiliateElement("refreshStatistics");

    AffiliateDashboard.loading = true;

    if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.textContent = "Refreshing...";
    }

    if (showStatus) {
        affiliateSetStatus(
            "Loading affiliate statistics..."
        );
    }

    try {
        await affiliateLoadSupabaseData();

        AffiliateDashboard.lastUpdated = new Date();

        affiliateRenderAll();

        if (showStatus) {
            affiliateSetStatus(
                "Statistics refreshed successfully at " +
                AffiliateDashboard.lastUpdated.toLocaleTimeString(),
                "success"
            );
        }
    } catch (error) {
        AffiliateDashboard.error = error;

        console.error(
            "Affiliate Dashboard Error:",
            error
        );

        if (showStatus) {
            affiliateSetStatus(
                error?.message ||
                "Unable to load affiliate statistics.",
                "error"
            );
        }

        /*
           Do not generate fake earnings if Supabase
           is unavailable. Keep existing data visible.
        */
    } finally {
        AffiliateDashboard.loading = false;

        if (refreshButton) {
            refreshButton.disabled = false;
            refreshButton.textContent = "Refresh Statistics";
        }
    }
}

function affiliateInitializeRefreshButton() {
    const button = affiliateElement("refreshStatistics");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        affiliateRefreshDashboard(true);
    });
}


/* =========================================================
   21. ACCOUNT BUTTON
========================================================= */

function affiliateInitializeAccountButton() {
    const button = document.querySelector(".profile-button");

    if (!button) {
        return;
    }

    button.addEventListener("click", () => {
        const accountLink = document.querySelector(
            '.navigation-menu a[href="#account"]'
        );

        if (accountLink) {
            accountLink.click();
            return;
        }

        const accountSection = affiliateElement("account");

        if (accountSection) {
            accountSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;
        }

        affiliateSetStatus(
            "The Account section has not been added to this HTML yet.",
            "info"
        );
    });
}


/* =========================================================
   22. RESPONSIVE CHART RESIZING
========================================================= */

let affiliateResizeTimeout = null;

window.addEventListener("resize", () => {
    clearTimeout(affiliateResizeTimeout);

    affiliateResizeTimeout = setTimeout(() => {
        affiliateRenderConversionChart();

        affiliateRenderRegistrationChart();
    }, 180);
});


/* =========================================================
   23. OPTIONAL BACKEND TRACKING ADAPTER
========================================================= */

/*
   If your backend provides actual click statistics,
   populate the adapter before refreshing.

   Example:

   window.affiliateDashboardTracking = {
       daily: [
           {
               date: "2026-10-14",
               clicks: 120,
               direct_clicks: 45
           }
       ]
   };

   These records must come from your actual tracking system.
*/

function affiliateLoadOptionalTrackingData() {
    const tracking = window.affiliateDashboardTracking;

    if (
        tracking &&
        (
            Array.isArray(tracking) ||
            Array.isArray(tracking.daily)
        )
    ) {
        AffiliateDashboard.trackingStatistics = tracking;
    } else {
        AffiliateDashboard.trackingStatistics = null;
    }
}


/* =========================================================
   24. INITIALIZE DASHBOARD
========================================================= */

function initializeAffiliateDashboard() {
    if (AffiliateDashboard.initialized) {
        return;
    }

    AffiliateDashboard.initialized = true;

    affiliateInitializeMenu();

    affiliateInitializeFilters();

    affiliateInitializePeriodSelectors();

    affiliateInitializeChartToggles();

    affiliateInitializeRefreshButton();

    affiliateInitializeAccountButton();

    affiliateLoadOptionalTrackingData();

    // Set initial date range.
    const interval = affiliateElement("timeInterval");

    if (interval) {
        AffiliateDashboard.timeInterval = interval.value;
    }

    const currency = affiliateElement("currencySelect");

    if (currency) {
        AffiliateDashboard.currency = currency.value;
    }

    const conversionPeriod =
        affiliateElement("conversionPeriod");

    if (conversionPeriod) {
        AffiliateDashboard.conversionPeriod =
            conversionPeriod.value;
    }

    const registrationPeriod =
        affiliateElement("registrationPeriod");

    if (registrationPeriod) {
        AffiliateDashboard.registrationPeriod =
            registrationPeriod.value;
    }

    const summaryPeriod =
        affiliateElement("summaryPeriod");

    if (summaryPeriod) {
        AffiliateDashboard.summaryPeriod =
            summaryPeriod.value;
    }

    const customRange = affiliateElement("customDateRange");

    if (customRange && interval) {
        customRange.hidden = interval.value !== "custom";
    }

    // Load actual data; no fake earnings are generated.
    affiliateRefreshDashboard(true);

    // Optional periodic refresh.
    if (AFFILIATE_CONFIG.refreshInterval > 0) {
        AffiliateDashboard.refreshTimer = setInterval(() => {
            affiliateRefreshDashboard(false);
        }, AFFILIATE_CONFIG.refreshInterval);
    }
}


/* =========================================================
   25. START
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



/* =====================================================
   STATE SUMMARY - ONLY
===================================================== */

(() => {
    "use strict";

    function initializeStateSummary() {
        const section = document.getElementById("stateSummary");

        if (!section || section.dataset.summaryInitialized === "true") {
            return;
        }

        const itemToggle = section.querySelector("#summaryItemToggle");
        const itemLabel = section.querySelector("#summaryItemLabel");
        const itemOptions = section.querySelector("#summaryItemOptions");
        const itemClose = section.querySelector("#summaryItemClose");
        const applyItemsButton = section.querySelector("#applySummaryItems");

        const periodSelect = section.querySelector("#summaryPeriod");
        const content = section.querySelector("#stateSummaryContent");

        const addButton = section.querySelector("#addSummaryRow");
        const addOptions = section.querySelector("#summaryAddOptions");
        const addCurrency = section.querySelector("#newSummaryCurrency");
        const addItem = section.querySelector("#newSummaryItem");
        const confirmAdd = section.querySelector("#confirmAddSummaryRow");
        const cancelAdd = section.querySelector("#cancelAddSummaryRow");

        if (
            !itemToggle ||
            !itemLabel ||
            !itemOptions ||
            !applyItemsButton ||
            !periodSelect ||
            !content ||
            !addButton ||
            !addOptions ||
            !addCurrency ||
            !addItem ||
            !confirmAdd ||
            !cancelAdd
        ) {
            return;
        }

        section.dataset.summaryInitialized = "true";

        const itemNames = {
            clicksCount: "Clicks Count",
            directLinkClicks: "Direct Link Clicks",
            registrations: "Registrations",
            newDeposits: "New Deposits",
            companyProfit: "Company Profit",
            rsCommission: "RS / Commission",
            cpa: "CPA",
            commissionAmount: "Commission Amount"
        };

        let nextRowId = 1;

        // Rows created by the plus button are kept separate
        // from rows generated by Item Selected.
        const addedRows = [];

        function getSelectedItems() {
            return Array.from(
                itemOptions.querySelectorAll(
                    'input[name="summaryItems"]:checked'
                )
            ).map(input => input.value);
        }

        function updateItemLabel() {
            const selected = getSelectedItems();

            if (selected.length === 0) {
                itemLabel.textContent = "Choose Items";
            } else if (selected.length === 1) {
                itemLabel.textContent = itemNames[selected[0]] || "1 Item Selected";
            } else {
                itemLabel.textContent = `${selected.length} Items Selected`;
            }
        }

        function closeItemOptions() {
            itemOptions.hidden = true;
            itemToggle.setAttribute("aria-expanded", "false");
        }

        function openItemOptions() {
            addOptions.hidden = true;
            addButton.setAttribute("aria-expanded", "false");

            itemOptions.hidden = false;
            itemToggle.setAttribute("aria-expanded", "true");
        }

        function closeAddOptions() {
            addOptions.hidden = true;
            addButton.setAttribute("aria-expanded", "false");
        }

        function openAddOptions() {
            closeItemOptions();

            addOptions.hidden = false;
            addButton.setAttribute("aria-expanded", "true");
        }

        function createRow(itemKey, currency, source, rowId) {
            const row = document.createElement("div");
            row.className = "summary-data-row";
            row.dataset.summaryRow = source;
            row.dataset.itemKey = itemKey;

            if (rowId !== undefined) {
                row.dataset.rowId = String(rowId);
            }

            const currencyCell = document.createElement("div");
            currencyCell.className = "summary-row-currency";

            const currencyCode = document.createElement("span");
            currencyCode.className = "currency-code";
            currencyCode.textContent = currency;

            const itemName = document.createElement("span");
            itemName.className = "summary-row-item";
            itemName.textContent = itemNames[itemKey] || itemKey;

            currencyCell.append(currencyCode, itemName);

            const viewCell = document.createElement("div");
            viewCell.className = "summary-row-view";

            const value = document.createElement("span");
            value.className = "summary-value";
            value.textContent = "0";
            value.setAttribute("aria-label", `${itemNames[itemKey] || itemKey}: 0`);

            viewCell.appendChild(value);

            if (source === "added") {
                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "summary-row-remove";
                removeButton.textContent = "×";
                removeButton.setAttribute(
                    "aria-label",
                    `Remove ${itemNames[itemKey] || itemKey} row`
                );

                removeButton.addEventListener("click", () => {
                    const index = addedRows.findIndex(
                        savedRow => savedRow.id === rowId
                    );

                    if (index !== -1) {
                        addedRows.splice(index, 1);
                    }

                    row.remove();
                    updateEmptyState();
                });

                viewCell.appendChild(removeButton);
            }

            row.append(currencyCell, viewCell);

            return row;
        }

        function updateEmptyState() {
            const rows = content.querySelectorAll(".summary-data-row");
            const existingMessage = content.querySelector(".summary-empty");

            if (rows.length === 0 && !existingMessage) {
                const message = document.createElement("p");
                message.className = "summary-empty";
                message.textContent =
                    "No summary items selected. Choose items above or add a row.";

                content.appendChild(message);
            } else if (rows.length > 0 && existingMessage) {
                existingMessage.remove();
            }
        }

        function renderRows() {
            // Replace only the summary rows, not the table header.
            content.replaceChildren();

            const selectedItems = getSelectedItems();

            selectedItems.forEach(itemKey => {
                content.appendChild(
                    createRow(itemKey, "USD", "selected")
                );
            });

            addedRows.forEach(savedRow => {
                content.appendChild(
                    createRow(
                        savedRow.itemKey,
                        savedRow.currency,
                        "added",
                        savedRow.id
                    )
                );
            });

            updateEmptyState();
        }

        // Item Selected opens only when its own button is clicked.
        itemToggle.addEventListener("click", () => {
            if (itemOptions.hidden) {
                openItemOptions();
            } else {
                closeItemOptions();
            }
        });

        if (itemClose) {
            itemClose.addEventListener("click", closeItemOptions);
        }

        // Selecting checkboxes does not open/close the dropdown.
        itemOptions
            .querySelectorAll('input[name="summaryItems"]')
            .forEach(input => {
                input.addEventListener("change", updateItemLabel);
            });

        applyItemsButton.addEventListener("click", () => {
            updateItemLabel();
            renderRows();
            closeItemOptions();
        });

        // Weekly / Monthly only changes the selected period.
        // It does not open either dropdown.
        periodSelect.addEventListener("change", () => {
            section.dataset.selectedPeriod = periodSelect.value;
        });

        // The plus button alone opens the add-row options.
        addButton.addEventListener("click", () => {
            if (addOptions.hidden) {
                openAddOptions();
            } else {
                closeAddOptions();
            }
        });

        confirmAdd.addEventListener("click", () => {
            const itemKey = addItem.value;
            const currency = addCurrency.value;

            if (!itemNames[itemKey] || !currency) {
                return;
            }

            // Prevent adding an identical item/currency twice.
            const alreadyExists = addedRows.some(row =>
                row.itemKey === itemKey &&
                row.currency === currency
            );

            if (alreadyExists) {
                let feedback = addOptions.querySelector(".summary-feedback");

                if (!feedback) {
                    feedback = document.createElement("p");
                    feedback.className = "summary-feedback";
                    feedback.setAttribute("role", "status");
                    addOptions.appendChild(feedback);
                }

                feedback.textContent =
                    "This summary item and currency have already been added.";

                return;
            }

            addedRows.push({
                id: nextRowId++,
                itemKey,
                currency
            });

            renderRows();
            closeAddOptions();

            const feedback = addOptions.querySelector(".summary-feedback");
            if (feedback) {
                feedback.remove();
            }
        });

        cancelAdd.addEventListener("click", closeAddOptions);

        // Close open panels when clicking outside State Summary.
        document.addEventListener("click", event => {
            if (!section.contains(event.target)) {
                closeItemOptions();
                closeAddOptions();
            }
        });

        // Escape closes the open panel.
        section.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeItemOptions();
                closeAddOptions();
            }
        });

        updateItemLabel();
        renderRows();

        section.dataset.selectedPeriod = periodSelect.value;
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeStateSummary,
            { once: true }
        );
    } else {
        initializeStateSummary();
    }
})();


/* =========================================
   STATE SUMMARY - EXPAND / MINIMIZE
   ========================================= */

(() => {
    function initializeSummaryToggle() {
        const toggleButton = document.getElementById("summaryDataToggle");
        const toggleIcon = document.getElementById("summaryDataToggleIcon");
        const toggleText = document.getElementById("summaryDataToggleText");
        const summaryTable = document.getElementById("stateSummaryTable");

        if (
            !toggleButton ||
            !toggleIcon ||
            !toggleText ||
            !summaryTable ||
            toggleButton.dataset.initialized === "true"
        ) {
            return;
        }

        toggleButton.dataset.initialized = "true";

        // Keep summary data hidden when the page first loads.
        summaryTable.hidden = true;
        toggleButton.setAttribute("aria-expanded", "false");

        toggleButton.addEventListener("click", () => {
            const isExpanded =
                toggleButton.getAttribute("aria-expanded") === "true";

            const shouldExpand = !isExpanded;

            summaryTable.hidden = !shouldExpand;
            toggleButton.setAttribute(
                "aria-expanded",
                String(shouldExpand)
            );

            toggleIcon.textContent = shouldExpand ? "−" : "+";
            toggleText.textContent = shouldExpand
                ? "Minimize Summary"
                : "Show Summary Data";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeSummaryToggle,
            { once: true }
        );
    } else {
        initializeSummaryToggle();
    }
})();


/* =========================================
   COMMISSION STRUCTURE - DASHBOARD
========================================= */

(function () {
    "use strict";

    const commissionSection = document.getElementById(
        "commissionStructureSection"
    );

    const commissionMenu = document.getElementById(
        "commissionStructureMenu"
    );

    if (!commissionSection || !commissionMenu) {
        console.warn(
            "Commission Structure: section or menu button not found."
        );
        return;
    }

    // Prevent duplicate event listeners.
    if (commissionSection.dataset.navigationInitialized === "true") {
        return;
    }

    commissionSection.dataset.navigationInitialized = "true";

    /*
     * Open Commission Structure.
     * Keep the existing HTML and Supabase connection unchanged.
     */
    commissionMenu.addEventListener("click", function (event) {
        event.preventDefault();

        // Hide other main dashboard sections.
        document.querySelectorAll(
            "main > section, .dashboard-section"
        ).forEach(function (section) {
            if (section !== commissionSection) {
                section.hidden = true;
            }
        });

        // Show Commission Structure.
        commissionSection.hidden = false;
        commissionSection.style.display = "";

        // Update navigation state.
        document.querySelectorAll(
            ".navigation-menu-button"
        ).forEach(function (button) {
            button.classList.remove("active");
            button.setAttribute("aria-expanded", "false");
        });

        commissionMenu.classList.add("active");
        commissionMenu.setAttribute("aria-expanded", "true");
    });
})();
    /*
     * Find Dashboard sections without changing
     * the existing HTML or Supabase connection.
     */
    function getDashboardSections() {
        const selectors = [
            "#mainDashboard",
            "#website",
            "#paymentHistory",
            "#account",
            "#contact",
            "#affiliateLink",
            "#promoCode",
            "#media",
            "#conversionStatistics",
            "#fullReport",
            "#marketingTools",
            "#playerReport",
            "#subAffiliateReport"
        ];

        return selectors
            .map(function (selector) {
                return document.querySelector(selector);
            })
            .filter(function (element, index, array) {
                return element &&
                    element !== commissionSection &&
                    array.indexOf(element) === index;
            });
    }

    // Show only the requested dashboard section.
    function showDashboardSection(targetSection) {
        const sections = getDashboardSections();

        sections.forEach(function (section) {
            section.hidden = section !== targetSection;
        });

        commissionSection.hidden =
            targetSection !== commissionSection;
    }

    // Open Commission Structure inside the same Dashboard.
    commissionMenu.addEventListener("click", function (event) {
        event.preventDefault();

        showDashboardSection(commissionSection);
    });

    // Handle Main Page navigation.
    const mainPageLink = document.querySelector(
        '#navigationMenu a[href="#mainDashboard"]'
    );

    if (mainPageLink) {
        mainPageLink.addEventListener("click", function (event) {
            const mainDashboard = document.getElementById(
                "mainDashboard"
            );

            if (!mainDashboard) {
                return;
            }

            event.preventDefault();
            showDashboardSection(mainDashboard);
        });
    }

    /*
     * Commission details interactions
     */
    const referralOption = commissionSection.querySelector(
        "#referralOption"
    );

    const revenueOption = commissionSection.querySelector(
        "#revenueOption"
    );

    const detailsPanel = commissionSection.querySelector(
        "#commissionDetails"
    );

    const detailsTitle = commissionSection.querySelector(
        "#detailsTitle"
    );

    const detailsCaption = commissionSection.querySelector(
        "#detailsCaption"
    );

    const detailsContent = commissionSection.querySelector(
        "#detailsContent"
    );

    const referralContent = commissionSection.querySelector(
        "#referralContent"
    );

    const revenueContent = commissionSection.querySelector(
        "#revenueContent"
    );

    const toggleDetails = commissionSection.querySelector(
        "#toggleDetails"
    );

    if (
        !referralOption ||
        !revenueOption ||
        !detailsPanel ||
        !detailsTitle ||
        !detailsCaption ||
        !detailsContent ||
        !referralContent ||
        !revenueContent ||
        !toggleDetails
    ) {
        console.warn(
            "Commission Structure: one or more detail elements are missing."
        );
        return;
    }

    let selectedType = "referral";

    function selectCommission(type) {
        selectedType = type;

        const isReferral = type === "referral";

        referralOption.classList.toggle("active", isReferral);
        revenueOption.classList.toggle("active", !isReferral);

        detailsTitle.textContent = isReferral
            ? "Referral Commission"
            : "Revenue Share";

        detailsCaption.textContent = isReferral
            ? "Your referral commission configuration"
            : "Your revenue share commission configuration";

        referralContent.hidden = !isReferral;
        revenueContent.hidden = isReferral;

        detailsPanel.hidden = false;
        detailsContent.hidden = false;

        toggleDetails.textContent = "−";

        toggleDetails.setAttribute(
            "aria-expanded",
            "true"
        );

        toggleDetails.setAttribute(
            "aria-label",
            "Minimize commission details"
        );

        referralOption.setAttribute(
            "aria-expanded",
            String(isReferral)
        );

        revenueOption.setAttribute(
            "aria-expanded",
            String(!isReferral)
        );
    }

    referralOption.addEventListener("click", function () {
        selectCommission("referral");
    });

    revenueOption.addEventListener("click", function () {
        selectCommission("revenue");
    });

    // Expand / minimize commission details.
    toggleDetails.addEventListener("click", function () {
        const willCollapse = !detailsContent.hidden;

        detailsContent.hidden = willCollapse;

        toggleDetails.textContent = willCollapse ? "+" : "−";

        toggleDetails.setAttribute(
            "aria-expanded",
            String(!willCollapse)
        );

        toggleDetails.setAttribute(
            "aria-label",
            willCollapse
                ? "Expand commission details"
                : "Minimize commission details"
        );

        referralOption.setAttribute(
            "aria-expanded",
            String(
                selectedType === "referral" && !willCollapse
            )
        );

        revenueOption.setAttribute(
            "aria-expanded",
            String(
                selectedType === "revenue" && !willCollapse
            )
        );
    });

    // Set initial commission type.
    selectCommission("referral");

})();



