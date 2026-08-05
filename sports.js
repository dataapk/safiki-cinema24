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
    if (!container) return;
    
    if (betSlip.length === 0) {
        container.innerHTML = '<div class="empty-slip">Your bet slip is empty</div>';
        updateTotalDisplay();
        return;
    }

    const grouped = {};
    betSlip.forEach(bet => {
        if (!grouped[bet.eventId]) grouped[bet.eventId] = [];
        grouped[bet.eventId].push(bet);
    });

    let html = '';
    Object.keys(grouped).forEach(eid => {
        const bets = grouped[eid];
        html += `<div class="event-group"><div style="color:#ff6b00;font-weight:bold;margin-bottom:8px;">${bets[0].eventName}</div>`;
        
        bets.forEach(bet => {
            if (currentMode === 'single') {
                html += `
                    <div class="bet-item" data-bet-id="${bet.id}">
                        <div class="bet-info">
                            <div class="bet-market">${bet.market}</div>
                            <div class="bet-odds">@ ${bet.odds.toFixed(2)}</div>
                            <div class="bet-date">${bet.addedAt}</div>
                        </div>
                        <button class="remove-btn" onclick="removeSingleBet('${bet.id}')">×</button>
                        <div class="stake-box">
                            <input type="number" placeholder="Stake (৳)" 
                                value="${bet.stake > 0 ? bet.stake : ''}"
                                oninput="updateStake('${bet.id}', this.value)">
                            <span class="returns">Return: ৳${(bet.stake * bet.odds).toFixed(2)}</span>
                        </div>
                    </div>`;
            } else {
                html += `
                    <div class="bet-item" data-bet-id="${bet.id}">
                        <div class="bet-info">
                            <div class="bet-market">${bet.market}</div>
                            <div class="bet-odds">@ ${bet.odds.toFixed(2)}</div>
                            <div class="bet-date">${bet.addedAt}</div>
                        </div>
                        <button class="remove-btn" onclick="removeSingleBet('${bet.id}')">×</button>
                    </div>`;
            }
        });
        html += '</div>';
    });
    
    container.innerHTML = html;
    updateTotalDisplay();
    if (currentMode === 'multiple') calculateReturns();
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
    
    let totalOdds = betSlip.reduce((acc, b) => acc * b.odds, 1);
    const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
    
    const totalOddsEl = document.getElementById('totalOdds');
    const potentialWinEl = document.getElementById('potentialWin');
    
    if (totalOddsEl) totalOddsEl.textContent = totalOdds.toFixed(2);
    if (potentialWinEl) potentialWinEl.textContent = `৳${(stake * totalOdds).toFixed(2)}`;
}

// ===== 9. UPDATE COUNT & DISPLAY =====
function updateBetCount() {
    const countEl = document.getElementById('sportsBetSlipCount');
    const floatBtn = document.getElementById('sportsBetSlip');
    
    if (countEl) countEl.textContent = betSlip.length;
    if (floatBtn) floatBtn.style.display = betSlip.length > 0 ? 'flex' : 'none';
    
    updateTotalDisplay();
}

function updateTotalDisplay() {
    const totalEl = document.getElementById('slipTotalAmount');
    if (!totalEl) return;
    
    if (currentMode === 'single') {
        const total = betSlip.reduce((s, b) => s + (b.stake || 0), 0);
        totalEl.textContent = `৳${total.toFixed(2)}`;
    } else {
        const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
        totalEl.textContent = `৳${stake.toFixed(2)}`;
    }
}

// ===== 10. PLACE BET =====
function placeSportsBet() {
    if (betSlip.length === 0) {
        showToast('Empty slip!', 'error');
        return;
    }

    if (currentMode === 'single') {
        if (betSlip.some(b => !b.stake || b.stake <= 0)) {
            showToast('Enter stake for all bets!', 'error');
            return;
        }
    } else {
        const stake = parseFloat(document.getElementById('multiStake')?.value) || 0;
        if (stake <= 0) {
            showToast('Enter total stake!', 'error');
            return;
        }
    }

    console.log('Bet placed:', { mode: currentMode, bets: betSlip });
    showToast('Bet placed!', 'success');
    
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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => updateBetCount());
