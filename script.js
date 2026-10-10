/* 1. DOM Elements Selection */
const allMenus = document.querySelectorAll('.dropdown-menu');

/* --- API & Global Variables --- */
/* --- গ্লোবাল ভেরিয়েবলসমূহ (এটি তোমার ফাইলের শুরুতে একবারই থাকবে)--*/

// ১. এটি মার্কেট রেট (ক্যালকুলেশনের জন্য)
let currentPrices = { 
    "ada": 1.5, 
    "btc": 65000, 
    "usdt": 1.0 
};

// ২.এটি ইউজারের ব্যক্তিগত ব্যালেন্স (ম্যাক্স বাটনের জন্য)
let userBalances = { 
    "ada": 1500.50, 
    "btc": 0.05, 
    "eth": 1.2, 
    "usdt": 2000.00, 
    "doge": 5000.00, 
    "trx": 3000.00 
};
let timeLeft = 30; // এখানে এটি ডিফাইন করে দাও

/* ==========================================
   GLOBAL BODY SCROLL CONTROL
========================================== */

function lockBodyScroll(){

    document.body.classList.add("modal-open");

    document.body.style.overflow = "hidden";
    document.body.style.overflowY = "hidden";

}

function unlockBodyScroll(){

    document.body.classList.remove("modal-open");

    document.body.style.overflow = "";
    document.body.style.overflowY = "";

}


/* --- ব্যালেন্স এবং কারেন্সি আপডেট ডিসপ্লে --- */
function updateDisplayedBalance() {
    // ১. ইউজার বর্তমানে কোন কারেন্সি সিলেক্ট করে আছে তা নেওয়া
    const fromCurrency = document.getElementById('from-currency').value;
    
    // ২. আমাদের গ্লোবাল ডাটাবেস থেকে ব্যালেন্স খুঁজে নেওয়া
    const balance = userBalances[fromCurrency] || 0;
    
    // ৩. স্ক্রিনের যে এলিমেন্টে ব্যালেন্স দেখাবে সেটি খুঁজে বের করা
    // ধরে নিলাম তোমার এইচটিএমএল-এ <span id="user-balance">...</span> নামে একটা জায়গা আছে
    const balanceDisplay = document.getElementById('user-balance');
    
    if (balanceDisplay) {
        // ব্যালেন্সটি টেক্সট হিসেবে বসানো
        balanceDisplay.innerText = `Balance: ${balance} ${fromCurrency.toUpperCase()}`;
    }
}




// API থেকে লাইভ রেট আনার ফাংশন
async function fetchLiveRates() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano,bitcoin,ethereum,tether,dogecoin,tron&vs_currencies=usd');
        const data = await response.json();
        
        currentPrices = {
            "ada": data.cardano.usd,
            "btc": data.bitcoin.usd,
            "eth": data.ethereum.usd,
            "usdt": data.tether.usd,
            "doge": data.dogecoin.usd,
            "trx": data.tron.usd
        };
        console.log("Rates Updated:", currentPrices);
        
        
    } catch (error) {
        console.error("Error fetching rates:", error);
    }
}

// ৬০ সেকেন্ড পর পর  রেট আপডেট করার লজিক
setInterval(fetchLiveRates, 60000);
fetchLiveRates(); // প্রথমবার পেজ লোড হওয়ার সাথে সাথে কল হবে

/* 2. Main Logic: Header Dropdown Handler */
/* হেডার এবং নোটিফিকেশনের সব ড্রপডাউন হ্যান্ডেল করার জন্য সম্মিলিত ফাংশন */
/* ১. ড্রপডাউন মেনু হ্যান্ডলার (এটি সব মেনুর জন্যই কাজ করবে) */
/* 2. Main Logic: Header Dropdown Handler (Updated) */
function headerDropdownMenu(id, event) {
    if (event) event.stopPropagation();
    
    const menu = document.getElementById(id);
    const allMenus = document.querySelectorAll('.dropdown-menu');
    
    // অন্য সব মেনু বন্ধ করা
    allMenus.forEach(m => {
        if (m.id !== id) {
            m.style.display = 'none';
        }
    });

    if (menu) {
        // যদি মেনুটা এখন 'none' থাকে (অথবা এমটি স্ট্রিং), তবে সেটাকে খুলতে হবে
        if (menu.style.display === 'none' || menu.style.display === '') {
            // নোটিফিকেশনের জন্য flex, অন্যদের জন্য block
            menu.style.display = (id === 'notif-menu') ? 'flex' : 'block';
        } else {
            // যদি আগে থেকেই খোলা থাকে, তবে বন্ধ করে দিবে
            menu.style.display = 'none';
        }
    }
}

/* ২. কারেন্সি সিলেকশন ফাংশন */


/* ৩. গ্লোবাল ক্লিক হ্যান্ডলার (এটি ঠিক করো) */
document.addEventListener('click', function(event) {
    const allMenus = document.querySelectorAll('.dropdown-menu');
    
    // যদি ক্লিক করা এলিমেন্টটি ড্রপডাউনের ভেতরে হয়, তবে মেনু বন্ধ হবে না
    // এটি তোমার সব মেনুকে কাজ করতে সাহায্য করবে
    allMenus.forEach(m => {
        // যদি ক্লিকটা মেনুর ভেতরে না হয়, তাহলেই শুধু মেনু বন্ধ হবে
        if (!m.contains(event.target)) {
            m.classList.remove('show');
        }
    });
});

/* 4. Wallet Actions: ট্যাব ওপেন করা */
function openWalletTab(action) {
    console.log("Wallet Action: " + action);
    // এখানে তোমার ডিপোজিট/উইথড্র মোডাল বা পেজ নেভিগেশন লজিক হবে
    headerDropdownMenu('wallet-menu');
}

