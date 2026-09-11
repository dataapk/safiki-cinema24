// ======================================================
// CASINO.JS
// ======================================================


// ======================================================
// CASINO CATEGORY DATA
// ======================================================

const casinoCategories = {

    popular: "Popular Games",

    slots: "Slot Games",

    aviator: "Aviator Games",

    live: "Live Casino",

    roulette: "Roulette Games",

    blackjack: "Blackjack Games",

    poker: "Poker Games",

    baccarat: "Baccarat Games",

    crash: "Crash Games",

    fishing: "Fishing Games"

};


// ======================================================
// CASINO GAMES DATA
// ======================================================

const casinoGames = {

    popular: [],


    // ------------------------------------------
    // SLOTS
    // ------------------------------------------

    slots: [

        {
            name: "Sweet Bonanza",
            image: "image/sweet-bonanza.jpg"
        },

        {
            name: "Book of Dead",
            image: "image/book-of-dead.jpg"
        },

        {
            name: "Gates of Olympus",
            image: "image/gates-of-olympus.jpg"
        }

    ],


    // ------------------------------------------
    // AVIATOR
    // ------------------------------------------

    aviator: [

        {
            name: "Aviator",
            image: "image/aviator.jpg"
        }

    ],


    // ------------------------------------------
    // LIVE CASINO
    // ------------------------------------------

    live: [

        {
            name: "Live Roulette",
            image: "image/live-roulette.jpg"
        },

        {
            name: "Live Blackjack",
            image: "image/live-blackjack.jpg"
        }

    ],


    // ------------------------------------------
    // ROULETTE
    // ------------------------------------------

    roulette: [

        {
            name: "European Roulette",
            image: "image/european-roulette.jpg"
        }

    ],


    // ------------------------------------------
    // BLACKJACK
    // ------------------------------------------

    blackjack: [

        {
            name: "Classic Blackjack",
            image: "image/classic-blackjack.jpg"
        }

    ],


    // ------------------------------------------
    // POKER
    // ------------------------------------------

    poker: [

        {
            name: "Texas Hold'em",
            image: "image/texas-holdem.jpg"
        }

    ],


    // ------------------------------------------
    // BACCARAT
    // ------------------------------------------

    baccarat: [

        {
            name: "Classic Baccarat",
            image: "image/classic-baccarat.jpg"
        }

    ],


    // ------------------------------------------
    // CRASH
    // ------------------------------------------

    crash: [

        {
            name: "Crash Game",
            image: "image/crash.jpg"
        }

    ],


    // ------------------------------------------
    // FISHING
    // ------------------------------------------

    fishing: [

        {
            name: "Fishing Game",
            image: "image/fishing.jpg"
        }

    ]

};

// ======================================================
// আর কোনো category এখন বন্ধ রাখতে চাইলে েমন Fishing এখন দেখাবে না, শুধু: fishing: [],
// ======================================================


// ======================================================
// SELECT CASINO CATEGORY
// ======================================================

function selectCasinoCategory(category, element) {

    const popularSection =
        document.getElementById("popularcasinoSection");

    const selectedSection =
        document.getElementById("casinoSelectedGames");



    // ------------------------------------------
    // Show Selected Category
    // ------------------------------------------

    if (selectedSection) {

        selectedSection.style.display = "block";

    }


    // ------------------------------------------
    // Active Category
    // ------------------------------------------

    const parentGrid =
        element
            ? element.closest(".subcat-grid")
            : null;

    if (parentGrid) {

        parentGrid
            .querySelectorAll(".subcat-item")
            .forEach(item => {

                item.classList.remove("active");

            });

        element.classList.add("active");

    }


    // ------------------------------------------
    // Update Title
    // ------------------------------------------

    const title =
        document.getElementById("casinoSelectedTitle");

    if (title) {

        title.textContent =
            casinoCategories[category] || "Casino Games";

    }


    // ------------------------------------------
    // Render Category Games
    // ------------------------------------------

    renderCasinoGames(category);

}


// ======================================================
// RENDER CASINO GAMES
// ======================================================

