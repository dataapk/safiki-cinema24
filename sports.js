// ==========================================
// SPORTS.JS
// SPORTS GAME PAGE
// ==========================================


// ==========================================
// SPORTS GAME DATA
// ==========================================

const sportsGames = {

    "cricket-live-1": {
        sport: "cricket",
        title: "Bangladesh vs India",
        status: "LIVE",
        league: "T20 International"
    },

    "cricket-live-2": {
        sport: "cricket",
        title: "Australia vs Pakistan",
        status: "LIVE",
        league: "T20 International"
    }

};


// ==========================================
// OPEN SPORTS GAME
// ==========================================

function openSportsGame(sport, gameId) {

    const game = sportsGames[gameId];

    if (!game) {

        console.log("Sports game not found:", gameId);

        return;

    }


    // Create new URL

    const url =
        window.location.pathname +
        "?sportsGame=" +
        encodeURIComponent(gameId);


    // Reload and open the game page

    window.location.href = url;

}


window.openSportsGame = openSportsGame;


// ==========================================
// RENDER SPORTS GAME PAGE
// ==========================================

function renderSportsGamePage() {

    const params =
        new URLSearchParams(window.location.search);


    const gameId =
        params.get("sportsGame");


    // No sports game selected

    if (!gameId) {

        return;

    }


    const game =
        sportsGames[gameId];


    if (!game) {

        return;

    }


    // ======================================
    // FIND MAIN CONTENT
    // ======================================

    const mainContent =
        document.querySelector(".main-content");


    if (!mainContent) {

        console.log("Main content not found");

        return;

    }


    // ======================================
    // HIDE EXISTING MAIN PAGE CONTENT
    // ======================================

    Array.from(mainContent.children).forEach(function(child) {

        child.style.display = "none";

    });


    // ======================================
    // CREATE SPORTS GAME PAGE
    // ======================================

    const gamePage =
        document.createElement("div");


    gamePage.id =
        "sports-full-game-page";


    gamePage.className =
        "sports-full-game-page";


    gamePage.innerHTML = `

        <div class="sports-page-header">


            <button class="sports-back-btn"
                    onclick="backFromSportsGame()">

                <i class="fas fa-arrow-left"></i>

                Back

            </button>


            <div class="sports-page-title">

                🏏 Cricket

            </div>


        </div>


        <div class="sports-section">


            <div class="sports-section-title">

                🏏 ${game.title}

            </div>


            <div class="sports-league-item">


                <div class="league-header">


                    <div class="league-name">

                        ${game.title}

                    </div>


                    <span class="event-live">

                        ● ${game.status}

                    </span>


                </div>


            </div>


            <div class="sports-league-item">


                <div class="league-header">


                    <div class="league-name">

                        League

                    </div>


                    <span class="countdown-badge">

                        ${game.league}

                    </span>


                </div>


            </div>


            <div class="sports-league-item">


                <div class="league-header">


                    <div class="league-name">

                        Match ID

                    </div>


                    <span class="countdown-badge">

                        ${gameId}

                    </span>


                </div>


            </div>


        </div>

    `;


    // ======================================
    // INSERT GAME PAGE
    // ======================================

    mainContent.appendChild(gamePage);


    // ======================================
    // SHOW GAME PAGE
    // ======================================

    gamePage.style.display = "block";


    // ======================================
    // START AT TOP
    // ======================================

    window.scrollTo(0, 0);

}


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    // Remove sportsGame from URL

    window.location.href =
        window.location.pathname;

}


window.backFromSportsGame =
    backFromSportsGame;


// ==========================================
// CHECK GAME PAGE ON LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    renderSportsGamePage();

});
