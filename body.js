
/*==========================================
   LANDING PAGE — FULL JAVASCRIPT
   Hero Slider | Auto Slide | Interactions
========================================== */

(function() {
  'use strict';
  

  /* =========================================
     HOME VIEW SWITCH
     Guest / Member Section
  ========================================== */
function updateHomeView(isLoggedIn){

    const guestSection = document.getElementById("guest-section");
    const memberSection = document.getElementById("member-section");

    if(!guestSection || !memberSection) return;


    if(isLoggedIn){

        guestSection.style.display = "none";
        memberSection.style.display = "block";

    }else{

        guestSection.style.display = "block";
        memberSection.style.display = "none";

    }

}

window.updateHomeView = updateHomeView;
  /* ==========================================
     2. HERO BANNER SLIDER
  ========================================== */

  /* ==========================================
     2. HERO BANNER SLIDER
  ========================================== */

  const HeroSlider = {
    slides: [],
    dots: [],
    currentIndex: 0,
    interval: null,
    duration: 4500, // 4.5 seconds per slide

    init() {
      this.slides = document.querySelectorAll('.hero-slide');
      this.dots = document.querySelectorAll('.hero-dot');
      
      if (this.slides.length === 0) return;
      
      this.startAutoSlide();
      this.bindEvents();
    },

    goTo(index) {
      if (index < 0) index = this.slides.length - 1;
      if (index >= this.slides.length) index = 0;
      
      this.slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      
      this.currentIndex = index;
    },

    next() {
      this.goTo(this.currentIndex + 1);
    },

    startAutoSlide() {
      this.stopAutoSlide();
      this.interval = setInterval(() => this.next(), this.duration);
    },

    stopAutoSlide() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },

    bindEvents() {
      const slider = document.getElementById('heroSlider');
      if (!slider) return;
      
      // Pause on hover
      slider.addEventListener('mouseenter', () => this.stopAutoSlide());
      slider.addEventListener('mouseleave', () => this.startAutoSlide());
      
      // Touch swipe support
      let touchStartX = 0;
      let touchEndX = 0;
      
      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    },

    handleSwipe(startX, endX) {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next(); // Swipe left → next
        } else {
          this.goTo(this.currentIndex - 1); // Swipe right → prev
        }
      }
    }
  };

  // Global function for dot clicks
  window.goToSlide = function(index) {
    HeroSlider.goTo(index);
    HeroSlider.stopAutoSlide();
    setTimeout(() => HeroSlider.startAutoSlide(), 8000); // Resume after 8s
  };


   /* ======================================================
   CASINO & SPORTS SECTION JAVASCRIPT
====================================================== */

// ===== DOM ELEMENTS =====
const heroBanner = document.getElementById('heroBanner');
const mainCategorySection = document.getElementById('mainCategorySection');
const casinoSubSection = document.getElementById('casinoSubSection');
const sportsSubSection = document.getElementById('sportsSubSection');

// Sub-banner sliders
const casinoSlider = document.getElementById('casinoSlider');
const sportsSlider = document.getElementById('sportsSlider');

// Auto-slide intervals
let casinoSlideInterval = null;
let sportsSlideInterval = null;

// Current slide indices
let casinoCurrentSlide = 0;
let sportsCurrentSlide = 0;


   // ==========================================
// UPDATE BALANCE UI
// ==========================================

function updateBalanceUI(){

    let balance = 0;

    // Wallet Manager থেকে Current Balance
    if(window.walletManager){

        balance =
            walletManager.balances[
                walletManager.currentCurrency
            ] || 0;

    }

    const balanceText =
        "$" + Number(balance).toFixed(2);


    // ============================
    // UPDATE WALLET DROPDOWN
    // ============================

    if(typeof updateWalletDropdown === "function"){

        updateWalletDropdown();

    }


    // ============================
    // Header Balance
    // ============================

    const header =
        document.getElementById("selected-balance");

    if(header){

    console.log(
        "balanceText =",
        balanceText,
        typeof balanceText
    );

    header.textContent = balanceText;

}


    // ============================
    // Bet Slip Balance
    // ============================

    const slip =
        document.getElementById("slipBalance");

    if(slip){

        slip.textContent =
            balanceText;

    }

}
   window.updateBalanceUI = updateBalanceUI;
   
