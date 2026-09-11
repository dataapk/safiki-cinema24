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

    const scrollTop =
        selectedSection.getBoundingClientRect().top +
        window.pageYOffset -
        80;

    window.scrollTo({
        top: scrollTop,
        behavior: "smooth"
    });

}


// ======================================================
// GLOBAL
// ======================================================

window.selectCasinoCategory =
    selectCasinoCategory;


// ======================================================
// BACK FROM CASINO
// ======================================================

function backFromCasino() {

    // ------------------------------------------
    // CASINO SECTION HIDE
    // ------------------------------------------

    if (casinoSubSection) {
        casinoSubSection.style.display = 'none';
    }


    // ------------------------------------------
    // MAIN CATEGORY CARDS SHOW
    // ------------------------------------------

    if (mainCategorySection) {
        mainCategorySection.style.display = 'block';
    }


    // ------------------------------------------
    // HERO BANNER SHOW
    // ------------------------------------------

    if (heroBanner) {
        heroBanner.style.display = 'block';
    }


    // ------------------------------------------
    // WINNERS SECTION SHOW
    // ------------------------------------------

    const winnersSection =
        document.getElementById("winnersSection");

    if (winnersSection) {
        winnersSection.style.display = "block";
    }


    // ------------------------------------------
    // CASINO AUTO SLIDE STOP / RESET
    // ------------------------------------------
    // প্রয়োজন হলে এখানে পরে add করা যাবে

}


// ======================================================
// GLOBAL
// ======================================================

window.backFromCasino =
    backFromCasino;
