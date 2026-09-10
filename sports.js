// ==========================================
// SPORTS.JS
// SPORTS FULL GAME VIEW
// COMMON SPORTS RENDERING SYSTEM
// ==========================================

console.log("🚀 SPORTS.JS STARTED");


// ==========================================
// SPORTS GAME DATA CACHE
// ==========================================

let sportsGames = {};
let sportsGamesLoaded = false;


// ==========================================
// SUPPORTED SPORTS
// ==========================================

const SUPPORTED_SPORTS = [
    "cricket",
    "football",
    "tennis",
    "basketball",
    "volleyball",
    "boxing",
    "hockey",
    "rugby",
    "golf"
];


// ==========================================
// SPORTS ICONS
// ==========================================

const SPORTS_ICONS = {

    cricket: "🏏",
    football: "⚽",
    tennis: "🎾",
    basketball: "🏀",
    volleyball: "🏐",
    boxing: "🥊",
    hockey: "🏒",
    rugby: "🏉",
    golf: "⛳"

};


// ==========================================
// SPORTS DISPLAY NAMES
// ==========================================

const SPORTS_NAMES = {

    cricket: "Cricket",
    football: "Football",
    tennis: "Tennis",
    basketball: "Basketball",
    volleyball: "Volleyball",
    boxing: "Boxing",
    hockey: "Hockey",
    rugby: "Rugby",
    golf: "Golf"

};


// ==========================================
// SPORTS STATUS LIST
// ==========================================

const SPORTS_STATUSES = [
    "live",
    "upcoming",
    "featured"
];


// ==========================================
// NORMALIZE SPORT
// ==========================================