// ==========================================
// PAGE LOAD এ আগের সিলেকশন রিস্টোর
// ==========================================
function restoreSelectedCurrency() {

    loadWalletManager();

    const savedImage =
        localStorage.getItem("selectedCurrencyImage");

    const img =
        document.getElementById("selected-currency-img");

    if (img && savedImage) {

        img.src = savedImage;

    }

    document
        .querySelectorAll(".currency-option")
        .forEach(opt => {

            opt.classList.remove("selected");

            if (
                opt.querySelector(".name")?.textContent.trim() ===
                walletManager.currentCurrency
            ) {

                opt.classList.add("selected");

            }

        });

    updateBalanceUI();

}
   

// ===== SELECT MAIN CATEGORY (Casino or Sports) =====
function selectMainCategory(category) {
    // Hide hero banner (main slider)
    if (heroBanner) {
        heroBanner.style.display = 'none';
    }
    
    // Hide main category cards section
    if (mainCategorySection) {
        mainCategorySection.style.display = 'none';
    }
    
    // Hide both sub-sections first (reset)
    if (casinoSubSection) casinoSubSection.style.display = 'none';
    if (sportsSubSection) sportsSubSection.style.display = 'none';
    
   // Show selected sub-section
if (category === 'casino') {

    if (casinoSubSection) {

        casinoSubSection.style.display = 'block';

        casinoCurrentSlide = 0;

        updateSubSlider('casino', 0);

        startAutoSlide('casino');

    }

    // Hide Sports Bet Slip
    hideSportsBetSlip();

}
else if (category === 'sports') {

    if (sportsSubSection) {

        sportsSubSection.style.display = 'block';

        sportsCurrentSlide = 0;

        updateSubSlider('sports', 0);

        startAutoSlide('sports');

    }

    // Show Sports Bet Slip
    showSportsBetSlip();

}

// Scroll to top smoothly
window.scrollTo({
    top: 0,
    behavior: 'smooth'
});

}

window.selectMainCategory = selectMainCategory;
function showSportsBetSlip() {

    const slip = document.getElementById("sportsBetSlip");

    if (slip) {

        slip.style.display = "flex";

    }

}

function hideSportsBetSlip() {

    const slip = document.getElementById("sportsBetSlip");

    if (slip) {

        slip.style.display = "none";

    }

}

window.showSportsBetSlip = showSportsBetSlip;
window.hideSportsBetSlip = hideSportsBetSlip;
   

   

