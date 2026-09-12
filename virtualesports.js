// ======================================================
// VIRTUAL SPORTS.JS
// VIRTUAL SPORTS FRONTEND
// ======================================================

console.log("🚀 VIRTUALESPORTS.JS STARTED");


// ======================================================
// VIRTUAL SPORTS STATE
// ======================================================

let virtualSportsCurrentSport = "cricket";
let virtualSportsCurrentTab = "live";


// ======================================================
// VIRTUAL SPORTS DATA CACHE
// ======================================================

let virtualSportsGames = {
    cricket: {
        live: [],
        upcoming: [],
        featured: []
    },

    football: {
        live: [],
        upcoming: [],
        featured: []
    }
};


// ======================================================
// OPEN VIRTUAL SPORTS
// ======================================================

window.openVirtualSports =
function () {

    console.log(
        "🖥️ Opening Virtual Sports..."
    );

    let section =
        document.getElementById(
            "virtualSportsFrontendSection"
        );


    // --------------------------------------------------
    // CREATE SECTION IF NOT EXISTS
    // --------------------------------------------------

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "virtualSportsFrontendSection";

        section.className =
            "virtual-sports-frontend-section";


        // Main content section-এর আগে বসানো হবে
        const mainCategory =
            document.getElementById(
                "mainCategorySection"
            );

        if (mainCategory) {

            mainCategory.style.display =
                "none";

            mainCategory.parentNode.insertBefore(
                section,
                mainCategory.nextSibling
            );

        } else {

            document.body.appendChild(
                section
            );

        }

    }


    // --------------------------------------------------
    // SHOW SECTION
    // --------------------------------------------------

    section.style.display =
        "block";


    // --------------------------------------------------
    // HIDE MAIN CATEGORY
    // --------------------------------------------------

    const mainCategory =
        document.getElementById(
            "mainCategorySection"
        );

    if (mainCategory) {

        mainCategory.style.display =
            "none";

    }


    // --------------------------------------------------
    // RENDER PAGE
    // --------------------------------------------------

    showSportsBetSlip();

    renderVirtualSportsHome();

};


// ======================================================
// CLOSE VIRTUAL SPORTS
// ======================================================

window.closeVirtualSports =
function () {

    const section =
        document.getElementById(
            "virtualSportsFrontendSection"
        );

    if (section) {

        section.style.display =
            "none";

    }


    // ==========================================
    // SHOW MAIN HERO BANNER
    // ==========================================

    if (heroBanner) {

        heroBanner.style.display =
            "block";

    }

    // Hide Virtual Sports Bet Slip
    hideSportsBetSlip();

    if (heroBanner) {
        heroBanner.style.display = "block";
    }


    // ==========================================
    // SHOW MAIN CATEGORY CARDS
    // ==========================================

    const mainCategory =
        document.getElementById(
            "mainCategorySection"
        );

    if (mainCategory) {

        mainCategory.style.display =
            "block";

    }

};


// ======================================================
// RENDER VIRTUAL SPORTS HOME
// ======================================================

