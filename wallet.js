// ==========================================
// WALLET.JS
// CENTRAL WALLET MANAGER
// SUPABASE WALLET VERSION
// ==========================================

console.log("WALLET.JS LOADED");


// ==========================================
// WALLET MANAGER
// ==========================================

const WALLET_CURRENCIES = [
    "USDT",
    "BTC",
    "ETH",
    "SOL",
    "XRP",
    "LTC",
    "BCH",
    "ZEC",
    "XMR",
    "DASH",
    "DOGE",
    "TRX",
    "GRAM",
    "ADA",
    "BNB",
    "LINK",
    "XLM",
    "SUI",
    "QNT",
    "SHIB"
];

const walletManager = {

    balances: {

        USDT: 0,
        BTC: 0,
        ETH: 0,
        SOL: 0,
        XRP: 0,
        LTC: 0,
        BCH: 0,
        ZEC: 0,
        XMR: 0,
        DASH: 0,
        DOGE: 0,
        TRX: 0,
        GRAM: 0,
        ADA: 0,
        BNB: 0,
        LINK: 0,
        XLM: 0,
        SUI: 0,
        QNT: 0,
        SHIB: 0

    },

    currentCurrency: "USDT",

    activeBets: [],

    betHistory: []

};
// ==========================================
// LOAD WALLET
// ==========================================

async function loadWalletManager(){

    // ==========================================
    // SELECTED CURRENCY
    // ==========================================

    const savedCurrency =
        localStorage.getItem("selectedCurrency");

    if(savedCurrency && WALLET_CURRENCIES.includes(savedCurrency)){

        walletManager.currentCurrency =
            savedCurrency;

    }


    // ==========================================
    // ACTIVE BETS
    // ==========================================

    const savedActiveBets =
        localStorage.getItem("activeBets");

    if(savedActiveBets){

        try{

            walletManager.activeBets =
                JSON.parse(savedActiveBets);

        }catch(e){

            walletManager.activeBets = [];

        }

    }


    // ==========================================
    // BET HISTORY
    // ==========================================

    const savedBetHistory =
        localStorage.getItem("betHistory");

    if(savedBetHistory){

        try{

            walletManager.betHistory =
                JSON.parse(savedBetHistory);

        }catch(e){

            walletManager.betHistory = [];

        }

    }


    // ==========================================
    // GET LOGGED-IN USER ID
    // ==========================================

    const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("userID") ||
        localStorage.getItem("user_id");


    if(!userId){

        console.log(
            "⚠️ Wallet: User ID not found."
        );

        updateBalanceUI();
        updateWalletDropdown();

        return;

    }


    // ==========================================
    // LOAD ONE WALLET ROW
    // ==========================================

    try{

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("wallet_balances")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();


        if(error){

            console.error(
                "❌ Wallet Load Error:",
                error
            );

            return;

        }


        // ==========================================
        // RESET ALL BALANCES
        // ==========================================

        WALLET_CURRENCIES.forEach(currency => {

            walletManager.balances[currency] = 0;

        });


        // ==========================================
        // LOAD CURRENCY COLUMNS
        // ==========================================

        if(data){

            WALLET_CURRENCIES.forEach(currency => {

                const columnName =
                    currency.toLowerCase();

                walletManager.balances[currency] =
                    Number(data[columnName]) || 0;

            });

        }


        // ==========================================
        // UPDATE UI
        // ==========================================

        updateBalanceUI();

        updateWalletDropdown();

        if(typeof updateSlipBalance === "function"){

            updateSlipBalance();

        }


        console.log(
            "✅ Wallet Loaded:",
            walletManager.balances
        );


    }catch(error){

        console.error(
            "❌ Wallet System Error:",
            error
        );

    }

}


// ==========================================
// UPDATE BALANCE UI
// ==========================================

function updateBalanceUI(){

    const balance =
        getCurrentBalance();


    // ======================================
    // Common balance selectors
    // ======================================

    document
        .querySelectorAll(
            "#wallet-balance, " +
            ".wallet-balance, " +
            ".header-balance, " +
            "[data-wallet-balance]"
        )
        .forEach(element => {

            element.textContent =
                Number(balance || 0)
                    .toFixed(8);

        });


    // ======================================
    // Current currency labels
    // ======================================

    document
        .querySelectorAll(
            "#wallet-currency, " +
            ".wallet-currency, " +
            "[data-wallet-currency]"
        )
        .forEach(element => {

            element.textContent =
                walletManager.currentCurrency;

        });

}


// ==========================================
// SAVE WALLET
// ==========================================

