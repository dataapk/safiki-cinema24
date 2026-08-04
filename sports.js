/* ==========================================
        SPORTS GAME DATABASE
========================================== */
console.log("SPORTS.JS LOADED");

let sportsBetSlip = [];
let addtoBetSlip = [];

// ==========================================
// OPEN SPORTS GAME
// ==========================================
console.log("OPEN FUNCTION REACHED");

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

        <!-- ==========================================
             LIVE MATCH HEADER
        ========================================== -->

        <div class="sports-game-match-header">

            <div class="sports-game-live-badge">

                <span class="live-dot"></span>

                LIVE

            </div>


            <div class="sports-game-match-title">

                ${game.title}

            </div>


            <div class="sports-game-league">

                ${game.league}

            </div>

        </div>



        <!-- ==========================================
             MATCH ANIMATION / VIDEO BOX
        ========================================== -->

        <div class="sports-game-hero">

            <div class="sports-game-animation">

                <div class="sports-animation-live">

                    ● LIVE

                </div>


                <div class="sports-animation-icon">

                    🏏

                </div>


                <div class="sports-animation-title">

                    ${game.title}

                </div>


                <div class="sports-animation-subtitle">

                    Live Match Centre

                </div>

            </div>

        </div>



        <!-- ==========================================
             BETTING SECTION
        ========================================== -->

        <div class="sports-betting-box">


            <div class="sports-betting-title">

                Match Betting

            </div>



            <!-- ======================================
                 MATCH WINNER
            ====================================== -->

            <div class="sports-market">

                <div class="sports-market-title">

                    Match Winner

                </div>


                <div class="sports-bet-options">


                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            ${game.homeTeam}

                        </span>


                        <strong>

                            1.85

                        </strong>

                    </button>



                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            ${game.awayTeam}

                        </span>


                        <strong>

                            1.65

                        </strong>

                    </button>


                </div>

            </div>



            <!-- ======================================
                 TOTAL RUNS
            ====================================== -->

            <div class="sports-market">

                <div class="sports-market-title">

                    Total Runs

                </div>


                <div class="sports-bet-options">


                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            Over 180.5

                        </span>


                        <strong>

                            1.90

                        </strong>

                    </button>



                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            Under 180.5

                        </span>


                        <strong>

                            1.80

                        </strong>

                    </button>


                </div>

            </div>



            <!-- ======================================
                 TOTAL BET
            ====================================== -->

            <div class="sports-total-bet">

                <span>

                    Total Bet

                </span>


                <strong>

                    ৳0

                </strong>

            </div>



            <!-- ======================================
                 PLACE BET
            ====================================== -->

            <button
                type="button"
                class="sports-place-bet"
            >

                PLACE BET

            </button>


        </div>

    `;



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

console.log("OPEN FUNCTION CLOSED");

window.openSportsGame = openSportsGame;



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


/* ==========================================
        SPORTS BET SLIP SYSTEM
========================================== */

function addToBetSlip(betData, btn){

    // একই বেট দুইবার এড না হয়
    const exists = sportsBetSlip.find(item =>
        item.eventId === betData.eventId &&
        item.market === betData.market &&
        item.selection === betData.selection
    );

    if(exists){
        return;
    }

    sportsBetSlip.push(betData);

    updateSportsBetSlip();

    openSportsBetSlip();

}

/* ===============================
      UPDATE BETSLIP
================================ */

function updateSportsBetSlip(){

    const container = document.getElementById("sportsBetSlipContainer");

    const count = document.getElementById("sportsBetSlipCount");

    if(!container) return;

    container.innerHTML = "";

    sportsBetSlip.forEach((bet,index)=>{

        container.innerHTML += `

        <div class="sports-slip-card">

            <div class="sports-slip-match">

                <strong>${bet.home}</strong>

                <span>vs</span>

                <strong>${bet.away}</strong>

            </div>

            <div class="sports-slip-market">

                ${bet.market}

            </div>

            <div class="sports-slip-selection">

                ${bet.selection}

            </div>

            <div class="sports-slip-odds">

                Odds : ${bet.odds}

            </div>

            <button
                class="sports-remove-btn"
                onclick="removeSportsBet(${index})">

                Remove

            </button>

        </div>

        `;

    });

    if(count){

        count.innerText = sportsBetSlip.length;

        document.getElementById("sportsBetSlip").style.display =
            sportsBetSlip.length ? "flex" : "none";

    }

}

/* ===============================
      REMOVE SINGLE BET
================================ */

function removeSportsBet(index){

    sportsBetSlip.splice(index,1);

    updateSportsBetSlip();

}

/* ===============================
      CLEAR ALL BETS
================================ */

function clearSportsBetSlip(){

    sportsBetSlip = [];

    updateSportsBetSlip();

    closeSportsBetSlip();

}

/* ===============================
      PLACE BET
================================ */

function placeSportsBet(){

    if(sportsBetSlip.length===0){

        alert("No Bet Selected");

        return;

    }

    console.log("BET DATA",sportsBetSlip);

    alert("Bet Placed Successfully");

    sportsBetSlip=[];

    updateSportsBetSlip();

    closeSportsBetSlip();

}

/* ===============================
      OPEN POPUP
================================ */

function openSportsBetSlip(){

    document.getElementById("sportsBetSlipPopup").style.display="block";

}

/* ===============================
      CLOSE POPUP
================================ */

function closeSportsBetSlip(){

    document.getElementById("sportsBetSlipPopup").style.display="none";

}




            <!-- ======================================
                 TOTAL RUNS
            ====================================== -->

            <div class="sports-market">

                <div class="sports-market-title">

                    Total Runs

                </div>


                <div class="sports-bet-options">


                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            Over 180.5

                        </span>


                        <strong>

                            1.90

                        </strong>

                    </button>



                    <button
                        type="button"
                        class="sports-bet-option"
                    >

                        <span>

                            Under 180.5

                        </span>


                        <strong>

                            1.80

                        </strong>

                    </button>


                </div>

            </div>



            <!-- ======================================
                 TOTAL BET
            ====================================== -->

            <div class="sports-total-bet">

                <span>

                    Total Bet

                </span>


                <strong>

                    ৳0

                </strong>

            </div>



            <!-- ======================================
                 PLACE BET
            ====================================== -->

            <button
                type="button"
                class="sports-place-bet"
            >

                PLACE BET

            </button>


        </div>

    `;



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



