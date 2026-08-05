// ==========================================
// SPORTS.JS
// SPORTS FULL GAME VIEW
// ==========================================

console.log("SPORTS.JS LOADED");


// ==========================================
// OPEN SPORTS GAME
// ==========================================

function openSportsGame(sport, gameId) {

    // কোন Event Page থেকে Game Open হয়েছে সেটা মনে রাখো
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

  


    // ==========================================
    // FIND GAME
    // ==========================================

    const game = games[gameId];

    if (!game) {

        console.log("Sports game not found:", gameId);

        return;

    }


    // ==========================================
    // FIND GAME PAGE
    // ==========================================

    const gamePage =
        document.getElementById("sports-game-page");

    const gameTitle =
        document.getElementById("sports-game-title");

    const gameContent =
        document.getElementById("sports-game-content");


    if (!gamePage || !gameContent) {

        console.log("Sports game page not found");

        return;

    }
   // Hide Sports Sub Banner Slider

const sportsSubBanner =
    document.getElementById("sportsSubBanner");

if (sportsSubBanner) {

    sportsSubBanner.style.display = "none";

}
// Hide Sports Header
const sportsSubHeader =
    document.getElementById("sportsSubHeader");

if (sportsSubHeader) {
    sportsSubHeader.style.display = "none";
}

// Hide Sports Sub Category Grid
const sportsSubcatGrid =
    document.getElementById("sportsSubcatGrid");

if (sportsSubcatGrid) {
    sportsSubcatGrid.style.display = "none";
}

    // ==========================================
    // PAGE TITLE
    // ==========================================

    if (gameTitle) {

        gameTitle.textContent =
            sport === "cricket"
                ? "🏏 Cricket"
                : "⚽ Football";

    }


    // ==========================================
    // GAME CONTENT
    // ==========================================

    gameContent.innerHTML = `





    // ==========================================
    // FIND EXISTING SPORTS SECTIONS
    // ==========================================

    const sportsSubSection =
        document.getElementById("sports-sub-section");

    const trendingPage =
        document.getElementById("sports-trending-page");

    const cricketEventsPage =
        document.getElementById("cricket-events-page");

    const footballEventsPage =
        document.getElementById("football-events-page");



    // ==========================================
    // HIDE NORMAL SPORTS CONTENT
    // ==========================================

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



    // ==========================================
    // SHOW FULL GAME PAGE
    // ==========================================

    gamePage.style.display = "block";


    // Prevent browser from jumping to another section

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

// ----- STATE -----
let betSlip = [];
let currentMode = 'single';

// Load from localStorage on start
if (localStorage.getItem('sportsBetSlip')) {
    try {
        betSlip = JSON.parse(localStorage.getItem('sportsBetSlip'));
        updateBetCount();
    } catch (e) {
        betSlip = [];
    }
}


// ==========================================
// 1. addToBetSlip()
// ==========================================
function addToBetSlip(data) {
    const isDuplicate = betSlip.some(bet => 
        bet.eventId === data.eventId && bet.market === data.market
    );
    
    if (isDuplicate) {
        showToast('This selection is already in your bet slip!', 'error');
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
    openSportsBetSlip();
    showToast('Added to bet slip!', 'success');
}


// ==========================================
// 2. openSportsBetSlip()
// ==========================================
function openSportsBetSlip() {
    const panel = document.getElementById('sportsBetSlip');
    if (panel) {
        panel.style.display = 'block';
        renderBetSlip();
    }
}


// ==========================================
// 3. closeSportsBetSlip()
// ==========================================
function closeSportsBetSlip() {
    const panel = document.getElementById('sportsBetSlip');
    if (panel) {
        panel.style.display = 'none';
    }
}


// ==========================================
// 4. removeSingleBet()
// ==========================================
function removeSingleBet(betId) {
    betSlip = betSlip.filter(bet => bet.id !== betId);
    saveSlip();
    updateBetCount();
    renderBetSlip();
    
    if (betSlip.length === 0) {
        const multiSection = document.getElementById('multipleSection');
        if (multiSection) multiSection.style.display = 'none';
    }
}


// ==========================================
// 5. clearAllSportsBetSlip()
// ==========================================
function clearAllSportsBetSlip() {
    if (betSlip.length === 0) return;
    
    if (confirm('Are you sure you want to clear all bets?')) {
        betSlip = [];
        saveSlip();
        updateBetCount();
        renderBetSlip();
        
        const multiSection = document.getElementById('multipleSection');
        if (multiSection) multiSection.style.display = 'none';
        
        showToast('All bets cleared!', 'info');
    }
}


// ==========================================
// 6. switchBetMode()
// ==========================================
function switchBetMode(mode) {
    currentMode = mode;
    
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
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


// ==========================================
// 7. renderBetSlip()
// ==========================================
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
    
    Object.keys(grouped).forEach(eventId => {
        const bets = grouped[eventId];
        const eventName = bets[0].eventName;
        
        html += `<div class="event-group">
                    <div class="event-group-name">${eventName}</div>`;
        
        bets.forEach(bet => {
            if (currentMode === 'single') {
                html += `
                    <div class="bet-item" data-bet-id="${bet.id}">
                        <div class="bet-info">
                            <div class="bet-market">${bet.market}</div>
                            <div class="bet-odds">@ ${bet.odds.toFixed(2)}</div>
                            <div class="bet-date">${bet.addedAt}</div>
                        </div>
                        <button type="button" class="remove-btn" onclick="removeSingleBet('${bet.id}')">×</button>
                        <div class="single-stake stake-box">
                            <input type="number" 
                                   placeholder="Stake (৳)" 
                                   value="${bet.stake > 0 ? bet.stake : ''}"
                                   oninput="updateStake('${bet.id}', this.value)"
                                   min="0">
                            <span class="returns">Return: ৳${(bet.stake * bet.odds).toFixed(2)}</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="bet-item" data-bet-id="${bet.id}">
                        <div class="bet-info">
                            <div class="bet-market">${bet.market}</div>
                            <div class="bet-odds">@ ${bet.odds.toFixed(2)}</div>
                            <div class="bet-date">${bet.addedAt}</div>
                        </div>
                        <button type="button" class="remove-btn" onclick="removeSingleBet('${bet.id}')">×</button>
                    </div>
                `;
            }
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
    updateTotalDisplay();
    
    if (currentMode === 'multiple') {
        calculateReturns();
    }
}


// ==========================================
// 8. updateStake()
// ==========================================
function updateStake(betId, value) {
    const bet = betSlip.find(b => b.id === betId);
    if (bet) {
        bet.stake = parseFloat(value) || 0;
        saveSlip();
        
        const item = document.querySelector(`[data-bet-id="${betId}"]`);
        if (item) {
            const returnSpan = item.querySelector('.returns');
            if (returnSpan) {
                returnSpan.textContent = `Return: ৳${(bet.stake * bet.odds).toFixed(2)}`;
            }
        }
        
        updateTotalDisplay();
    }
}


// ==========================================
// 9. calculateReturns()
// ==========================================
function calculateReturns() {
    if (currentMode !== 'multiple') return;
    
    let totalOdds = 1;
    betSlip.forEach(bet => {
        totalOdds *= bet.odds;
    });
    
    const stakeInput = document.getElementById('multiStake');
    const stake = stakeInput ? (parseFloat(stakeInput.value) || 0) : 0;
    const potentialWin = stake * totalOdds;
    
    const totalOddsEl = document.getElementById('totalOdds');
    const potentialWinEl = document.getElementById('potentialWin');
    
    if (totalOddsEl) totalOddsEl.textContent = totalOdds.toFixed(2);
    if (potentialWinEl) potentialWinEl.textContent = `৳${potentialWin.toFixed(2)}`;
}


// ==========================================
// 10. updateBetCount()
// ==========================================
function updateBetCount() {
    const badge = document.getElementById('betBadge');
    if (badge) {
        badge.textContent = betSlip.length;
        badge.style.display = betSlip.length > 0 ? 'inline-block' : 'none';
    }
    updateTotalDisplay();
}


// ==========================================
// 11. updateTotalDisplay()
// ==========================================
function updateTotalDisplay() {
    const totalEl = document.getElementById('slipTotalAmount');
    if (!totalEl) return;
    
    if (currentMode === 'single') {
        const totalStake = betSlip.reduce((sum, bet) => sum + (bet.stake || 0), 0);
        totalEl.textContent = `৳${totalStake.toFixed(2)}`;
    } else {
        const stakeInput = document.getElementById('multiStake');
        const stake = stakeInput ? (parseFloat(stakeInput.value) || 0) : 0;
        totalEl.textContent = `৳${stake.toFixed(2)}`;
    }
}


// ==========================================
// 12. placeSportsBet()
// ==========================================
function placeSportsBet() {
    if (betSlip.length === 0) {
        showToast('Your bet slip is empty!', 'error');
        return;
    }

    if (currentMode === 'single') {
        const emptyStake = betSlip.some(bet => !bet.stake || bet.stake <= 0);
        if (emptyStake) {
            showToast('Please enter stake for all bets!', 'error');
            return;
        }
    } else {
        const stakeInput = document.getElementById('multiStake');
        const stake = stakeInput ? (parseFloat(stakeInput.value) || 0) : 0;
        if (stake <= 0) {
            showToast('Please enter your total stake!', 'error');
            return;
        }
    }

    const betData = {
        mode: currentMode,
        bets: betSlip.map(bet => ({
            eventId: bet.eventId,
            eventName: bet.eventName,
            market: bet.market,
            odds: bet.odds,
            stake: currentMode === 'single' ? bet.stake : 
                   parseFloat(document.getElementById('multiStake').value) / betSlip.length
        })),
        totalStake: currentMode === 'single' 
            ? betSlip.reduce((sum, b) => sum + b.stake, 0)
            : parseFloat(document.getElementById('multiStake').value),
        placedAt: new Date().toISOString()
    };

    console.log('Placing bet:', betData);
    
    // TODO: Replace with your API endpoint
    // fetch('/api/place-bet', { 
    //     method: 'POST', 
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(betData) 
    // });
    
    showToast('Bet placed successfully!', 'success');
    
    betSlip = [];
    saveSlip();
    updateBetCount();
    renderBetSlip();
    
    const multiSection = document.getElementById('multipleSection');
    if (multiSection) multiSection.style.display = 'none';
    
    const multiStake = document.getElementById('multiStake');
    if (multiStake) multiStake.value = '';
}


// ==========================================
// HELPERS
// ==========================================
function saveSlip() {
    localStorage.setItem('sportsBetSlip', JSON.stringify(betSlip));
}

function showToast(message, type) {
    const existing = document.querySelector('.bet-slip-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `bet-slip-toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    
    if (type === 'success') toast.style.background = '#22c55e';
    else if (type === 'error') toast.style.background = '#ef4444';
    else toast.style.background = '#3b82f6';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    updateBetCount();
});
