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

    window.openSportsGame = openSportsGame;

}
