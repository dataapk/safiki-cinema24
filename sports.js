// ==========================================
// SPORTS.JS
// SPORTS FULL GAME VIEW
// ==========================================

console.log("SPORTS.JS LOADED");


// ==========================================
// OPEN SPORTS GAME
// ==========================================
function openSportsGame(sport, gameId) {

    window.currentSportsPage = sport + "-events-page";

    const games = {
        "cricket-live-1": {
            sport: "cricket",
            title: "Bangladesh vs India",
            status: "LIVE",
            league: "T20 International",
            homeTeam: "Bangladesh",
            awayTeam: "India"
        },
        "cricket-live-2": {
            sport: "cricket",
            title: "Australia vs Pakistan",
            status: "LIVE",
            league: "T20 International",
            homeTeam: "Australia",
            awayTeam: "Pakistan"
        }
    };

    const game = games[gameId];
    if (!game) {
        console.log("Sports game not found:", gameId);
        return;
    }

    const gamePage = document.getElementById("sports-game-page");
    const gameTitle = document.getElementById("sports-game-title");
    const gameContent = document.getElementById("sports-game-content");

    if (!gamePage || !gameContent) {
        console.log("Sports game page not found");
        return;
    }

    // Hide Sports Sub Banner Slider
    const sportsSubBanner = document.getElementById("sportsSubBanner");
    if (sportsSubBanner) {
        sportsSubBanner.style.display = "none";
    }

    // Hide Sports Header
    const sportsSubHeader = document.getElementById("sportsSubHeader");
    if (sportsSubHeader) {
        sportsSubHeader.style.display = "none";
    }

    // Hide Sports Sub Category Grid
    const sportsSubcatGrid = document.getElementById("sportsSubcatGrid");
    if (sportsSubcatGrid) {
        sportsSubcatGrid.style.display = "none";
    }

    // Page Title
    if (gameTitle) {
        gameTitle.textContent = sport === "cricket" ? "🏏 Cricket" : "⚽ Football";
    }

    // ==========================================
    // GAME CONTENT - INNERHTML START
    // ==========================================
    
    gameContent.innerHTML = `

        <!-- LIVE MATCH HEADER -->
        <div class="sports-game-match-header">
            <div class="sports-game-live-badge">
                <span class="live-dot"></span>
                LIVE
            </div>
            <div class="sports-game-match-title">${game.title}</div>
            <div class="sports-game-league">${game.league}</div>
        </div>

        <!-- MATCH ANIMATION -->
        <div class="sports-game-hero">
            <div class="sports-game-animation">
                <div class="sports-animation-live">● LIVE</div>
                <div class="sports-animation-icon">🏏</div>
                <div class="sports-animation-title">${game.title}</div>
                <div class="sports-animation-subtitle">Live Match Centre</div>
            </div>
        </div>

        <!-- BETTING SECTION -->
        <div class="sports-betting-box">

            <div class="sports-betting-title">Match Betting</div>

            <!-- MATCH WINNER -->
            <div class="sports-market">
                <div class="sports-market-title">Match Winner</div>
                <div class="sports-bet-options">
                    <button type="button" class="sports-bet-option" onclick="addToBetSlip({
                        eventId: '${gameId}',
                        eventName: '${game.title}',
                        market: '${game.homeTeam}',
                        odds: 1.85
                    })">
                        <span>${game.homeTeam}</span>
                        <strong>1.85</strong>
                    </button>
                    <button type="button" class="sports-bet-option" onclick="addToBetSlip({
                        eventId: '${gameId}',
                        eventName: '${game.title}',
                        market: '${game.awayTeam}',
                        odds: 1.65
                    })">
                        <span>${game.awayTeam}</span>
                        <strong>1.65</strong>
                    </button>
                </div>
            </div>

            <!-- TOTAL RUNS -->
            <div class="sports-market">
                <div class="sports-market-title">Total Runs</div>
                <div class="sports-bet-options">
                    <button type="button" class="sports-bet-option" onclick="addToBetSlip({
                        eventId: '${gameId}',
                        eventName: '${game.title}',
                        market: 'Over 180.5',
                        odds: 1.90
                    })">
                        <span>Over 180.5</span>
                        <strong>1.90</strong>
                    </button>
                    <button type="button" class="sports-bet-option" onclick="addToBetSlip({
                        eventId: '${gameId}',
                        eventName: '${game.title}',
                        market: 'Under 180.5',
                        odds: 1.80
                    })">
                        <span>Under 180.5</span>
                        <strong>1.80</strong>
                    </button>
                </div>
            </div>


    `;  // <-- ✅ এখানে `; দিয়ে স্ট্রিং শেষ

    // ==========================================
    // HIDE NORMAL SPORTS CONTENT
    // ==========================================

    const sportsSubSection = document.getElementById("sports-sub-section");
    const trendingPage = document.getElementById("sports-trending-page");
    const cricketEventsPage = document.getElementById("cricket-events-page");
    const footballEventsPage = document.getElementById("football-events-page");

    if (sportsSubSection) {
        sportsSubSection.style.display = "none";
    }

    if (trendingPage) {
        trendingPage.style.display = "none";
    }

    if (cricketEventsPage) {
        cricketEventsPage.style.display = "none";
    }

    if (footballEventsPage) {
        footballEventsPage.style.display = "none";
    }

    // Show Full Game Page
    gamePage.style.display = "block";

    // Prevent browser from jumping
    window.scrollTo(0, 0);
}

// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    // Hide Full Game View
    const gamePage = document.getElementById("sports-game-page");
    if (gamePage) {
        gamePage.style.display = "none";
    }

    // Hide All Event Pages
    const pages = [
        "cricket-events-page",
        "football-events-page",
        "basketball-events-page",
        "tennis-events-page",
        "volleyball-events-page",
        "boxing-events-page",
        "hockey-events-page",
        "rugby-events-page",
        "golf-events-page"
    ];

    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.style.display = "none";
        }
    });

    // Restore Sports Banner
    const sportsSubBanner = document.getElementById("sportsSubBanner");
    if (sportsSubBanner) {
        sportsSubBanner.style.display = "block";
    }

    // Restore Sports Header
    const sportsHeader = document.querySelector(".subcat-header-row");
    if (sportsHeader) {
        sportsHeader.style.display = "flex";
    }

    // Restore Sports Sub Categories
    const sportsGrid = document.getElementById("sportsSubcatGrid");
    if (sportsGrid) {
        sportsGrid.style.display = "grid";
    }

    // Show Trending Again
    const trending = document.getElementById("sports-trending-page");
    if (trending) {
        trending.style.display = "block";
    }

    // Remove Active Button
    document.querySelectorAll("#sportsSubcatGrid .subcat-item").forEach(item => {
        item.classList.remove("active");
    });

    // Scroll Back To Sports Section
    const sportsSection = document.getElementById("sportsSubSection");
    if (sportsSection) {
        sportsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.openSportsGame = openSportsGame;
window.backFromSportsGame = backFromSportsGame;


// ==========================================
// DEBUG
// ==========================================

console.log(
    "openSportsGame TYPE:",
    typeof window.openSportsGame
);

console.log(
    "backFromSportsGame TYPE:",
    typeof window.backFromSportsGame
);


// ===== বেট স্লিপ হেডারে ব্যালেন্স দেখাও ====
function updateSlipBalance() {
    const balanceEl = document.getElementById('slipBalance');
    if (!balanceEl) return;

    // localStorage থেকে নাও (এখনকার জন্য)
    let balance = localStorage.getItem('selectedBalance');

    // যদো কিছু না থাকে, ডিফল্ট
    if (!balance) {
        balance = '$0.00';
    }

    balanceEl.textContent = balance;
}

// ===== সুপারবেস আপডেট (পরে শুধু এটা আনকমেন্ট করবে) =====
/*
async function syncBalanceFromSupabase() {
    const userId = localStorage.getItem('userId');
    const currency = localStorage.getItem('selectedCurrency') || 'USDT';
    
    const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency_symbol')
        .eq('user_id', userId)
        .eq('currency', currency)
        .single();
    
    if (data) {
        const formatted = `${data.currency_symbol || '$'}${parseFloat(data.balance).toFixed(2)}`;
        localStorage.setItem('selectedBalance', formatted);
        updateSlipBalance();
    }
}
*/


// ==========================================
// SPORTS BET SLIP SYSTEM
// ==========================================

// ==========================================
// SPORTS BET SLIP - sports.js
// ==========================================

// ===== STATE =====
let betSlip = [];
let currentMode = 'single';

if (localStorage.getItem('sportsBetSlip')) {
    try {
        betSlip = JSON.parse(localStorage.getItem('sportsBetSlip'));
        updateBetCount();
    } catch (e) {
        betSlip = [];
    }
}

// ===== 1. ADD =====
function addToBetSlip(data) {
    const isDuplicate = betSlip.some(bet => 
        bet.eventId === data.eventId && bet.market === data.market
    );
    
    if (isDuplicate) {
        showToast('Already added!', 'error');
        return;
    }

    const bet = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        eventId: data.eventId,
        eventName: data.eventName,
        market: data.market,
        odds: parseFloat(data.odds),
        stake: 0,
        addedAt: new Date().toLocaleString('en-GB', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
        })
    };

    betSlip.push(bet);
    saveSlip();
    updateBetCount();
    renderBetSlip();
    showToast('Added to bet slip!', 'success');
}