/* 5. Close on Outside Click (যে কোনো খালি জায়গায় ক্লিক করলে মেনু বন্ধ হবে) */
/* সম্পূর্ণ আপডেট করা উইন্ডো অনক্লিক হ্যান্ডলার */
window.onclick = function(event) {
    // ১. চেক করো ক্লিকটি কোনো ড্রপডাউন মেনুর ভেতরে হয়েছে কি না
    const isClickInsideMenu = event.target.closest('.dropdown-menu');
    
    // ২. চেক করো ক্লিকটি মেনু খোলার বাটনের ওপর হয়েছে কি না 
    // (যেকোনো এলিমেন্ট যেটাতে onclick ফাংশন আছে)
    const isClickOnButton = event.target.onclick !== null || event.target.closest('[onclick]');

    // ৩. যদি ক্লিক মেনুর ভেতরে না হয় এবং বাটনের ওপরও না হয়, তবেই সব মেনু বন্ধ হবে
    if (!isClickInsideMenu && !isClickOnButton) {
        allMenus.forEach(m => {
            m.style.display = 'none';
        });
    }
}
// ২. সর্টিং ফাংশন (Sort Amount & Alpha)
function sortAssets(type) {
    const menu = document.getElementById('currency-menu');
    const items = Array.from(menu.querySelectorAll('.currency-option'));

    items.sort((a, b) => {
        if (type === 'alpha') {
            const nameA = a.querySelector('.name').innerText;
            const nameB = b.querySelector('.name').innerText;
            return nameA.localeCompare(nameB);
        } else if (type === 'amount') {
            const valA = parseFloat(a.querySelector('.balance').innerText.replace('$', ''));
            const valB = parseFloat(b.querySelector('.balance').innerText.replace('$', ''));
            return valB - valA; // বড় থেকে ছোট (Descending)
        }
    });

    items.forEach(item => menu.appendChild(item));
}
// ===============================
// BODY SCROLL LOCK
// ===============================

function lockBodyScroll(){

    document.body.style.overflow = "hidden";

}

function unlockBodyScroll(){

    document.body.style.overflow = "";

}
// ===============================
// END BODY SCROLL LOCK
// ===============================

