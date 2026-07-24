/* 1. DOM Elements Selection */
const allMenus = document.querySelectorAll('.dropdown-menu');

/* --- API & Global Variables --- */
/* --- গ্লোবাল ভেরিয়েবলসমূহ (এটি তোমার ফাইলের শুরুতে একবারই থাকবে)-- */

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


/* --- ইভেন্ট লিসেনার: কারেন্সি পাল্টালেই যেন ব্যালেন্স আপডেট হয় --- */
document.getElementById('from-currency').addEventListener('change', function() {
    updateDisplayedBalance(); // ব্যালেন্স টেক্সট আপডেট করবে
    // এখানে চাইলে তুমি প্রাইস ক্যালকুলেশন ফাংশনটিও কল করতে পারো
    if (typeof calculateExchange === 'function') {
        calculateExchange();
    }
});

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
        
        // রেট আপডেট হলে সাথে সাথে ক্যালকুলেশন আপডেট করে দেবে
        calculateExchange(); 
    } catch (error) {
        console.error("Error fetching rates:", error);
    }
}

// ৬০ সেকেন্ড পর পর রেট আপডেট করার লজিক
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
function selectCurrency(name, img, balance) {
    const headerImg = document.getElementById('selected-currency-img');
    if (headerImg) {
        headerImg.src = img;
        headerImg.alt = name;
    }

    const headerBalance = document.getElementById('selected-balance');
    if (headerBalance) {
        headerBalance.innerText = balance;
    }

    // ড্রপডাউন মেনু ক্লোজ করা
    headerDropdownMenu('currency-menu');
}

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
    // ১. সব গ্রিড হাইড করা
    document.querySelectorAll('.crypto-grid').forEach(content => {
        content.style.display = 'none';
    });
    
    // ২. সব বক্স হাইড করা (address-box, withdraw-box, exchange-box)
    document.getElementById('address-box').style.display = 'none';
    document.getElementById('withdraw-input-box').style.display = 'none';
    document.getElementById('exchange-box').style.display = 'none';

    // ৩. বাটন থেকে 'active' ক্লাস সরানো
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });

    // ৪. লজিক: কোনটা শো করতে হবে
    if (tabId === 'exchange') {
        document.getElementById('exchange-box').style.display = 'block';
    } else {
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.style.display = 'grid';
        }
    }

    // ৫. বাটনে 'active' ক্লাস যোগ করা
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
// এক্সচেঞ্জ বক্স ওপেন করার জন্য
function openExchange() {
    // সব বক্স হাইড করা
    document.querySelectorAll('.crypto-grid').forEach(el => el.style.display = 'none');
    document.getElementById('address-box').style.display = 'none';
    document.getElementById('withdraw-input-box').style.display = 'none';
    
    // মেইন মেনু হাইড করা (যদি থাকে)
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) mainMenu.style.display = 'none';
    
    // এক্সচেঞ্জ বক্স দেখানো
    document.getElementById('exchange-box').style.display = 'block';
}

// এক্সচেঞ্জ থেকে ফিরে আসার জন্য
function goBackFromExchange() {
    document.getElementById('exchange-box').style.display = 'none';
    
    // আবার মেইন মেনু দেখানো
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) mainMenu.style.display = 'block';
    
    // ডিফল্ট ট্যাবটি আবার শো করা (যেমন: deposit)
    document.getElementById('deposit').style.display = 'grid';
}

// ১. এক্সচেঞ্জ বক্স ক্লোজ করার ফাংশন
function closeExchange() {
    document.getElementById('exchange-box').style.display = 'none';
    console.log("Exchange box closed");
}

// ২. সোয়াপ (Swap) কয়েন ফাংশন
function swapCoins() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    // ভ্যালু অদলবদল
    let temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    // আইকন ও ক্যালকুলেশন আপডেট
    updateIcons();
    calculateExchange();
    console.log("Coins swapped");
}

// ৩. ম্যাক্স (Max) ব্যালেন্স সেট করার ফাংশন
function setMax() {
    // ১. ইউজার বর্তমানে কোন কারেন্সি সিলেক্ট করে আছে তা নেওয়া
    const fromCurrency = document.getElementById('from-currency').value;
    
    // ২. গ্লোবাল ডাটাবেস থেকে ব্যালেন্স নেওয়া
    // '|| 0' দেওয়ার মানে হলো, যদি ব্যালেন্স না পাওয়া যায় তবে এটি ০ ধরে নেবে
    const balance = userBalances[fromCurrency] || 0;
    
    // ৩. ইনপুট বক্সে ব্যালেন্সটি বসানো
    const amountInput = document.getElementById('from-amount');
    amountInput.value = balance;
    
    // ৪. ব্যালেন্স পরিবর্তনের সাথে সাথে এক্সচেঞ্জ ক্যালকুলেশন আপডেট করা
    if (typeof checkMinimumLimit === 'function') {
        checkMinimumLimit();
    }
    
    if (typeof calculateExchange === 'function') {
        calculateExchange();
    }
}


