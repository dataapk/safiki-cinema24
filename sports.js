// ==========================================
// SPORTS.JS
// SPORTS FULL GAME PAGE
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

    window.location.href =
        "sports-game.html?sport=" +
        encodeURIComponent(sport) +
        "&game=" +
        encodeURIComponent(gameId);

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


    // Normal homepage

    if (!gameId) {

        return;

    }


    const game =
        sportsGames[gameId];


    if (!game) {

        console.log("Invalid sports game:", gameId);

        return;

    }


    // ======================================
    // CREATE GAME PAGE
    // ======================================

    let gamePage =
        document.getElementById(
            "sports-full-game-page"
        );


    if (gamePage) {

        gamePage.remove();

    }


    gamePage =
        document.createElement("div");


    gamePage.id =
        "sports-full-game-page";


    gamePage.innerHTML = `

        <div class="sports-page-header">

            <button
                class="sports-back-btn"
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
    // HIDE SPORTS HOME CONTENT ONLY
    // ======================================

    const sportsPages = [

        "sports-trending-page",
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


    sportsPages.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display = "none";

        }

    });


    // Hide sports subcategory area

    const sportsGrid =
        document.getElementById(
            "sportsSubcatGrid"
        );


    if (sportsGrid) {

        const gridParent =
            sportsGrid.closest(
                ".subcat-grid"
            );


        if (gridParent) {

            gridParent.style.display = "none";

        }

    }


    // ======================================
    // INSERT GAME PAGE
    // ======================================

    document.body.appendChild(gamePage);


    // ======================================
    // SHOW GAME PAGE
    // ======================================

    gamePage.style.display = "block";


    // ======================================
    // TOP
    // ======================================

    window.scrollTo(0, 0);

}


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    window.location.href =
        window.location.pathname;

}


window.backFromSportsGame =
    backFromSportsGame;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderSportsGamePage();

    }
);