function normalizeSportsSport(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


// ==========================================
// NORMALIZE STATUS
// ==========================================

function normalizeSportsStatus(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


// ==========================================
// NORMALIZE MATCH STATUS
// ==========================================

function normalizeSportsMatchStatus(value) {

    return String(value || "enable")
        .trim()
        .toLowerCase();

}


// ==========================================
// CHECK IF MATCH IS ENABLED
// ==========================================

function isSportsGameEnabled(game) {

    const matchStatus =
        normalizeSportsMatchStatus(
            game?.match_status
        );

    return matchStatus === "enable";

}


// ==========================================
// SAFE HTML ESCAPE
// ==========================================

function escapeSportsHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================
// GET GAME SERIAL NUMBER
// ==========================================

function getSportsGameNumber(gameId) {

    const match =
        String(gameId || "")
            .match(/-(\d+)$/);

    if (!match) {
        return 999999;
    }

    return Number(match[1]);

}


// ==========================================
// GET SPORT ICON
// ==========================================

function getSportsIcon(sport) {

    const normalizedSport =
        normalizeSportsSport(sport);

    return (
        SPORTS_ICONS[normalizedSport] ||
        "🏆"
    );

}


// ==========================================
// GET SPORT DISPLAY NAME
// ==========================================

function getSportsDisplayName(sport) {

    const normalizedSport =
        normalizeSportsSport(sport);

    return (
        SPORTS_NAMES[normalizedSport] ||
        (
            normalizedSport
                ? normalizedSport.charAt(0).toUpperCase() +
                  normalizedSport.slice(1)
                : "Sports"
        )
    );

}


// ==========================================
// GET SPORT EVENT PAGE ID
// ==========================================

function getSportsEventPageId(sport) {

    const normalizedSport =
        normalizeSportsSport(sport);

    return (
        normalizedSport +
        "-events-page"
    );

}


// ==========================================
// GET SPORTS CONTAINER ID
// ==========================================

function getSportsContainerId(
    sport,
    status
) {

    const normalizedSport =
        normalizeSportsSport(sport);

    const normalizedStatus =
        normalizeSportsStatus(status);


    // ==========================================
    // PRIMARY CONTAINER NAMING
    // ==========================================

    return (
        normalizedSport +
        "-" +
        normalizedStatus +
        "-events"
    );

}


// ==========================================
// GET SPORTS CONTAINER
// ==========================================

function getSportsGamesContainer(
    sport,
    status
) {

    const normalizedSport =
        normalizeSportsSport(sport);

    const normalizedStatus =
        normalizeSportsStatus(status);


    // ==========================================
    // PRIMARY ID
    // ==========================================

    const primaryId =
        getSportsContainerId(
            normalizedSport,
            normalizedStatus
        );


    let container =
        document.getElementById(
            primaryId
        );


    if (container) {
        return container;
    }


    // ==========================================
    // FALLBACK IDs
    // ==========================================

    const fallbackIds = [

        `${normalizedSport}-${normalizedStatus}`,

        `${normalizedSport}-${normalizedStatus}-games`,

        `${normalizedSport}-${normalizedStatus}-game-events`,

        `${normalizedSport}-${normalizedStatus}-event`,

        `${normalizedSport}Events${normalizedStatus.charAt(0).toUpperCase()}${normalizedStatus.slice(1)}`

    ];


    for (
        const id of fallbackIds
    ) {

        container =
            document.getElementById(id);

        if (container) {
            return container;
        }

    }


    return null;

}


// ==========================================
// LOAD SPORTS GAMES FROM SUPABASE
// ==========================================

async function loadSportsGames() {

    console.log(
        "🔄 Loading sports games from Supabase..."
    );


    if (
        typeof supabaseClient ===
        "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "❌ supabaseClient is not available."
        );

        return false;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("sports_games")
            .select("*");


    console.log(
        "📦 SUPABASE RAW DATA:",
        data
    );


    console.log(
        "📦 SUPABASE ERROR:",
        error
    );


    if (error) {

        console.error(
            "❌ Failed to load sports games:",
            error
        );

        return false;

    }


    sportsGames = {};


    if (
        !data ||
        data.length === 0
    ) {

        console.warn(
            "⚠️ Supabase returned 0 sports games."
        );


        sportsGamesLoaded = true;


        clearAllSportsGameContainers();


        return true;

    }


    // ==========================================
    // BUILD CACHE
    // ==========================================

    data.forEach(
        (game, index) => {

            console.log(
                `🎮 GAME ${index + 1}:`,
                game
            );


            if (!game.game_id) {
                return;
            }


            sportsGames[
                game.game_id
            ] = game;

        }
    );


    sportsGamesLoaded = true;


    console.log(
        "🗂️ SPORTS GAMES CACHE:",
        sportsGames
    );


    // ==========================================
// RENDER ALL SPORTS
// ==========================================

renderAllSportsGames();

// ==========================================
// RENDER FOOTER SPORTS
// ==========================================

renderFooterSportsGames();


    return true;

}


// ==========================================
// CLEAR ALL SPORTS GAME CONTAINERS
// ==========================================

function clearAllSportsGameContainers() {

    SUPPORTED_SPORTS.forEach(
        sport => {

            SPORTS_STATUSES.forEach(
                status => {

                    const container =
                        getSportsGamesContainer(
                            sport,
                            status
                        );


                    if (container) {

                        container.innerHTML =
                            "";

                    }

                }
            );

        }
    );

}


// ==========================================
// GET ALL CACHED SPORTS GAMES
// ==========================================

function getAllSportsGames() {

    return Object.values(
        sportsGames || {}
    );

}


// ==========================================
// GET GAMES BY SPORT + STATUS
// ==========================================

function getSportsGamesByStatus(
    sport,
    status
) {

    const normalizedSport =
        normalizeSportsSport(sport);

    const normalizedStatus =
        normalizeSportsStatus(status);


    return getAllSportsGames()
        .filter(
            game => {

                const gameSport =
                    normalizeSportsSport(
                        game.sport
                    );


                const gameStatus =
                    normalizeSportsStatus(
                        game.status
                    );


                return (
                    gameSport === normalizedSport &&
                    gameStatus === normalizedStatus &&
                    isSportsGameEnabled(game)
                );

            }
        )
        .sort(
            (a, b) => {

                return (
                    getSportsGameNumber(
                        a.game_id
                    ) -
                    getSportsGameNumber(
                        b.game_id
                    )
                );

            }
        );

}


// ==========================================
// CREATE COMMON SPORTS GAME CARD
// ==========================================

function createSportsGameCard(
    game,
    index
) {

    const sport =
        normalizeSportsSport(
            game.sport
        );


    const status =
        normalizeSportsStatus(
            game.status
        );


    const gameCard =
        document.createElement(
            "div"
        );


    gameCard.className =
        "sports-game-card";


    // ==========================================
    // STORE GAME DATA
    // ==========================================

    gameCard.dataset.gameId =
        game.game_id;


    gameCard.dataset.sport =
        sport;


    gameCard.dataset.status =
        status;

    // ==========================================
// STATUS LABEL
// ==========================================

let statusLabel =
    "UPCOMING";


if (status === "live") {

    statusLabel =
        `
            <span class="live-dot"></span>
            LIVE
        `;

} else if (
    status === "featured"
) {

    statusLabel =
        "FEATURED";

}


   

    // ==========================================
    // GAME CARD HTML
    // ==========================================

    gameCard.innerHTML = `

        <div class="sports-game-card-header">

            <div class="sports-game-status-label">

                ${statusLabel}

            </div>


            <div class="sports-game-serial">

                #${index + 1}

            </div>

        </div>


        <div class="sports-game-card-title">

            ${escapeSportsHtml(game.title)}

        </div>


        <div class="sports-game-card-league">

            ${escapeSportsHtml(game.league)}

        </div>


        <div class="sports-game-card-teams">

            <div class="sports-game-team"
     onclick="event.stopPropagation(); 
     openSportsGame('${escapeSportsHtml(game.sport)}', '${escapeSportsHtml(game.game_id)}')">

    ${escapeSportsHtml(game.home_team)}

</div>


            <div class="sports-game-vs">

                VS

            </div>


            <div class="sports-game-team"
     onclick="event.stopPropagation();
     openSportsGame('${escapeSportsHtml(game.sport)}', '${escapeSportsHtml(game.game_id)}')">

    ${escapeSportsHtml(game.away_team)}

</div>

        </div>

    `;
    

    // ==========================================
    // OPEN GAME
    // ==========================================

    gameCard.addEventListener(
        "click",
        function () {

            console.log(
                "🏆 Opening Sports Game:",
                {
                    sport,
                    gameId: game.game_id,
                    status
                }
            );


            openSportsGame(
                sport,
                game.game_id
            );

        }
    );


    return gameCard;

}


// ==========================================
// COMMON SPORTS RENDERER
// ==========================================

function renderSportsGames(
    sport,
    status
) {

    const normalizedSport =
        normalizeSportsSport(sport);

    const normalizedStatus =
        normalizeSportsStatus(status);


    // ==========================================
    // VALIDATE SPORT
    // ==========================================

    if (
        !SUPPORTED_SPORTS.includes(
            normalizedSport
        )
    ) {

        console.warn(
            "⚠️ Unsupported sport:",
            sport
        );

        return;

    }


    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    if (
        !SPORTS_STATUSES.includes(
            normalizedStatus
        )
    ) {

        console.warn(
            "⚠️ Unsupported status:",
            status
        );

        return;

    }


    // ==========================================
    // GET CONTAINER
    // ==========================================

    const container =
        getSportsGamesContainer(
            normalizedSport,
            normalizedStatus
        );


    if (!container) {

        console.log(
            "⏳ Sports container not found:",
            getSportsContainerId(
                normalizedSport,
                normalizedStatus
            )
        );

        return;

    }


    // ==========================================
    // CLEAR OLD CONTENT
    // ==========================================

    container.innerHTML =
        "";


    // ==========================================
    // GET GAMES
    // ==========================================

    const games =
        getSportsGamesByStatus(
            normalizedSport,
            normalizedStatus
        );


    console.log(
        `🎯 ${normalizedSport.toUpperCase()} ${normalizedStatus.toUpperCase()} GAMES:`,
        games
    );


    // ==========================================
    // NO GAMES
    // ==========================================

    if (
        games.length === 0
    ) {

        console.log(
            `ℹ️ No ${normalizedSport} ${normalizedStatus} games available.`
        );


        container.innerHTML = `

            <div class="sports-empty-state">

                <div class="sports-empty-icon">

                    <i class="fas fa-calendar-times"></i>

                </div>

                <h4>
                    No Games Available
                </h4>

            </div>

        `;

        return;

    }


    // ==========================================
    // CREATE GAME CARDS
    // ==========================================

    games.forEach(
        (game, index) => {

            const card =
                createSportsGameCard(
                    game,
                    index
                );


            if (card) {

                container.appendChild(
                    card
                );

            }

        }
    );


    // ==========================================
    // RENDER COMPLETE
    // ==========================================

    console.log(
        `✅ ${games.length} ${getSportsDisplayName(normalizedSport)} ${normalizedStatus} Game(s) Rendered.`
    );

}


// ==========================================
// RENDER ALL SPORTS
// ==========================================

function renderAllSportsGames() {

    console.log(
        "🎨 Rendering ALL Sports Games..."
    );


    SUPPORTED_SPORTS.forEach(
        sport => {

            SPORTS_STATUSES.forEach(
                status => {

                    renderSportsGames(
                        sport,
                        status
                    );

                }
            );

        }
    );


    console.log(
        "✅ ALL SPORTS RENDERING FINISHED"
    );

}


// ==========================================
// BACKWARD COMPATIBILITY
// ==========================================
// These functions are kept so existing HTML or
// other JS code does not break.
// ==========================================

function renderCricketGames() {

    renderSportsGames(
        "cricket",
        "live"
    );

}


function renderCricketUpcomingGames() {

    renderSportsGames(
        "cricket",
        "upcoming"
    );

}


function renderCricketFeaturedGames() {

    renderSportsGames(
        "cricket",
        "featured"
    );

}


// ==========================================
// GENERIC SINGLE SPORT HELPERS
// ==========================================

function renderFootballGames() {

    renderSportsGames(
        "football",
        "live"
    );

}


function renderFootballUpcomingGames() {

    renderSportsGames(
        "football",
        "upcoming"
    );

}


function renderFootballFeaturedGames() {

    renderSportsGames(
        "football",
        "featured"
    );

}


function renderTennisGames() {

    renderSportsGames(
        "tennis",
        "live"
    );

}


function renderTennisUpcomingGames() {

    renderSportsGames(
        "tennis",
        "upcoming"
    );

}


function renderTennisFeaturedGames() {

    renderSportsGames(
        "tennis",
        "featured"
    );

}


// ==========================================
// START SPORTS GAME DATA LOADING
// ==========================================

const sportsGamesReady =
    loadSportsGames();


console.log(
    "✅ SPORTS DATA LOADER PASSED"
);


// ==========================================
// RENDER WHEN HTML IS READY
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            renderAllSportsGames();

        }
    );

} else {

    renderAllSportsGames();

}