// ৩. ফেভারিট ফিল্টার ফাংশন
function filterFavorites() {
    const headerIcon = document.getElementById('header-fav-icon');
    const items = document.querySelectorAll('.currency-option');
    
    headerIcon.classList.toggle('fas');
    headerIcon.classList.toggle('far');
    headerIcon.classList.toggle('active');

    const isFavMode = headerIcon.classList.contains('active');

    items.forEach(item => {
        const favBtn = item.querySelector('.fav-btn');
        const isFavorited = favBtn.classList.contains('active');

        if (isFavMode) {
            item.style.display = isFavorited ? 'flex' : 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

// ৪. হাইড এমটি (Hide Empty) ফাংশন
function filterAssets() {
    const isChecked = document.getElementById('hide-empty-check').checked;
    const items = document.querySelectorAll('.currency-option');
    
    items.forEach(item => {
        const balanceText = item.querySelector('.balance').innerText;
        const balance = parseFloat(balanceText.replace('$', ''));
        
        if (isChecked && balance === 0) {
            item.style.display = 'none';
        } else {
            item.style.display = 'flex';
        }
    });
}

// ৫. ইনডিভিজুয়াল ফেভারিট টগল ফাংশন
function toggleFavorite(element, event) {
    event.stopPropagation();
    element.classList.toggle('fas');
    element.classList.toggle('far');
    element.classList.toggle('active');
}
// ৫. WALLET DROPDOWN DEPOSIT WITHDRAW
let currentTab = 'deposit'; // ডিফল্ট ট্যাব

function showTab(tabId) {

    // সব গ্রিড হাইড করা
    document.querySelectorAll('.crypto-grid').forEach(content => {
        content.style.display = 'none';
    });

    // সব বক্স হাইড করা
    document.getElementById('address-box').style.display = 'none';
    document.getElementById('withdraw-input-box').style.display = 'none';

    // সব বাটন থেকে active ক্লাস সরানো
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });

    // কোনটা শো করতে হবে
    const targetTab = document.getElementById(tabId);

    if (targetTab) {
        targetTab.style.display = 'grid';
    }

    // বাটনে active ক্লাস যোগ করা
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}


function selectCrypto(coinName, address) {
    // ১. বর্তমান ট্যাব (deposit/withdraw/exchange) লুকিয়ে ফেলা
    const activeGrid = document.getElementById(currentTab);
    if (activeGrid) {
        activeGrid.style.display = 'none';
    }
    
    // ২. অ্যাড্রেস বক্স দেখানো
    const addrBox = document.getElementById('address-box');
    if (addrBox) {
        addrBox.style.display = 'grid';
    }
    
    // ৩. ডাটা আপডেট করা
    const title = document.getElementById('coin-title');
    const addr = document.getElementById('wallet-address');
    if (title) title.innerText = coinName;
    if (addr) addr.innerText = address;
}

function goBack() {
    // ১. অ্যাড্রেস বক্স হাইড করা
    const addrBox = document.getElementById('address-box');
    if (addrBox) {
        addrBox.style.display = 'none';
    }
    
    // ২. বর্তমান ট্যাবটি আবার শো করা
    const activeGrid = document.getElementById(currentTab);
    if (activeGrid) {
        activeGrid.style.display = 'grid';
    }
}
// ১. অ্যাড্রেস বক্স হাইড করা
// নেটওয়ার্ক অনুযায়ী অ্যাড্রেস ডাটাবেস (সহজ ভার্সন)
const cryptoData = {
    'USDT': {
        'ERC20': '0x4FB74...0450252',
        'TRC20': 'TX12345...67890',
        'BEP20': '0xB1234...99999'
    }
    // অন্য কারেন্সিগুলো এখানে এভাবে যোগ করবে
};

function updateAddress() {
    const network = document.getElementById('network-select').value;
    const addressSpan = document.getElementById('wallet-address');
    
    // এখানে নেটওয়ার্ক অনুযায়ী অ্যাড্রেস আপডেট হবে
    addressSpan.innerText = cryptoData['USDT'][network]; 
}

function copyAddress() {
    const address = document.getElementById('wallet-address').innerText;
    navigator.clipboard.writeText(address);
    alert("Address Copied!");
}

function selectCrypto(coinName, address) {
    document.querySelectorAll('.crypto-grid').forEach(g => g.style.display = 'none');
    const addrBox = document.getElementById('address-box');
    addrBox.style.display = 'block';
    
    document.getElementById('coin-title').innerText = coinName + " Deposit";
    document.getElementById('wallet-address').innerText = address;
}

// উইথড্র সেকশন সিলেক্ট করার ফাংশন
function selectWithdraw(coinName) {
    // ১. উইথড্র মেইন গ্রিড লুকানো
    document.getElementById('withdraw').style.display = 'none';
    
    // ২. উইথড্র ইনপুট বক্স দেখানো
    document.getElementById('withdraw-input-box').style.display = 'block';
    
    // ৩. টাইটেল আপডেট
    document.getElementById('withdraw-coin-title').innerText = coinName + " Withdraw";
}

// উইথড্র থেকে ব্যাক করার ফাংশন
function goBackFromWithdraw() {
    document.getElementById('withdraw-input-box').style.display = 'none';
    document.getElementById('withdraw').style.display = 'grid';
}

// উইথড্র কনফার্ম বাটন ফাংশন
function processWithdraw() {
    const address = document.getElementById('withdraw-address').value;
    const password = document.getElementById('withdraw-password').value;
    
    if (address === "" || password === "") {
        alert("দয়া করে অ্যাড্রেস এবং পাসওয়ার্ড পূরণ করুন!");
        return;
    }
    
    // এখানে তোমার উইথড্র রিকোয়েস্ট পাঠানোর এপিআই কল বা লজিক বসাবে
    console.log("Withdraw Request:", { address, password });
    alert("আপনার উইথড্র রিকোয়েস্টটি সফলভাবে পাঠানো হয়েছে!");
}
// CLOSE ALL PAGE

function closeAll() {
    // সব গ্রিড এবং বক্স হাইড করে দেওয়া
    document.querySelectorAll('.crypto-grid').forEach(el => el.style.display = 'none');
    document.getElementById('address-box').style.display = 'none';
    document.getElementById('withdraw-input-box').style.display = 'none';
    
    // অথবা যদি তোমার পুরো ওয়ালেট সেকশনটা একটা মেইন ডিভ-এ থাকে, সেটা হাইড করতে পারো
    // document.getElementById('main-wallet-container').style.display = 'none';
}

// ২. NOTIFICATIONA  profile menu START
// নোটিফিকেশনের জন্য আলাদা ফাংশন
// নোটিফিকেশনের জন্য আলাদা ফাংশন
function toggleNotificationPanel(event) {

    event.stopPropagation();

    const panel = document.getElementById('notification-panel');

    // Notification toggle
    if (panel) {
        panel.classList.toggle('active');
    }

}

// CLOSE BUTTON

const closeNotification=document.getElementById('close-notification');

if(closeNotification){
    closeNotification.addEventListener('click',(e)=>{
        e.stopPropagation();

        const panel=document.getElementById('notification-panel');

        if(panel){
            panel.classList.remove('active');
        }
    });
}

// --- Outside Click Handler ---
window.addEventListener('click', (event) => {

    const notificationPanel = document.getElementById('notification-panel');
    const logoutModal = document.getElementById('logout-confirm-popup');

    // Notification Panel — Outside Click
    if (
        notificationPanel &&
        notificationPanel.classList.contains('active') &&
        !notificationPanel.contains(event.target) &&
        !event.target.closest('.notification-btn')
    ) {
        notificationPanel.classList.remove('active');
    }

    // Logout Modal — Outside Click
    if (logoutModal && event.target === logoutModal) {
        closeLogoutPopup();
    }

});

// END Outside Click Handler ---

// ======================================
// NOTIFICATION VIEW  START
// ======================================

function openNotificationView(title,message,date,time){

    const view=document.getElementById('notification-view-popup');

    if(!view) return;


    document.getElementById('viewNotifTitle').textContent=title;
    document.getElementById('viewNotifDate').textContent=date;
    document.getElementById('viewNotifTime').textContent=time;
    document.getElementById('viewNotifMessage').textContent=message;


    view.classList.add('active');


}
function closeNotificationView(){

    const view=document.getElementById('notification-view-popup');

    if(view){

        view.classList.remove('active');

    }

}
// ======================================
// NOTIFICATION VIEW  END
// ======================================



// ==============================
// PERSONAL AREA
// ==============================

function openPersonalTab(tabName) {

    // 1. সব Personal tab content hide
    const allContents =
        document.querySelectorAll('.personal-tab-content');

    allContents.forEach(content => {
        content.style.display = 'none';
    });


    // 2. সব Personal tab button থেকে active remove
    const allTabs =
        document.querySelectorAll('.personal-tab');

    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });


    // 3. Tab অনুযায়ী content ID
    let targetId = '';

    if (tabName === 'details') {

        targetId = 'personaldetailsSection';

    } else if (tabName === 'verification') {

        targetId = 'idVerificationSection';

    } else if (tabName === 'address') {

        targetId = 'proofAddressSection';

    }


    // 4. নির্বাচিত content show
    const selectedContent =
        document.getElementById(targetId);

    if (selectedContent) {
        selectedContent.style.display = 'block';
    }


    // 5. Tab name অনুযায়ী active button
    const activeTab =
        document.querySelector(
            `.personal-tab[data-tab="${tabName}"]`
        );

    if (activeTab) {
        activeTab.classList.add('active');
    }

}

