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


// ==========================================
// SPORTS BET SLIP SYSTEM
// ==========================================