// ==========================================
// SUPABASE REALTIME
// SPORTS GAME INSERT / UPDATE / DELETE
// ==========================================

let sportsGamesRealtimeChannel =
    null;


function setupSportsGamesRealtime() {

    if (
        typeof supabaseClient ===
        "undefined" ||
        !supabaseClient
    ) {

        console.warn(
            "⚠️ Supabase client unavailable for realtime."
        );

        return;

    }


    if (
        sportsGamesRealtimeChannel
    ) {

        console.log(
            "ℹ️ Sports realtime already initialized."
        );

        return;

    }


    try {

        sportsGamesRealtimeChannel =
            supabaseClient
                .channel(
                    "sports-games-live-updates"
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "sports_games"
                    },
                    function (payload) {

                        console.log(
                            "🔔 SPORTS GAME REALTIME UPDATE:",
                            payload
                        );


                        // ==================================
                        // INSERT
                        // ==================================

                        if (
                            payload.eventType ===
                            "INSERT"
                        ) {

                            const newGame =
                                payload.new;


                            if (
                                newGame &&
                                newGame.game_id
                            ) {

                                sportsGames[
                                    newGame.game_id
                                ] = newGame;

                            }

                        }


                        // ==================================
                        // UPDATE
                        // ==================================

                        if (
                            payload.eventType ===
                            "UPDATE"
                        ) {

                            const updatedGame =
                                payload.new;


                            if (
                                updatedGame &&
                                updatedGame.game_id
                            ) {

                                sportsGames[
                                    updatedGame.game_id
                                ] = updatedGame;

                            }

                        }


                        // ==================================
                        // DELETE
                        // ==================================

                        if (
                            payload.eventType ===
                            "DELETE"
                        ) {

                            const deletedGame =
                                payload.old;


                            if (
                                deletedGame &&
                                deletedGame.game_id
                            ) {

                                delete sportsGames[
                                    deletedGame.game_id
                                ];

                            }

                        }


                        // ==================================
                        // RE-RENDER EVERYTHING
                        // ==================================

                        renderAllSportsGames();

                    }
                )
                .subscribe(
                    function (status) {

                        console.log(
                            "📡 SPORTS REALTIME STATUS:",
                            status
                        );

                    }
                );


    } catch (error) {

        console.error(
            "❌ SPORTS REALTIME SETUP ERROR:",
            error
        );

    }

}


// ==========================================
// INITIALIZE REALTIME
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setupSportsGamesRealtime();

        }
    );

} else {

    setupSportsGamesRealtime();

}


// ==========================================
// OPEN SPORTS GAME
// ==========================================