// ============================================
// OPEN PERSONAL AREA (from Profile Menu)
// ============================================



// ============================================
// end PROOF OF ADDRESS FUNCTIONS
// ============================================
function openSecuritySettings() {

    alert("Security Settings - Coming Soon");

}
// প্রোফাইলের জন্য আলাদা ফাংশন



// END ট্রানজেকশন লোড করার মেইন ফাংশন

/* ===============================
   SETTINGS SECTION
================================ */

// Open Settings
function openProfileSettingMenu(){

    const profileMenu = document.getElementById("profile-menu");
    if(profileMenu){
        profileMenu.style.display = "none";
    }

    const personalArea = document.getElementById("personal-area-section");
    if(personalArea){
        personalArea.style.display = "none";
    }

    const accountInfo = document.getElementById("account-info-section");
    if(accountInfo){
        accountInfo.style.display = "none";
    }

    const kyc = document.getElementById("kyc-section");
    if(kyc){
        kyc.style.display = "none";
    }

    const transaction = document.getElementById("transaction-history-section");
    if(transaction){
        transaction.style.display = "none";
    }

    const settings = document.getElementById("settings-section");
    if(settings){
        settings.style.display = "block";
    }

    switchSettingsTab("security");

}


// Close Settings
function closeProfileSettingMenu(){

    const settings = document.getElementById("settings-section");

    if(settings){
        settings.style.display = "none";
    }

}