// ===== 2. OPEN / CLOSE =====
function openSportsBetSlip() {
    const panel = document.getElementById('sportsBetSlipPanel');
    if (panel) {
        panel.style.display = 'block';
        updateSlipBalance();  // ✅ ব্যালেন্স দেখাও
        renderBetSlip();
    }
}

function closeSportsBetSlip() {
    const panel = document.getElementById('sportsBetSlipPanel');
    if (panel) panel.style.display = 'none';
}

// ===== 3. REMOVE =====
function removeSingleBet(betId) {
    betSlip = betSlip.filter(bet => bet.id !== betId);
    saveSlip();
    updateBetCount();
    renderBetSlip();
}

// ===== 4. CLEAR ALL =====
function clearAllSportsBetSlip() {
    if (betSlip.length === 0) return;
    if (!confirm('Clear all bets?')) return;
    
    betSlip = [];
    saveSlip();
    updateBetCount();
    renderBetSlip();
    document.getElementById('multipleSection').style.display = 'none';
    showToast('Cleared!', 'info');
}

// ===== 5. MODE SWITCH =====
function switchBetMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.mode-tab');
    const multiSection = document.getElementById('multipleSection');
    
    if (mode === 'single') {
        if (tabs[0]) tabs[0].classList.add('active');
        if (multiSection) multiSection.style.display = 'none';
    } else {
        if (tabs[1]) tabs[1].classList.add('active');
        if (multiSection) multiSection.style.display = 'block';
    }
    
    renderBetSlip();
    calculateReturns();
}

