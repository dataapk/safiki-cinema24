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

    slots: [],

    aviator: [],

    live: [],

    roulette: [],

    blackjack: [],

    poker: [],

    baccarat: [],

    crash: [],

    fishing: []

};


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

    // ------------------------------------------
    // Active View All
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
    // Selected Area
    // ------------------------------------------

    const title =
        document.getElementById("casinoSelectedTitle");

    const grid =
        document.getElementById("casinoGamesGrid");

    if (!grid) return;


    if (title) {

        title.textContent =
            "All Casino Games";

    }


    grid.innerHTML = "";


    // ------------------------------------------
    // Casino Category Order
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
    // Render Every Category
    // ------------------------------------------

    categories.forEach(category => {

        const games =
            casinoGames[category] || [];


        const section =
            document.createElement("div");

        section.className =
            "casino-category-section";


        section.innerHTML = `

            <h4 class="casino-category-title">
                ${casinoCategories[category]}
            </h4>

            <div class="casino-category-games"></div>

        `;


        const gamesContainer =
            section.querySelector(
                ".casino-category-games"
            );


        // --------------------------------------
        // No Games
        // --------------------------------------

        if (games.length === 0) {

            gamesContainer.innerHTML = `

                <div class="casino-no-games">
                    No Games Available
                </div>

            `;

        }


        // --------------------------------------
        // Games
        // --------------------------------------

        games.forEach(game => {

            const card =
                document.createElement("div");

            card.className =
                "casino-game-card";


            card.innerHTML = `

                <div class="casino-game-card-image">

                    ${
                        game.image
                        ? `<img src="${game.image}"
                               alt="${game.name}">`
                        : `<div class="casino-game-placeholder">
                            🎮
                           </div>`
                    }

                </div>

                <div class="casino-game-card-title">
                    ${game.name}
                </div>

            `;


            gamesContainer.appendChild(card);

        });


        grid.appendChild(section);

    });

}


// ======================================================
// OPEN CASINO DEFAULT
// ======================================================

function openCasinoDefault() {

    // ------------------------------------------
    // Hide Recent Winner / Live Section
    // ------------------------------------------

    const winnersSection =
        document.getElementById("winnersSection");

    if (winnersSection) {
        winnersSection.style.display = "none";
    }

}

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