// ১. কারেন্সি অনুযায়ী রেট ও লিমিট আপডেট করার ফাংশন
function updateStatLimits() {
    const fromCurrency = document.getElementById('from-currency').value;
    const price = currentPrices[fromCurrency] || 1;
    
    // লিমিট (ডলারে)
    const minUSD = 5;
    const maxUSD = 20000;
    
    const minAmount = minUSD / price;
    const maxAmount = maxUSD / price;
    
    const currencyLabel = fromCurrency.toUpperCase();
    
    // UI-তে ভ্যালু বসানো
    const minEl = document.getElementById('stat-min');
    const maxEl = document.getElementById('stat-max');
    
    if(minEl) minEl.innerText = `${minAmount.toFixed(4)} ${currencyLabel}`;
    if(maxEl) maxEl.innerText = `${maxAmount.toFixed(2)} ${currencyLabel}`;
    
    console.log("Stat Limits updated for:", currencyLabel);
}
function checkMinimumLimit() {
    const fromCurrency = document.getElementById('from-currency').value; 
    const currencyName = fromCurrency.toUpperCase();
    const price = currentPrices[fromCurrency] || 1;
    const minAmount = 10 / price;
    
    let decimals = 4;
    if (fromCurrency === 'btc' || fromCurrency === 'eth') {
        decimals = 6;
    }

    const message = `Min: ${minAmount.toFixed(decimals)} ${currencyName} ($10)`;
    const minAmountElement = document.getElementById('min-amount');
    
    if (minAmountElement) {
        minAmountElement.innerText = message;
        
        const amountInput = parseFloat(document.getElementById('from-amount').value) || 0;
        
        if (amountInput > 0 && amountInput < minAmount) {
            minAmountElement.style.color = "red"; 
        } else {
            minAmountElement.style.color = "#ffffff"; 
        }
    } 
} // এটা ফাংশন বন্ধ করল

function validateExchange(amount, minLimit) {
    const minAmountElement = document.getElementById('min-amount');
    const exchangeBtn = document.querySelector('.exchange-btn'); // তোমার এক্সচেঞ্জ বাটন

    // মিনিমাম অ্যামাউন্ট ১০ ডলার হতে হবে (তোমার শর্ত অনুযায়ী)
    const MIN_LIMIT = 10.00; 

    if (amount < MIN_LIMIT) {
        // ১০ ডলারের কম হলে:
        minAmountElement.innerText = "Min: " + MIN_LIMIT + " USD (Required)";
        minAmountElement.style.color = "red"; // টেক্সট লাল করে দিবে
        minAmountElement.style.fontWeight = "bold";
        
        // বাটন ডিজেবল করে দেওয়া যাতে ভুল ট্রানজ্যাকশন না হয়
        exchangeBtn.disabled = true;
        exchangeBtn.style.opacity = "0.5";
        
        return false; // লজিক আটকে দিবে
    } else {
        // ১০ ডলারের বেশি হলে:
        minAmountElement.innerText = "Min: " + minLimit + " ADA"; // অরিজিনাল ভ্যালু ফিরে আসবে
        minAmountElement.style.color = "#ffffff"; // রঙ ঠিক করে দিবে
        
        // বাটন আবার সচল করে দেওয়া
        exchangeBtn.disabled = false;
        exchangeBtn.style.opacity = "1";
        
        return true; // সব ঠিক আছে
    }
}

// ৪. এক্সচেঞ্জ প্রসেসিং ফাংশন
function processExchange() {
    // ১. প্রয়োজনীয় ডেটা সংগ্রহ
    const fromCurrency = document.getElementById('from-currency').value;
    const amount = parseFloat(document.getElementById('from-amount').value);
    const currencyName = fromCurrency.toUpperCase();
    
    // লাইভ রেট ও মিনিমাম লিমিট ক্যালকুলেশন
    const price = currentPrices[fromCurrency] || 1;
    const minAmount = 10 / price; 

    // ২. ভ্যালিডেশন চেক (যদি অ্যামাউন্ট ভুল বা কম হয়)
    if (!amount || amount < minAmount) {
        // মেসেজে একটু স্পেস দেওয়ার জন্য ${currencyName} এর আগে স্পেস রাখা হয়েছে
        alert(`Exchange failed: Minimum amount is ${minAmount.toFixed(4)} ${currencyName}`);
        return; // এখানেই থেমে যাবে, এক্সচেঞ্জ হবে না
    }
    
    // ৩. যদি ভ্যালিডেশন পাস করে (সব ঠিক থাকে), তবে নিচের লজিক চলবে
    // এখানে তোমার এক্সচেঞ্জ হওয়ার আসল এপিআই বা ডাটাবেজ কোডটি বসাবে
    
    alert("Exchange successful for " + amount + " " + currencyName + "!");
    console.log("Exchange processed for " + amount + " " + currencyName);
    
    // এখানে তোমার ব্যালেন্স আপডেটের কোড বা অন্যান্য ফাংশন কল করতে পারো
}
// ৫. রেট আপডেট ও টাইমার ফাংশন (প্রতি ৩০ সেকেন্ড)
function startRateTimer() {
    setInterval(() => {
        timeLeft--;
        const timerDisplay = document.getElementById('rate-timer');
        if (timerDisplay) timerDisplay.innerText = timeLeft;
        
        if (timeLeft <= 0) {
            fetchLiveRates();
            timeLeft = 30;
        }
    }, 1000);
}