// Switch Tabs
function switchSettingsTab(tab) {

    // Hide all tabs
    document.getElementById("security-tab").style.display = "none";
    document.getElementById("sessions-tab").style.display = "none";
    document.getElementById("self-exclusion-tab").style.display = "none";

    // Remove active button
    document.querySelectorAll(".settings-tab-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    // Show selected tab
    if (tab === "security") {

        document.getElementById("security-tab").style.display = "block";
        document.querySelectorAll(".settings-tab-btn")[0].classList.add("active");

    }

    if (tab === "sessions") {

        document.getElementById("sessions-tab").style.display = "block";
        document.querySelectorAll(".settings-tab-btn")[1].classList.add("active");

    }

    if (tab === "self-exclusion") {

        document.getElementById("self-exclusion-tab").style.display = "block";
        document.querySelectorAll(".settings-tab-btn")[2].classList.add("active");

    }

}


/* ===============================
   SECURITY
================================ */

// Update Password
function updatePassword() {

    alert("Password Updated Successfully.");

}


// Enable 2FA
function enable2FA() {

    alert("Two-Factor Authentication Enabled.");

}


/* ===============================
   ACTIVE SESSION
================================ */

// Destroy Session
function destroySession() {

    if (confirm("Are you sure you want to destroy this session?")) {

        alert("Session Destroyed.");

    }

}


/* ===============================
   SELF EXCLUSION
================================ */

function selfExclude(period) {

    if (confirm("Activate Self Exclusion for " + period + "?")) {

        alert("Self Exclusion Activated: " + period);

    }

}
/* ===============================
   END SETTING 
================================ */

/* ==========================================
   START MY BONUS SECTION
========================================== */
/*=====================================================
                MY BONUS - PART 1
        Open / Close / Tabs / Initialize
=====================================================*/

/*------------------------------
    OPEN MY BONUS
------------------------------*/

function openMyBonus(){

    // Hide Profile Menu
    const profileMenu = document.getElementById("profile-menu");

    if(profileMenu){

        profileMenu.style.display = "none";

    }

    // Show Bonus Page
    const bonus = document.getElementById("my-bonus-section");

    if(bonus){

        bonus.style.display = "block";

    }

    // Default Tab
    openBonusTab("deposit");

}


/*------------------------------
    CLOSE MY BONUS
------------------------------*/

function closeMyBonus(){

    const bonus = document.getElementById("my-bonus-section");

    if(bonus){

        bonus.style.display = "none";

    }

}


/*------------------------------
        BONUS TAB
------------------------------*/

function openBonusTab(tab){

    // Hide All Bonus Content
    document.querySelectorAll(".bonus-tab-content").forEach(el=>{
        el.style.display="none";
    });

    // Remove Active Tab
    document.querySelectorAll(".bonus-menu-btn").forEach(btn=>{
        btn.classList.remove("active");
    });


    // Deposit Bonus
    if(tab==="deposit"){

        document.getElementById("depositBonusContent").style.display="block";
        document.getElementById("depositBonusTab").classList.add("active");

    }


    // Cashback Bonus
    else if(tab==="cashback"){

        document.getElementById("cashbackBonusContent").style.display="block";
        document.getElementById("cashbackBonusTab").classList.add("active");

    }


    // Referral Reward
    else if(tab==="referral"){

        document.getElementById("referralBonusContent").style.display="block";
        document.getElementById("referralBonusTab").classList.add("active");

    }

}


// Close My Bonus
function closeMyBonus(){

    document.getElementById("my-bonus-section").style.display="none";

}
/* =========================================
        BONUS WALLET TOGGLE
========================================= */

const bonusWalletToggle = document.getElementById("bonusWalletToggle");

// Load Saved State
if(bonusWalletToggle){

    const savedState = localStorage.getItem("bonusWalletEnabled");

    if(savedState==="true"){

        bonusWalletToggle.checked = true;

    }else{

        bonusWalletToggle.checked = false;

    }

}


// Toggle Change
bonusWalletToggle?.addEventListener("change",function(){

    if(this.checked){

        // Enable Bonus Balance
        localStorage.setItem("bonusWalletEnabled","true");

        console.log("✅ Bonus Balance Enabled");

    }else{

        // Disable Bonus Balance
        localStorage.setItem("bonusWalletEnabled","false");

        console.log("❌ Bonus Balance Disabled");

    }

});
/*------------------------------
        INITIALIZE
------------------------------*/

document.addEventListener("DOMContentLoaded",()=>{

    const page=document.getElementById("my-bonus-section");

    if(page){

        page.style.display="none";

    }

});
/*=====================================================
                MY BONUS - PART 2
          Bonus Toggle & Active Logic
=====================================================*/

/*--------------------------------
      Bonus Toggle Elements
--------------------------------*/

const depositBonusMode =
document.getElementById("depositBonusMode");

const birthdayBonusMode =
document.getElementById("birthdayBonusMode");

const weeklyBonusMode =
document.getElementById("weeklyBonusMode");


/*--------------------------------
      Disable Other Bonuses
--------------------------------*/

function disableOtherBonuses(current){

    const allBonus = [

        depositBonusMode,

        birthdayBonusMode,

        weeklyBonusMode

    ];

    allBonus.forEach(item=>{

        if(item && item!==current){

            item.checked=false;

        }

    });

}


/*--------------------------------
      Deposit Bonus
--------------------------------*/

if(depositBonusMode){

    depositBonusMode.addEventListener("change",function(){

        if(this.checked){

            disableOtherBonuses(this);

            console.log("Deposit Bonus Activated");

        }else{

            console.log("Deposit Bonus Disabled");

        }

    });

}


/*--------------------------------
      Birthday Bonus
--------------------------------*/

if(birthdayBonusMode){

    birthdayBonusMode.addEventListener("change",function(){

        if(this.checked){

            disableOtherBonuses(this);

            console.log("Birthday Bonus Activated");

        }else{

            console.log("Birthday Bonus Disabled");

        }

    });

}


/*--------------------------------
      Weekly Bonus
--------------------------------*/

if(weeklyBonusMode){

    weeklyBonusMode.addEventListener("change",function(){

        if(this.checked){

            disableOtherBonuses(this);

            console.log("Weekly Bonus Activated");

        }else{

            console.log("Weekly Bonus Disabled");

        }

    });

}


/*--------------------------------
      Active Bonus Name
--------------------------------*/

function updateActiveBonus(title){

    const text =
    document.getElementById("active-bonus-name");

    if(text){

        text.innerText=title;

    }

}


/*--------------------------------
      Update Bonus Name
--------------------------------*/

if(depositBonusMode){

    depositBonusMode.addEventListener("change",()=>{

        if(depositBonusMode.checked){

            updateActiveBonus("First Deposit Bonus");

        }

    });

}

if(birthdayBonusMode){

    birthdayBonusMode.addEventListener("change",()=>{

        if(birthdayBonusMode.checked){

            updateActiveBonus("Birthday Bonus");

        }

    });

}

if(weeklyBonusMode){

    weeklyBonusMode.addEventListener("change",()=>{

        if(weeklyBonusMode.checked){

            updateActiveBonus("Weekly Bonus");

        }

    });

}

/*=====================================================
                MY BONUS - PART 3
      Progress Bar + Countdown + Bonus Progress
=====================================================*/

/*--------------------------------
        Demo Bonus Data
   (Later Load From Supabase)
--------------------------------*/

let bonusData = {

    progress: 0,

    wagerCompleted: 0,

    wagerRequired: 3000,

    expireTime: Date.now() + (3 * 24 * 60 * 60 * 1000)

};


/*--------------------------------
      Progress Update
--------------------------------*/

/* =========================================
        BONUS PROGRESS CARD UPDATE
========================================= */

function updateBonusProgressCard(tab){

    const title = document.getElementById("bonusProgressTitle");
    const text = document.getElementById("bonusProgressText");
    const percent = document.getElementById("bonusProgressPercent");
    const wager = document.getElementById("bonusWagerText");
    const badge = document.getElementById("bonusStatusBadge");
    const claimBtn = document.getElementById("claimBonusBtn");
    const progressFill = document.getElementById("bonusProgressFill");

    const walletArea = document.getElementById("bonusWalletArea");
    const claimArea = document.getElementById("bonusClaimArea");
    const progressBar = document.querySelector(".bonus-progress-bar");

    if(!title) return;

    // Default (সব দেখাও)
    walletArea.style.display = "flex";
    claimArea.style.display = "block";
    progressBar.style.display = "block";
    claimBtn.style.display = "inline-flex";

    switch(tab){

        case "deposit":

            title.textContent = "Deposit Bonus Progress";

            text.textContent = "Complete the deposit wagering requirement to unlock your deposit bonus.";

            percent.textContent = "0%";

            wager.textContent = "Wager : 0 / 0";

            badge.textContent = "ACTIVE";
            badge.className = "bonus-status active";

            progressFill.style.width = "0%";

            claimBtn.textContent = "UNCLAIM";
            claimBtn.className = "claim-bonus-btn locked";
            claimBtn.disabled = true;

        break;


        case "promotional":

            title.textContent = "Promotional Bonus Progress";

            text.textContent = "Complete the promotional wagering requirement to unlock your promotional reward.";

            percent.textContent = "0%";

            wager.textContent = "Wager : 0 / 0";

            badge.textContent = "ACTIVE";
            badge.className = "bonus-status active";

            progressFill.style.width = "0%";

            claimBtn.textContent = "UNCLAIM";
            claimBtn.className = "claim-bonus-btn locked";
            claimBtn.disabled = true;

        break;


        case "history":

            title.textContent = "Bonus History";

            text.textContent = "Your latest completed, claimed and expired bonus records are shown here. Only the latest 10 records are stored automatically.";

            percent.textContent = "";

            wager.textContent = "";

            badge.textContent = "INFO";
            badge.className = "bonus-status";

            progressFill.style.width = "0%";

            walletArea.style.display = "none";
            claimArea.style.display = "none";
            progressBar.style.display = "none";
            claimBtn.style.display = "none";

        break;

    }

}
/*--------------------------------
      Add Wager Progress
--------------------------------*/

function addBonusWager(amount){

    bonusData.wagerCompleted += amount;

    if(bonusData.wagerCompleted > bonusData.wagerRequired){

        bonusData.wagerCompleted =
        bonusData.wagerRequired;

    }

    updateBonusProgress();

}


/*--------------------------------
        Countdown Timer
--------------------------------*/

function updateBonusCountdown(){

    const timer =
    document.getElementById("depositBonusTimer");

    if(!timer) return;

    let diff =
    bonusData.expireTime - Date.now();

    if(diff <= 0){

        timer.innerText = "Expired";

        return;

    }

    let days =
    Math.floor(diff / 86400000);

    diff %= 86400000;

    let hours =
    Math.floor(diff / 3600000);

    diff %= 3600000;

    let minutes =
    Math.floor(diff / 60000);

    timer.innerText =
        days + "D " +
        hours + "H " +
        minutes + "M";

}


/*--------------------------------
      Complete Bonus
--------------------------------*/

function completeBonus(){

    if(bonusData.progress >= 100){

        alert("🎉 Bonus Completed!");

        bonusData.wagerCompleted = 0;

        bonusData.progress = 100;

    }

}


/*--------------------------------
      Update Every Minute
--------------------------------*/

setInterval(function(){

    updateBonusCountdown();

},60000);


/*--------------------------------
        Initialize
--------------------------------*/



updateBonusCountdown();


/*--------------------------------
 Example
 Later Game Bet:

 addBonusWager(25);

--------------------------------*/
/*=====================================================
                MY BONUS - PART 4
        History + Backend Ready + Final Init
=====================================================*/

/*--------------------------------
        Bonus History
--------------------------------*/

let bonusHistory = [];

function addBonusHistory(type,status,amount){

    bonusHistory.unshift({

        type:type,

        status:status,

        amount:amount,

        date:new Date().toLocaleString()

    });

    renderBonusHistory();

}


/*--------------------------------
      Render History
--------------------------------*/

function renderBonusHistory(){

    const container =
    document.getElementById("bonusHistoryList");

    if(!container) return;

    container.innerHTML="";

    bonusHistory.forEach(item=>{

        container.innerHTML += `

        <div class="bonus-history-item">

            <div class="bonus-history-left">

                <h4>${item.type}</h4>

                <span>${item.date}</span>

            </div>

            <div class="bonus-history-right ${item.status.toLowerCase()}">

                ${item.status}

            </div>

        </div>

        `;

    });

}


/*--------------------------------
      Deposit Bonus Completed
--------------------------------*/

function finishDepositBonus(){

    addBonusHistory(

        "First Deposit Bonus",

        "Completed",

        document.getElementById("depositBonusBalance")?.innerText || "$0.00"

    );

}


/*--------------------------------
      Promotional Bonus Completed
--------------------------------*/

function finishPromotionalBonus(name){

    addBonusHistory(

        name,

        "Completed",

        "$0.00"

    );

}


/*--------------------------------
      Backend Ready
--------------------------------*/

/*
Later connect Supabase

Example:

await supabase
.from("user_bonus")
.select("*")

*/


async function loadBonusData(){

    console.log("Load Bonus From Backend");

}


async function saveBonusData(){

    console.log("Save Bonus To Backend");

}


async function loadBonusHistory(){

    console.log("Load Bonus History");

}


/*--------------------------------
      Auto Save (Optional)
--------------------------------*/

setInterval(()=>{

    saveBonusData();

},30000);


/*--------------------------------
      Initialize
--------------------------------*/

document.addEventListener("DOMContentLoaded",()=>{

    loadBonusData();

    loadBonusHistory();

    renderBonusHistory();

});


/*--------------------------------
 Example Game Bet

addBonusWager(50);

Example Complete

finishDepositBonus();

--------------------------------*/
/* ==========================================
  END  MY BONUS SECTION
========================================== */


function openLogoutPopup(){

    const profileSidebar =
        document.getElementById("profile-sidebar");

    if(profileSidebar){
        profileSidebar.style.display = "none";
    }


    const popup =
        document.getElementById("logout-confirm-popup");

    if(popup){
        popup.style.display = "flex";
    }

}


function closeLogoutPopup(){

    const popup = document.getElementById("logout-confirm-popup");

    if(popup){
        popup.style.display = "none";
    }

}


async function confirmLogout(){

    const { error } = await supabaseClient.auth.signOut();

    if(error){
        console.error("Logout Error:", error);
        return;
    }

    closeLogoutPopup();


    // Auto Refresh After Logout
    window.location.reload();

}
function updateLogoutUI(){

    const userActions = document.getElementById("user-actions-area");
    const guestActions = document.getElementById("guest-actions-area");

    if(userActions){
        userActions.style.display = "none";
    }

    if(guestActions){
        guestActions.style.display = "flex";
    }

}


// হেডার আপডেট করার মূল ফাংশন
// ১. লগইন/লগআউট স্ট্যাটাস অনুযায়ী হেডার আপডেট করার ফাংশন
// =========================
// Header Login Status
// =========================
// =========================
// Header Login Status
// =========================

async function updateHeaderAuth() {

    console.log("updateHeaderAuth() Running");

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {
        console.error(
            "❌ Auth User Error:",
            error
        );
    }

    const user = data?.user;

    const memberControls =
        document.getElementById("member-controls");

    const guestArea =
        document.getElementById("guest-actions-area");

    const userArea =
        document.getElementById("user-actions-area");

    console.log(
        "Supabase User:",
        user
    );


    // =========================
    // LOGGED IN USER
    // =========================

    if (user) {

        if (memberControls)
            memberControls.style.display = "flex";

        if (userArea)
            userArea.style.display = "flex";

        if (guestArea)
            guestArea.style.display = "none";


        // =========================
        // HOME MEMBER VIEW
        // =========================

        if (window.updateHomeView) {
            updateHomeView(true);
        }


        // =========================
        // GET USER DATA
        // =========================

        let userData = null;

        try {

            const {
                data: profileData,
                error: profileError
            } = await supabaseClient
                .from("user_data")
                .select(
                    "user_id, email, kyc_status, account_level"
                )
                .eq("email", user.email)
                .maybeSingle();

            if (profileError) {

                console.error(
                    "❌ User Data Error:",
                    profileError
                );

            } else {

                userData = profileData;

                console.log(
                    "✅ Header User Data:",
                    userData
                );

            }

        } catch (error) {

            console.error(
                "❌ User Data Load Error:",
                error
            );

        }


        // =========================
        // USER ID
        // =========================

        const profileUserId =
            document.getElementById(
                "profileUserId"
            );

        if (profileUserId) {

            profileUserId.textContent =
                userData?.user_id || "—";

        }


        // =========================
        // KYC STATUS
        // Pending  → Unverified
        // Approved → Verified
        // =========================

        const verificationStatus =
            document.getElementById(
                "profileUserVerificationStatus"
            );

        if (verificationStatus) {

            const kycStatus =
                String(
                    userData?.kyc_status || ""
                )
                .trim()
                .toLowerCase();

            if (kycStatus === "approved") {

                verificationStatus.textContent =
                    "Verified";

            } else {

                verificationStatus.textContent =
                    "Unverified";

            }

        }


        // =========================
        // ACCOUNT LEVEL
        // =========================

        const accountLevel =
            String(
                userData?.account_level || "Bronze"
            ).trim() || "Bronze";


        // =========================
        // FOOTER USER UI
        // Player + Account Level
        // =========================

        if (window.footerUpdateUserUI) {

            footerUpdateUserUI({

                name: "Player",

                vip: accountLevel,

                avatar:
                    user.user_metadata?.avatar ||
                    "images/default-avatar.png"

            });

        }


        // =========================
        // DIRECT FOOTER LEVEL UPDATE
        // =========================

        const footerUserName =
            document.getElementById(
                "footerUserName"
            );

        if (footerUserName) {

            footerUserName.textContent =
                "Player";

        }


        const footerUserLevel =
            document.getElementById(
                "footerUserLevel"
            );

        if (footerUserLevel) {

            footerUserLevel.textContent =
                accountLevel;

        }


        // =========================
        // SAVE EXISTING APP USER ID
        // =========================

        if (userData?.user_id) {

            localStorage.setItem(
                "userId",
                userData.user_id
            );

            localStorage.setItem(
                "userID",
                userData.user_id
            );

            localStorage.setItem(
                "user_id",
                userData.user_id
            );

        }


        console.log(
            "✅ Header User UI Updated:",
            {
                userId:
                    userData?.user_id || "—",

                email:
                    userData?.email || user.email,

                kycStatus:
                    userData?.kyc_status || "Pending",

                verification:
                    String(
                        userData?.kyc_status || ""
                    )
                    .trim()
                    .toLowerCase() === "approved"
                        ? "Verified"
                        : "Unverified",

                accountLevel:
                    accountLevel
            }
        );


    // =========================
    // LOGGED OUT USER
    // =========================

    } else {

        if (memberControls)
            memberControls.style.display = "none";

        if (userArea)
            userArea.style.display = "none";

        if (guestArea)
            guestArea.style.display = "flex";


        // =========================
        // HOME GUEST VIEW
        // =========================

        if (window.updateHomeView) {
            updateHomeView(false);
        }

    }
}


// =========================
// MAKE GLOBALLY AVAILABLE
// =========================

window.updateHeaderAuth =
    updateHeaderAuth;


// =========================
// FIRST HEADER LOAD
// =========================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await updateHeaderAuth();

    }
);
// =========================
// Logout Popup
// =========================