// ===== BACK TO MAIN DASHBOARD =====
function backToMainDashboard() {

      hideSportsBetSlip();
    // Show hero banner again
    if (heroBanner) {
        heroBanner.style.display = 'block';
    }
    
    // Show main category cards
    if (mainCategorySection) {
        mainCategorySection.style.display = 'block';
    }
    
    // Hide both sub-sections
    if (casinoSubSection) casinoSubSection.style.display = 'none';
    if (sportsSubSection) sportsSubSection.style.display = 'none';
    
    // Stop auto-slides
    stopAutoSlide('casino');
    stopAutoSlide('sports');
    
    // Reset active sub-categories
    document.querySelectorAll('.subcat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Scroll to top
    window.scrollTo({ top: 50, behavior: 'smooth' });
}
   window.backToMainDashboard = backToMainDashboard;

// ==========================================
// OPEN MY BETS
// ==========================================

function openMyBets(){

    const popup = document.getElementById("my-bets-popup");

    if(!popup) return;


    popup.classList.add("show");

    document.body.style.overflow = "hidden";


    // ==============================
    // DEFAULT SPORTS ACTIVE TAB
    // ==============================

    const sportsBtn =
        document.querySelector(
            '[data-category="sports"]'
        );

    if(sportsBtn){

        sportsBtn.click();

    }


    // ==============================
    // DEFAULT ACTIVE BETS SUB TAB
    // ==============================

    const activeBtn =
        document.querySelector(
            '[data-subtab="active"]'
        );

    if(activeBtn){

        activeBtn.click();

    }


    // ==============================
    // RENDER ACTIVE BETS
    // ==============================

    if(typeof renderActiveBets === "function"){


      
        cleanBetHistory();
        renderActiveBets();

    }

}


window.openMyBets = openMyBets;

// ==========================================
// CLOSE MY BETS
// ==========================================

function closeMyBets(){

    const popup = document.getElementById("my-bets-popup");

    if(!popup) return;

    popup.classList.remove("show");

    document.body.style.overflow = "";

}

window.closeMyBets = closeMyBets;


// ==========================================
// CLOSE WHEN CLICK OUTSIDE
// ==========================================

document.addEventListener("click",function(e){

    const popup = document.getElementById("my-bets-popup");

    const container = document.querySelector(".my-bets-container");

    if(!popup || !container) return;

    if(
        popup.classList.contains("show") &&
        e.target === popup
    ){

        closeMyBets();

    }

});

   // ==========================================
// MY BETS TAB SWITCH
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const mainTabs = document.querySelectorAll(".bets-main-tab");

    mainTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            // Active Button
            mainTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Panels
            const sportsPanel = document.getElementById("sports-bets-panel");
            const casinoPanel = document.getElementById("casino-bets-panel");

            if(tab.dataset.tab === "sports"){

                sportsPanel.style.display = "block";
                casinoPanel.style.display = "none";

            }else{

                sportsPanel.style.display = "none";
                casinoPanel.style.display = "block";

            }

        });

    });

});

   // ==========================================
// SPORTS / CASINO SUB TAB SWITCH
// ==========================================

document.addEventListener("DOMContentLoaded",()=>{

    const subTabs=document.querySelectorAll(".bets-sub-tab");

    subTabs.forEach(tab=>{

        tab.addEventListener("click",()=>{

            const wrapper=tab.parentElement;

            wrapper
            .querySelectorAll(".bets-sub-tab")
            .forEach(t=>t.classList.remove("active"));

            tab.classList.add("active");

            const panel=tab.closest(".bets-panel");
           // ==============================
// LOAD TAB CONTENT
// ==============================

const subtab = tab.dataset.subtab;


if(subtab === "active"){

    if(typeof renderActiveBets === "function"){

        renderActiveBets();

    }

}


if(subtab === "history"){

    if(typeof renderBetHistory === "function"){

        renderBetHistory();

    }

}

            if(!panel) return;

            const lists=panel.querySelectorAll(".bets-list");

            lists.forEach(list=>{

                list.style.display="none";

            });

            switch(tab.dataset.subtab){

                case "active":

                    document.getElementById("sports-active-list").style.display="flex";

                break;

                case "history":

                    document.getElementById("sports-history-list").style.display="flex";

                break;

                case "casino-active":

                    document.getElementById("casino-active-list").style.display="flex";

                break;

                case "casino-history":

                    document.getElementById("casino-history-list").style.display="flex";

                break;

            }

        });

    });

});

   // ==========================================
// RENDER ACTIVE BETS
// ==========================================