// ===== 6. RENDER =====
function renderBetSlip() {
    const container = document.getElementById('betSlipBody');
    const multiSection = document.getElementById('multipleSection');
    if (!container) return;
    
    if (betSlip.length === 0) {
        container.innerHTML = '<div class="empty-slip">Your bet slip is empty</div>';
        if (multiSection) multiSection.style.display = 'none';
        updateTotalDisplay();
        return;
    }

    // Group by event
    const eventGroups = {};
    betSlip.forEach(bet => {
        if (!eventGroups[bet.eventId]) eventGroups[bet.eventId] = [];
        eventGroups[bet.eventId].push(bet);
    });

    // Check: are there multiple different events?
    const hasMultipleEvents = Object.keys(eventGroups).length >= 2;

    // ==========================================
    // SINGLE MODE: Always show ALL bets
    // ==========================================
    if (currentMode === 'single') {
        let html = '';
        Object.keys(eventGroups).forEach(eid => {
            const bets = eventGroups[eid];
            html += `<div class="event-group">
                        <div style="color:#ff6b00;font-weight:bold;margin-bottom:8px;font-size:13px;">
                            ${bets[0].eventName}
                        </div>`;
            
      bets.forEach(bet => {
    html += `
        <div class="bet-item" data-bet-id="${bet.id}">
            
            <!-- ✅ Top Right: Close Button -->
            <button class="remove-btn" onclick="removeSingleBet('${bet.id}')" style="position:absolute;top:12px;right:12px;">×</button>
            
            <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-right:30px;">
                
                <!-- Left: Market, Date, Stake -->
                <div style="flex:1;">
                    <div class="bet-market">${bet.market}</div>
                    <div class="bet-date">${bet.addedAt}</div>
                    <div class="stake-box" style="margin-top:6px;">
                        <input type="number" placeholder="Stake ($)" style="width:90px;padding:4px 6px;font-size:13px;" 
                            value="${bet.stake > 0 ? bet.stake : ''}"
                            oninput="updateStake('${bet.id}', this.value)">
                    </div>
                </div>
                
                <!-- Right: Odds, Return -->
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;margin-top:24px;">
                    <div class="bet-odds">@ ${bet.odds.toFixed(2)}</div>
                    <span class="returns">Return: ৳${(bet.stake * bet.odds).toFixed(2)}</span>
                </div>
                
            </div>
        </div>`;
});
            html += '</div>';
        });
        
        container.innerHTML = html;
        if (multiSection) multiSection.style.display = 'none';
    }
    
    // ==========================================
    // MULTIPLE MODE: Show ALL bets ONLY if 2+ different events
    // ==========================================
    else {
        if (!hasMultipleEvents) {
            container.innerHTML = '<div class="empty-slip">Add bets from different matches for multi.</div>';
            if (multiSection) multiSection.style.display = 'none';
            updateTotalDisplay();
            return;
        }

        // ✅ আগে এখানে ভুল ছিল — শুধু uniqueEventBets দেখাতো
        // ✅ এখন সব বেট দেখাবে
        let html = '';
        Object.keys(eventGroups).forEach(eid => {
            const bets = eventGroups[eid];
            html += `<div class="event-group">
                        <div style="color:#ff6b00;font-weight:bold;margin-bottom:8px;font-size:13px;">
                            ${bets[0].eventName}
                        </div>`;
            
            bets.forEach(bet => {
    html += `
        <div class="bet-item" data-bet-id="${bet.id}" style="position:relative;padding-top:14px;">
            
            <!-- ✅ Bet Card এর Top-Right এ × -->
            <button class="remove-btn" onclick="removeSingleBet('${bet.id}')" style="position:absolute;top:10px;right:10px;z-index:2;">×</button>
            
            <!-- Left Side: Market, Date, Stake -->
            <div style="padding-right:40px;">
                <div class="bet-market" style="font-weight:bold;color:#fff;font-size:14px;margin-bottom:4px;">${bet.market}</div>
                <div class="bet-date" style="color:#888;font-size:11px;margin-bottom:8px;">${bet.addedAt}</div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <input type="number" placeholder="Stake ($)" style="width:90px;padding:4px 6px;font-size:13px;border-radius:6px;border:1px solid #333;background:#0f0f1a;color:white;height:32px;" 
                        value="${bet.stake > 0 ? bet.stake : ''}"
                        oninput="updateStake('${bet.id}', this.value)">
                </div>
            </div>
            
            <!-- Right Side: Odds (top), Return (bottom) -->
            <div style="position:absolute;right:10px;bottom:14px;text-align:right;">
                <div class="bet-odds" style="color:#ff6b00;font-weight:bold;font-size:13px;margin-bottom:4px;">@ ${bet.odds.toFixed(2)}</div>
                <span class="returns" style="color:#4ade80;font-size:13px;white-space:nowrap;">Return: ৳${(bet.stake * bet.odds).toFixed(2)}</span>
            </div>
            
        </div>`;
  });
            
            html += '</div>';
        });
        
        container.innerHTML = html;
        if (multiSection) multiSection.style.display = 'block';
        calculateReturns();
    }
    
    updateTotalDisplay();
}

// ===== 7. STAKE UPDATE =====
function updateStake(betId, value) {
    const bet = betSlip.find(b => b.id === betId);
    if (!bet) return;
    
    bet.stake = parseFloat(value) || 0;
    saveSlip();
    
    const item = document.querySelector(`[data-bet-id="${betId}"]`);
    if (item) {
        const ret = item.querySelector('.returns');
        if (ret) ret.textContent = `Return: ৳${(bet.stake * bet.odds).toFixed(2)}`;
    }
    updateTotalDisplay();
}


// ===== 8. CALCULATE =====
function calculateReturns() {
    if (currentMode !== 'multiple') return;
    
    // Check: 2+ different events?
    const eventIds = [...new Set(betSlip.map(b => b.eventId))];
    if (eventIds.length < 2) {
        document.getElementById('totalOdds').textContent = '0.00';
        document.getElementById('potentialWin').textContent = '৳0.00';
        return;
    }
    
    // ✅ সব বেটের অডস গুণ হবে
    let totalOdds = betSlip.reduce((acc, b) => acc * b.odds, 1);
    const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
    
    document.getElementById('totalOdds').textContent = totalOdds.toFixed(2);
    document.getElementById('potentialWin').textContent = `৳${(stake * totalOdds).toFixed(2)}`;
}

