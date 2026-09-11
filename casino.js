// ======================================================
// SELECT CASINO CATEGORY
// ======================================================

function selectCasinoCategory(category, element) {

    // ------------------------------------------
    // CASINO GAMES LIST
    // ------------------------------------------

    const gamesList =
        document.getElementById("casinoGamesList");

    if (!gamesList) return;


    // ------------------------------------------
    // ACTIVE SUB CATEGORY
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

        if (element) {
            element.classList.add("active");
        }

    }


    // ------------------------------------------
    // CASINO CATEGORY SECTIONS
    // ------------------------------------------

    const casinoSections = {

        slots:
            document.getElementById("slotsCasinoSection"),

        aviator:
            document.getElementById("aviatorCasinoSection"),

        live:
            document.getElementById("liveCasinoSection"),

        roulette:
            document.getElementById("rouletteCasinoSection"),

        blackjack:
            document.getElementById("blackjackCasinoSection"),

        poker:
            document.getElementById("pokerCasinoSection"),

        baccarat:
            document.getElementById("baccaratCasinoSection"),

        crash:
            document.getElementById("crashCasinoSection"),

        fishing:
            document.getElementById("fishingCasinoSection")

    };


    // ------------------------------------------
    // FIND SELECTED SECTION
    // ------------------------------------------

    const selectedSection =
        casinoSections[category];

    if (!selectedSection) return;


    // ------------------------------------------
    // MOVE SELECTED SECTION TO TOP
    // ------------------------------------------

    gamesList.prepend(selectedSection);


    // ------------------------------------------
    // SCROLL TO SELECTED SECTION
    // ------------------------------------------

    selectedSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
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