function renderActiveBets(){

    const container =
        document.getElementById("sports-active-list");

    if(!container) return;


    container.innerHTML = "";


    if(
        !walletManager.activeBets ||
        walletManager.activeBets.length === 0
    ){

        container.innerHTML = `
            <div class="empty-bets">
                No Active Bets
            </div>
        `;

        return;
    }


    walletManager.activeBets.forEach(bet=>{


        const card = document.createElement("div");

        card.className = "active-bet-card";


        card.innerHTML = `

            <div class="bet-header">

                <span>
                    Bet ID:
                    ${bet.betId}
                </span>

            </div>


            <div class="bet-info">

                <div>
                    Date:
                    ${bet.placedTime}
                </div>


                <div>
                    Odds:
                    ${bet.odds}
                </div>


                <div>
                    Stake:
                    ${bet.stake}
                    ${bet.currency}
                </div>


                <div>
                    Possible Win:
                    ${bet.possibleWin}
                    ${bet.currency}
                </div>

            </div>


            <button 
                class="cashout-btn"
                onclick="cashOutBet('${bet.betId}')">

                Cash Out

            </button>

        `;


        container.appendChild(card);


    });

}
   window.renderActiveBets = renderActiveBets;

   // ==========================================
// CASH OUT BET
// ==========================================

function cashOutBet(betId){

    const betIndex =
        walletManager.activeBets.findIndex(
            bet => bet.betId === betId
        );


    if(betIndex === -1){

        console.log("Bet not found");
        return;

    }


    const bet =
        walletManager.activeBets[betIndex];


   // ==============================
// CASH OUT AMOUNT
// ==============================

const cashOutAmount =
    Number(
        bet.possibleWin ||
        (bet.stake * bet.odds)
    );


if(cashOutAmount <= 0){

    console.log("Invalid Cash Out Amount");
    return;

}


    // ==============================
    // ADD BALANCE
    // ==============================

    const currentBalance =
        walletManager.balances[
            walletManager.currentCurrency
        ] || 0;


    walletManager.balances[
        walletManager.currentCurrency
    ] =
        Number(
            (
                currentBalance +
                cashOutAmount
            ).toFixed(2)
        );


    // ==============================
    // MOVE TO HISTORY
    // ==============================

    const historyBet = {

        ...bet,

        status: "CASHED OUT",

        cashOutAmount: cashOutAmount,

        cashOutTime:
            new Date().toLocaleString()

    };


    walletManager.betHistory.push(historyBet);
     cleanBetHistory();


    // ==============================
    // REMOVE ACTIVE BET
    // ==============================

    walletManager.activeBets.splice(
        betIndex,
        1
    );


    // ==============================
    // SAVE DATA
    // ==============================

    saveWalletManager();


    // ==============================
    // REFRESH UI
    // ==============================

    updateBalanceUI();

    renderActiveBets();


    console.log(
        "Cash Out Completed:",
        historyBet
    );


    showToast(
        "Cash Out Successful!",
        "success"
    );

}


window.cashOutBet = cashOutBet;


   // ==========================================
// RENDER BET HISTORY
// ==========================================

