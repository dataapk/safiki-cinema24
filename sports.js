// ==========================================
// SPORTS.JS
// SPORTS FULL GAME VIEW
// ==========================================


// ==========================================
// OPEN SPORTS GAME
// ==========================================

function openSportsGame(sport, gameId) {

    const games = {

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


    const game = games[gameId];

    if (!game) {

        console.log("Sports game not found:", gameId);

        return;

    }


    // Find Cricket Events Page

    const cricketPage =
        document.getElementById("cricket-events-page");


    if (!cricketPage) {

        console.log("Cricket Events Page not found");

        return;

    }


    // Hide existing Cricket Event content

    Array.from(cricketPage.children).forEach(function(child) {

        if (!child.classList.contains("sports-game-view")) {

            child.style.display = "none";

        }

    });


    // Remove old game view

    const oldGameView =
        document.getElementById("sports-game-view");


    if (oldGameView) {

        oldGameView.remove();

    }


    // Create Full Game View

    const gameView =
        document.createElement("div");


    gameView.id = "sports-game-view";

    gameView.className = "sports-game-view";


    gameView.innerHTML = `

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


    // Add Full Game View

    cricketPage.appendChild(gameView);


    // Keep Cricket Events Page visible

    cricketPage.style.display = "block";


    // Scroll to top

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// Make available to inline onclick

window.openSportsGame = openSportsGame;


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    window.location.reload();

}


// Make available to inline onclick

window.backFromSportsGame = backFromSportsGame;