function renderVirtualSportsHome() {

    const section =
        document.getElementById(
            "virtualSportsFrontendSection"
        );

    if (!section) {

        console.warn(
            "⚠️ Virtual Sports frontend section not found."
        );

        return;

    }


    section.innerHTML = `

        


        <!-- ========================================= -->
        <!-- SLIDING BANNER -->
        <!-- ========================================= -->

        <div class="virtual-sports-banner-wrapper">

            <div
                class="virtual-sports-banner-slider"
                id="virtualSportsBannerSlider">


                <!-- BANNER 1 -->

                <div
                    class="virtual-sports-banner
                           virtual-banner-active">

                    <div class="virtual-banner-content">

                        <span class="virtual-banner-small">
                            VIRTUAL SPORTS
                        </span>

                        <h2>
                            Favorite Virtual Sports
                        </h2>

                        <p>
                            Enjoy exciting virtual
                            sports action anytime.
                        </p>

                    </div>

                </div>


                <!-- BANNER 2 -->

                <div
                    class="virtual-sports-banner">

                    <div class="virtual-banner-content">

                        <span class="virtual-banner-small">
                            VIRTUAL CRICKET
                        </span>

                        <h2>
                            Virtual Cricket
                        </h2>

                        <p>
                            Follow virtual cricket
                            matches and events.
                        </p>

                    </div>

                </div>


                <!-- BANNER 3 -->

                <div
                    class="virtual-sports-banner">

                    <div class="virtual-banner-content">

                        <span class="virtual-banner-small">
                            VIRTUAL FOOTBALL
                        </span>

                        <h2>
                            Virtual Football
                        </h2>

                        <p>
                            Experience fast virtual
                            football action.
                        </p>

                    </div>

                </div>


            </div>


            <!-- BANNER DOTS -->

            <div
                class="virtual-sports-banner-dots"
                id="virtualSportsBannerDots">

                <span
                    class="virtual-banner-dot active"
                    onclick="goToVirtualSportsBanner(0)">
                </span>

                <span
                    class="virtual-banner-dot"
                    onclick="goToVirtualSportsBanner(1)">
                </span>

                <span
                    class="virtual-banner-dot"
                    onclick="goToVirtualSportsBanner(2)">
                </span>

            </div>

        </div>

        <!-- ========================================= -->
        <!-- VIRTUAL SPORTS HEADER -->
        <!-- ========================================= -->

        <div class="virtual-sports-page-header">

            <button
                class="virtual-sports-back-btn"
                onclick="closeVirtualSports()">

                <i class="fas fa-chevron-left"></i>

                Back

            </button>


            <h2>
                Virtual Sports
            </h2>

        </div>

       <!-- ================================= -->
<!-- VIRTUAL SPORTS GAME SELECTOR -->
<!-- ================================= -->

<div class="virtual-sports-games-section">

    <div class="virtual-sports-game-grid">

        <!-- ================================= -->
        <!-- CRICKET -->
        <!-- ================================= -->

        <div
            class="virtual-sports-game-card active"
            onclick="
                openVirtualSportGame(
                    'cricket'
                )
            ">

            <div
                class="virtual-sports-game-icon cricket-icon">

                🏏

            </div>

            <div class="virtual-sports-game-info">

                <h3>
                    Virtual Cricket
                </h3>

            </div>

            <div
                class="virtual-sports-game-arrow">

                <i class="fas fa-chevron-right"></i>

            </div>

        </div>


        <!-- ================================= -->
        <!-- FOOTBALL -->
        <!-- ================================= -->

        <div
            class="virtual-sports-game-card"
            onclick="
                openVirtualSportGame(
                    'football'
                )
            ">

            <div
                class="virtual-sports-game-icon football-icon">

                ⚽

            </div>

            <div class="virtual-sports-game-info">

                <h3>
                    Virtual Football
                </h3>

            </div>

            <div
                class="virtual-sports-game-arrow">

                <i class="fas fa-chevron-right"></i>

            </div>

        </div>

    </div>

</div>
        <!-- ========================================= -->
        <!-- SELECTED SPORT SECTION -->
        <!-- ========================================= -->

        <div
            class="virtual-sport-events-section"
            id="virtualSportEventsSection">

        </div>

    `;


    // --------------------------------------------------
    // DEFAULT SPORT
    // --------------------------------------------------

    openVirtualSportGame(
        "cricket"
    );


    // --------------------------------------------------
    // START BANNER
    // --------------------------------------------------

    startVirtualSportsBanner();

}


// ======================================================
// OPEN VIRTUAL SPORT GAME
// ======================================================

window.openVirtualSportGame =
function (sport) {

    if (
        sport !== "cricket" &&
        sport !== "football"
    ) {

        return;

    }


    virtualSportsCurrentSport =
        sport;

    virtualSportsCurrentTab =
        "live";


    // --------------------------------------------------
    // UPDATE CARD ACTIVE STATE
    // --------------------------------------------------

    document
        .querySelectorAll(
            ".virtual-sports-game-card"
        )
        .forEach(card => {

            card.classList.remove(
                "active"
            );

        });


    const cards =
        document.querySelectorAll(
            ".virtual-sports-game-card"
        );


    cards.forEach(card => {

        const onclickValue =
            card.getAttribute(
                "onclick"
            );

        if (
            onclickValue &&
            onclickValue.includes(
                `'${sport}'`
            )
        ) {

            card.classList.add(
                "active"
            );

        }

    });


    renderVirtualSportTabs();

};


// ======================================================
// RENDER LIVE / UPCOMING / FEATURED
// ======================================================

// ==========================================
// RENDER VIRTUAL SPORTS EVENTS
// LIVE + UPCOMING + FEATURED
// ==========================================