function renderBetHistory(){

    const container =
        document.getElementById("sports-history-list");


    if(!container) return;


    container.innerHTML = "";


    if(
        !walletManager.betHistory ||
        walletManager.betHistory.length === 0
    ){

        container.innerHTML = `
            <div class="empty-bets">

                <i class="fas fa-history"></i>

                <p>No Bet History</p>

            </div>
        `;

        return;

    }


    [...walletManager.betHistory]
.reverse()
.forEach(bet=>{


    const card =
        document.createElement("div");


        card.className =
            "history-bet-card";


        card.innerHTML = `

            <div class="bet-header">

                <span>
                    Bet ID:
                    ${bet.betId}
                </span>

            </div>


            <div class="bet-info">

                <div>
                    Date:
                    ${bet.placedTime || "-"}
                </div>


                <div>
                    Odds:
                    ${bet.odds || "-"}
                </div>


                <div>

                    Stake:

                    ${bet.stake || 0}

                    ${bet.currency || ""}

                </div>

                ${
                bet.status === "MATCH CANCELLED & REFUNDED"

                ? `

                <div>

                    Refund:

                    ${bet.refund || bet.stake}

                    ${bet.currency || ""}

                </div>


                <div>
                    Cash Out:
                    ${bet.cashOutAmount || 0}
                    ${bet.currency || ""}
                </div>


                <div class="bet-status">

    <span class="bet-status ${
        bet.status === "CASHED OUT"
            ? "cashed-out"
        : bet.status === "WIN"
            ? "win"
        : bet.status === "LOSE"
            ? "lose"
        : bet.status === "MATCH CANCELLED & REFUNDED"
               ? "refunded"
        : ""
    }">

        ${bet.status || "COMPLETED"}

        </span>

</div>

    </div>

        `;


        container.appendChild(card);


    });

}


window.renderBetHistory = renderBetHistory;


   // ==========================================
// CLEAN OLD BET HISTORY
// KEEP ONLY LAST 7 DAYS
// ==========================================

function cleanBetHistory(){

    if(
        !walletManager.betHistory ||
        walletManager.betHistory.length === 0
    ){
        return;
    }


    const now = new Date();


    walletManager.betHistory =
        walletManager.betHistory.filter(bet=>{


            const betDate =
                new Date(
                    bet.cashOutTime ||
                    bet.placedTime
                );


            const diffTime =
                now - betDate;


            const diffDays =
                diffTime /
                (1000 * 60 * 60 * 24);


            return diffDays <= 7;


        });


    saveWalletManager();

}


window.cleanBetHistory = cleanBetHistory;

   // ==========================================
// REJECT BET (SIMULATION)
// ==========================================

function rejectBet(betId){

    const index =
        walletManager.activeBets.findIndex(
            bet=>bet.betId===betId
        );

    if(index===-1){

        console.log("Bet Not Found");

        return;

    }


    const bet =
        walletManager.activeBets[index];


    const refund =
        Number(bet.stake || 0);


    // Refund Wallet

    walletManager.balances[
        walletManager.currentCurrency
    ] += refund;


    // Remove Active

    walletManager.activeBets.splice(
        index,
        1
    );


    // History

    walletManager.betHistory.push({

        ...bet,

        status: "MATCH CANCELLED & REFUNDED",

refund: refund,

refundedTime: new Date().toLocaleString()
    });


    cleanBetHistory();


    saveWalletManager();


    updateBalanceUI();

    updateSlipBalance();


    renderActiveBets();

    renderBetHistory();


    showToast(
        "Bet Rejected • Stake Refunded",
        "success"
    );

}

window.rejectBet = rejectBet;

   

// ===== SUB-BANNER SLIDER =====
function goToSubSlide(type, index) {
    updateSubSlider(type, index);
    
    if (type === 'casino') {
        casinoCurrentSlide = index;
        resetAutoSlide('casino');
    } else if (type === 'sports') {
        sportsCurrentSlide = index;
        resetAutoSlide('sports');
    }
}

function updateSubSlider(type, index) {
    const sliderId = type === 'casino' ? 'casinoSlider' : 'sportsSlider';
    const slider = document.getElementById(sliderId);
    
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.sub-slide');
    const dots = slider.parentElement.querySelectorAll('.sub-dot');
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ===== AUTO SLIDE (4 seconds) =====
function startAutoSlide(type) {
    stopAutoSlide(type);
    
    const interval = setInterval(() => {
        if (type === 'casino') {
            casinoCurrentSlide = (casinoCurrentSlide + 1) % 3;
            updateSubSlider('casino', casinoCurrentSlide);
        } else if (type === 'sports') {
            sportsCurrentSlide = (sportsCurrentSlide + 1) % 3;
            updateSubSlider('sports', sportsCurrentSlide);
        }
    }, 4000);
    
    if (type === 'casino') {
        casinoSlideInterval = interval;
    } else {
        sportsSlideInterval = interval;
    }
}

function stopAutoSlide(type) {
    if (type === 'casino' && casinoSlideInterval) {
        clearInterval(casinoSlideInterval);
        casinoSlideInterval = null;
    } else if (type === 'sports' && sportsSlideInterval) {
        clearInterval(sportsSlideInterval);
        sportsSlideInterval = null;
    }
}

function resetAutoSlide(type) {
    startAutoSlide(type);
}


// ==========================================
// SELECT SPORTS SUB CATEGORY
// ==========================================

function selectSubCategory(pageId, element) {

    // ----------------------------
    // Active Button
    // ----------------------------

    const parentGrid = element.closest(".subcat-grid");

    if (parentGrid) {

        parentGrid.querySelectorAll(".subcat-item").forEach(item => {

            item.classList.remove("active");

        });

    }

    element.classList.add("active");


    // ----------------------------
    // Keep Sports Section Visible
    // ----------------------------

    const sportsSubSection =
        document.getElementById("sports-sub-section");

    if (sportsSubSection) {

        sportsSubSection.style.display = "block";

    }


    // ----------------------------
    // Hide Trending
    // ----------------------------

    const trending =
        document.getElementById("sports-trending-page");

    if (trending) {

        trending.style.display = "none";

    }


    // ----------------------------
    // Hide All Event Pages
    // ----------------------------

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

        const page =
            document.getElementById(id);

        if (page) {

            page.style.display = "none";

        }

    });


    // ----------------------------
    // Show Selected Event Page
    // ----------------------------

    const currentPage =
        document.getElementById(pageId);

    if (currentPage) {

        currentPage.style.display = "block";

        currentPage.scrollIntoView({

            behavior: "smooth",
            block: "start"

        });

    }

}


// ==========================================
// GLOBAL
// ==========================================

window.selectSubCategory = selectSubCategory;

   // ===========================
// BACK TO TRENDING
// ===========================

function backToTrending() {

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


    // Show Trending

    const trending = document.getElementById("sports-trending-page");

    if (trending) {

        trending.style.display = "block";

        trending.scrollIntoView({

            behavior: "smooth",
            block: "start"

        });

    }


    // Remove Active Button

    document.querySelectorAll(".subcat-item").forEach(item => {

        item.classList.remove("active");

    });

}

window.backToTrending = backToTrending;
// ==========================================
// SPORTS - OPEN GAME
// ==========================================



// ===== OPEN GAME (Placeholder) =====
function openGame(mainType, subType, gameId) {
    console.log(`Opening ${mainType} > ${subType} > Game ${gameId}`);
    // Add your game open logic here
    // e.g., window.location.href = `/game/${mainType}/${subType}/${gameId}`;
}
   window.openGame = openGame;   // ← এই লাইনে বসবে

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
    // Ensure sub-sections are hidden on load
    if (casinoSubSection) casinoSubSection.style.display = 'none';
    if (sportsSubSection) sportsSubSection.style.display = 'none';
});

  /* ==========================================
     3. GAMES MARQUEE — CSS handles animation
     (No JS needed for basic marquee)
  ========================================== */

  const GamesMarquee = {
    init() {
      // Optional: Pause on hover is handled by CSS
      // Optional: Dynamic speed based on screen width
      this.adjustSpeed();
      window.addEventListener('resize', () => this.adjustSpeed());
    },

    adjustSpeed() {
      const track = document.querySelector('.marquee-content');
      if (!track) return;
      
      // Slower on mobile for readability
      if (window.innerWidth < 480) {
        track.style.animationDuration = '35s';
      } else {
        track.style.animationDuration = '25s';
      }
    }
  };

  /* ==========================================
     5. RECENT WINNERS SLIDER
     CSS handles animation, JS for dynamic data
  ========================================== */

  const WinnersSlider = {
    init() {
      this.duplicateForSeamlessLoop();
    },

    duplicateForSeamlessLoop() {
      // Ensure seamless loop by duplicating cards if needed
      const track = document.getElementById('winnersTrack');
      if (!track) return;
      
      // The HTML already has 10 cards, CSS animation handles the rest
      // This function can be used to dynamically add more winners from API
    },

    // Add new winner dynamically (for future backend integration)
    addWinner(name, game, amount, avatarColor) {
      const track = document.getElementById('winnersTrack');
      if (!track) return;
      
      const card = document.createElement('div');
      card.className = 'winner-card';
      card.style.cssText = 'background: var(--surface); border: 1px solid var(--border);';
      card.innerHTML = `
        <div class="winner-avatar" style="background: ${avatarColor};">${name.charAt(0)}</div>
        <span class="winner-name" style="color: var(--text);">${name}</span>
        <span class="winner-game" style="color: var(--text-muted);">${game}</span>
        <span class="winner-amount" style="color: var(--yellow);">${amount}</span>
      `;
      
      track.appendChild(card);
    }
  };

  /* ==========================================
     STICKY BOTTOM BAR
  ========================================== */

  const StickyBar = {
    init() {
      this.checkScroll();
      window.addEventListener('scroll', () => this.checkScroll());
    },

    checkScroll() {
      const bar = document.getElementById('stickyBottomBar');
      if (!bar) return;
      
      // Show sticky bar after scrolling down 200px
      if (window.scrollY > 200) {
        bar.style.transform = 'translateY(0)';
      } else {
        bar.style.transform = 'translateY(100%)';
      }
    }
  };

  /* ==========================================
     SMOOTH SCROLL FOR FOOTER LINKS
  ========================================== */

  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#') return; // Skip placeholder links
          
          const target = document.querySelector(targetId);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  };

  /* ==========================================
     ANIMATION ON SCROLL (Intersection Observer)
  ========================================== */

  const ScrollAnimations = {
    init() {
      if (!('IntersectionObserver' in window)) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.offer-card, .why-card, .crypto-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
      });
    }
  };

  /* ==========================================
     COUNTER ANIMATION (for future stats)
 ========================================== */

  const CounterAnimation = {
    animate(element, target, duration = 2000) {
      let start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start).toLocaleString();
        }
      }, 16);
    }
  };

  /* ==========================================
     TOAST NOTIFICATION
  ========================================== */

  window.showLandingToast = function(message, type = 'success') {
    const existing = document.querySelector('.landing-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'landing-toast';
    
    const colors = {
      success: 'linear-gradient(135deg, #1d8548, #16a34a)',
      error: 'linear-gradient(135deg, #ef4444, #ff5252)',
      info: 'linear-gradient(135deg, #2979ff, #448aff)',
      warning: 'linear-gradient(135deg, #d6c61a, #e8d52a)'
    };

    toast.innerHTML = `<span>${message}</span>`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: ${colors[type] || colors.success};
      color: #fff;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      white-space: nowrap;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  /* ==========================================
     LOGIN / REGISTER / DEPOSIT HANDLERS
     (Placeholder for future integration)
  ========================================== */

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.sticky-btn, .hero-btn');
    if (!btn) return;
    
    const text = btn.textContent.trim().toLowerCase();
    
    if (text.includes('login')) {
      // window.location.href = '/login';
      console.log('Login clicked');
    } else if (text.includes('register') || text.includes('join')) {
      // window.location.href = '/register';
      console.log('Register clicked');
    } else if (text.includes('deposit')) {
      // window.location.href = '/deposit';
      console.log('Deposit clicked');
    } else if (text.includes('claim')) {
      showLandingToast('Please login to claim this offer', 'info');
    }
  });

 /* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener('DOMContentLoaded', function () {

    HeroSlider.init();
    GamesMarquee.init();
    WinnersSlider.init();
    StickyBar.init();
    SmoothScroll.init();
    ScrollAnimations.init();

    updateHomeView();

    // Load Wallet
    loadWalletManager();

    // Restore Selected Currency + Balance
    restoreSelectedCurrency();

    // Update Header + Bet Slip UI
    updateBalanceUI();

if(typeof updateWalletDropdown === "function"){

    updateWalletDropdown();

}

console.log("Landing Page JS initialized");

});

})();   // ← এটা আগের মতোই থাকবে