// ===== 9. UPDATE COUNT & DISPLAY =====
function updateBetCount() {
    const countEl = document.getElementById('sportsBetSlipCount');
    const floatBtn = document.getElementById('sportsBetSlip');
    
    if (countEl) {
        countEl.textContent = betSlip.length;  // 0 হলে 0 দেখাবে
    }
    
    // ✅ স্পোর্টস পেইজে থাকলে সবসময় দেখা যাবে, কখনো হাইড হবে না
    if (floatBtn) {
        floatBtn.style.display = 'flex';
    }
    
    updateTotalDisplay();
}

function updateTotalDisplay() {
    const totalEl = document.getElementById('slipTotalAmount');
    if (!totalEl) return;
    
    if (currentMode === 'single') {
        // Sum ALL individual stakes
        const total = betSlip.reduce((s, b) => s + (b.stake || 0), 0);
        totalEl.textContent = `৳${total.toFixed(2)}`;
    } else {
        // Multi: show shared stake
        const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
        totalEl.textContent = `৳${stake.toFixed(2)}`;
    }
}

// ===== 10. PLACE BET =====
function placeSportsBet() {
    if (betSlip.length === 0) {
        showToast('Your bet slip is empty!', 'error');
        return;
    }

    let totalStake = 0;

    // ===== Calculate total stake =====
    if (currentMode === 'single') {
        const emptyStake = betSlip.some(b => !b.stake || b.stake <= 0);
        if (emptyStake) {
            showToast('Please enter stake for all bets!', 'error');
            return;
        }
        totalStake = betSlip.reduce((sum, b) => sum + b.stake, 0);
    } else {
        const eventIds = [...new Set(betSlip.map(b => b.eventId))];
        if (eventIds.length < 2) {
            showToast('Need bets from 2+ different matches for multi!', 'error');
            return;
        }
        
        const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
        if (stake <= 0) {
            showToast('Please enter your total stake!', 'error');
            return;
        }
        totalStake = stake;
    }

    // ===== Balance Check =====
    let balanceStr = localStorage.getItem('selectedBalance');
    console.log('Balance before bet:', balanceStr);
    
    if (!balanceStr || balanceStr === 'null') {
        showToast('Please select a currency first!', 'error');
        return;
    }

    let currencySymbol = balanceStr.match(/[^0-9.,]/g)?.[0] || '$';
    let currentBalance = parseFloat(balanceStr.replace(/[^0-9.]/g, '')) || 0;

    if (currentBalance < totalStake) {
        showToast('Insufficient balance!', 'error');
        return;
    }

    // Deduct balance
    let newBalance = currentBalance - totalStake;
    let newBalanceStr = currencySymbol + newBalance.toFixed(2);
    
    // ✅ localStorage আপডেট
    localStorage.setItem('selectedBalance', newBalanceStr);
    console.log('New balance:', newBalanceStr);
    
    // ✅ বেট স্লিপ আপডেট
    updateSlipBalance();
    
    // ✅ মেইন UI আপডেট (সব জায়গায়)
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USDT';
    updateMainWalletUI(savedCurrency, newBalanceStr);

    // ===== Place Bet =====
    console.log('Bet placed:', { 
        mode: currentMode, 
        bets: betSlip, 
        totalStake: totalStake,
        remainingBalance: newBalance 
    });
    
    showToast('Bet placed successfully!', 'success');
    
    // Clear slip
    betSlip = [];
    saveSlip();
    updateBetCount();
    renderBetSlip();
    closeSportsBetSlip();
    
    const ms = document.getElementById('multipleSection');
    if (ms) ms.style.display = 'none';
    const mstake = document.getElementById('multiStake');
    if (mstake) mstake.value = '';
}
// ===== HELPERS =====
function saveSlip() {
    localStorage.setItem('sportsBetSlip', JSON.stringify(betSlip));
}

