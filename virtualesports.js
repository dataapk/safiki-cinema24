```js
// ======================================================
// VIRTUAL SPORTS.JS
// VIRTUAL SPORTS FRONTEND
// ======================================================

console.log("🚀 VIRTUALSPORTS.JS STARTED");


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


    // --------------------------------------------------
    // SHOW HERO
    // --------------------------------------------------

    if (typeof heroBanner !== "undefined" &&
        heroBanner) {

        heroBanner.style.display =
            "block";

    }


    // --------------------------------------------------
    // HIDE BET SLIP
    // --------------------------------------------------

    hideSportsBetSlip();


    // --------------------------------------------------
    // SHOW MAIN CATEGORY
    // --------------------------------------------------

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


        <!-- ========================================= -->
        <!-- VIRTUAL SPORTS GAME SELECTOR -->
        <!-- ========================================= -->

        <div class="virtual-sports-games-section">

            <div class="virtual-sports-game-grid">


                <!-- ================================= -->
                <!-- VIRTUAL CRICKET -->
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

                    <div
                        class="virtual-sports-game-info">

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
                <!-- VIRTUAL FOOTBALL -->
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

                    <div
                        class="virtual-sports-game-info">

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
    // UPDATE ACTIVE CARD
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
// RENDER VIRTUAL SPORT TABS
// ======================================================
// Main Virtual Sports page
// LIVE / UPCOMING / FEATURED
// ======================================================

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
        <!-- LIVE -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    🔥 LIVE
                </span>

            </div>


            <div class="virtual-sport-games-list">

                ${
                    renderVirtualSportGamesHTML(
                        sportGames.live,
                        "Live"
                    )
                }

            </div>

        </div>


        <!-- ================================= -->
        <!-- UPCOMING -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    ⏱ UPCOMING
                </span>

            </div>


            <div class="virtual-sport-games-list">

                ${
                    renderVirtualSportGamesHTML(
                        sportGames.upcoming,
                        "Upcoming"
                    )
                }

            </div>

        </div>


        <!-- ================================= -->
        <!-- FEATURED -->
        <!-- ================================= -->

        <div class="virtual-sport-category-section">

            <div class="virtual-sport-category-header">

                <span class="virtual-sport-category-title">
                    ⭐ FEATURED
                </span>

            </div>


            <div class="virtual-sport-games-list">

                ${
                    renderVirtualSportGamesHTML(
                        sportGames.featured,
                        "Featured"
                    )
                }

            </div>

        </div>

    `;

}


// ======================================================
// RENDER GAME HTML
// ======================================================