// পেজ লোড হওয়ার সময় সব ইনিশিয়ালাইজ করা
window.onload = function() {
    fetchLiveRates();
    startRateTimer();
};

// ক্যালকুলেশন ফাংশন (৫% ফি সহ আপডেট করা হয়েছে)
function calculateExchange() {
    const fromVal = parseFloat(document.getElementById('from-amount').value) || 0;
    const fromCurr = document.getElementById('from-currency').value;
    const toCurr = document.getElementById('to-currency').value;

    // রেট বের করা
    const fromPrice = currentPrices[fromCurr] || 0;
    const toPrice = currentPrices[toCurr] || 0;
    
    // কনভার্সন ফর্মুলা: (fromAmount * fromPrice) / toPrice
    const grossResult = (fromVal * fromPrice) / toPrice;
   
       //--- ৫% এক্সচেঞ্জ ফি ক্যালকুলেশন ---
       //নিচে ৫% ফি কেটে নেওয়ার লজিকটি দেওয়া হলো।
       //আমরা মোট রেজাল্ট থেকে ৫% বাদ দিচ্ছি (অর্থাৎ ৯৫% রেজাল্ট দেখাচ্ছি)।
   
    const feePercentage = 0.05; 
    const netResult = grossResult * (1 - feePercentage);

    // নিচে রেজাল্ট বসানো (ইউজার শুধু ফি কাটার পরের অ্যামাউন্টটিই দেখতে পাবে)
    const toAmountDisplay = document.getElementById('to-amount');
    if (toAmountDisplay) {
        toAmountDisplay.innerText = netResult.toFixed(8);
    }
}
function updateStats(fromCurr, toCurr, fromVal, calculatedMax) {
    // এখানে তোমার ব্যালেন্স এবং লিমিটগুলো আপডেট হচ্ছে
    document.getElementById('user-balance').innerText = userBalance + " " + fromCurr.toUpperCase();
    document.getElementById('min-amount').innerText = "31.40 " + fromCurr.toUpperCase();
    
    // নিচে ম্যাক্স অ্যামাউন্ট হিসেবে ক্যালকুলেটেড ভ্যালু বা তোমার লজিক অনুযায়ী মান বসাও
    document.getElementById('max-amount').innerText = calculatedMax + " " + fromCurr.toUpperCase();
}

// ইনপুট বা ড্রপডাউনে কিছু পরিবর্তন হলে ক্যালকুলেশন কল হবে
document.getElementById('from-amount').addEventListener('input', calculateExchange);
document.getElementById('from-currency').addEventListener('change', calculateExchange);
document.getElementById('to-currency').addEventListener('change', calculateExchange);
// এই ফাংশনটি তোমার জাভাস্ক্রিপ্ট ফাইলে যোগ করো
function updatecurrencyIcons() {
    // ১. FROM কারেন্সির জন্য (ড্রপডাউনের পাশে)
    const fromSelect = document.getElementById('from-currency');
    const fromIcon = document.getElementById('from-icon');
    const fromOption = fromSelect.options[fromSelect.selectedIndex];
    
    if (fromOption) {
        const imageUrl = fromOption.getAttribute('data-img');
        fromIcon.src = imageUrl;

        // ২. নতুন সংযোজন: ইনপুট বক্সের পাশের লোগো আপডেট করা
        // ধরে নিচ্ছি তোমার ইনপুট বক্সের পাশের লোগোর ID 'input-from-icon'
        const inputFromIcon = document.getElementById('input-from-icon');
        if (inputFromIcon) {
            inputFromIcon.src = imageUrl;
        }
    }

    // ৩. TO কারেন্সির জন্য
    const toSelect = document.getElementById('to-currency');
    const toIcon = document.getElementById('to-icon');
    const toOption = toSelect.options[toSelect.selectedIndex];
    if (toOption) {
        toIcon.src = toOption.getAttribute('data-img');
    }
    
    console.log("Icons updated successfully");
}
// ২. NOTIFICATIONA  profile menu START
// নোটিফিকেশনের জন্য আলাদা ফাংশন
// নোটিফিকেশনের জন্য আলাদা ফাংশন
function toggleNotifMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('notif-popup');
    const profile = document.getElementById('profile-menu'); // ❌ ছিল 'profile-popup' → ✅ ঠিক 'profile-menu'
    if (profile) profile.style.display = 'none'; // অন্য মেনু বন্ধ
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

