
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

    document.getElementById("transaction-history-section").style.display="block";

}


// ===============================
// Close
// ===============================

function closeTransaction(){

    document.getElementById("transaction-history-section").style.display="none";

}


// ===============================
// Deposit
// ===============================

function showDepositHistory(){

    currentTransactionTab="deposit";

    document.getElementById("deposit-tab").classList.add("active");

    document.getElementById("withdraw-tab").classList.remove("active");

    loadTransactionHistory();

}


// ===============================
// Withdrawal
// ===============================

function showWithdrawHistory(){

    currentTransactionTab="withdraw";

    document.getElementById("withdraw-tab").classList.add("active");

    document.getElementById("deposit-tab").classList.remove("active");

    loadTransactionHistory();

}


// ===============================
// Currency Dropdown
// ===============================

function toggleCurrencyDropdown(){

    const dropdown=document.getElementById("currency-dropdown");

    dropdown.classList.toggle("show");

}


// ===============================
// Currency Filter
// ===============================

function filterCurrency(currency){

    currentCurrency=currency;

    document.getElementById("selectedCurrency").innerText=currency;

    document.getElementById("currency-dropdown").classList.remove("show");

    loadTransactionHistory();

}


// ===============================
// Load Transaction
// (Temporary Demo)
// ===============================

function loadTransactionHistory(){

    console.log("TAB :",currentTransactionTab);

    console.log("Currency :",currentCurrency);

    // Supabase will connect here later.

}


// ===============================
// Previous Page
// ===============================

function previousTransactionPage(){

    console.log("Previous Page");

}


// ===============================
// Next Page
// ===============================

function nextTransactionPage(){

    console.log("Next Page");

}


// ===============================
// Click Outside Close Dropdown
// ===============================

document.addEventListener("click",function(e){

    const dropdown=document.getElementById("currency-dropdown");

    const button=document.querySelector(".currency-filter-btn");

    if(!dropdown || !button) return;

    if(!button.contains(e.target) && !dropdown.contains(e.target)){

        dropdown.classList.remove("show");

    }

});

