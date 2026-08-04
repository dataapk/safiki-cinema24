/* ==========================================
        SPORTS GAME DATABASE
========================================== */
console.log("SPORTS.JS LOADED");

let sportsBetSlip = [];


/* ==========================================
        OPEN SPORTS GAME
========================================== */

function openSportsGame(sport, gameId) {

    // কোন Page থেকে এসেছে মনে রাখো
    window.currentSportsPage = sport + "-events-page";

    const games = {

        /* ===============================
              CRICKET
        =============================== */

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
        },


        /* ===============================
              FOOTBALL
        =============================== */

        "football-live-1": {
            sport: "football",
            title: "Real Madrid vs Barcelona",
            status: "LIVE",
            league: "La Liga",
            homeTeam: "Real Madrid",
            awayTeam: "Barcelona"
        },

        "football-live-2": {
            sport: "football",
            title: "Liverpool vs Arsenal",
            status: "LIVE",
            league: "Premier League",
            homeTeam: "Liverpool",
            awayTeam: "Arsenal"
        },


        /* ===============================
              TENNIS
        =============================== */

        "tennis-live-1": {
            sport: "tennis",
            title: "Alcaraz vs Sinner",
            status: "LIVE",
            league: "ATP Tour",
            homeTeam: "Alcaraz",
            awayTeam: "Sinner"
        },


        /* ===============================
              BASKETBALL
        =============================== */

        "basketball-live-1": {
            sport: "basketball",
            title: "Lakers vs Celtics",
            status: "LIVE",
            league: "NBA",
            homeTeam: "Lakers",
            awayTeam: "Celtics"
        },


        /* ===============================
              HOCKEY
        =============================== */

        "hockey-live-1": {
            sport: "hockey",
            title: "India vs Pakistan",
            status: "LIVE",
            league: "FIH Pro League",
            homeTeam: "India",
            awayTeam: "Pakistan"
        },


        /* ===============================
              VOLLEYBALL
        =============================== */

        "volleyball-live-1": {
            sport: "volleyball",
            title: "Brazil vs Japan",
            status: "LIVE",
            league: "FIVB Nations League",
            homeTeam: "Brazil",
            awayTeam: "Japan"
        },


        /* ===============================
              HANDBALL
        =============================== */

        "handball-live-1": {
            sport: "handball",
            title: "Denmark vs France",
            status: "LIVE",
            league: "EHF Championship",
            homeTeam: "Denmark",
            awayTeam: "France"
        },


        /* ===============================
              BASEBALL
        =============================== */

        "baseball-live-1": {
            sport: "baseball",
            title: "Yankees vs Dodgers",
            status: "LIVE",
            league: "MLB",
            homeTeam: "Yankees",
            awayTeam: "Dodgers"
        },


        /* ===============================
              OTHERS
        =============================== */

        "others-live-1": {
            sport: "others",
            title: "Demo Match",
            status: "LIVE",
            league: "International",
            homeTeam: "Team A",
            awayTeam: "Team B"
        }

    };

    const game = games[gameId];

    if (!game) {

        console.log("Sports game not found :", gameId);

        return;

    }

    // এখান থেকে নিচে তোমার আগের render code থাকবে...
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
// ==========================================
// SHOW GAME PAGE
// ==========================================

gamePage.style.display = "block";

// ==========================================
// GAME CONTENT RENDER
// ==========================================

gameContent.innerHTML = `

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



<div class="sports-game-hero">

    <div class="sports-game-animation">

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


<div class="sports-betting-box">


    <div class="sports-betting-title">

        Match Betting

    </div>



    <div class="sports-market">


        <div class="sports-market-title">

            Match Winner

        </div>


        <div class="sports-bet-options">


            <button
                class="sports-bet-option"
                onclick="addToBetSlip({

                    eventId:'${gameId}',

                    market:'Match Winner',

                    selection:'${game.homeTeam}',

                    odds:1.85

                },this)"
            >

                <span>
                    ${game.homeTeam}
                </span>


                <strong>
                    1.85
                </strong>


            </button>



            <button
                class="sports-bet-option"
                onclick="addToBetSlip({

                    eventId:'${gameId}',

                    market:'Match Winner',

                    selection:'${game.awayTeam}',

                    odds:1.65

                },this)"
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


</div>

`;

window.openSportsGame = openSportsGame;



/* ==========================================
        BACK FROM SPORTS GAME
========================================== */

function backFromSportsGame() {

    const gamePage =
        document.getElementById("sports-game-page");

    if (gamePage) {

        gamePage.style.display = "none";

    }

    // Sports Header Show
    const sportsSubHeader =
        document.getElementById("sportsSubHeader");

    if (sportsSubHeader) {

        sportsSubHeader.style.display = "block";

    }

    // Sports Banner Show
    const sportsSubBanner =
        document.getElementById("sportsSubBanner");

    if (sportsSubBanner) {

        sportsSubBanner.style.display = "block";

    }

    // Sports Category Grid Show
    const sportsSubcatGrid =
        document.getElementById("sportsSubcatGrid");

    if (sportsSubcatGrid) {

        sportsSubcatGrid.style.display = "grid";

    }

    // আবার আগের Sports Section-এ ফিরে যাও
    if (window.currentSportsPage) {

        const page =
            document.getElementById(window.currentSportsPage);

        if (page) {

            page.style.display = "block";

        }

    }

}

window.backFromSportsGame = backFromSportsGame;


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

/* ===============================
      WINDOW EXPORT
================================ */


window.addToBetSlip = addToBetSlip;
window.removeSportsBet = removeSportsBet;
window.clearSportsBetSlip = clearSportsBetSlip;
window.placeSportsBet = placeSportsBet;
window.openSportsBetSlip = openSportsBetSlip;
window.closeSportsBetSlip = closeSportsBetSlip;



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