// প্রোফাইলের জন্য আলাদা ফাংশন
function toggleProfileMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById("profile-menu");
    const notif = document.getElementById('notif-popup'); // নোটিফিকেশনও বন্ধ করবে
    
    if (!menu) return;
    
    if (notif) notif.style.display = 'none'; // নোটিফিকেশন বন্ধ
    
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}

function openProfileMenu(){

    const menu = document.getElementById("profile-menu");

    if(menu){

        menu.style.display="block";

        setTimeout(()=>{

            menu.classList.add("active");

        },10);

    }

}


function closeProfileMenu(){

    const menu = document.getElementById("profile-menu");

    if(menu){

        menu.classList.remove("active");

    }

}
// ==============================
// PERSONAL AREA
// ==============================

function openPersonalTab(tabName) {
    // 1. সব ট্যাব কন্টেন্ট হাইড করা
    const allContents = document.querySelectorAll('.personal-tab-content');
    allContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // 2. সব ট্যাব বাটন থেকে active ক্লাস সরানো
    const allTabs = document.querySelectorAll('.personal-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 3. নির্বাচিত কন্টেন্ট দেখানো (ID ম্যাপিং)
    let targetId = '';
    
    if (tabName === 'details') {
        targetId = 'personaldetailsSection'; // Personal Details
    } else if (tabName === 'verification') {
        targetId = 'idVerificationSection'; // ID Verification
    } else if (tabName === 'address') {
        targetId = 'proofAddressSection'; // Proof Documents
    }
    
    const selectedContent = document.getElementById(targetId);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // 4. ক্লিক করা বাটনে active ক্লাস যোগ করা
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// ============================================
// OPEN PERSONAL AREA (from Profile Menu)
// ============================================

function openPersonalArea() {
    // Profile menu বন্ধ করা
    const profileMenu = document.getElementById('profile-menu');
    if (profileMenu) {
        profileMenu.style.display = 'none';
    }
    
    // Personal area দেখানো
    const personalArea = document.getElementById('personal-area-section');
    if (personalArea) {
        personalArea.style.display = 'block';
    }
    
    // Default: Personal Details ট্যাব ওপেন করা
    // সব কন্টেন্ট হাইড করা
    document.querySelectorAll('.personal-tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Personal Details দেখানো
    const detailsSection = document.getElementById('personaldetailsSection');
    if (detailsSection) {
        detailsSection.style.display = 'block';
    }
    
    // প্রথম ট্যাবে active ক্লাস যোগ করা
    const allTabs = document.querySelectorAll('.personal-tab');
    allTabs.forEach(tab => tab.classList.remove('active'));
    
    const firstTab = document.querySelector('.personal-tab');
    if (firstTab) {
        firstTab.classList.add('active');
    }
}

// ============================================
// CLOSE PERSONAL AREA
// ============================================

function closePersonalArea() {
    const personalArea = document.getElementById('personal-area-section');
    if (personalArea) {
        personalArea.style.display = 'none';
    }
}
// ============================================
// CLOSE PERSONAL AREA
// ============================================
// ============================================
// PERSONAL AREA — COMPLETE JAVASCRIPT
// ============================================

// ===== Open/Close Personal Area =====
function openPersonalArea() {
    const section = document.getElementById('personal-area-section');
    if (section) {
        section.style.display = 'block';
        // Default open Personal Details
        openPersonalTab('details');
    }
}

function closePersonalArea() {
    const section = document.getElementById('personal-area-section');
    if (section) section.style.display = 'none';
}

// ===== Tab Switching =====
function openPersonalTab(tabName) {
    // Hide all contents
    document.querySelectorAll('.personal-tab-content').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    // Remove active from all tabs
    document.querySelectorAll('.personal-tab').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected content
    const contentMap = {
        'details': 'personaldetailsSection',
        'verification': 'idVerificationSection',
        'address': 'proofAddressSection'
    };
    
    const selectedContent = document.getElementById(contentMap[tabName]);
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
    }
    
    // Add active to clicked tab
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// ===== Edit Mode Toggle =====
let isEditMode = false;

function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const toggleTrack = document.getElementById('toggleTrack');
    const editLabel = document.getElementById('editLabel');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const personalDetails = document.getElementById('personaldetailsSection');
    
    if (!personalDetails) return;
    
    const allInputs = personalDetails.querySelectorAll('.form-input');
    const allActionBtns = personalDetails.querySelectorAll('.action-btn');
    
    if (isEditMode) {
        // ON
        if (toggleTrack) toggleTrack.classList.add('active');
        if (editLabel) {
            editLabel.textContent = 'Editing...';
            editLabel.style.color = '#ffd666';
        }
        if (saveChangesBtn) saveChangesBtn.disabled = false;
        
        allInputs.forEach(input => {
            if (!input.classList.contains('otp-input')) {
                input.disabled = false;
            }
        });
        
        allActionBtns.forEach(btn => {
            if (!btn.classList.contains('send-btn') && !btn.classList.contains('save-btn')) {
                btn.disabled = false;
            }
        });
    } else {
        // OFF
        if (toggleTrack) toggleTrack.classList.remove('active');
        if (editLabel) {
            editLabel.textContent = 'Edit';
            editLabel.style.color = '#ccd6f6';
        }
        if (saveChangesBtn) saveChangesBtn.disabled = true;
        
        allInputs.forEach(input => {
            input.disabled = true;
        });
        
        allActionBtns.forEach(btn => {
            btn.disabled = true;
        });
        
        // Close dropdowns
        document.querySelectorAll('.change-dropdown').forEach(d => d.style.display = 'none');
    }
}

// ===== Save Changes =====
function saveAllChanges() {
    const firstName = document.getElementById('firstName')?.value;
    const surname = document.getElementById('surname')?.value;
    
    console.log('Saving:', { firstName, surname });
    
    alert('Saved successfully!');
    
    // Turn off edit mode
    toggleEditMode();
}

// ===== Email Change =====
function toggleEmailChange() {
    const dropdown = document.getElementById('emailChangeDropdown');
    const sendBtn = document.getElementById('emailSendCodeBtn');
    
    if (dropdown && sendBtn) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';
        
        // Change এ ক্লিক করলে ড্রপডাউন ওপেন হবে এবং ইমেইল বক্সের ভেতরের "Send Code" বাটনটা দৃশ্যমান হবে
        sendBtn.style.display = isHidden ? 'block' : 'none';
        
        // রিসেট করার জন্য
        document.getElementById('emailVerifyRow').style.display = 'none';
        document.getElementById('newEmailRow').style.display = 'none';
    }
}

function sendEmailOtp() {
    // সেন্ড কোডে ক্লিক করলে ওটিপি ভেরিফিকেশন রো ওপেন হবে
    document.getElementById('emailVerifyRow').style.display = 'flex';
    // সেন্ড কোড বাটনটা আর দরকার নেই তাই লুকিয়ে দিলাম
    document.getElementById('emailSendCodeBtn').style.display = 'none';
}

function verifyEmailOtp() {
    // ওটিপি ভেরিফাই সফল হলে নতুন ইমেইল লেখার বক্স ওপেন হবে
    alert('Code Verified Successfully!');
    document.getElementById('emailVerifyRow').style.display = 'none';
    document.getElementById('newEmailRow').style.display = 'block';
}

//function saveNewEmail() {
   // alert('Email updated!');
   // document.getElementById('emailChangeDropdown').style.display = 'none';
   // document.getElementById('emailSendCodeBtn').style.display = 'none';
//}
// ===== Email Save Function (Local UI Update Ready for Supabase) =====
function saveNewEmail() {
    const newEmailInput = document.getElementById('newEmailInput');
    const currentEmailInput = document.getElementById('currentEmail');
    
    if (!newEmailInput || newEmailInput.value.trim() === '') {
        alert('Please enter a valid email address!');
        return;
    }

    const updatedEmail = newEmailInput.value.trim();

    // ১. লোকাল ইউআই (UI) বা স্ক্রিনে ইনস্ট্যান্ট আপডেট করে দেখানো
    currentEmailInput.value = updatedEmail;
    
    alert('Email updated successfully!');
    
    // ২. ড্রপডাউন এবং সব এক্সট্রা রো বন্ধ করে রিসেট করা
    document.getElementById('emailChangeDropdown').style.display = 'none';
    document.getElementById('emailSendCodeBtn').style.display = 'none';
    document.getElementById('emailVerifyRow').style.display = 'none';
    document.getElementById('newEmailRow').style.display = 'none';
    
    // ৩. ইনপুট বক্সগুলো ফাঁকা করে দেওয়া
    newEmailInput.value = '';
    document.getElementById('emailOtpInput').value = '';

    /* 
       =========================================================
       FUTURE SUPABASE INTEGRATION NOTE:
       ভবিষ্যতে যখন সুপারবেজ কানেক্ট করবি, তখন ঠিক এই জায়গাতে 
       supabase.from('profiles').update({ email: updatedEmail }).eq(...) 
       কোডটি বসিয়ে দিলেই এটা ব্যাকএন্ডের সাথে রিয়েল-টাইমে সিঙ্ক হয়ে যাবে!
       =========================================================
    */
}

// ===== Mobile Number Change & Edit Flow =====
// ===== Mobile Number Flow & Verification Logic =====

// ১. Edit বাটনে ক্লিক করলে ফিল্ড আনলক হবে এবং ওটিপি ড্রপডাউন ওপেন হবে
function toggleMobileAdd() {
    const dropdown = document.getElementById('mobileChangeDropdown');
    const mobileInput = document.getElementById('mobileNumber');
    const countrySelect = document.getElementById('countryCode');
    const addBtn = document.getElementById('mobileAddBtn');
    
    if (dropdown) {
        const isHidden = dropdown.style.display === 'none';
        dropdown.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
            mobileInput.disabled = false;
            countrySelect.disabled = false;
            mobileInput.focus();
            addBtn.textContent = 'Cancel';
        } else {
            mobileInput.disabled = true;
            countrySelect.disabled = true;
            addBtn.textContent = 'Edit';
        }
    }
}