/* ==========================================
        BET SLIP POPUP
========================================== */


/* OPEN */

function openSportsBetSlip(){


    const popup =
    document.getElementById(
        "sportsBetSlipPopup"
    );


    if(!popup) return;


    popup.style.display="flex";


    lockBodyScroll();

}



/* CLOSE */

function closeSportsBetSlip(){


    const popup =
    document.getElementById(
        "sportsBetSlipPopup"
    );


    if(!popup) return;


    popup.style.display="none";


    unlockBodyScroll();

}



/* FLOATING BUTTON CLICK */

const sportsBetSlipButton =
document.getElementById(
    "sportsBetSlip"
);


if(sportsBetSlipButton){

    sportsBetSlipButton
    .addEventListener(
        "click",
        openSportsBetSlip
    );

}

// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.openSportsGame = openSportsGame;
window.backFromSportsGame = backFromSportsGame;
window.addToBetSlip = addToBetSlip;
window.removeSportsBet = removeSportsBet;
window.clearSportsBetSlip = clearSportsBetSlip;
window.placeSportsBet = placeSportsBet;
window.openSportsBetSlip = openSportsBetSlip;
window.closeSportsBetSlip = closeSportsBetSlip;



// ==========================================
// DEBUG
// ==========================================

window.openSportsGame = openSportsGame;

console.log(
    "EXPORT CHECK:",
    typeof window.openSportsGame
);

console.log(
    "backFromSportsGame TYPE:",
    typeof window.backFromSportsGame
);

console.log(
    "CHECK FUNCTION:",
    typeof openSportsGame
);


window.openSportsGame = openSportsGame;


console.log(
    "CHECK WINDOW:",
    typeof window.openSportsGame
);