function showLogoutPopup() {

    document.getElementById("logout-confirm-popup").style.display = "flex";

}

function closeLogoutPopup() {

    document.getElementById("logout-confirm-popup").style.display = "none";

}


// =========================
// Logout
// =========================

async function performLogout() {

    // Supabase Logout
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }


    // Local Storage Remove
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userName");


    // Close Popup
    closeLogoutPopup();


    // Header Update
    await updateHeaderAuth();


    // Footer Menu Update
    if(window.footerUpdateUserUI){

        footerUpdateUserUI(null);

    }


    // Redirect Home
    window.location.href =
    "https://dataapk.github.io/safiki-gaming/";

}


// =========================
// Login Success
// =========================

function loginSuccess() {

    localStorage.setItem("userLoggedIn", "true");

    updateHeaderAuth();

    window.location.href = "index.html";

}
/* ===========================
   LOGIN SIGN UP FORM JS
=========================== */

function openLogin() {
    document.getElementById("loginModal").style.display = "flex";
    document.getElementById("signupModal").style.display = "none";
    document.body.style.overflow = "hidden";
}

function openSignup() {
    document.getElementById("signupModal").style.display = "flex";
    document.getElementById("loginModal").style.display = "none";
    document.body.style.overflow = "hidden";
}

function closeAuth(){

    document.getElementById("loginModal").style.display="none";

    document.getElementById("signupModal").style.display="none";

    document.getElementById("forgotModal").style.display="none";

    document.body.style.overflow="auto";

}

