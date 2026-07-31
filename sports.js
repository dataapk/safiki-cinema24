// ==========================================
// SPORTS.JS
// SPORTS GAME PAGE
// ==========================================


// ==========================================
// SPORTS GAME DATA
// ==========================================

const SportsGameState = {

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

    const game = SportsGameState[gameId];

    if (!game) {

        console.log("Sports game not found:", gameId);

        return;

    }


    // URL change + full page reload

    const url =
        window.location.pathname +
        "?sportsGame=" +
        encodeURIComponent(gameId);


    window.location.href = url;

}


window.openSportsGame = openSportsGame;


// ==========================================
// OPEN SPORTS GAME PAGE AFTER RELOAD
// ==========================================

function openSportsGamePage() {

    const params =
        new URLSearchParams(window.location.search);


    const gameId =
        params.get("sportsGame");


    // Normal homepage

    if (!gameId) {

        return;

    }


    const game =
        SportsGameState[gameId];


    if (!game) {

        return;

    }


    const section =
        document.getElementById("sports-game-page");


    if (!section) {

        console.log(
            "sports-game-page not found"
        );

        return;

    }


    // ======================================
    // GAME PAGE CONTENT
    // ======================================

    const title =
        document.getElementById(
            "sports-game-title"
        );


    const content =
        document.getElementById(
            "sports-game-content"
        );


    if (title) {

        title.textContent =
            game.sport === "cricket"
                ? "🏏 Cricket"
                : "Sports";

    }


    if (content) {

        content.innerHTML = `

            <div class="sports-section">

                <div class="sports-section-title">

                    ${game.title}

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

    }


    // ======================================
    // SHOW GAME PAGE
    // ======================================

    section.style.display = "block";


    requestAnimationFrame(() => {

        section.style.opacity = "1";

        section.style.transform =
            "translateY(0)";

    });


    // ======================================
    // HIDE SPORTS HOME SECTIONS
    // ======================================

    const sportsHomeSections = [

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


    sportsHomeSections.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            element.style.display = "none";

        }

    });

}


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    // Remove game state from URL
    // Then reload the original page

    window.location.href =
        window.location.pathname;

}


window.backFromSportsGame =
    backFromSportsGame;


// ==========================================
// CHECK SPORTS GAME ON PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        openSportsGamePage();

    }
);
