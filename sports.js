// ==========================================
// SPORTS - OPEN GAME
// ==========================================

function openSportsGame(sport, gameId) {

    // ======================================
    // GAME DATA
    // ======================================

    const games = {

        "cricket-live-1": {
            title: "Bangladesh vs India",
            status: "LIVE",
            league: "T20 International"
        },

        "cricket-live-2": {
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


    // ======================================
    // FIND CRICKET EVENTS PAGE
    // ======================================

    const cricketPage =
        document.getElementById("cricket-events-page");

    if (!cricketPage) {
        console.log("Cricket events page not found");
        return;
    }


    // ======================================
    // HIDE CRICKET CONTENT
    // ======================================

    const cricketContent = Array.from(
        cricketPage.children
    ).filter(function(child) {

        return !child.classList.contains(
            "sports-game-view"
        );

    });


    cricketContent.forEach(function(child) {

        child.style.display = "none";

    });


    // ======================================
    // REMOVE OLD GAME VIEW
    // ======================================

    const oldGameView =
        document.getElementById("sports-game-view");

    if (oldGameView) {
        oldGameView.remove();
    }


    // ======================================
    // CREATE FULL GAME VIEW
    // ======================================

    const gameView =
        document.createElement("div");

    gameView.id = "sports-game-view";

    gameView.className =
        "sports-game-view";


    // ======================================
    // GAME VIEW HTML
    // ======================================

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


    // ======================================
    // ADD GAME VIEW INSIDE CRICKET PAGE
    // ======================================

    cricketPage.appendChild(gameView);


    // ======================================
    // SHOW CRICKET PAGE
    // ======================================

    cricketPage.style.display = "block";


    // ======================================
    // MOVE TO TOP
    // ======================================

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    console.log(
        "Sports Game Opened:",
        sport,
        gameId
    );

}


window.openSportsGame = openSportsGame;


// ==========================================
// SPORTS - BACK
// ==========================================

function backFromSportsGame() {

    // Reload page and return to normal Sports view

    window.location.reload();

}


window.backFromSportsGame = backFromSportsGame;
