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

        USDT: 100.00,
        BTC: 1500.00,
        ETH: 500.00,
        DOGE: 80.00,
        TRX: 120.00

    },

    currentCurrency: "USDT"

};


// ==========================================
// LOAD WALLET
// ==========================================

function loadWalletManager(){

    const savedWallet =
        localStorage.getItem("walletBalances");

    if(savedWallet){

        try{

            walletManager.balances =
                JSON.parse(savedWallet);

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

}


// ==========================================
// UPDATE BALANCE UI
// ==========================================

function updateBalanceUI(){

    const balance =
        getCurrentBalance();

    const balanceText =
        "$" + balance.toFixed(2);


    // Header Balance

    const headerBalance =
        document.getElementById(
            "selected-balance"
        );

    if(headerBalance){

        headerBalance.textContent =
            balanceText;

    }


    // Bet Slip Balance

    const slipBalance =
        document.getElementById(
            "betslipBalance"
        );

    if(slipBalance){

        slipBalance.textContent =
            balanceText;

    }

}

window.updateBalanceUI =
    updateBalanceUI;


// ==========================================
// SAVE WALLET
// ==========================================

function saveWalletManager(){

    localStorage.setItem(

        "walletBalances",

        JSON.stringify(

            walletManager.balances

        )

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

    // Current Currency
    walletManager.currentCurrency = name;

    // Save
    localStorage.setItem("selectedCurrency", name);
    localStorage.setItem("selectedCurrencyImage", image);

    // Update Image
    const img = document.getElementById("selected-currency-img");

    if(img){

        img.src = image;

    }

    // Remove Old Selected
    document
        .querySelectorAll(".currency-option")
        .forEach(item => {

            item.classList.remove("selected");

        });

    // Add Selected
    if(el){

        el.classList.add("selected");

    }

    // Update Header + Bet Slip
    updateBalanceUI();

    // Save Wallet
    saveWalletManager();

    // Close Dropdown (optional)
    if(typeof headerDropdownMenu === "function"){

        headerDropdownMenu("currency-menu");

    }

}

window.selectCurrency = selectCurrency;

// ==========================================
// RESTORE SELECTED CURRENCY
// ==========================================

function restoreSelectedCurrency(){

    loadWalletManager();

    const img =
        document.getElementById(
            "selected-currency-img"
        );

    if(img){

        const savedImage =
            localStorage.getItem(
                "selectedCurrencyImage"
            );

        if(savedImage){

            img.src = savedImage;

        }

    }

    updateBalanceUI();

}

window.restoreSelectedCurrency =
    restoreSelectedCurrency;


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

    restoreSelectedCurrency();

    updateBalanceUI();

});

window.testWallet = "OK";
