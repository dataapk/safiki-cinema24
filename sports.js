function openSportsGame(sport, gameId) {

    const games = {
"cricket-live-1": {
    sport: "cricket",
    title: "Bangladesh vs India",
    status: "LIVE",
    league: "T20 International",
    homeTeam: "Bangladesh",
    awayTeam: "India"
}

        "cricket-live-2": {
            sport: "cricket",
            title: "Australia vs Pakistan",
            status: "LIVE",
            league: "T20 International"
        }

    };

    const game = games[gameId];

    if (!game) {
        console.log("Game not found:", gameId);
        return;
    }

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

    gameTitle.textContent =
        sport === "cricket"
            ? "🏏 Cricket"
            : "⚽ Football";


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
         MATCH ANIMATION / VIDEO
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


        <!-- MATCH WINNER -->

        <div class="sports-market">

            <div class="sports-market-title">
                Match Winner
            </div>

            <div class="sports-bet-options">

                <button class="sports-bet-option">

                    <span>
                        Bangladesh
                    </span>

                    <strong>
                        1.85
                    </strong>

                </button>


                <button class="sports-bet-option">

                    <span>
                        India
                    </span>

                    <strong>
                        1.65
                    </strong>

                </button>

            </div>

        </div>


        <!-- TOTAL RUNS -->

        <div class="sports-market">

            <div class="sports-market-title">
                Total Runs
            </div>

            <div class="sports-bet-options">

                <button class="sports-bet-option">

                    <span>
                        Over 180.5
                    </span>

                    <strong>
                        1.90
                    </strong>

                </button>


                <button class="sports-bet-option">

                    <span>
                        Under 180.5
                    </span>

                    <strong>
                        1.80
                    </strong>

                </button>

            </div>

        </div>


        <!-- BET TOTAL -->

        <div class="sports-total-bet">

            <span>
                Total Bet
            </span>

            <strong>
                ৳0
            </strong>

        </div>


        <!-- PLACE BET -->

        <button class="sports-place-bet">

            PLACE BET

        </button>

    </div>

`;

    // Show game page

    const sportsSubSection =
    document.getElementById("sports-sub-section");

const trendingPage =
    document.getElementById("sports-trending-page");

const cricketEventsPage =
    document.getElementById("cricket-events-page");

const footballEventsPage =
    document.getElementById("football-events-page");

// Hide normal sports content
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
   gamePage.style.display = "block";

}


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.openSportsGame = openSportsGame;
window.backFromSportsGame = backFromSportsGame;