function renderCasinoGames(category) {

    const grid =
        document.getElementById("casinoGamesGrid");

    if (!grid) return;


    // ------------------------------------------
    // Popular = HTML Existing Games
    // ------------------------------------------

    if (category === "popular") {
        return;
    }


    // ------------------------------------------
    // Clear Selected Games
    // ------------------------------------------

    grid.innerHTML = "";


    const games =
        casinoGames[category] || [];


    // ------------------------------------------
    // No Games
    // ------------------------------------------

    if (games.length === 0) {

        grid.innerHTML = `
            <div class="casino-no-games">
                No Games Available
            </div>
        `;

        return;

    }


    // ------------------------------------------
    // Game Cards
    // ------------------------------------------

    games.forEach(game => {

        const card =
            document.createElement("div");

        card.className =
            "casino-game-card";


        card.innerHTML = `

            <div class="casino-game-card-image">

                ${
                    game.image
                    ? `<img src="${game.image}" alt="${game.name}">`
                    : `<div class="casino-game-placeholder">
                        🎮
                       </div>`
                }

            </div>

            <div class="casino-game-card-title">
                ${game.name}
            </div>

        `;


        grid.appendChild(card);

    });

}

// ======================================================
// VIEW ALL CASINO CATEGORIES
// ======================================================

function viewAllCasinoCategories(element) {

    const grid =
        document.getElementById("casinoGamesGrid");

    if (!grid) return;


    // Active button
    const parentGrid =
        element
            ? element.closest(".subcat-grid")
            : null;

    if (parentGrid) {

        parentGrid
            .querySelectorAll(".subcat-item")
            .forEach(item => {

                item.classList.remove("active");

            });

        element.classList.add("active");

    }


    // Show selected area
    const selectedSection =
        document.getElementById("casinoSelectedGames");

    if (selectedSection) {

        selectedSection.style.display = "block";

    }


    // Title
    const title =
        document.getElementById("casinoSelectedTitle");

    if (title) {

        title.textContent = "All Games";

    }


    // Clear old content
    grid.innerHTML = "";


    // ------------------------------------------
    // CATEGORY ORDER
    // ------------------------------------------

    const categories = [

        "slots",
        "aviator",
        "live",
        "roulette",
        "blackjack",
        "poker",
        "baccarat",
        "crash",
        "fishing"

    ];


    // ------------------------------------------
    // CREATE EACH CATEGORY
    // ------------------------------------------

    categories.forEach(category => {

        const games =
            casinoGames[category] || [];


        // Category wrapper
        const section =
            document.createElement("div");

        section.className =
            "casino-category-section";


        // Category title
        const categoryTitle =
            document.createElement("h4");

        categoryTitle.className =
            "casino-category-title";

        categoryTitle.textContent =
            casinoCategories[category] ||
            "Casino Games";


        // Games grid
        const gamesGrid =
            document.createElement("div");

        gamesGrid.className =
            "casino-category-games";


        // --------------------------------------
        // NO GAMES
        // --------------------------------------

        if (games.length === 0) {

            gamesGrid.innerHTML = `
                <div class="casino-no-games">
                    No Games Available
                </div>
            `;

        }


        // --------------------------------------
        // GAME CARDS
        // --------------------------------------

        else {

            games.forEach(game => {

                const card =
                    document.createElement("div");

                card.className =
                    "casino-game-card";


                card.innerHTML = `

                    <div class="casino-game-card-image">

                        ${
                            game.image
                            ? `
                                <img
                                    src="${game.image}"
                                    alt="${game.name}"
                                >
                              `
                            : `
                                <div class="casino-game-placeholder">
                                    🎮
                                </div>
                              `
                        }

                    </div>

                    <div class="casino-game-card-title">
                        ${game.name}
                    </div>

                `;


                gamesGrid.appendChild(card);

            });

        }


        // --------------------------------------
        // APPEND
        // --------------------------------------

        section.appendChild(categoryTitle);

        section.appendChild(gamesGrid);

        grid.appendChild(section);

    });

}
// ======================================================
// BACK FROM CASINO 
// ======================================================


function backFromCasino() {

    // Casino section hide
    if (casinoSubSection) {
        casinoSubSection.style.display = 'none';
    }

    // Main category cards show
    if (mainCategorySection) {
        mainCategorySection.style.display = 'block';
    }

    // Hero banner show
    if (heroBanner) {
        heroBanner.style.display = 'block';
    }

    // Winner Section show
    const winnersSection =
        document.getElementById("winnersSection");

    if (winnersSection) {
        winnersSection.style.display = "block";
    }

    // Casino auto slide stop/reset যদি প্রয়োজন হয়
}

// ======================================================
// GLOBAL
// ======================================================

window.selectCasinoCategory =
    selectCasinoCategory;

window.viewAllCasinoCategories =
    viewAllCasinoCategories;

window.openCasinoDefault =
    openCasinoDefault;