function renderVirtualSportTabs() {

    const container =
        document.getElementById(
            "virtualSportEventsSection"
        );

    if (!container) return;


    const sportName =
        virtualSportsCurrentSport === "cricket"
            ? "Virtual Cricket"
            : "Virtual Football";


    const sportGames =
        virtualSportsGames[
            virtualSportsCurrentSport
        ] || {
            live: [],
            upcoming: [],
            featured: []
        };


    container.innerHTML = `

        <!-- ================================= -->
        <!-- SELECTED SPORT HEADER -->
        <!-- ================================= -->

        <div class="virtual-sport-selected-header">

            <div class="virtual-sport-selected-icon">

                ${
                    virtualSportsCurrentSport === "cricket"
                        ? "🏏"
                        : "⚽"
                }

            </div>

            <h3>
                ${sportName}
            </h3>

        </div>


        <!-- ================================= -->
        <!-- LIVE EVENTS -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    🔥 LIVE
                </span>

            </div>

            <div class="virtual-sport-games-list">

                ${
                    sportGames.live &&
                    sportGames.live.length > 0

                    ?

                    sportGames.live
                        .map(game =>
                            createVirtualSportGameCard(game)
                        )
                        .join("")

                    :

                    `
                    <div class="virtual-sports-empty-state">

                        <div class="virtual-empty-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>

                        <h4>
                            No Live Games
                        </h4>

                        <p>
                            There are currently no
                            live virtual games available.
                        </p>

                    </div>
                    `
                }

            </div>

        </div>


        <!-- ================================= -->
        <!-- UPCOMING EVENTS -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    ⏱ UPCOMING
                </span>

            </div>

            <div class="virtual-sport-games-list">

                ${
                    sportGames.upcoming &&
                    sportGames.upcoming.length > 0

                    ?

                    sportGames.upcoming
                        .map(game =>
                            createVirtualSportGameCard(game)
                        )
                        .join("")

                    :

                    `
                    <div class="virtual-sports-empty-state">

                        <div class="virtual-empty-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>

                        <h4>
                            No Upcoming Games
                        </h4>

                        <p>
                            There are currently no
                            upcoming virtual games available.
                        </p>

                    </div>
                    `
                }

            </div>

        </div>


        <!-- ================================= -->
        <!-- FEATURED EVENTS -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    ⭐ FEATURED
                </span>

            </div>

            <div class="virtual-sport-games-list">

                ${
                    sportGames.featured &&
                    sportGames.featured.length > 0

                    ?

                    sportGames.featured
                        .map(game =>
                            createVirtualSportGameCard(game)
                        )
                        .join("")

                    :

                    `
                    <div class="virtual-sports-empty-state">

                        <div class="virtual-empty-icon">
                            <i class="fas fa-calendar-times"></i>
                        </div>

                        <h4>
                            No Featured Games
                        </h4>

                        <p>
                            There are currently no
                            featured virtual games available.
                        </p>

                    </div>
                    `
                }

            </div>

        </div>

    `;
}


// ======================================================
// RENDER VIRTUAL SPORT GAMES
// ======================================================

// ======================================================
// RENDER VIRTUAL SPORT GAMES
// ======================================================

function renderVirtualSportGames() {

    const sport =
        virtualSportsCurrentSport;


    const liveList =
        document.getElementById(
            "virtualLiveGamesList"
        );

    const upcomingList =
        document.getElementById(
            "virtualUpcomingGamesList"
        );

    const featuredList =
        document.getElementById(
            "virtualFeaturedGamesList"
        );


    // --------------------------------------------------
    // GET GAMES
    // --------------------------------------------------

    const liveGames =
        virtualSportsGames[
            sport
        ]?.live || [];


    const upcomingGames =
        virtualSportsGames[
            sport
        ]?.upcoming || [];


    const featuredGames =
        virtualSportsGames[
            sport
        ]?.featured || [];


    // --------------------------------------------------
    // RENDER SECTION HELPER
    // --------------------------------------------------

    function renderGameList(
        list,
        games,
        type
    ) {

        if (!list) {
            return;
        }


        if (
            !games ||
            games.length === 0
        ) {

            list.innerHTML = `

                <div
                    class="virtual-sports-empty-state">

                    <div
                        class="virtual-empty-icon">

                        <i
                            class="fas fa-calendar-times">
                        </i>

                    </div>

                    <h4>
                        No ${type} Games
                    </h4>

                    <p>
                        There are currently no
                        virtual games available.
                    </p>

                </div>

            `;

            return;

        }


        list.innerHTML =
            games.map(
                game =>
                    createVirtualSportGameCard(
                        game
                    )
            ).join("");

    }


    // --------------------------------------------------
    // RENDER ALL
    // --------------------------------------------------

    renderGameList(
        liveList,
        liveGames,
        "Live"
    );


    renderGameList(
        upcomingList,
        upcomingGames,
        "Upcoming"
    );


    renderGameList(
        featuredList,
        featuredGames,
        "Featured"
    );

}
// ======================================================
// CREATE GAME CARD
// ======================================================

