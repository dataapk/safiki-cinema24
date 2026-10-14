
console.log("WALLET.JS LOADED");

// ==========================================
// WALLET CURRENCIES
// ==========================================

const WALLET_CURRENCIES = [
    "USDT", "BTC", "ETH", "SOL", "XRP",
    "LTC", "BCH", "ZEC", "XMR", "DASH",
    "DOGE", "TRX", "GRAM", "ADA", "BNB",
    "LINK", "XLM", "SUI", "QNT", "SHIB"
];

// ==========================================
// WALLET SETTINGS
// ==========================================

// Betting integration stays disabled during wallet testing.
// The betting script must also respect this flag.
window.WALLET_BETTING_ENABLED = false;

const WALLET_REFRESH_INTERVAL = 15000;

const walletManager = {
    balances: {},
    currentCurrency: "USDT",
    activeBets: [],
    betHistory: [],
    userId: null,
    lastUpdatedAt: null,
    realtimeChannel: null,
    refreshTimer: null,
    loading: false
};

WALLET_CURRENCIES.forEach(currency => {
    walletManager.balances[currency] = 0;
});

// ==========================================
// GET EXISTING APP USER ID
// ==========================================

function getWalletAppUserId() {
    const directKeys = [
        "userId",
        "userID",
        "user_id"
    ];

    // First check the existing direct storage keys.
    for (const key of directKeys) {
        const value = localStorage.getItem(key);

        if (value && value.trim()) {
            return value.trim();
        }
    }

    // Check common existing user-data storage keys.
    const objectKeys = [
        "user_data",
        "userData",
        "currentUser",
        "current_user",
        "loggedInUser",
        "userProfile",
        "user_profile"
    ];

    const possibleIdFields = [
        "user_id",
        "userId",
        "userID",
        "app_user_id",
        "appUserId"
    ];

    for (const key of objectKeys) {
        const rawValue = localStorage.getItem(key);

        if (!rawValue) continue;

        try {
            const parsed = JSON.parse(rawValue);

            if (!parsed || typeof parsed !== "object") {
                continue;
            }

            for (const field of possibleIdFields) {
                const value = parsed[field];

                if (
                    typeof value === "string" &&
                    value.trim()
                ) {
                    return value.trim();
                }
            }
        } catch (error) {
            // Ignore storage entries that are not JSON.
        }
    }

    // Do not generate an ID or use another user's ID.
    return null;
}

// ==========================================
// LOAD SAVED WALLET PREFERENCES
// ==========================================

function loadWalletPreferences() {
    const savedCurrency =
        localStorage.getItem("selectedCurrency");

    if (
        savedCurrency &&
        WALLET_CURRENCIES.includes(savedCurrency)
    ) {
        walletManager.currentCurrency = savedCurrency;
    }

    try {
        const savedActiveBets =
            localStorage.getItem("activeBets");

        walletManager.activeBets =
            savedActiveBets ? JSON.parse(savedActiveBets) : [];

        const savedBetHistory =
            localStorage.getItem("betHistory");

        walletManager.betHistory =
            savedBetHistory ? JSON.parse(savedBetHistory) : [];

        if (!Array.isArray(walletManager.activeBets)) {
            walletManager.activeBets = [];
        }

        if (!Array.isArray(walletManager.betHistory)) {
            walletManager.betHistory = [];
        }

    } catch (error) {
        walletManager.activeBets = [];
        walletManager.betHistory = [];
    }
}

// ==========================================
// LOAD LATEST BALANCE FROM SUPABASE
// ==========================================

async function loadWalletManager() {
    console.log("WALLET LOAD STARTED");
    if (walletManager.loading) return;

    walletManager.loading = true;

    try {
        loadWalletPreferences();

        const userId = getWalletAppUserId();

        if (!userId) {
            console.warn(
                "Wallet: App User ID not found. " +
                "Check the existing login/user-data storage."
            );

            updateBalanceUI();
            updateWalletDropdown();
            return;
        }

        walletManager.userId = userId;

        if (!window.supabaseClient) {
            console.error(
                "Wallet: Supabase client not found."
            );
            return;
        }

                console.log("WALLET USER ID:", userId);
        console.log("SUPABASE CLIENT:", !!window.supabaseClient);

        console.log("WALLET QUERY START", {
            userId,
            supabaseReady: !!window.supabaseClient
        });

        const {
            data,
            error
        } = await window.supabaseClient
            .from("wallet_balances")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

        console.log("WALLET QUERY RESULT", {
            data,
            error
        });

        if (error) {
            console.error("Wallet Load Error:", error);
            return;
        }

        if (!data) {
            console.warn(
                "Wallet row not found for App User ID:",
                userId
            );

            // Do not silently replace an existing UI balance
            // with zero when the requested row is missing.
            return;
        }

        // Update local state only after successful retrieval.
        WALLET_CURRENCIES.forEach(currency => {
            const columnName = currency.toLowerCase();

            walletManager.balances[currency] =
                Number(data[columnName]) || 0;
        });

        walletManager.lastUpdatedAt =
            data.updated_at || new Date().toISOString();

        updateBalanceUI();
        updateWalletDropdown();

        console.log("Wallet loaded successfully:", {
            userId,
            balances: walletManager.balances,
            lastUpdatedAt: walletManager.lastUpdatedAt
        });

    } catch (error) {
        console.error("Wallet System Error:", error);
    } finally {
        walletManager.loading = false;
    }
}

// ==========================================
// REFRESH LATEST BALANCE
// ==========================================

function startWalletAutoRefresh() {
    if (walletManager.refreshTimer) {
        clearInterval(walletManager.refreshTimer);
    }

    walletManager.refreshTimer = setInterval(() => {
        loadWalletManager();
    }, WALLET_REFRESH_INTERVAL);
}