function renderVirtualSportGamesHTML(
    games,
    type
) {

    if (
        !games ||
        games.length === 0
    ) {

        return `

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

    }


    return games
        .map(
            game =>
                createVirtualSportGameCard(
                    game
                )
        )
        .join("");

}


// ======================================================
// RENDER VIRTUAL SPORT GAMES
// ======================================================
// Kept for existing system compatibility
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


    function renderGameList(
        list,
        games,
        type
    ) {

        if (!list) return;


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
            games
                .map(
                    game =>
                        createVirtualSportGameCard(
                            game
                        )
                )
                .join("");

    }


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
        game?.sport ||
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
                    '${game?.id || ""}'
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
                        ${game?.home || "Home"}
                    </strong>

                    <span>
                        vs
                    </span>

                    <strong>
                        ${game?.away || "Away"}
                    </strong>

                </div>


                <div
                    class="virtual-event-meta">

                    ${
                        game?.time ||
                        "Virtual Event"
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
// ======================================================
// FOOTER VIRTUAL SPORTS SYSTEM
// ======================================================
// No League layer here.
// Virtual Sports
//     ├── Cricket
//     └── Football
// ======================================================


// ======================================================
// FOOTER VIRTUAL SPORTS STATE
// ======================================================

let footerVirtualSportsCurrentSport =
    "cricket";


// ======================================================
// OPEN FOOTER VIRTUAL SPORTS SPORT
// ======================================================

window.openFooterVirtualSport =
function (sport) {

    if (
        sport !== "cricket" &&
        sport !== "football"
    ) {

        return;

    }


    footerVirtualSportsCurrentSport =
        sport;


    renderFooterVirtualSportGames(
        sport
    );

};


// ======================================================
// GET FOOTER VIRTUAL SPORT GAMES
// ======================================================

function getFooterVirtualSportGames(
    sport
) {

    const sportGames =
        virtualSportsGames[
            sport
        ];


    if (!sportGames) {

        return [];

    }


    return [

        ...(sportGames.live || []),

        ...(sportGames.upcoming || []),

        ...(sportGames.featured || [])

    ];

}


// ======================================================
// RENDER FOOTER VIRTUAL SPORTS
// ======================================================

window.renderFooterVirtualSports =
function () {

    const container =
        document.getElementById(
            "footerVirtualSportsDynamic"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <!-- ===================================== -->
        <!-- VIRTUAL CRICKET -->
        <!-- ===================================== -->

        <div class="footer-menu-item">

            <div
                class="footer-menu-header"
                onclick="
                    event.stopPropagation();
                    footerToggleMenuSub(
                        'footerVirtualCricketSub',
                        'footerVirtualCricketArrow'
                    )
                ">

                <i class="fas fa-baseball-ball"></i>

                <span>
                    Cricket
                </span>

                <i
                    class="fas fa-chevron-down footer-arrow"
                    id="footerVirtualCricketArrow">
                </i>

            </div>


            <div
                class="footer-menusub-list footer-menusub-hidden"
                id="footerVirtualCricketSub">

                <div
                    id="footerVirtualCricketDynamic">

                </div>

            </div>

        </div>


        <!-- ===================================== -->
        <!-- E-SPORTS -->
        <!-- ===================================== -->

        <div class="footer-menu-item">

            <div
                class="footer-menu-header"
                onclick="
                    event.stopPropagation();
                    footerToggleMenuSub(
                        'footerVirtualFootballSub',
                        'footerVirtualFootballArrow'
                    )
                ">

                <i class="fas fa-futbol"></i>

                <span>
                    E-Sports
                </span>

                <i
                    class="fas fa-chevron-down footer-arrow"
                    id="footerVirtualFootballArrow">
                </i>

            </div>


            <div
                class="footer-menusub-list footer-menusub-hidden"
                id="footerVirtualFootballSub">

                <div
                    id="footerVirtualFootballDynamic">

                </div>

            </div>

        </div>

    `;


    renderFooterVirtualSportGames(
        "cricket"
    );


    renderFooterVirtualSportGames(
        "football"
    );

};


// ======================================================
// RENDER FOOTER VIRTUAL SPORT GAMES
// ======================================================

function renderFooterVirtualSportGames(
    sport
) {

    const containerId =
        sport === "cricket"
            ? "footerVirtualCricketDynamic"
            : "footerVirtualFootballDynamic";


    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    const sportGames =
        virtualSportsGames[
            sport
        ] || {
            live: [],
            upcoming: [],
            featured: []
        };


    const sections = [

        {
            key: "live",
            title: "🔥 LIVE"
        },

        {
            key: "upcoming",
            title: "⏱ UPCOMING"
        },

        {
            key: "featured",
            title: "⭐ FEATURED"
        }

    ];


    let html = "";


    sections.forEach(
        section => {

            const games =
                sportGames[
                    section.key
                ] || [];


            // --------------------------------------
            // Empty status
            // --------------------------------------

            if (
                games.length === 0
            ) {

                return;

            }


            html += `

                <div
                    class="footer-sport-status-section">

                    <div
                        class="footer-sport-status-title">

                        ${section.title}

                    </div>


                    <div
                        class="footer-virtual-games-list">

                        ${
                            games
                                .map(
                                    game =>
                                        createFooterVirtualSportGameRow(
                                            game
                                        )
                                )
                                .join("")
                        }

                    </div>

                </div>

            `;

        }
    );


    // --------------------------------------
    // No games at all
    // --------------------------------------

    if (!html) {

        html = `

            <div class="footer-no-games">

                No Games Available

            </div>

        `;

    }


    container.innerHTML =
        html;

}


// ======================================================
// CREATE FOOTER VIRTUAL GAME ROW
// ======================================================

function createFooterVirtualSportGameRow(
    game
) {

    if (!game) {

        return "";

    }


    const sport =
        game.sport ||
        footerVirtualSportsCurrentSport;


    const icon =
        sport === "cricket"
            ? "🏏"
            : "⚽";


    const gameId =
        game.id ||
        game.game_id ||
        "";


    const home =
        game.home ||
        game.home_team ||
        "Home";


    const away =
        game.away ||
        game.away_team ||
        "Away";


    const time =
        game.time ||
        game.start_time ||
        "Virtual Event";


    return `

        <div
            class="footer-virtual-sport-game-row"
            onclick="
                event.stopPropagation();
                openFooterVirtualSportGame(
                    '${gameId}'
                )
            ">


            <span
                class="footer-virtual-game-icon">

                ${icon}

            </span>


            <span
                class="footer-virtual-game-info">

                <span
                    class="footer-virtual-game-teams">

                    ${home}

                    <span>
                        vs
                    </span>

                    ${away}

                </span>


                <span
                    class="footer-virtual-game-time">

                    ${time}

                </span>

            </span>


            <i
                class="fas fa-chevron-right footer-virtual-game-arrow">
            </i>

        </div>

    `;

}


// ======================================================
// OPEN FOOTER VIRTUAL SPORT GAME
// ======================================================

window.openFooterVirtualSportGame =
function (gameId) {

    if (!gameId) {

        return;

    }


    // --------------------------------------------------
    // MARK FOOTER SOURCE
    // --------------------------------------------------

    window.openedVirtualSportGameFromFooter =
        true;


    // --------------------------------------------------
    // CLOSE FOOTER SIDEBAR
    // --------------------------------------------------

    if (
        typeof footerCloseSidebar === "function"
    ) {

        footerCloseSidebar();

    }


    // --------------------------------------------------
    // OPEN SAME FULL GAME VIEW
    // --------------------------------------------------

    openVirtualSportGameView(
        gameId
    );

};


// ======================================================
// REFRESH FOOTER VIRTUAL SPORTS
// ======================================================

window.refreshFooterVirtualSports =
function () {

    renderFooterVirtualSports();

};


// ======================================================
// UPDATE VIRTUAL SPORTS CACHE
// ======================================================
// This function lets the existing Control Panel
// update the same virtualSportsGames cache.
// ======================================================

window.updateVirtualSportsGameCache =
function (game) {

    if (!game) {

        return;

    }


    const gameId =
        game.id ||
        game.game_id;


    if (!gameId) {

        return;

    }


    const sport =
        String(
            game.sport ||
            game.category ||
            ""
        )
        .toLowerCase();


    if (
        sport !== "cricket" &&
        sport !== "football"
    ) {

        return;

    }


    // --------------------------------------------------
    // NORMALIZE STATUS
    // --------------------------------------------------

    let status =
        String(
            game.status ||
            ""
        )
        .toLowerCase();


    if (
        status === "live"
    ) {

        status = "live";

    } else if (
        status === "upcoming"
    ) {

        status = "upcoming";

    } else if (
        status === "featured"
    ) {

        status = "featured";

    } else {

        return;

    }


    // --------------------------------------------------
    // REMOVE OLD COPY FROM ALL STATUS LISTS
    // --------------------------------------------------

    [
        "live",
        "upcoming",
        "featured"
    ]
    .forEach(
        type => {

            virtualSportsGames[
                sport
            ][type] =
                (
                    virtualSportsGames[
                        sport
                    ][type] || []
                )
                .filter(
                    existingGame => {

                        const existingId =
                            existingGame.id ||
                            existingGame.game_id;

                        return (
                            String(existingId) !==
                            String(gameId)
                        );

                    }
                );

        }
    );


    // --------------------------------------------------
    // ADD UPDATED GAME
    // --------------------------------------------------

    virtualSportsGames[
        sport
    ][status].push(
        game
    );


    // --------------------------------------------------
    // REFRESH MAIN VIRTUAL SPORTS
    // --------------------------------------------------

    renderVirtualSportTabs();


    // --------------------------------------------------
    // REFRESH FOOTER
    // --------------------------------------------------

    renderFooterVirtualSports();

};


// ======================================================
// REMOVE VIRTUAL SPORTS GAME FROM CACHE
// ======================================================

window.removeVirtualSportsGameCache =
function (gameId) {

    if (!gameId) {

        return;

    }


    [
        "cricket",
        "football"
    ]
    .forEach(
        sport => {

            [
                "live",
                "upcoming",
                "featured"
            ]
            .forEach(
                status => {

                    virtualSportsGames[
                        sport
                    ][status] =
                        (
                            virtualSportsGames[
                                sport
                            ][status] || []
                        )
                        .filter(
                            game => {

                                const id =
                                    game.id ||
                                    game.game_id;

                                return (
                                    String(id) !==
                                    String(gameId)
                                );

                            }
                        );

                }
            );

        }
    );


    // --------------------------------------------------
    // REFRESH
    // --------------------------------------------------

    renderVirtualSportTabs();

    renderFooterVirtualSports();

};


// ======================================================
// REFRESH ALL VIRTUAL SPORTS UI
// ======================================================

window.refreshVirtualSportsUI =
function () {

    renderVirtualSportTabs();

    renderFooterVirtualSports();

};


// ======================================================
// BANNER SYSTEM
// ======================================================

let virtualSportsBannerIndex =
    0;


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


        // ------------------------------------------------
        // FOOTER VIRTUAL SPORTS
        // ------------------------------------------------

        renderFooterVirtualSports();

    }
);


// ======================================================
// END OF VIRTUAL SPORTS.JS
// ======================================================
```