// ২. Send Code এবং Verify & Save - দুটো স্টেপ একসাথেই হ্যান্ডেল করার মূল ফাংশন
function sendMobileOtp() {
    const mobileInput = document.getElementById('mobileNumber');
    const otpInput = document.getElementById('mobileOtpInput');
    const btn = document.getElementById('mobileSendBtn');
    
    // স্টেপ ১: যদি বাটন "Send Code" থাকে (কোড পাঠানোর জন্য)
    if (btn.textContent === 'Send Code') {
        if (!mobileInput.value.trim()) {
            alert('Please enter a valid mobile number first!');
            return;
        }

        // কোড পাঠানোর নোটিফিকেশন
        alert('Verification code sent to your mobile!');
        
        // বাটন টেক্সট বদলে "Verify & Save" করে দেওয়া
        btn.textContent = 'Verify & Save';
        btn.classList.remove('send-btn');
        btn.classList.add('save-btn');
    } 
    // স্টেপ ২: যদি বাটন "Verify & Save" থাকে (কোড বসানোর পর ফাইনাল সেভ করার জন্য)
    else if (btn.textContent === 'Verify & Save') {
        if (!otpInput.value.trim()) {
            alert('Please enter your verification code!');
            return;
        }

        // ভেরিফিকেশন সফল মেসেজ
        alert('Mobile number verified and saved successfully!');
        
        // ড্রপডাউন বন্ধ করা
        document.getElementById('mobileChangeDropdown').style.display = 'none';
        
        // ইনপুট বক্স ও কান্ট্রি কোড চিরতরে লক/ডিজেবল করে দেওয়া (ইমেইলের মতো)
        mobileInput.disabled = true;
        document.getElementById('countryCode').disabled = true;
        
        // Edit বাটন লুকিয়ে ফেলে Change বাটনটি পার্মানেন্টলি শো করা
        const addBtn = document.getElementById('mobileAddBtn');
        const changeBtn = document.getElementById('mobileChangeBtn');
        if (addBtn) addBtn.style.display = 'none';
        if (changeBtn) changeBtn.style.display = 'inline-block';
        
        // ফিল্ড ও বাটন আগের অবস্থায় রিসেট করা
        otpInput.value = '';
        btn.textContent = 'Send Code';
        btn.classList.remove('save-btn');
        btn.classList.add('send-btn');
    }
}