function saveWalletManager(){

    // ======================================
    // Selected Currency
    // ======================================

    localStorage.setItem(
        "selectedCurrency",
        walletManager.currentCurrency
    );


    // ======================================
    // Active Bets
    // ======================================

    localStorage.setItem(
        "activeBets",
        JSON.stringify(
            walletManager.activeBets
        )
    );


    // ======================================
    // Bet History
    // ======================================

    localStorage.setItem(
        "betHistory",
        JSON.stringify(
            walletManager.betHistory
        )
    );

}


// ==========================================
// GET CURRENT BALANCE
// ==========================================

function getCurrentBalance(){

    const balance =
        walletManager.balances[
            walletManager.currentCurrency
        ];


    return Number(
        balance || 0
    );

}


// ==========================================
// SET CURRENT BALANCE
// ==========================================

async function setCurrentBalance(amount){

    const currency =
        walletManager.currentCurrency;

    const userId =
        localStorage.getItem("userId") ||
        localStorage.getItem("userID") ||
        localStorage.getItem("user_id");


    if(!userId){

        console.error(
            "❌ Cannot update wallet: User ID not found."
        );

        return;

    }


    if(!WALLET_CURRENCIES.includes(currency)){

        console.error(
            "❌ Invalid wallet currency:",
            currency
        );

        return;

    }


    const numericAmount =
        Number(amount);


    if(!Number.isFinite(numericAmount)){

        console.error(
            "❌ Invalid wallet amount:",
            amount
        );

        return;

    }


    // ==========================================
    // UPDATE LOCAL WALLET STATE
    // ==========================================

    walletManager.balances[currency] =
        numericAmount;


    saveWalletManager();


    // ==========================================
    // UPDATE UI
    // ==========================================

    updateBalanceUI();

    updateWalletDropdown();

    if(typeof updateSlipBalance === "function"){

        updateSlipBalance();

    }


    // ==========================================
    // UPDATE SUPABASE COLUMN
    // ==========================================

    const columnName =
        currency.toLowerCase();

    const updateData = {};

    updateData[columnName] =
        numericAmount;


    const {
        error
    } =
        await window.supabaseClient
            .from("wallet_balances")
            .update(updateData)
            .eq("user_id", userId);


    if(error){

        console.error(
            "❌ Wallet Balance Update Error:",
            error
        );

        return;

    }


    console.log(
        `✅ ${currency} balance updated:`,
        numericAmount
    );

}


// ==========================================
// SELECT CURRENCY
// ==========================================

function selectCurrency(name, image, el){

    // ======================================
    // Current Currency
    // ======================================

    walletManager.currentCurrency =
        name;


    // ======================================
    // Save Currency
    // ======================================

    localStorage.setItem(
        "selectedCurrency",
        name
    );


    localStorage.setItem(
        "selectedCurrencyImage",
        image
    );


    // ======================================
    // Header Image
    // ======================================

    const img =
        document.getElementById(
            "selected-currency-img"
        );


    if(img){

        img.src =
            image;

    }


    // ======================================
    // Remove Old Selected
    // ======================================

    document
        .querySelectorAll(
            ".currency-option"
        )
        .forEach(item => {

            item.classList.remove(
                "selected"
            );

        });


    // ======================================
    // Add Selected
    // ======================================

    if(el){

        el.classList.add(
            "selected"
        );

    }


    // ======================================
    // Save Existing Wallet State
    // ======================================

    saveWalletManager();


    // ======================================
    // Refresh Balance
    // ======================================

    updateBalanceUI();

    updateWalletDropdown();

    updateSlipBalance();


    // ======================================
    // Close Dropdown
    // ======================================

    if(
        typeof headerDropdownMenu ===
        "function"
    ){

        headerDropdownMenu(
            "currency-menu"
        );

    }

}


window.selectCurrency =
    selectCurrency;


// ==========================================
// UPDATE WALLET DROPDOWN
// ==========================================

function updateWalletDropdown(){

    document
        .querySelectorAll(".currency-option")
        .forEach(option => {

            const nameElement =
                option.querySelector(".name");

            const balanceElement =
                option.querySelector(".balance");

            if(!nameElement || !balanceElement){

                return;

            }

            const currency =
                nameElement.textContent
                    .trim()
                    .toUpperCase();


            if(
                WALLET_CURRENCIES.includes(currency)
            ){

                const amount =
                    Number(
                        walletManager.balances[currency]
                    ) || 0;


                balanceElement.textContent =
                    amount.toFixed(8);

            }

        });

}


window.updateWalletDropdown =
    updateWalletDropdown;


// ==========================================
// GLOBAL
// ==========================================

window.walletManager =
    walletManager;

window.loadWalletManager =
    loadWalletManager;

window.saveWalletManager =
    saveWalletManager;

window.getCurrentBalance =
    getCurrentBalance;

window.setCurrentBalance =
    setCurrentBalance;


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadWalletManager();

    }
);


window.testWallet =
    "OK";
