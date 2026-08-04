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


                <button
    type="button"
    class="sports-bet-option"

    onclick="
        addToBetSlip({

            eventId:'${game.id}',

            market:'Match Winner',

            selection:'${game.homeTeam}',

            odds:1.85,

            home:'${game.homeTeam}',

            away:'${game.awayTeam}'

        },this)

    "

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
        BET SLIP POPUP
========================================== */

.sports-betslip-popup{

    position:fixed;

    left:50%;

    top:50%;

    transform:translate(-50%,-50%);

    width:95%;

    max-width:420px;

    max-height:85vh;

    background:#1f1f23;

    border:1px solid rgba(255,255,255,.08);

    border-radius:18px;

    overflow:hidden;

    display:flex;

    flex-direction:column;

    z-index:99999;

    box-shadow:0 20px 60px rgba(0,0,0,.65);

}



/* HEADER */

.sports-betslip-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:18px;

    background:#2a2a30;

    border-bottom:1px solid rgba(255,255,255,.08);

}


.sports-betslip-header h3{

    margin:0;

    color:#fff;

    font-size:20px;

    font-weight:600;

}


.sports-betslip-close{

    border:none;

    background:none;

    color:#fff;

    font-size:22px;

    cursor:pointer;

}



/* TABS */

.sports-betslip-tabs{

    display:flex;

    gap:10px;

    padding:15px;

    background:#222228;

}


.sports-betslip-tabs button{

    flex:1;

    padding:12px;

    border:none;

    border-radius:10px;

    background:#34343c;

    color:#ddd;

    cursor:pointer;

    transition:.25s;

}


.sports-betslip-tabs button.active{

    background:#2fbf71;

    color:#fff;

}



/* BET LIST */

.sports-betslip-list{

    flex:1;

    overflow-y:auto;

    padding:15px;

}


.sports-empty-slip{

    text-align:center;

    color:#aaa;

    padding:40px 10px;

    font-size:15px;

}



/* BET CARD */

.bet-item{

    background:#2d2d34;

    border-radius:12px;

    padding:15px;

    margin-bottom:12px;

}


.bet-item h4{

    margin:0 0 6px;

    color:#fff;

    font-size:15px;

}


.bet-item p{

    margin:0;

    color:#bfbfbf;

    font-size:13px;

}



/* STAKE */

.sports-stake-box{

    padding:15px;

    border-top:1px solid rgba(255,255,255,.08);

}


.sports-stake-box label{

    display:block;

    color:#ccc;

    margin-bottom:8px;

}


.sports-stake-box input{

    width:100%;

    padding:12px;

    border:none;

    border-radius:10px;

    background:#34343c;

    color:#fff;

    font-size:15px;

    outline:none;

}



/* SUMMARY */

.sports-slip-summary{

    padding:15px;

    display:flex;

    flex-direction:column;

    gap:10px;

    border-top:1px solid rgba(255,255,255,.08);

}


.sports-slip-summary div{

    display:flex;

    justify-content:space-between;

}


.sports-slip-summary span{

    color:#bfbfbf;

}


.sports-slip-summary strong{

    color:#2fbf71;

    font-size:16px;

}



/* BUTTONS */

.sports-slip-actions{

    display:flex;

    gap:10px;

    padding:15px;

    border-top:1px solid rgba(255,255,255,.08);

}


.sports-clear-btn{

    flex:1;

    padding:14px;

    border:none;

    border-radius:10px;

    background:#555;

    color:#fff;

    cursor:pointer;

}


.sports-placebet-btn{

    flex:2;

    padding:14px;

    border:none;

    border-radius:10px;

    background:#2fbf71;

    color:#fff;

    font-weight:600;

    cursor:pointer;

}



/* SCROLL */

.sports-betslip-list::-webkit-scrollbar{

    width:6px;

}


.sports-betslip-list::-webkit-scrollbar-thumb{

    background:#555;

    border-radius:20px;

}



/* MOBILE */

@media(max-width:600px){

    .sports-betslip-popup{

        width:96%;

        max-height:90vh;

        border-radius:16px;

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
