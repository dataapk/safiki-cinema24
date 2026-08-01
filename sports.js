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



// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    // Hide Full Sports Game View
    const gamePage = document.getElementById("sports-game-page");

    if (gamePage) {
        gamePage.style.display = "none";
    }

    // Restore Previous Sports Event Page
    if (window.currentSportsPage) {

        const sportsEventPage =
            document.getElementById(window.currentSportsPage);

        if (sportsEventPage) {

            sportsEventPage.style.display = "block";

            sportsEventPage.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

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