window.openSportsGame =
    async function (
        sport,
        gameId
    ) {

        const normalizedSport =
            normalizeSportsSport(
                sport
            );


        window.currentSportsPage =
            getSportsEventPageId(
                normalizedSport
            );


        console.log(
            "SPORT:",
            normalizedSport
        );


        console.log(
            "GAME ID:",
            gameId
        );


        // ==========================================
        // WAIT FOR SPORTS DATA
        // ==========================================

        if (
            !sportsGamesLoaded
        ) {

            const loaded =
                await sportsGamesReady;


            if (!loaded) {

                console.error(
                    "❌ Sports games could not be loaded."
                );

                return;

            }

        }


        // ==========================================
        // GET GAME FROM CACHE
        // ==========================================

        const game =
            sportsGames[
                gameId
            ];


        if (!game) {

            console.log(
                "Sports game not found:",
                gameId
            );

            return;

        }


        console.log(
            "✅ Selected sports game:",
            game
        );


        // ==========================================
        // GAME PAGE ELEMENTS
        // ==========================================

        const gamePage =
            document.getElementById(
                "sports-game-page"
            );


        const gameTitle =
            document.getElementById(
                "sports-game-title"
            );


        const gameContent =
            document.getElementById(
                "sports-game-content"
            );


        if (
            !gamePage ||
            !gameContent
        ) {

            console.log(
                "Sports game page not found"
            );

            return;

        }


        // ==========================================
        // HIDE SPORTS SUB BANNER
        // ==========================================

        const sportsSubBanner =
            document.getElementById(
                "sportsSubBanner"
            );


        if (sportsSubBanner) {

            sportsSubBanner.style.display =
                "none";

        }


        // ==========================================
        // HIDE SPORTS HEADER
        // ==========================================

        const sportsSubHeader =
            document.getElementById(
                "sportsSubHeader"
            );


        if (sportsSubHeader) {

            sportsSubHeader.style.display =
                "none";

        }


        // ==========================================
        // HIDE SPORTS SUB CATEGORY GRID
        // ==========================================

        const sportsSubcatGrid =
            document.getElementById(
                "sportsSubcatGrid"
            );


        if (sportsSubcatGrid) {

            sportsSubcatGrid.style.display =
                "none";

        }


        // ==========================================
        // PAGE TITLE
        // ==========================================

        if (gameTitle) {

            gameTitle.textContent =
                getSportsIcon(
                    normalizedSport
                ) +
                " " +
                getSportsDisplayName(
                    normalizedSport
                );

        }


        // ==========================================
        // GAME CONTENT
        // ==========================================

        gameContent.innerHTML =
            createSportsGamePageHtml(
                game
            );


        // ==========================================
        // HIDE NORMAL SPORTS CONTENT
        // ==========================================

        const sportsSubSection =
            document.getElementById(
                "sports-sub-section"
            );


        const sportsSubSectionAlt =
            document.getElementById(
                "sportsSubSection"
            );


        const trendingPage =
            document.getElementById(
                "sports-trending-page"
            );


        if (sportsSubSection) {

            sportsSubSection.style.display =
                "none";

        }


        


        if (trendingPage) {

            trendingPage.style.display =
                "none";

        }

        // ==========================================
// SHOW SPORTS GAME PAGE PARENT
// ==========================================

if (sportsSubSectionAlt) {

    sportsSubSectionAlt.style.display =
        "block";

}


// ==========================================
// SHOW FULL GAME PAGE
// ==========================================

gamePage.style.display =
    "block";


        // ==========================================
        // HIDE ALL SPORT EVENT PAGES
        // ==========================================

        SUPPORTED_SPORTS.forEach(
            supportedSport => {

                const page =
                    document.getElementById(
                        getSportsEventPageId(
                            supportedSport
                        )
                    );


                if (page) {

                    page.style.display =
                        "none";

                }

            }
        );


       

        
        // ==========================================
        // SCROLL TOP
        // ==========================================

        window.scrollTo(
            0,
            0
        );

    };


// ==========================================
// CREATE SPORTS GAME FULL PAGE
// ==========================================

function createSportsGamePageHtml(
    game
) {

    const sport =
        normalizeSportsSport(
            game.sport
        );


    const status =
        normalizeSportsStatus(
            game.status
        );


    const icon =
        getSportsIcon(
            sport
        );


    const sportName =
        getSportsDisplayName(
            sport
        );


    const statusText =
        status === "live"
            ? "LIVE"
            : status === "featured"
                ? "FEATURED"
                : "UPCOMING";


    return `

        <!-- ==================================
             GAME HEADER
        ================================== -->

        <div class="sports-game-match-header">

            <div class="sports-game-live-badge">

                ${
                    status === "live"
                        ? `
                            <span class="live-dot"></span>
                            LIVE
                          `
                        : escapeSportsHtml(
                            statusText
                          )
                }

            </div>


            <div class="sports-game-match-title">

                ${escapeSportsHtml(game.title)}

            </div>


            <div class="sports-game-league">

                ${escapeSportsHtml(game.league)}

            </div>

        </div>


        <!-- ==================================
             MATCH HERO
        ================================== -->

        <div class="sports-game-hero">

            <div class="sports-game-animation">

                <div class="sports-animation-live">

                    ${
                        status === "live"
                            ? "● LIVE"
                            : escapeSportsHtml(
                                statusText
                              )
                    }

                </div>


                <div class="sports-animation-icon">

                    ${icon}

                </div>


                <div class="sports-animation-title">

                    ${escapeSportsHtml(game.title)}

                </div>


                <div class="sports-animation-subtitle">

                    ${escapeSportsHtml(sportName)}
                    Match Centre

                </div>

            </div>

        </div>


        <!-- ==================================
             BETTING SECTION
        ================================== -->

        <div class="sports-betting-box">

            <div class="sports-betting-title">

                Match Betting

            </div>


            ${renderSportsMarkets(game)}

        </div>

    `;

}


// ==========================================
// RENDER SPORTS MARKETS
// ==========================================

function renderSportsMarkets(
    game
) {

    let html = "";


    // ==========================================
    // MATCH WINNER
    // ==========================================

    const matchWinnerEnabled =
        String(
            game.match_winner_enabled
        ).toLowerCase() === "true";


    if (
        matchWinnerEnabled
    ) {

        html += `

            <div class="sports-market">

                <div class="sports-market-title">

                    Match Winner

                </div>


                <div class="sports-bet-options">

                    <button
                        type="button"
                        class="sports-bet-option"
                        onclick="addToBetSlip({
                            eventId: '${escapeSportsHtml(game.game_id)}',
                            eventName: '${escapeSportsHtml(game.title)}',
                            market: '${escapeSportsHtml(game.home_team)}',
                            odds: 1.85
                        })"
                    >

                        <span>

                            ${escapeSportsHtml(
                                game.home_team
                            )}

                        </span>


                        <strong>

                            1.85

                        </strong>

                    </button>


                    <button
                        type="button"
                        class="sports-bet-option"
                        onclick="addToBetSlip({
                            eventId: '${escapeSportsHtml(game.game_id)}',
                            eventName: '${escapeSportsHtml(game.title)}',
                            market: '${escapeSportsHtml(game.away_team)}',
                            odds: 1.65
                        })"
                    >

                        <span>

                            ${escapeSportsHtml(
                                game.away_team
                            )}

                        </span>


                        <strong>

                            1.65

                        </strong>

                    </button>

                </div>

            </div>

        `;

    }


    // ==========================================
    // TOTAL RUNS
    // ==========================================

    const totalRunsEnabled =
        String(
            game.total_runs_enabled
        ).toLowerCase() === "true";


    if (
        totalRunsEnabled
    ) {

        html += `

            <div class="sports-market">

                <div class="sports-market-title">

                    Total Runs

                </div>


                <div class="sports-bet-options">

                    <button
                        type="button"
                        class="sports-bet-option"
                        onclick="addToBetSlip({
                            eventId: '${escapeSportsHtml(game.game_id)}',
                            eventName: '${escapeSportsHtml(game.title)}',
                            market: 'Over 180.5',
                            odds: 1.90
                        })"
                    >

                        <span>

                            Over 180.5

                        </span>


                        <strong>

                            1.90

                        </strong>

                    </button>


                    <button
                        type="button"
                        class="sports-bet-option"
                        onclick="addToBetSlip({
                            eventId: '${escapeSportsHtml(game.game_id)}',
                            eventName: '${escapeSportsHtml(game.title)}',
                            market: 'Under 180.5',
                            odds: 1.80
                        })"
                    >

                        <span>

                            Under 180.5

                        </span>


                        <strong>

                            1.80

                        </strong>

                    </button>

                </div>

            </div>

        `;

    }


    // ==========================================
    // NO ENABLED MARKET
    // ==========================================

    if (!html) {

        html = `

            <div class="sports-market">

                <div class="sports-market-title">

                    Markets

                </div>


                <div
                    style="
                        padding:15px;
                        text-align:center;
                        opacity:.65;
                    "
                >

                    No markets available

                </div>

            </div>

        `;

    }


    return html;

}