// ৩. পরবর্তীতে কেউ নাম্বার পরিবর্তন করতে চাইলে (Change বাটনে ক্লিক করলে)
function toggleMobileChange() {
    const confirmChange = confirm('Do you want to change your mobile number?');
    if (confirmChange) {
        const mobileInput = document.getElementById('mobileNumber');
        const countrySelect = document.getElementById('countryCode');
        const dropdown = document.getElementById('mobileChangeDropdown');
        const newMobileRow = document.getElementById('newMobileRow');

        // কান্ট্রি কোড ও মোবাইল ইনপুট আনলক করা এবং বক্স ফাঁকা করা
        countrySelect.disabled = false;
        mobileInput.disabled = false;
        mobileInput.value = '';
        mobileInput.focus();
        
        dropdown.style.display = 'block';
        if (newMobileRow) {
            newMobileRow.style.display = 'block'; // চেঞ্জের ক্ষেত্রে নতুন নাম্বারের ঘর শো করবে
        }
        
        document.getElementById('mobileChangeBtn').style.display = 'none';
        document.getElementById('mobileAddBtn').style.display = 'inline-block';
        document.getElementById('mobileAddBtn').textContent = 'Cancel';
    }
}

// ৪. পুরনো কোডের নাম মেইনটেইন করার জন্য অতিরিক্ত ফাংশন কানেকশন (যদি কোথাও দরকার হয়)
function saveNewMobile() {
    sendMobileOtp();
}
// ===== Avatar =====
function changeAvatar() {
    alert('Avatar change clicked!');
}