function createVirtualSportGameCard(
    game
) {

    const sport =
        virtualSportsCurrentSport;


    const sportIcon =
        sport === "cricket"
            ? "🏏"
            : "⚽";


    return `

        <div
            class="virtual-sport-event-card"
            onclick="
                openVirtualSportGameView(
                    '${game.id || ""}'
                )
            ">


            <div
                class="virtual-event-sport-icon">

                ${sportIcon}

            </div>


            <div
                class="virtual-event-main">


                <div
                    class="virtual-event-teams">

                    <strong>
                        ${game.home || "Home"}
                    </strong>

                    <span>
                        vs
                    </span>

                    <strong>
                        ${game.away || "Away"}
                    </strong>

                </div>


                <div
                    class="virtual-event-meta">

                    ${
                        game.time
                            || "Virtual Event"
                    }

                </div>

            </div>


            <div
                class="virtual-event-arrow">

                <i
                    class="fas fa-chevron-right">
                </i>

            </div>


        </div>

    `;

}


// ======================================================
// GAME VIEW PLACEHOLDER
// ======================================================
//
// IMPORTANT:
// Full Game View এখন তৈরি করা হচ্ছে না.
// পরে এখানে complete game page বসবে.
// ======================================================

window.openVirtualSportGameView =
function (gameId) {

    console.log(
        "🎮 Virtual Sport Game:",
        gameId
    );

    console.log(
        "ℹ️ Full Game View will be added later."
    );

};


// ======================================================
// BANNER SYSTEM
// ======================================================

let virtualSportsBannerIndex = 0;

let virtualSportsBannerTimer =
    null;


// ======================================================
// START BANNER
// ======================================================

function startVirtualSportsBanner() {

    stopVirtualSportsBanner();


    virtualSportsBannerTimer =
        setInterval(
            function () {

                virtualSportsBannerIndex++;

                if (
                    virtualSportsBannerIndex >= 3
                ) {

                    virtualSportsBannerIndex =
                        0;

                }

                showVirtualSportsBanner(
                    virtualSportsBannerIndex
                );

            },
            4000
        );

}


// ======================================================
// STOP BANNER
// ======================================================

function stopVirtualSportsBanner() {

    if (
        virtualSportsBannerTimer
    ) {

        clearInterval(
            virtualSportsBannerTimer
        );

        virtualSportsBannerTimer =
            null;

    }

}


// ======================================================
// SHOW BANNER
// ======================================================

function showVirtualSportsBanner(
    index
) {

    const banners =
        document.querySelectorAll(
            ".virtual-sports-banner"
        );

    const dots =
        document.querySelectorAll(
            ".virtual-banner-dot"
        );


    banners.forEach(
        banner => {

            banner.classList.remove(
                "virtual-banner-active"
            );

        }
    );


    dots.forEach(
        dot => {

            dot.classList.remove(
                "active"
            );

        }
    );


    if (
        banners[index]
    ) {

        banners[index].classList.add(
            "virtual-banner-active"
        );

    }


    if (
        dots[index]
    ) {

        dots[index].classList.add(
            "active"
        );

    }

}


// ======================================================
// MANUAL BANNER CONTROL
// ======================================================

window.goToVirtualSportsBanner =
function (index) {

    if (
        index < 0 ||
        index > 2
    ) {

        return;

    }


    virtualSportsBannerIndex =
        index;


    showVirtualSportsBanner(
        index
    );


    startVirtualSportsBanner();

};


// ======================================================
// CAPITALIZE TAB
// ======================================================

function capitalizeVirtualTab(
    value
) {

    if (!value) {

        return "";

    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "✅ Virtual Sports frontend ready."
        );

    }
);


// ======================================================
// END OF VIRTUAL SPORTS.JS
// ======================================================