function showToast(msg, type) {
    const existing = document.querySelector('.bet-slip-toast');
    if (existing) existing.remove();
    
    const t = document.createElement('div');
    t.className = 'bet-slip-toast';
    t.textContent = msg;
    t.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);
        padding:12px 24px;border-radius:8px;color:white;font-weight:500;z-index:99999;`;
    t.style.background = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity 0.3s'; setTimeout(()=>t.remove(),300); }, 2500);
}


// ===== STATE =====
let activeBets = [];
let sportsHistory = [];
let casinoBets = [];

// ===== ১. Open/Close History Panel =====
function footerOpenBetHistory() {
    const panel = document.getElementById('betHistoryPanel');
    if (panel) {
        panel.style.display = 'block';
        renderActiveBets();
        renderBetHistory();
    }
}

function closeBetHistory() {
    const panel = document.getElementById('betHistoryPanel');
    if (panel) panel.style.display = 'none';
}

// ===== ২. Main Tab Switch (Sports / Casino) =====
function switchHistoryTab(tab) {
    document.querySelectorAll('.history-main-tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('historySports').style.display = tab === 'sports' ? 'flex' : 'none';
    document.getElementById('historyCasino').style.display = tab === 'casino' ? 'flex' : 'none';
}

// ===== ৩. Sports Sub Tab Switch =====
function switchSportsSubTab(subTab) {
    const tabs = document.querySelectorAll('#historySports .history-sub-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('sportsActiveList').style.display = subTab === 'active' ? 'block' : 'none';
    document.getElementById('sportsHistoryList').style.display = subTab === 'history' ? 'block' : 'none';
    
    if (subTab === 'active') renderActiveBets();
    if (subTab === 'history') renderBetHistory();
}

// ===== ৪. Casino Sub Tab Switch =====
function switchCasinoSubTab(subTab) {
    const tabs = document.querySelectorAll('#historyCasino .history-sub-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    document.getElementById('casinoMyBetsList').style.display = subTab === 'mybets' ? 'block' : 'none';
    document.getElementById('casinoWinnersList').style.display = subTab === 'winners' ? 'block' : 'none';
}

// ===== ৫. Render Active Bets =====
function renderActiveBets() {
    const container = document.getElementById('sportsActiveList');
    if (!container) return;
    
    if (activeBets.length === 0) {
        container.innerHTML = '<div class="empty-history">No active bets</div>';
        return;
    }
    
    let html = '';
    activeBets.forEach(bet => {
        html += `
            <div class="active-bet-card" data-active-id="${bet.id}">
                <div class="bet-title">${bet.eventName}</div>
                <div class="bet-detail">${bet.market}</div>
                <div class="bet-odds">Odds: @${bet.odds.toFixed(2)}</div>
                <div class="bet-stake">Stake: ৳${bet.stake.toFixed(2)} | Potential: ৳${bet.potentialWin.toFixed(2)}</div>
                <button class="cashout-btn" onclick="cashOutBet('${bet.id}')">Cash Out (৳${(bet.stake * 0.85).toFixed(2)})</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ৬. Render Bet History =====
function renderBetHistory() {
    const container = document.getElementById('sportsHistoryList');
    if (!container) return;
    
    if (sportsHistory.length === 0) {
        container.innerHTML = '<div class="empty-history">No bet history</div>';
        return;
    }
    
    let html = '';
    sportsHistory.forEach(bet => {
        const statusClass = bet.status === 'lost' ? 'lost' : '';
        const statusText = bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Cashed Out';
        
        html += `
            <div class="history-bet-card ${statusClass}">
                <div class="status ${bet.status}">${statusText}</div>
                <div style="font-weight:bold;">${bet.eventName}</div>
                <div style="color:#888;font-size:12px;">${bet.market} | @${bet.odds.toFixed(2)}</div>
                <div style="margin-top:4px;">Stake: ৳${bet.stake.toFixed(2)} | Return: ৳${bet.returnAmount.toFixed(2)}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== ৭. Cash Out =====
// function cashOutBet(betId) {
   //  const betIndex = activeBets.findIndex(b => b.id === betId);
 //    if (betIndex === -1) return;
    
 //    const bet = activeBets[betIndex];
  //   const cashAmount = bet.stake * 0.85; // 85% cash out
    
  //   if (!confirm(`Cash out ৳${cashAmount.toFixed(2)} now?`)) return;
    
    // Add to history
   //  sportsHistory.unshift({
      //   ...bet,
       //  status: 'cashed',
       //  returnAmount: cashAmount,
       //  settledAt: new

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => updateBetCount());