// ==========================================
// GLOBAL FUNCTION CHECK
// ==========================================

console.log(
    "🌍 GLOBAL openSportsGame:",
    typeof window.openSportsGame
);


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    // ==========================================
    // HIDE FULL GAME VIEW
    // ==========================================

    const gamePage =
        document.getElementById(
            "sports-game-page"
        );


    if (gamePage) {

        gamePage.style.display =
            "none";

    }


    // ==========================================
    // HIDE ALL EVENT PAGES
    // ==========================================

    SUPPORTED_SPORTS.forEach(
        sport => {

            const page =
                document.getElementById(
                    getSportsEventPageId(
                        sport
                    )
                );


            if (page) {

                page.style.display =
                    "none";

            }

        }
    );


    // ==========================================
    // RESTORE SPORTS BANNER
    // ==========================================

    const sportsSubBanner =
        document.getElementById(
            "sportsSubBanner"
        );


    if (sportsSubBanner) {

        sportsSubBanner.style.display =
            "block";

    }


    // ==========================================
    // RESTORE SPORTS HEADER
    // ==========================================

    const sportsHeader =
        document.querySelector(
            ".subcat-header-row"
        );


    if (sportsHeader) {

        sportsHeader.style.display =
            "flex";

    }


    // ==========================================
    // RESTORE SPORTS SUB CATEGORY GRID
    // ==========================================

    const sportsGrid =
        document.getElementById(
            "sportsSubcatGrid"
        );


    if (sportsGrid) {

        sportsGrid.style.display =
            "grid";

    }


    // ==========================================
    // SHOW TRENDING
    // ==========================================

    const trending =
        document.getElementById(
            "sports-trending-page"
        );


    if (trending) {

        trending.style.display =
            "block";

    }


    // ==========================================
    // REMOVE ACTIVE BUTTON
    // ==========================================

    document
        .querySelectorAll(
            "#sportsSubcatGrid .subcat-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    // ==========================================
    // SCROLL BACK
    // ==========================================

    const sportsSection =
        document.getElementById(
            "sportsSubSection"
        );


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

window.openSportsGame =
    openSportsGame;


window.backFromSportsGame =
    backFromSportsGame;


window.renderAllSportsGames =
    renderAllSportsGames;


window.renderSportsGames =
    renderSportsGames;


window.loadSportsGames =
    loadSportsGames;


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
// BET SLIP HEADER BALANCE
// ==========================================

function updateSlipBalance() {

    const balanceEl =
        document.getElementById(
            "slipBalance"
        );


    if (!balanceEl) {
        return;
    }


    let balance = 0;


    if (
        typeof getCurrentBalance ===
        "function"
    ) {

        balance =
            getCurrentBalance() || 0;

    }


    balanceEl.textContent =
        "$" +
        Number(
            balance
        ).toFixed(2);

}


// ==========================================
// SUPABASE BALANCE UPDATE
// ==========================================

/*
async function syncBalanceFromSupabase() {

    const userId =
        localStorage.getItem(
            "userId"
        );

    const currency =
        localStorage.getItem(
            "selectedCurrency"
        ) || "USDT";


    const {
        data,
        error
    } =
        await supabase
            .from("wallets")
            .select(
                "balance, currency_symbol"
            )
            .eq(
                "user_id",
                userId
            )
            .eq(
                "currency",
                currency
            )
            .single();


    if (data) {

        const formatted =
            `${data.currency_symbol || "$"}${parseFloat(data.balance).toFixed(2)}`;


        localStorage.setItem(
            "selectedBalance",
            formatted
        );


        updateSlipBalance();

    }

}
*/


// ==========================================
// SPORTS BET SLIP SYSTEM
// ==========================================


// ==========================================
// STATE
// ==========================================

let betSlip = [];

let currentMode =
    "single";


// ==========================================
// LOAD BET SLIP
// ==========================================

if (
    localStorage.getItem(
        "sportsBetSlip"
    )
) {

    try {

        betSlip =
            JSON.parse(
                localStorage.getItem(
                    "sportsBetSlip"
                )
            );


        updateBetCount();

    } catch (e) {

        betSlip = [];

    }

}


// ==========================================
// ADD TO BET SLIP
// ==========================================

function addToBetSlip(data) {

    const isDuplicate =
        betSlip.some(
            bet =>
                bet.eventId ===
                    data.eventId &&
                bet.market ===
                    data.market
        );


    if (isDuplicate) {

        showToast(
            "Already added!",
            "error"
        );

        return;

    }


    const bet = {

        id:
            Date.now() +
            Math.random()
                .toString(36)
                .substr(2, 9),

        eventId:
            data.eventId,

        eventName:
            data.eventName,

        market:
            data.market,

        odds:
            parseFloat(
                data.odds
            ),

        stake:
            0,

        addedAt:
            new Date()
                .toLocaleString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

    };


    betSlip.push(
        bet
    );


    saveSlip();

    updateBetCount();

    renderBetSlip();

    showToast(
        "Added to bet slip!",
        "success"
    );

}


// ==========================================
// OPEN BET SLIP
// ==========================================

function openSportsBetSlip() {

    const panel =
        document.getElementById(
            "sportsBetSlipPanel"
        );


    const betSlipElement =
        document.getElementById(
            "sportsBetSlip"
        );


    if (betSlipElement) {

        betSlipElement.style.display =
            "flex";

    }


    if (panel) {

        panel.style.display =
            "block";


        updateSlipBalance();

        renderBetSlip();

    }

}


// ==========================================
// CLOSE BET SLIP
// ==========================================

function closeSportsBetSlip() {

    const panel =
        document.getElementById(
            "sportsBetSlipPanel"
        );


    if (panel) {

        panel.style.display =
            "none";

    }

}


// ==========================================
// REMOVE SINGLE BET
// ==========================================

function removeSingleBet(
    betId
) {

    betSlip =
        betSlip.filter(
            bet =>
                bet.id !==
                betId
        );


    saveSlip();

    updateBetCount();

    renderBetSlip();

}


// ==========================================
// CLEAR ALL BETS
// ==========================================

function clearAllSportsBetSlip() {

    if (
        betSlip.length ===
        0
    ) {

        return;

    }


    if (
        !confirm(
            "Clear all bets?"
        )
    ) {

        return;

    }


    betSlip = [];


    saveSlip();

    updateBetCount();

    renderBetSlip();


    const multipleSection =
        document.getElementById(
            "multipleSection"
        );


    if (multipleSection) {

        multipleSection.style.display =
            "none";

    }


    showToast(
        "Cleared!",
        "info"
    );

}


// ==========================================
// SWITCH BET MODE
// ==========================================

function switchBetMode(
    mode
) {

    currentMode =
        mode;


    document
        .querySelectorAll(
            ".mode-tab"
        )
        .forEach(
            tab =>
                tab.classList.remove(
                    "active"
                )
        );


    const tabs =
        document.querySelectorAll(
            ".mode-tab"
        );


    const multiSection =
        document.getElementById(
            "multipleSection"
        );


    if (
        mode ===
        "single"
    ) {

        if (tabs[0]) {

            tabs[0].classList.add(
                "active"
            );

        }


        if (multiSection) {

            multiSection.style.display =
                "none";

        }

    } else {

        if (tabs[1]) {

            tabs[1].classList.add(
                "active"
            );

        }


        if (multiSection) {

            multiSection.style.display =
                "block";

        }

    }


    renderBetSlip();

    calculateReturns();

}


// ==========================================
// RENDER BET SLIP
// ==========================================

function renderBetSlip() {

    const container =
        document.getElementById(
            "betSlipBody"
        );


    const multiSection =
        document.getElementById(
            "multipleSection"
        );


    if (!container) {

        return;

    }


    if (
        betSlip.length ===
        0
    ) {

        container.innerHTML =
            '<div class="empty-slip">Your bet slip is empty</div>';


        if (multiSection) {

            multiSection.style.display =
                "none";

        }


        updateTotalDisplay();

        return;

    }


    // ==========================================
    // GROUP BY EVENT
    // ==========================================

    const eventGroups = {};


    betSlip.forEach(
        bet => {

            if (
                !eventGroups[
                    bet.eventId
                ]
            ) {

                eventGroups[
                    bet.eventId
                ] = [];

            }


            eventGroups[
                bet.eventId
            ].push(
                bet
            );

        }
    );


    const hasMultipleEvents =
        Object.keys(
            eventGroups
        ).length >= 2;


    // ==========================================
    // SINGLE MODE
    // ==========================================

    if (
        currentMode ===
        "single"
    ) {

        let html = "";


        Object.keys(
            eventGroups
        ).forEach(
            eid => {

                const bets =
                    eventGroups[eid];


                html += `
                    <div class="event-group">

                        <div
                            style="
                                color:#ff6b00;
                                font-weight:bold;
                                margin-bottom:8px;
                                font-size:13px;
                            "
                        >

                            ${escapeSportsHtml(
                                bets[0].eventName
                            )}

                        </div>
                `;


                bets.forEach(
                    bet => {

                        html += `

                            <div
                                class="bet-item"
                                data-bet-id="${escapeSportsHtml(bet.id)}"
                            >

                                <button
                                    class="remove-btn"
                                    onclick="removeSingleBet('${escapeSportsHtml(bet.id)}')"
                                    style="
                                        position:absolute;
                                        top:12px;
                                        right:12px;
                                    "
                                >
                                    ×
                                </button>


                                <div
                                    style="
                                        display:flex;
                                        justify-content:space-between;
                                        align-items:flex-start;
                                        padding-right:30px;
                                    "
                                >

                                    <div style="flex:1;">

                                        <div class="bet-market">

                                            ${escapeSportsHtml(
                                                bet.market
                                            )}

                                        </div>


                                        <div class="bet-date">

                                            ${escapeSportsHtml(
                                                bet.addedAt
                                            )}

                                        </div>


                                        <div
                                            class="stake-box"
                                            style="margin-top:6px;"
                                        >

                                            <input
                                                type="number"
                                                placeholder="Stake ($)"
                                                style="
                                                    width:90px;
                                                    padding:4px 6px;
                                                    font-size:13px;
                                                "
                                                value="${
                                                    bet.stake > 0
                                                        ? bet.stake
                                                        : ""
                                                }"
                                                oninput="updateStake('${escapeSportsHtml(bet.id)}', this.value)"
                                            >

                                        </div>

                                    </div>


                                    <div
                                        style="
                                            display:flex;
                                            flex-direction:column;
                                            align-items:flex-end;
                                            gap:6px;
                                            margin-top:24px;
                                        "
                                    >

                                        <div class="bet-odds">

                                            @ ${Number(
                                                bet.odds
                                            ).toFixed(2)}

                                        </div>


                                        <span class="returns">

                                            Return: ৳${
                                                (
                                                    bet.stake *
                                                    bet.odds
                                                ).toFixed(2)
                                            }

                                        </span>

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                );


                html += `
                    </div>
                `;

            }
        );


        container.innerHTML =
            html;


        if (multiSection) {

            multiSection.style.display =
                "none";

        }

    }


    // ==========================================
    // MULTIPLE MODE
    // ==========================================

    else {

        if (!hasMultipleEvents) {

            container.innerHTML =
                '<div class="empty-slip">Add bets from different matches for multi.</div>';


            if (multiSection) {

                multiSection.style.display =
                    "none";

            }


            updateTotalDisplay();

            return;

        }


        let html = "";


        Object.keys(
            eventGroups
        ).forEach(
            eid => {

                const bets =
                    eventGroups[eid];


                html += `

                    <div class="event-group">

                        <div
                            style="
                                color:#ff6b00;
                                font-weight:bold;
                                margin-bottom:8px;
                                font-size:13px;
                            "
                        >

                            ${escapeSportsHtml(
                                bets[0].eventName
                            )}

                        </div>

                `;


                bets.forEach(
                    bet => {

                        html += `

                            <div
                                class="bet-item"
                                data-bet-id="${escapeSportsHtml(bet.id)}"
                                style="
                                    position:relative;
                                    padding-top:14px;
                                "
                            >

                                <button
                                    class="remove-btn"
                                    onclick="removeSingleBet('${escapeSportsHtml(bet.id)}')"
                                    style="
                                        position:absolute;
                                        top:10px;
                                        right:10px;
                                        z-index:2;
                                    "
                                >

                                    ×

                                </button>


                                <div
                                    style="
                                        padding-right:40px;
                                    "
                                >

                                    <div
                                        class="bet-market"
                                        style="
                                            font-weight:bold;
                                            color:#fff;
                                            font-size:14px;
                                            margin-bottom:4px;
                                        "
                                    >

                                        ${escapeSportsHtml(
                                            bet.market
                                        )}

                                    </div>


                                    <div
                                        class="bet-date"
                                        style="
                                            color:#888;
                                            font-size:11px;
                                            margin-bottom:8px;
                                        "
                                    >

                                        ${escapeSportsHtml(
                                            bet.addedAt
                                        )}

                                    </div>


                                    <div
                                        style="
                                            display:flex;
                                            justify-content:space-between;
                                            align-items:center;
                                        "
                                    >

                                        <input
                                            type="number"
                                            placeholder="Stake ($)"
                                            style="
                                                width:90px;
                                                padding:4px 6px;
                                                font-size:13px;
                                                border-radius:6px;
                                                border:1px solid #333;
                                                background:#0f0f1a;
                                                color:white;
                                                height:32px;
                                            "
                                            value="${
                                                bet.stake > 0
                                                    ? bet.stake
                                                    : ""
                                            }"
                                            oninput="updateStake('${escapeSportsHtml(bet.id)}', this.value)"
                                        >

                                    </div>

                                </div>


                                <div
                                    style="
                                        position:absolute;
                                        right:10px;
                                        bottom:14px;
                                        text-align:right;
                                    "
                                >

                                    <div
                                        class="bet-odds"
                                        style="
                                            color:#ff6b00;
                                            font-weight:bold;
                                            font-size:13px;
                                            margin-bottom:4px;
                                        "
                                    >

                                        @ ${Number(
                                            bet.odds
                                        ).toFixed(2)}

                                    </div>


                                    <span
                                        class="returns"
                                        style="
                                            color:#4ade80;
                                            font-size:13px;
                                            white-space:nowrap;
                                        "
                                    >

                                        Return: ৳${
                                            (
                                                bet.stake *
                                                bet.odds
                                            ).toFixed(2)
                                        }

                                    </span>

                                </div>

                            </div>

                        `;

                    }
                );


                html += `
                    </div>
                `;

            }
        );


        container.innerHTML =
            html;


        if (multiSection) {

            multiSection.style.display =
                "block";

        }


        calculateReturns();

    }


    updateTotalDisplay();

}


// ==========================================
// UPDATE STAKE
// ==========================================

function updateStake(
    betId,
    value
) {

    const bet =
        betSlip.find(
            b =>
                b.id ===
                betId
        );


    if (!bet) {

        return;

    }


    bet.stake =
        parseFloat(
            value
        ) || 0;


    saveSlip();


    const item =
        document.querySelector(
            `[data-bet-id="${CSS.escape(betId)}"]`
        );


    if (item) {

        const ret =
            item.querySelector(
                ".returns"
            );


        if (ret) {

            ret.textContent =
                `Return: ৳${(
                    bet.stake *
                    bet.odds
                ).toFixed(2)}`;

        }

    }


    updateTotalDisplay();

}


// ==========================================
// CALCULATE RETURNS
// ==========================================

function calculateReturns() {

    if (
        currentMode !==
        "multiple"
    ) {

        return;

    }


    const eventIds =
        [
            ...new Set(
                betSlip.map(
                    b =>
                        b.eventId
                )
            )
        ];


    if (
        eventIds.length <
        2
    ) {

        const totalOddsEl =
            document.getElementById(
                "totalOdds"
            );


        const potentialWinEl =
            document.getElementById(
                "potentialWin"
            );


        if (totalOddsEl) {

            totalOddsEl.textContent =
                "0.00";

        }


        if (potentialWinEl) {

            potentialWinEl.textContent =
                "৳0.00";

        }


        return;

    }


    let totalOdds =
        betSlip.reduce(
            (
                acc,
                b
            ) =>
                acc *
                b.odds,
            1
        );


    const stake =
        parseFloat(
            document.getElementById(
                "multiStake"
            )?.value
        ) || 0;


    const totalOddsEl =
        document.getElementById(
            "totalOdds"
        );


    const potentialWinEl =
        document.getElementById(
            "potentialWin"
        );


    if (totalOddsEl) {

        totalOddsEl.textContent =
            totalOdds.toFixed(2);

    }


    if (potentialWinEl) {

        potentialWinEl.textContent =
            `৳${(
                stake *
                totalOdds
            ).toFixed(2)}`;

    }

}


// ==========================================
// UPDATE BET COUNT
// ==========================================

function updateBetCount() {

    const countEl =
        document.getElementById(
            "sportsBetSlipCount"
        );


    if (countEl) {

        countEl.textContent =
            betSlip.length;

    }


    updateTotalDisplay();

}


// ==========================================
// UPDATE TOTAL DISPLAY
// ==========================================

function updateTotalDisplay() {

    const totalEl =
        document.getElementById(
            "slipTotalAmount"
        );


    if (!totalEl) {

        return;

    }


    if (
        currentMode ===
        "single"
    ) {

        const total =
            betSlip.reduce(
                (
                    sum,
                    b
                ) =>
                    sum +
                    (
                        b.stake ||
                        0
                    ),
                0
            );


        totalEl.textContent =
            `৳${total.toFixed(2)}`;

    } else {

        const stake =
            parseFloat(
                document.getElementById(
                    "multiStake"
                )?.value
            ) || 0;


        totalEl.textContent =
            `৳${stake.toFixed(2)}`;

    }

}


// ==========================================
// PLACE SPORTS BET
// ==========================================

function placeSportsBet() {

    if (
        betSlip.length ===
        0
    ) {

        showToast(
            "Your bet slip is empty!",
            "error"
        );

        return;

    }


    let totalStake =
        0;


    // ==========================================
    // SINGLE
    // ==========================================

    if (
        currentMode ===
        "single"
    ) {

        const emptyStake =
            betSlip.some(
                b =>
                    !b.stake ||
                    b.stake <= 0
            );


        if (emptyStake) {

            showToast(
                "Please enter stake for all bets!",
                "error"
            );

            return;

        }


        totalStake =
            betSlip.reduce(
                (
                    sum,
                    b
                ) =>
                    sum +
                    b.stake,
                0
            );

    }


    // ==========================================
    // MULTIPLE
    // ==========================================

    else {

        const eventIds =
            [
                ...new Set(
                    betSlip.map(
                        b =>
                            b.eventId
                    )
                )
            ];


        if (
            eventIds.length <
            2
        ) {

            showToast(
                "Need bets from 2+ different matches for multi!",
                "error"
            );

            return;

        }


        const stake =
            parseFloat(
                document.getElementById(
                    "multiStake"
                )?.value
            ) || 0;


        if (
            stake <=
            0
        ) {

            showToast(
                "Please enter your total stake!",
                "error"
            );

            return;

        }


        totalStake =
            stake;

    }


    // ==========================================
    // BALANCE CHECK
    // ==========================================

    let currentBalance =
        getCurrentBalance();


    if (
        currentBalance <
        totalStake
    ) {

        showToast(
            "Insufficient balance!",
            "error"
        );

        return;

    }


    // ==========================================
    // DEDUCT WALLET
    // ==========================================

    let newBalance =
        currentBalance -
        totalStake;


    setCurrentBalance(
        newBalance
    );


    updateBalanceUI();

    updateSlipBalance();


    // ==========================================
    // PLACE BET LOG
    // ==========================================

    console.log(
        "Bet placed:",
        {
            mode:
                currentMode,

            bets:
                betSlip,

            totalStake:
                totalStake,

            remainingBalance:
                newBalance
        }
    );


    // ==========================================
    // SAVE ACTIVE BET
    // ==========================================

    const activeBet = {

        betId:
            "DG-" +
            Date.now(),

        match:
            currentMode ===
            "single"
                ? betSlip[0].match
                : "Multiple Bet",

        market:
            currentMode,

        selections:
            JSON.parse(
                JSON.stringify(
                    betSlip
                )
            ),

        odds:
            currentMode ===
            "single"
                ? betSlip[0].odds
                : getTotalOdds(),

        stake:
            totalStake,

        possibleWin:
            Number(
                (
                    totalStake *
                    (
                        currentMode ===
                        "single"
                            ? betSlip[0].odds
                            : getTotalOdds()
                    )
                ).toFixed(2)
            ),

        cashOut:
            totalStake,

        currency:
            walletManager.currentCurrency,

        status:
            "ACTIVE",

        placedTime:
            new Date()
                .toLocaleString()

    };


    walletManager.activeBets.push(
        activeBet
    );


    saveWalletManager();


    showToast(
        "Bet placed successfully!",
        "success"
    );


    // ==========================================
    // CLEAR SLIP
    // ==========================================

    betSlip = [];


    saveSlip();

    updateBetCount();

    renderBetSlip();

    closeSportsBetSlip();


    const multipleSection =
        document.getElementById(
            "multipleSection"
        );


    if (multipleSection) {

        multipleSection.style.display =
            "none";

    }


    const multiStake =
        document.getElementById(
            "multiStake"
        );


    if (multiStake) {

        multiStake.value =
            "";

    }

}


// ==========================================
// GET TOTAL ODDS
// ==========================================

function getTotalOdds() {

    if (
        !betSlip.length
    ) {

        return 0;

    }


    let totalOdds =
        1;


    betSlip.forEach(
        bet => {

            totalOdds *=
                parseFloat(
                    bet.odds
                );

        }
    );


    return Number(
        totalOdds.toFixed(2)
    );

}


window.getTotalOdds =
    getTotalOdds;


// ==========================================
// SAVE BET SLIP
// ==========================================

function saveSlip() {

    localStorage.setItem(
        "sportsBetSlip",
        JSON.stringify(
            betSlip
        )
    );

}


// ==========================================
// SHOW TOAST
// ==========================================

function showToast(
    msg,
    type
) {

    const existing =
        document.querySelector(
            ".bet-slip-toast"
        );


    if (existing) {

        existing.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "bet-slip-toast";


    toast.textContent =
        msg;


    toast.style.cssText =
        `
            position:fixed;
            top:20px;
            left:50%;
            transform:translateX(-50%);
            padding:12px 24px;
            border-radius:8px;
            color:white;
            font-weight:500;
            z-index:99999;
        `;


    toast.style.background =
        type === "success"
            ? "#22c55e"
            : type === "error"
                ? "#ef4444"
                : "#3b82f6";


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";


            toast.style.transition =
                "opacity 0.3s";


            setTimeout(
                () => {

                    toast.remove();

                },
                300
            );

        },
        2500
    );

}


// ==========================================
// BET HISTORY & CASH OUT SYSTEM
// ==========================================


// ==========================================
// INIT
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateBetCount();

        renderAllSportsGames();

    }
);


// ==========================================
// FINAL DEBUG
// ==========================================

console.log(
    "🏁 SPORTS.JS FINISHED",
    typeof window.openSportsGame
);
