
/* ========================================= */
/* TRANSACTION HISTORY
   DIGIBET24
========================================= */

let currentTransactionTab = "deposit";
let currentCurrency = "ALL";


// ===============================
// Open Transaction History
// ===============================

function openTransaction(){
    lockBodyScroll();

    document.getElementById("transaction-history-section").style.display = "block";

    loadTransactionHistory();

}

// ===============================
// Close
// ===============================

function closeTransaction(){

    document.getElementById("transaction-history-section").style.display="none";
   unlockBodyScroll();

}
/* ========================================= */
/* SHOW DEPOSIT HISTORY */
/* ========================================= */

function showDepositHistory(){

    currentTransactionTab = "deposit";

    document.getElementById("deposit-tab")
        .classList.add("active");

    document.getElementById("withdraw-tab")
        .classList.remove("active");

    loadTransactionHistory();

}


/* ========================================= */
/* SHOW WITHDRAW HISTORY */
/* ========================================= */

function showWithdrawHistory(){

    currentTransactionTab = "withdraw";

    document.getElementById("withdraw-tab")
        .classList.add("active");

    document.getElementById("deposit-tab")
        .classList.remove("active");

    loadTransactionHistory();

}



/* ===============================
   TRANSACTION HISTORY DROPDOWN
================================ */

function toggleTransactionHistory(){

    const dropdown = document.getElementById("transaction-history-list");

    dropdown.classList.toggle("show");

}


/* ===============================
   TRANSACTION HISTORY FILTER
================================ */

function filterTransactionHistory(history){

    currentCurrency = history;

    document.getElementById("transactionHistorySelected").innerHTML =
        document.querySelector(
            '#transaction-history-list div[onclick="filterTransactionHistory(\'' + history + '\')"]'
        ).innerHTML;

    document.getElementById("transaction-history-list")
        .classList.remove("show");

    loadTransactionHistory();

}


/* ===============================
   TRANSACTION EXPLORER
================================ */

function openTransactionExplorer(txid){

    console.log("Explorer :", txid);

    // Future
    // window.open("https://blockchain-explorer/" + txid,"_blank");

}


/* ===============================
   CLICK OUTSIDE CLOSE
================================ */

document.addEventListener("click",function(e){

    const dropdown =
        document.getElementById("transaction-history-list");

    const button =
        document.querySelector(".transaction-history-btn");

    if(!dropdown || !button) return;

    if(
        !button.contains(e.target) &&
        !dropdown.contains(e.target)
    ){

        dropdown.classList.remove("show");

    }

});