// ===== ID Verification =====
function updateKycRequirements() {
    console.log('Country changed');
}

function previewIdImage(input, side) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(side + 'Preview');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function startSelfieCamera() {
    alert('Camera starting...');
}

function startVerification() {
    alert('Verification started!');
}

// ===== Proof of Address =====
function toggleAddressEdit() {
    const inputs = document.querySelectorAll('#proofAddressSection .form-input');
    inputs.forEach(input => {
        input.disabled = !input.disabled;
    });
}

function saveAddress() {
    alert('Address saved!');
}

function selectDocType(type) {
    document.querySelectorAll('.doc-option').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('addressUploadSection').style.display = 'block';
}

function previewAddressDoc(input) {
    if (input.files && input.files[0]) {
        document.getElementById('addressSubmitSection').style.display = 'block';
        document.getElementById('submitAddressBtn').disabled = false;
    }
}

function submitAddressVerification() {
    alert('Submitted for verification!');
}



// ============================================
// end PROOF OF ADDRESS FUNCTIONS
// ============================================
function openSecuritySettings() {

    alert("Security Settings - Coming Soon");

}
// প্রোফাইলের জন্য আলাদা ফাংশন

// ট্রানজেকশন লোড করার মেইন ফাংশন
function openTransaction(){

    document.getElementById("profile-menu").style.display = "none";

    const transaction = document.getElementById("transaction-history-section");

    if(transaction){

        transaction.style.display = "block";
        transaction.classList.add("active");

    }

}