// ==========================================
// SUPABASE REALTIME LISTENER
// ==========================================

function startWalletRealtime() {
    const userId =
        walletManager.userId || getWalletAppUserId();

    if (!userId || !window.supabaseClient) {
        return;
    }

    if (walletManager.realtimeChannel) {
        window.supabaseClient.removeChannel(
            walletManager.realtimeChannel
        );

        walletManager.realtimeChannel = null;
    }

    walletManager.realtimeChannel =
        window.supabaseClient
            .channel("wallet-balance-" + userId)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "wallet_balances",
                    filter: "user_id=eq." + userId
                },
                () => {
                    console.log(
                        "Wallet balance changed in Supabase."
                    );

                    loadWalletManager();
                }
            )
            .subscribe(status => {
                console.log(
                    "Wallet Realtime status:",
                    status
                );
            });
}

// ==========================================
// UPDATE MAIN UI BALANCE
// ==========================================

function updateBalanceUI() {
    const balance = getCurrentBalance();

    const balanceText =
        walletManager.currentCurrency === "USDT"
            ? balance.toFixed(2)
            : balance.toFixed(8);

    document.querySelectorAll(
        "#wallet-balance, " +
        ".wallet-balance, " +
        ".header-balance, " +
        "[data-wallet-balance], " +
        "#selected-balance"
    ).forEach(element => {
        element.textContent = balanceText;
    });

    document.querySelectorAll(
        "#wallet-currency, " +
        ".wallet-currency, " +
        "[data-wallet-currency]"
    ).forEach(element => {
        element.textContent =
            walletManager.currentCurrency;
    });
}

// ==========================================
// SAVE WALLET PREFERENCES
// ==========================================

function saveWalletManager() {
    localStorage.setItem(
        "selectedCurrency",
        walletManager.currentCurrency
    );

    localStorage.setItem(
        "activeBets",
        JSON.stringify(walletManager.activeBets)
    );

    localStorage.setItem(
        "betHistory",
        JSON.stringify(walletManager.betHistory)
    );
}

// ==========================================
// GET CURRENT CURRENCY BALANCE
// ==========================================

function getCurrentBalance() {
    return Number(
        walletManager.balances[
            walletManager.currentCurrency
        ] || 0
    );
}

// ==========================================
// SET CURRENT BALANCE
// Use only for controlled testing for now.
// Do not use this as the final betting debit flow.
// ==========================================

async function setCurrentBalance(amount) {
    const userId =
        walletManager.userId || getWalletAppUserId();

    const currency = walletManager.currentCurrency;
    const numericAmount = Number(amount);

    if (!userId) {
        console.error("Cannot update wallet: User ID not found.");
        return false;
    }

    if (!WALLET_CURRENCIES.includes(currency)) {
        console.error("Invalid wallet currency:", currency);
        return false;
    }

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        console.error("Invalid wallet amount:", amount);
        return false;
    }

    if (!window.supabaseClient) {
        console.error("Supabase client not found.");
        return false;
    }

    // Save to Supabase first; update the UI only on success.
    const columnName = currency.toLowerCase();

    const updateData = {
        [columnName]: numericAmount
    };

    const { error } = await window.supabaseClient
        .from("wallet_balances")
        .update(updateData)
        .eq("user_id", userId);

    if (error) {
        console.error("Wallet Balance Update Error:", error);
        return false;
    }

    await loadWalletManager();

    console.log(
        `${currency} balance update requested:`,
        numericAmount
    );

    return true;
}

// ==========================================
// SELECT CURRENCY
// ==========================================

function selectCurrency(name, image, el) {
    if (!WALLET_CURRENCIES.includes(name)) {
        console.error("Invalid wallet currency:", name);
        return;
    }

    walletManager.currentCurrency = name;

    localStorage.setItem("selectedCurrency", name);

    if (image) {
        localStorage.setItem("selectedCurrencyImage", image);
    }

    const img = document.getElementById(
        "selected-currency-img"
    );

    if (img && image) {
        img.src = image;
    }

    document.querySelectorAll(".currency-option").forEach(item => {
        item.classList.remove("selected");
    });

    if (el) {
        el.classList.add("selected");
    }

    saveWalletManager();
    updateBalanceUI();
    updateWalletDropdown();

    if (typeof headerDropdownMenu === "function") {
        headerDropdownMenu("currency-menu");
    }
}

window.selectCurrency = selectCurrency;

// ==========================================
// UPDATE CURRENCY DROPDOWN BALANCES
// ==========================================

function updateWalletDropdown() {
    document.querySelectorAll(".currency-option").forEach(option => {
        const nameElement = option.querySelector(".name");
        const balanceElement = option.querySelector(".balance");

        if (!nameElement || !balanceElement) return;

        const currency =
            nameElement.textContent.trim().toUpperCase();

        if (!WALLET_CURRENCIES.includes(currency)) return;

        const amount =
            Number(walletManager.balances[currency]) || 0;

        balanceElement.textContent =
            currency === "USDT"
                ? amount.toFixed(2)
                : amount.toFixed(8);
    });
}

window.updateWalletDropdown = updateWalletDropdown;

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.walletManager = walletManager;
window.loadWalletManager = loadWalletManager;
window.saveWalletManager = saveWalletManager;
window.getCurrentBalance = getCurrentBalance;
window.setCurrentBalance = setCurrentBalance;
window.getWalletAppUserId = getWalletAppUserId;

// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async function() {
    await loadWalletManager();

    startWalletAutoRefresh();
    startWalletRealtime();
});

window.testWallet = "OK";