function switchSignup() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "flex";
}

function switchLogin(){

    document.getElementById("signupModal").style.display="none";

    document.getElementById("forgotModal").style.display="none";

    document.getElementById("loginModal").style.display="flex";

}

/* বাইরে ক্লিক করলে Popup বন্ধ হবে */
window.addEventListener("click", function (e) {

    const login = document.getElementById("loginModal");
    const signup = document.getElementById("signupModal");

    if (e.target === login) {
        closeAuth();
    }

    if (e.target === signup) {
        closeAuth();
    }

});

/* ESC চাপলে Popup বন্ধ হবে */
document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {
        closeAuth();
    }

});

/* Placeholder (পরের ধাপে Supabase যুক্ত করব) */

// ==============================
// LOGIN USER
// ==============================

async function loginUser() {

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("✅ Login Successful!");

// Login Status Save
localStorage.setItem("userLoggedIn", "true");

localStorage.setItem(
    "userName",
    data.user.user_metadata.first_name || "Player"
);

// প্রথমে Modal বন্ধ
closeAuth();

// তারপর Header Update
await updateHeaderAuth();

console.log("Logged In User:", data.user);
}
// ==============================
// LOGIN USER
// ==============================

function openForgotPassword(e){

    e.preventDefault();

    document.getElementById("loginModal").style.display="none";

    document.getElementById("forgotModal").style.display="flex";

}