function closeTransaction(){

    const transaction = document.getElementById("transaction-history-section");

    if(transaction){

        transaction.style.display = "none";
        transaction.classList.remove("active");

    }

}
async function fetchTransactions(type = 'deposits', filter = 'latest') {
    const container = document.getElementById('trans-list-container');
    container.innerHTML = '<p>Loading...</p>';

    try {
        // এখানে তোমার সুপারবেজ কোয়েরি হবে
        // const { data, error } = await supabaseClient.from('transactions').select('*').eq('type', type);
        
        // ডামি ডেটা (সুপারবেজ কানেক্ট করার পর এই অংশটা মুছে শুধু কোয়েরি রাখবে)
        const data = [
            { status: 'Paid', amount: '899.50', coin: 'USDT', date: '29 May 2026', txid: '0x2b35c...d1ad2' }
        ];

        container.innerHTML = ''; // লোডিং মুছে ফেলো
        data.forEach(item => {
            container.innerHTML += `
                <div class="trans-item">
                    <div class="item-left">
                        <span class="status">Status: <span class="paid">${item.status}</span></span>
                        <span class="amount">${item.amount} <img src="image/${item.coin.toLowerCase()}.png" width="15"></span>
                    </div>
                    <div class="item-right">
                        <span class="date">${item.date}</span>
                        <span class="tx-id">TX ID: ${item.txid}</span>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = '<p>Error loading transactions.</p>';
    }
}

// ট্যাব সুইচ করার ফাংশন
function switchTransTab(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    fetchTransactions(type);
}

function toggleTransactionCurrencyDropdown() {

    const menu = document.getElementById("transaction-currency-menu");

    menu.classList.toggle("active");

}
function selectTransactionCurrency(currency) {

    document.getElementById("selected-transaction-currency").innerText =
        currency === "all" ? "All Currency" : currency;

    document
        .getElementById("transaction-currency-menu")
        .classList.remove("active");

    // পরে Supabase Filter এখানে হবে
    console.log("Selected Transaction Currency:", currency);

}
function filterBy(type){

    console.log("Transaction Filter:", type);


    // Active button change

    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(btn => {

        btn.classList.remove("active");

    });


    event.target.classList.add("active");


    // পরে Supabase query filter এখানে হবে

    if(type === "archived"){

        console.log("Showing Archived Transactions");

    }


    if(type === "latest"){

        console.log("Showing Latest Transactions");

    }

}
// ট্রানজেকশন লোড করার মেইন ফাংশন

// ট্রানজেকশন লোড করার মেইন ফাংশন
  let currentPage = 1;
const totalPages = 10; // পরে Supabase থেকে আসবে

function updatePagination(){

    document.getElementById("page-number").textContent =
        `Page ${currentPage}`;

    document.getElementById("prev-page").disabled =
        currentPage === 1;

    document.getElementById("next-page").disabled =
        currentPage === totalPages;

}

function nextTransactionPage(){

    if(currentPage < totalPages){

        currentPage++;

        updatePagination();

        // এখানেই পরে Supabase থেকে নতুন data load হবে

    }

}

function previousTransactionPage(){

    if(currentPage > 1){

        currentPage--;

        updatePagination();

        // এখানেই পরে Supabase থেকে আগের page load হবে

    }

}

updatePagination();


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

    // Promotional Bonus
   else if(tab==="promotional"){

        document.getElementById("promotionalBonusContent").style.display="block";
        document.getElementById("promotionalBonusTab").classList.add("active");

    }

    // History Bonus
    else if(tab==="history"){

        document.getElementById("historyBonusContent").style.display="block";
        document.getElementById("historyBonusTab").classList.add("active");

        // Future:
        // loadBonusHistory();

    }

    // Update Progress Card
    updateBonusProgressCard(tab);

}

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

    const popup = document.getElementById("logout-confirm-popup");

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

// --- Outside Click Handler ---
window.addEventListener('click', (event) => {

    const notifPopup = document.getElementById('notif-popup');
    const profileMenu = document.getElementById('profile-menu');
    const logoutModal = document.getElementById('logout-confirm-popup');

    // Close notifications if clicking outside
    if (
        notifPopup &&
        !notifPopup.contains(event.target) &&
        !event.target.closest('.notif-icon-class')
    ) {
        notifPopup.style.display = 'none';
    }

    // Close profile menu if clicking outside
    if (
        profileMenu &&
        !profileMenu.contains(event.target) &&
        !event.target.closest('.profile-icon-class')
    ) {
        profileMenu.style.display = 'none';
    }

    // Close logout popup if clicking outside
    if (
        logoutModal &&
        event.target === logoutModal
    ) {
        closeLogoutPopup();
    }

});
// END Outside Click Handler ---
// হেডার আপডেট করার মূল ফাংশন
// ১. লগইন/লগআউট স্ট্যাটাস অনুযায়ী হেডার আপডেট করার ফাংশন
// =========================
// Header Login Status
// =========================

async function updateHeaderAuth() {

    console.log("updateHeaderAuth() Running");

    const { data } = await supabaseClient.auth.getUser();

    const user = data.user;

    const memberControls = document.getElementById("member-controls");
    const guestArea = document.getElementById("guest-actions-area");
    const userArea = document.getElementById("user-actions-area");

   console.log("Supabase User:", user);

// ===== DEBUG =====
// আপাতত সবসময় Header দেখাও
if (user) {

    if (memberControls) memberControls.style.display = "flex";
    if (userArea) userArea.style.display = "flex";
    if (guestArea) guestArea.style.display = "none";
    // Footer Menu Update
if(window.footerUpdateUserUI){

    footerUpdateUserUI({
        name: user.user_metadata?.name || "Player",
        vip: user.user_metadata?.vip || "VIP 0",
        avatar: user.user_metadata?.avatar || "images/default-avatar.png"
    });

}

} else {

    if (memberControls) memberControls.style.display = "none";
    if (userArea) userArea.style.display = "none";
    if (guestArea) guestArea.style.display = "flex";

   }
}

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

const checkbox = document.getElementById("agreeTerms");

console.log(checkbox);

console.log(checkbox.checked);
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const allowedDomains = [
    "@gmail.com",
    "@yahoo.com",
    "@outlook.com",
    "@hotmail.com"
];

const isValidDomain = allowedDomains.some(domain =>
    email.toLowerCase().endsWith(domain)
);

if (!isValidDomain) {
    alert("Please use a valid Gmail, Yahoo, Outlook or Hotmail email.");
    return;
}
    
    const password = document.getElementById("signupPassword").value;
    // Password must be at least 8 characters,
// contain one uppercase letter,
// one lowercase letter,
// one number,
// and one special character.

const passwordPattern =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/;

if (!passwordPattern.test(password)) {

    alert(
        "Password must be at least 8 characters and include:\n\n" +
        "• One uppercase letter\n" +
        "• One lowercase letter\n" +
        "• One number\n" +
        "• One special character"
    );

    return;
}
    const confirmPassword = document.getElementById("signupConfirm").value;
    const referralCode = document.getElementById("referralCode").value.trim();
    const agreeTerms = document.getElementById("agreeTerms").checked;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    console.log("agreeTerms =", agreeTerms);

if (!agreeTerms) {
    alert("Please accept the Terms & Conditions.");
    console.log(document.getElementById("agreeTerms"));
    console.log(document.getElementById("agreeTerms").checked);
    return;
}

    // Create Account
    const { data, error } = await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

            data: {
                first_name: firstName,
                last_name: lastName,
                referral_code: referralCode
            }

        }

    });

    if (error) {

        alert(error.message);

        return;

    }

alert("🎉 Account created successfully!");

closeAuth();

await updateHeaderAuth();

console.log("Signup User:", data.user);


if(window.footerCheckUser){

    await footerCheckUser();

}


} // signupUser closing
// ==============================
// PAGE LOAD
// ==============================
document.addEventListener("DOMContentLoaded", function () {

    updateHeaderAuth();

});
