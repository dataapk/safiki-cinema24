// ==========================================
// WALLET.JS
// CENTRAL WALLET MANAGER
// ==========================================

console.log("WALLET.JS LOADED");


// ==========================================
// WALLET MANAGER
// ==========================================

const walletManager = {

    balances: {

    USDT: 500.00,
    BTC: 1500.00,
    ETH: 500.00,
    DOGE: 80.00,
    TRX: 120.00,
    SOL: 1450.00,
    LTC: 1150.00

},

    currentCurrency: "USDT",

    activeBets: [],

    betHistory: []

};


// ==========================================
// LOAD WALLET
// ==========================================

function loadWalletManager(){

    const savedWallet =
        localStorage.getItem("walletBalances");

    if(savedWallet){

        try{

            walletManager.balances = {

    ...walletManager.balances,

    ...JSON.parse(savedWallet)

};

        }catch(e){

            console.log(
                "Wallet Load Error"
            );

        }

    }


    const savedCurrency =
        localStorage.getItem(
            "selectedCurrency"
        );

    if(savedCurrency){

        walletManager.currentCurrency =
            savedCurrency;

    }
  // ==========================================
// LOAD ACTIVE BETS
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
// LOAD BET HISTORY
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
 }   



// ==========================================
// UPDATE BALANCE UI
// ==========================================



// ==========================================
// SAVE WALLET
// ==========================================

function saveWalletManager(){

    // Wallet Balance
    localStorage.setItem(
        "walletBalances",
        JSON.stringify(walletManager.balances)
    );

    // Selected Currency
    localStorage.setItem(
        "selectedCurrency",
        walletManager.currentCurrency
    );

    // Active Bets
    localStorage.setItem(
        "activeBets",
        JSON.stringify(walletManager.activeBets)
    );

    // Bet History
    localStorage.setItem(
        "betHistory",
        JSON.stringify(walletManager.betHistory)
    );

}


// ==========================================
// GET CURRENT BALANCE
// ==========================================

function getCurrentBalance(){

    return walletManager.balances[
        walletManager.currentCurrency
    ];

}


// ==========================================
// SET CURRENT BALANCE
// ==========================================

function setCurrentBalance(amount){

    walletManager.balances[
        walletManager.currentCurrency
    ] = amount;

    saveWalletManager();

}

// ==========================================
// SELECT CURRENCY
// ==========================================
function selectCurrency(name, image, el){

    // =========================
    // Current Currency
    // =========================

    walletManager.currentCurrency = name;

    // =========================
    // Save
    // =========================

    localStorage.setItem(
        "selectedCurrency",
        name
    );

    localStorage.setItem(
        "selectedCurrencyImage",
        image
    );

    // =========================
    // Header Image
    // =========================

    const img =
        document.getElementById(
            "selected-currency-img"
        );

    if(img){

        img.src = image;

    }

    // =========================
    // Remove Old Selected
    // =========================

    document
        .querySelectorAll(".currency-option")
        .forEach(item=>{

            item.classList.remove("selected");

        });

    // =========================
    // Add Selected
    // =========================

    if(el){

        el.classList.add("selected");

    }

    // =========================
    // Save Wallet
    // =========================

    saveWalletManager();

    // =========================
    // Refresh Balance
    // =========================

    updateBalanceUI();

    updateSlipBalance();

    // =========================
    // Close Dropdown
    // =========================

    if(typeof headerDropdownMenu==="function"){

        headerDropdownMenu("currency-menu");

    }

}

window.selectCurrency = selectCurrency;

 // =========================
    //  start UPDATE DROPDOWN
    // ========================

function updateWalletDropdown(){

    document.querySelectorAll(".currency-option")
    .forEach(option=>{

        const currency =
            option.querySelector(".name")?.textContent;

        const balance =
            option.querySelector(".balance");

        if(balance && walletManager.balances[currency] !== undefined){

            balance.textContent =
                "$" + walletManager.balances[currency].toFixed(2);

        }

    });

}
window.updateWalletDropdown =
    updateWalletDropdown;

// ==========================================
// RESTORE SELECTED CURRENCY
// =========================================


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


document.addEventListener("DOMContentLoaded", function () {

    loadWalletManager();

});

window.testWallet = "OK";