function sendResetLink(){

    alert("Supabase Password Reset will be connected in Step 5.");

}
function togglePassword(inputId, icon){

    const input = document.getElementById(inputId);

    if(input.type === "password"){

        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");

    }else{

        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");

    }

}
// ==============================
// SIGN UP USER
// ==============================

async function signupUser() {

    console.log("Signup Clicked");


    // --------------------------------
    // GET FORM ELEMENTS SAFELY
    // --------------------------------

    const firstNameInput =
        document.getElementById("firstName");

    const lastNameInput =
        document.getElementById("lastName");

    const emailInput =
        document.getElementById("signupEmail");

    const passwordInput =
        document.getElementById("signupPassword");

    const confirmPasswordInput =
        document.getElementById("signupConfirm");

    const referralCodeInput =
        document.getElementById("referralCode");

    const agreeTermsInput =
        document.getElementById("agreeTerms");


    // --------------------------------
    // CHECK REQUIRED ELEMENTS
    // --------------------------------

    if (
        !firstNameInput ||
        !lastNameInput ||
        !emailInput ||
        !passwordInput ||
        !confirmPasswordInput ||
        !agreeTermsInput
    ) {

        console.error(
            "Signup form element is missing."
        );

        alert(
            "Signup form is not configured correctly. Please try again."
        );

        return;

    }


    // --------------------------------
    // GET VALUES
    // --------------------------------
    console.log("FIRST NAME DEBUG:", {
    inputExists: Boolean(firstNameInput),
    inputId: firstNameInput?.id,
    inputValue: JSON.stringify(firstNameInput?.value),
    activeElementId: document.activeElement?.id
});

    const firstName =
        firstNameInput.value.trim();

    const lastName =
        lastNameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    const referralCode =
    referralCodeInput &&
    typeof referralCodeInput.value === "string"
        ? referralCodeInput.value.trim()
        : "";

    const agreeTerms =
        agreeTermsInput.checked;


    // --------------------------------
    // REQUIRED FIELD VALIDATION
    // --------------------------------

    console.log("SIGNUP FIELD CHECK:", {
    firstName,
    lastName,
    email,
    passwordPresent: Boolean(password),
    confirmPasswordPresent: Boolean(confirmPassword)
});

    if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        alert(
            "Please fill in all required fields."
        );

        return;

    }


    // --------------------------------
    // EMAIL DOMAIN VALIDATION
    // ONLY GMAIL + YAHOO
    // --------------------------------

    const allowedDomains = [
        "@gmail.com",
        "@yahoo.com"
    ];


    const isValidDomain =
        allowedDomains.some(
            domain =>
                email.endsWith(domain)
        );


    if (!isValidDomain) {

        alert(
            "Please use a valid Gmail or Yahoo email."
        );

        return;

    }


    // --------------------------------
    // PASSWORD VALIDATION
    // --------------------------------

    const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/;


    if (
        !passwordPattern.test(
            password
        )
    ) {

        alert(
            "Password must be at least 8 characters and include:\n\n" +
            "• One uppercase letter\n" +
            "• One lowercase letter\n" +
            "• One number\n" +
            "• One special character"
        );

        return;

    }


    // --------------------------------
    // CONFIRM PASSWORD
    // --------------------------------

    if (
        password !== confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        return;

    }


    // --------------------------------
    // TERMS & CONDITIONS
    // --------------------------------

    if (!agreeTerms) {

        alert(
            "Please accept the Terms & Conditions."
        );

        return;

    }


    // --------------------------------
    // CREATE SUPABASE AUTH ACCOUNT
    // --------------------------------

    const {
        data,
        error
    } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {

                    first_name:
                        firstName,

                    last_name:
                        lastName,

                    referral_code:
                        referralCode

                }

            }

        });


    // --------------------------------
    // SIGNUP ERROR
    // --------------------------------

    if (error) {

        console.error(
            "Signup error:",
            error
        );

        alert(
            error.message
        );

        return;

    }


    // --------------------------------
    // ACCOUNT CREATED
    // --------------------------------

    console.log(
        "Signup User:",
        data.user
    );


    alert(
        "🎉 Account created successfully!"
    );


    // --------------------------------
    // CLOSE AUTH
    // --------------------------------

    closeAuth();


    // --------------------------------
    // UPDATE HEADER
    // --------------------------------

    await updateHeaderAuth();


    // --------------------------------
    // FOOTER USER CHECK
    // --------------------------------

    if (
        window.footerCheckUser
    ) {

        await footerCheckUser();

    }


}

// signupUser closing



// ==============================
// PAGE LOAD
// ==============================

document.addEventListener("DOMContentLoaded", function () {

    // Browser যেন আগের Scroll Position মনে না রাখে
    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    // সবসময় Top থেকে শুরু হবে
    window.scrollTo(0, 0);

    // Header Update
    updateHeaderAuth();

});
