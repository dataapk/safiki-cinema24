// ==========================================
// WALLET.JS
// CENTRAL WALLET MANAGER
// SUPABASE WALLET VERSION
// ==========================================

console.log("WALLET.JS LOADED");


// ==========================================
// WALLET MANAGER
// ==========================================

const walletManager = {

    // ======================================
    // REAL USER BALANCES
    // Loaded from Supabase
    // ======================================

    balances: {
        USDT: 0,
        BTC: 0,
        ETH: 0,
        DOGE: 0,
        TRX: 0,
        SOL: 0,
        LTC: 0
    },

    currentCurrency: "USDT",

    activeBets: [],

    betHistory: []

};


// ==========================================
// LOAD WALLET
// ==========================================

async function loadWalletManager(){

    // ======================================
    // RESTORE SELECTED CURRENCY
    // ======================================

    const savedCurrency =
        localStorage.getItem(
            "selectedCurrency"
        );

    if(savedCurrency){

        walletManager.currentCurrency =
            savedCurrency;

    }


    // ======================================
    // LOAD ACTIVE BETS
    // ======================================

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


    // ======================================
    // LOAD BET HISTORY
    // ======================================

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


    // ======================================
    // LOAD REAL BALANCE FROM SUPABASE
    // ======================================

    if(
        !window.supabaseClient
    ){

        console.warn(
            "⚠️ Supabase client not available yet."
        );

        updateBalanceUI();
        updateWalletDropdown();
        updateSlipBalance();

        return;

    }


    try{

        // ==================================
        // GET CURRENT AUTH USER
        // ==================================

        const {
            data: userData,
            error: userError
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if(
            userError ||
            !userData ||
            !userData.user
        ){

            console.log(
                "ℹ️ No logged-in user. Wallet balance remains zero."
            );

            updateBalanceUI();
            updateWalletDropdown();
            updateSlipBalance();

            return;

        }


        const user =
            userData.user;


        // ==================================
        // GET USER WALLET BALANCES
        // ==================================

        const {
            data: walletData,
            error: walletError
        } =
            await window.supabaseClient
                .from("wallet_balances")
                .select(
                    "currency, balance"
                )
                .eq(
                    "user_id",
                    user.id
                );


        if(walletError){

            console.error(
                "❌ Wallet Load Error:",
                walletError
            );

            updateBalanceUI();
            updateWalletDropdown();
            updateSlipBalance();

            return;

        }


        // ==================================
        // RESET LOCAL BALANCES
        // ==================================

        walletManager.balances = {

            USDT: 0,
            BTC: 0,
            ETH: 0,
            DOGE: 0,
            TRX: 0,
            SOL: 0,
            LTC: 0

        };


        // ==================================
        // APPLY SUPABASE BALANCES
        // ==================================

        if(
            Array.isArray(walletData)
        ){

            walletData.forEach(row => {

                const currency =
                    String(
                        row.currency || ""
                    ).toUpperCase();

                const balance =
                    Number(
                        row.balance || 0
                    );


                if(
                    walletManager.balances
                    .hasOwnProperty(currency)
                ){

                    walletManager.balances[
                        currency
                    ] = balance;

                }

            });

        }


        console.log(
            "✅ Wallet balances loaded:",
            walletManager.balances
        );


    }catch(error){

        console.error(
            "❌ Wallet Load Failed:",
            error
        );

    }


    // ======================================
    // REFRESH UI
    // ======================================

    updateBalanceUI();

    updateWalletDropdown();

    updateSlipBalance();

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

    amount =
        Number(amount);


    if(
        !Number.isFinite(amount)
    ){

        return;

    }


    // ======================================
    // Update local manager immediately
    // ======================================

    walletManager.balances[
        walletManager.currentCurrency
    ] = amount;


    // ======================================
    // Save existing wallet state
    // ======================================

    saveWalletManager();


    // ======================================
    // Update UI immediately
    // ======================================

    updateBalanceUI();

    updateWalletDropdown();

    updateSlipBalance();


    // ======================================
    // Sync balance to Supabase
    // ======================================

    if(
        !window.supabaseClient
    ){

        return;

    }


    try{

        const {
            data: userData,
            error: userError
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if(
            userError ||
            !userData ||
            !userData.user
        ){

            return;

        }


        const user =
            userData.user;


        const {
            error: upsertError
        } =
            await window.supabaseClient
                .from("wallet_balances")
                .upsert(
                    {
                        user_id:
                            user.id,

                        currency:
                            walletManager.currentCurrency,

                        balance:
                            amount
                    },
                    {
                        onConflict:
                            "user_id,currency"
                    }
                );


        if(upsertError){

            console.error(
                "❌ Wallet Save Error:",
                upsertError
            );

            return;

        }


        console.log(
            "✅ Wallet balance synced:",
            walletManager.currentCurrency,
            amount
        );


    }catch(error){

        console.error(
            "❌ Wallet Sync Failed:",
            error
        );

    }

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
// UPDATE DROPDOWN
// ==========================================

function updateWalletDropdown(){

    document
        .querySelectorAll(
            ".currency-option"
        )
        .forEach(option => {

            const currency =
                option
                    .querySelector(".name")
                    ?.textContent
                    ?.trim()
                    ?.toUpperCase();


            const balance =
                option.querySelector(
                    ".balance"
                );


            if(
                balance &&
                currency &&
                walletManager.balances[
                    currency
                ] !== undefined
            ){

                const value =
                    Number(
                        walletManager
                            .balances[
                                currency
                            ] || 0
                    );


                // =================================
                // IMPORTANT:
                // Show crypto amount.
                // Do NOT convert to USDT.
                // =================================

                balance.textContent =
                    value.toFixed(8);

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
