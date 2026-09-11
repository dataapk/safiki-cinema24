// ======================================================
// SELECT CASINO CATEGORY
// ======================================================

function selectCasinoCategory(category, element) {

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

        element.classList.add("active");

    }


    // ------------------------------------------
    // FIND SELECTED CASINO SECTION
    // ------------------------------------------

    const selectedSection =
        gamesList.querySelector(
            `[data-casino-category="${category}"]`
        );

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



