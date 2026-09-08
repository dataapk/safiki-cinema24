// ==========================================
// SPORTS.JS
// MASTER SPORTS FRONTEND
// SPORTS FULL GAME VIEW
// COMMON SPORTS RENDERING SYSTEM
// SUPABASE-DRIVEN MARKETS & ODDS
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
// SAFE JAVASCRIPT VALUE
// ==========================================

function escapeSportsAttribute(value) {

    return escapeSportsHtml(
        value
    );

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


    return Number(
        match[1]
    );

}


// ==========================================
// GET SPORT ICON
// ==========================================

function getSportsIcon(sport) {

    const normalizedSport =
        normalizeSportsSport(
            sport
        );


    return (
        SPORTS_ICONS[
            normalizedSport
        ] ||
        "🏆"
    );

}


// ==========================================
// GET SPORT DISPLAY NAME
// ==========================================

function getSportsDisplayName(sport) {

    const normalizedSport =
        normalizeSportsSport(
            sport
        );


    return (
        SPORTS_NAMES[
            normalizedSport
        ] ||
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
        normalizeSportsSport(
            sport
        );


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
        normalizeSportsSport(
            sport
        );


    const normalizedStatus =
        normalizeSportsStatus(
            status
        );


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
        normalizeSportsSport(
            sport
        );


    const normalizedStatus =
        normalizeSportsStatus(
            status
        );


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
            document.getElementById(
                id
            );


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


        sportsGamesLoaded =
            true;


        clearAllSportsGameContainers();


        return true;

    }


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


    sportsGamesLoaded =
        true;


    console.log(
        "🗂️ SPORTS GAMES CACHE:",
        sportsGames
    );


    renderAllSportsGames();


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
        normalizeSportsSport(
            sport
        );


    const normalizedStatus =
        normalizeSportsStatus(
            status
        );


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
                    gameSport ===
                        normalizedSport &&
                    gameStatus ===
                        normalizedStatus &&
                    isSportsGameEnabled(
                        game
                    )
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
// PARSE MARKET DATA FROM SUPABASE
// ==========================================

function parseSportsMarketData(game) {

    const possibleFields = [

        "markets",
        "betting_markets",
        "sports_markets",
        "odds_data",
        "market_data"

    ];


    let rawMarkets = null;


    for (
        const field of possibleFields
    ) {

        if (
            game &&
            game[field] !== null &&
            game[field] !== undefined &&
            game[field] !== ""
        ) {

            rawMarkets =
                game[field];

            break;

        }

    }


    if (!rawMarkets) {

        return [];

    }


    if (
        typeof rawMarkets ===
        "string"
    ) {

        try {

            rawMarkets =
                JSON.parse(
                    rawMarkets
                );

        } catch (error) {

            console.warn(
                "⚠️ Could not parse sports market JSON:",
                error
            );

            return [];

        }

    }


    if (
        Array.isArray(
            rawMarkets
        )
    ) {

        return rawMarkets
            .filter(
                market =>
                    market &&
                    typeof market ===
                    "object"
            );

    }


    if (
        typeof rawMarkets ===
        "object"
    ) {

        if (
            Array.isArray(
                rawMarkets.markets
            )
        ) {

            return rawMarkets.markets;

        }


        return Object.entries(
            rawMarkets
        ).map(
            ([key, value]) => {

                if (
                    value &&
                    typeof value ===
                    "object"
                ) {

                    return {
                        ...value,
                        market:
                            value.market ||
                            value.name ||
                            key
                    };

                }


                return {
                    market: key,
                    odds: value
                };

            }
        );

    }


    return [];

}


// ==========================================
// NORMALIZE MARKET OPTIONS
// ==========================================

function normalizeSportsMarketOptions(
    market
) {

    if (!market) {

        return [];

    }


    const possibleOptions = [

        market.options,

        market.selections,

        market.outcomes,

        market.bets

    ];


    let options = null;


    for (
        const candidate of possibleOptions
    ) {

        if (
            Array.isArray(
                candidate
            )
        ) {

            options =
                candidate;

            break;

        }

    }


    if (
        options
    ) {

        return options
            .map(
                option => {

                    if (
                        option === null ||
                        option === undefined
                    ) {

                        return null;

                    }


                    if (
                        typeof option ===
                        "string" ||
                        typeof option ===
                        "number"
                    ) {

                        return {

                            label:
                                String(
                                    option
                                ),

                            odds:
                                null

                        };

                    }


                    return {

                        label:
                            option.label ||
                            option.name ||
                            option.selection ||
                            option.outcome ||
                            option.team ||
                            option.title ||
                            "",

                        odds:
                            option.odds ??
                            option.price ??
                            option.value ??
                            null,

                        id:
                            option.id ??
                            null

                    };

                }
            )
            .filter(
                option =>
                    option &&
                    option.label
            );

    }


    return [];

}


// ==========================================
// GET NORMALIZED SPORTS MARKETS
// ==========================================

function getSportsMarkets(
    game
) {

    const markets =
        parseSportsMarketData(
            game
        );


    return markets
        .map(
            (market, index) => {

                const marketName =
                    market.market ||
                    market.name ||
                    market.title ||
                    market.label ||
                    `Market ${index + 1}`;


                const options =
                    normalizeSportsMarketOptions(
                        market
                    );


                return {

                    ...market,

                    marketName:
                        String(
                            marketName
                        ),

                    options

                };

            }
        )
        .filter(
            market =>
                market.options.length >
                0
        );

}


// ==========================================
// GET PRIMARY SPORTS MARKET
// ==========================================

function getPrimarySportsMarket(
    game
) {

    const markets =
        getSportsMarkets(
            game
        );


    if (
        markets.length ===
        0
    ) {

        return null;

    }


    return markets[0];

}


// ==========================================
// FORMAT ODDS
// ==========================================

function formatSportsOdds(
    odds
) {

    if (
        odds === null ||
        odds === undefined ||
        odds === ""
    ) {

        return "";

    }


    const number =
        Number(
            odds
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "";

    }


    return number.toFixed(2);

}


// ==========================================
// CREATE PRIMARY MARKET OPTION
// ==========================================

function createSportsPrimaryMarketOption(
    game,
    market,
    option
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "sports-primary-odd";


    const odds =
        formatSportsOdds(
            option.odds
        );


    button.innerHTML = `

        <span class="sports-primary-odd-label">

            ${escapeSportsHtml(
                option.label
            )}

        </span>

        ${
            odds
                ? `
                    <strong class="sports-primary-odd-value">
                        ${escapeSportsHtml(odds)}
                    </strong>
                  `
                : ""
        }

    `;


    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            if (
                option.odds ===
                    null ||
                option.odds ===
                    undefined ||
                option.odds ===
                    ""
            ) {

                showToast(
                    "Odds are not available.",
                    "error"
                );

                return;

            }


            addToBetSlip({

                eventId:
                    game.game_id,

                eventName:
                    game.title ||
                    `${game.home_team || ""} VS ${game.away_team || ""}`,

                market:
                    `${market.marketName} - ${option.label}`,

                odds:
                    option.odds

            });

        }
    );


    return button;

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


    gameCard.dataset.gameId =
        game.game_id;


    gameCard.dataset.sport =
        sport;


    gameCard.dataset.status =
        status;


    // ==========================================
    // MAIN MARKET
    // ==========================================

    const primaryMarket =
        getPrimarySportsMarket(
            game
        );


    // ==========================================
    // CARD HTML
    // ==========================================

    gameCard.innerHTML = `

        <div class="sports-game-card-main">

            <div class="sports-game-card-title-row">

                <div class="sports-game-card-title">

                    ${escapeSportsHtml(
                        game.title
                    )}

                </div>


                ${
                    status === "live"
                        ? `
                            <div class="sports-game-live-indicator">

                                <span class="live-dot"></span>

                                LIVE

                            </div>
                          `
                        : ""
                }

            </div>


            <div class="sports-game-card-teams">

                <div
                    class="sports-game-team sports-game-team-home"
                    data-open-game="true"
                >

                    ${escapeSportsHtml(
                        game.home_team
                    )}

                </div>


                <div class="sports-game-vs">

                    VS

                </div>


                <div
                    class="sports-game-team sports-game-team-away"
                    data-open-game="true"
                >

                    ${escapeSportsHtml(
                        game.away_team
                    )}

                </div>

            </div>


            ${
                primaryMarket
                    ? `
                        <div class="sports-primary-market">

                            <div class="sports-primary-market-title">

                                ${escapeSportsHtml(
                                    primaryMarket.marketName
                                )}

                            </div>

                            <div class="sports-primary-odds-row"></div>

                        </div>
                      `
                    : `
                        <div class="sports-primary-market-empty">

                            No odds available

                        </div>
                      `
            }

        </div>


        <div class="sports-game-serial">

            #${index + 1}

        </div>

    `;


    // ==========================================
    // OPEN FULL GAME VIEW
    // ==========================================

    gameCard
        .querySelectorAll(
            "[data-open-game='true']"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        console.log(
                            "🏆 Opening Sports Game:",
                            {
                                sport,
                                gameId:
                                    game.game_id,
                                status
                            }
                        );


                        openSportsGame(
                            sport,
                            game.game_id
                        );

                    }
                );

            }
        );


    // ==========================================
    // RENDER PRIMARY ODDS
    // ==========================================

    if (
        primaryMarket
    ) {

        const oddsRow =
            gameCard.querySelector(
                ".sports-primary-odds-row"
            );


        if (oddsRow) {

            primaryMarket.options
                .forEach(
                    option => {

                        const button =
                            createSportsPrimaryMarketOption(
                                game,
                                primaryMarket,
                                option
                            );


                        oddsRow.appendChild(
                            button
                        );

                    }
                );

        }

    }


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
        normalizeSportsSport(
            sport
        );


    const normalizedStatus =
        normalizeSportsStatus(
            status
        );


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


    container.innerHTML =
        "";


    const games =
        getSportsGamesByStatus(
            normalizedSport,
            normalizedStatus
        );


    console.log(
        `🎯 ${normalizedSport.toUpperCase()} ${normalizedStatus.toUpperCase()} GAMES:`,
        games
    );


    if (
        games.length ===
        0
    ) {

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
        // WAIT FOR DATA
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
        // GET GAME
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
        // PAGE ELEMENTS
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
        // HIDE SPORTS BANNER
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
        // HIDE SPORTS CATEGORY GRID
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
        // CREATE FULL GAME VIEW
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


        if (sportsSubSectionAlt) {

            sportsSubSectionAlt.style.display =
                "none";

        }


        if (trendingPage) {

            trendingPage.style.display =
                "none";

        }


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
        // SHOW FULL GAME PAGE
        // ==========================================

        gamePage.style.display =
            "block";


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

                ${escapeSportsHtml(
                    game.title
                )}

            </div>


            ${
                game.league
                    ? `
                        <div class="sports-game-league">

                            ${escapeSportsHtml(
                                game.league
                            )}

                        </div>
                      `
                    : ""
            }

        </div>


        <!-- ==================================
             SPORT MATCH HERO
        ================================== -->

        <div class="sports-game-hero">

            <div class="sports-game-animation">

                <div class="sports-animation-live">

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


                <div class="sports-animation-icon">

                    ${icon}

                </div>


                <div class="sports-animation-title">

                    ${escapeSportsHtml(
                        game.home_team
                    )}

                    <span class="sports-animation-vs">

                        VS

                    </span>

                    ${escapeSportsHtml(
                        game.away_team
                    )}

                </div>


                <div class="sports-animation-subtitle">

                    ${escapeSportsHtml(
                        sportName
                    )}
                    Match Centre

                </div>

            </div>

        </div>


        <!-- ==================================
             SPORT-SPECIFIC INFORMATION
        ================================== -->

        ${createSportsSpecificGameInfo(
            game
        )}


        <!-- ==================================
             BETTING SECTION
        ================================== -->

        <div class="sports-betting-box">

            <div class="sports-betting-title">

                Match Betting

            </div>


            <div id="sports-full-game-markets">

                ${renderSportsMarkets(
                    game
                )}

            </div>

        </div>

    `;

}


// ==========================================
// SPORT-SPECIFIC GAME INFORMATION
// ==========================================

function createSportsSpecificGameInfo(
    game
) {

    const sport =
        normalizeSportsSport(
            game.sport
        );


    const homeTeam =
        game.home_team ||
        "";


    const awayTeam =
        game.away_team ||
        "";


    if (
        sport === "cricket"
    ) {

        return `

            <div class="sports-specific-info cricket-game-info">

                <div class="sports-specific-info-title">

                    Cricket

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "football"
    ) {

        return `

            <div class="sports-specific-info football-game-info">

                <div class="sports-specific-info-title">

                    Football

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "basketball"
    ) {

        return `

            <div class="sports-specific-info basketball-game-info">

                <div class="sports-specific-info-title">

                    Basketball

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "tennis"
    ) {

        return `

            <div class="sports-specific-info tennis-game-info">

                <div class="sports-specific-info-title">

                    Tennis

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "volleyball"
    ) {

        return `

            <div class="sports-specific-info volleyball-game-info">

                <div class="sports-specific-info-title">

                    Volleyball

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "boxing"
    ) {

        return `

            <div class="sports-specific-info boxing-game-info">

                <div class="sports-specific-info-title">

                    Boxing

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "hockey"
    ) {

        return `

            <div class="sports-specific-info hockey-game-info">

                <div class="sports-specific-info-title">

                    Hockey

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "rugby"
    ) {

        return `

            <div class="sports-specific-info rugby-game-info">

                <div class="sports-specific-info-title">

                    Rugby

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    if (
        sport === "golf"
    ) {

        return `

            <div class="sports-specific-info golf-game-info">

                <div class="sports-specific-info-title">

                    Golf

                </div>

                <div class="sports-specific-teams">

                    <span>
                        ${escapeSportsHtml(homeTeam)}
                    </span>

                    <strong>
                        VS
                    </strong>

                    <span>
                        ${escapeSportsHtml(awayTeam)}
                    </span>

                </div>

            </div>

        `;

    }


    return "";

}


// ==========================================
// RENDER SPORTS MARKETS
// ==========================================

function renderSportsMarkets(
    game
) {

    const markets =
        getSportsMarkets(
            game
        );


    if (
        markets.length ===
        0
    ) {

        return `

            <div class="sports-market-empty">

                <div class="sports-market-empty-title">

                    Markets

                </div>


                <div class="sports-market-empty-text">

                    No markets available

                </div>

            </div>

        `;

    }


    let html = "";


    markets.forEach(
        market => {

            html += `

                <div class="sports-market">

                    <div class="sports-market-title">

                        ${escapeSportsHtml(
                            market.marketName
                        )}

                    </div>


                    <div class="sports-bet-options">

            `;


            market.options.forEach(
                option => {

                    const odds =
                        formatSportsOdds(
                            option.odds
                        );


                    html += `

                        <button
                            type="button"
                            class="sports-bet-option"
                            data-sports-market="${escapeSportsAttribute(market.marketName)}"
                            data-sports-selection="${escapeSportsAttribute(option.label)}"
                            data-sports-odds="${escapeSportsAttribute(option.odds)}"
                        >

                            <span>

                                ${escapeSportsHtml(
                                    option.label
                                )}

                            </span>


                            ${
                                odds
                                    ? `
                                        <strong>
                                            ${escapeSportsHtml(odds)}
                                        </strong>
                                      `
                                    : ""
                            }

                        </button>

                    `;

                }
            );


            html += `

                    </div>

                </div>

            `;

        }
    );


    return html;

}


// ==========================================
// ATTACH FULL GAME MARKET EVENTS
// ==========================================

function attachSportsFullGameMarketEvents(
    game
) {

    const container =
        document.getElementById(
            "sports-full-game-markets"
        );


    if (!container) {

        return;

    }


    container
        .querySelectorAll(
            ".sports-bet-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const market =
                            button.dataset
                                .sportsMarket ||
                            "";


                        const selection =
                            button.dataset
                                .sportsSelection ||
                            "";


                        const odds =
                            button.dataset
                                .sportsOdds;


                        if (
                            odds ===
                                "" ||
                            odds ===
                                "null" ||
                            odds ===
                                "undefined"
                        ) {

                            showToast(
                                "Odds are not available.",
                                "error"
                            );

                            return;

                        }


                        addToBetSlip({

                            eventId:
                                game.game_id,

                            eventName:
                                game.title ||
                                `${game.home_team || ""} VS ${game.away_team || ""}`,

                            market:
                                `${market} - ${selection}`,

                            odds:
                                odds

                        });

                    }
                );

            }
        );

}


// ==========================================
// PATCH FULL GAME VIEW AFTER OPEN
// ==========================================

function initializeSportsFullGameView(
    game
) {

    attachSportsFullGameMarketEvents(
        game
    );

}


// ==========================================
// BACK FROM SPORTS GAME
// ==========================================

function backFromSportsGame() {

    const gamePage =
        document.getElementById(
            "sports-game-page"
        );


    if (gamePage) {

        gamePage.style.display =
            "none";

    }


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


    const sportsSubBanner =
        document.getElementById(
            "sportsSubBanner"
        );


    if (sportsSubBanner) {

        sportsSubBanner.style.display =
            "block";

    }


    const sportsHeader =
        document.querySelector(
            ".subcat-header-row"
        );


    if (sportsHeader) {

        sportsHeader.style.display =
            "flex";

    }


    const sportsGrid =
        document.getElementById(
            "sportsSubcatGrid"
        );


    if (sportsGrid) {

        sportsGrid.style.display =
            "grid";

    }


    const trending =
        document.getElementById(
            "sports-trending-page"
        );


    if (trending) {

        trending.style.display =
            "block";

    }


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


window.createSportsGameCard =
    createSportsGameCard;


window.createSportsGamePageHtml =
    createSportsGamePageHtml;


window.renderSportsMarkets =
    renderSportsMarkets;


window.getSportsMarkets =
    getSportsMarkets;


// ==========================================
// SPORTS DATA LOADER
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
                                ] =
                                    newGame;

                            }

                        }


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
                                ] =
                                    updatedGame;

                            }

                        }


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


    let balance =
        0;


    if (
        typeof getCurrentBalance ===
        "function"
    ) {

        balance =
            getCurrentBalance() ||
            0;

    }


    balanceEl.textContent =
        "$" +
        Number(
            balance
        ).toFixed(2);

}


// ==========================================
// SPORTS BET SLIP SYSTEM
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

    if (!data) {

        return;

    }


    const eventId =
        data.eventId ||
        "";


    const eventName =
        data.eventName ||
        "Sports Event";


    const market =
        data.market ||
        "";


    const odds =
        parseFloat(
            data.odds
        );


    if (
        !eventId ||
        !market ||
        !Number.isFinite(
            odds
        )
    ) {

        showToast(
            "Invalid betting selection.",
            "error"
        );

        return;

    }


    const isDuplicate =
        betSlip.some(
            bet =>
                bet.eventId ===
                    eventId &&
                bet.market ===
                    market
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
            eventId,

        eventName:
            eventName,

        market:
            market,

        odds:
            odds,

        stake:
            0,

        addedAt:
            new Date()
                .toLocaleString(
                    "en-GB",
                    {
                        day:
                            "numeric",

                        month:
                            "short",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
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
                    eventGroups[
                        eid
                    ];


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
                                data-bet-id="${escapeSportsAttribute(bet.id)}"
                            >

                                <button
                                    class="remove-btn"
                                    type="button"
                                    data-remove-bet="${escapeSportsAttribute(bet.id)}"
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
                                                data-stake-bet="${escapeSportsAttribute(bet.id)}"
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


        attachBetSlipEvents();


        if (multiSection) {

            multiSection.style.display =
                "none";

        }

    } else {

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
                    eventGroups[
                        eid
                    ];


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
                                data-bet-id="${escapeSportsAttribute(bet.id)}"
                                style="
                                    position:relative;
                                    padding-top:14px;
                                "
                            >

                                <button
                                    class="remove-btn"
                                    type="button"
                                    data-remove-bet="${escapeSportsAttribute(bet.id)}"
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
                                            data-stake-bet="${escapeSportsAttribute(bet.id)}"
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


        attachBetSlipEvents();


        if (multiSection) {

            multiSection.style.display =
                "block";

        }


        calculateReturns();

    }


    updateTotalDisplay();

}


// ==========================================
// ATTACH BET SLIP EVENTS
// ==========================================

function attachBetSlipEvents() {

    document
        .querySelectorAll(
            "[data-remove-bet]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        removeSingleBet(
                            button.dataset
                                .removeBet
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-stake-bet]"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    function () {

                        updateStake(
                            input.dataset
                                .stakeBet,
                            input.value
                        );

                    }
                );

            }
        );

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


    const totalOdds =
        betSlip.reduce(
            (
                acc,
                bet
            ) =>
                acc *
                Number(
                    bet.odds
                ),
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
                    bet
                ) =>
                    sum +
                    (
                        bet.stake ||
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


    if (
        currentMode ===
        "single"
    ) {

        const emptyStake =
            betSlip.some(
                bet =>
                    !bet.stake ||
                    bet.stake <=
                        0
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
                    bet
                ) =>
                    sum +
                    bet.stake,
                0
            );

    } else {

        const eventIds =
            [
                ...new Set(
                    betSlip.map(
                        bet =>
                            bet.eventId
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


    let currentBalance =
        typeof getCurrentBalance ===
        "function"
            ? getCurrentBalance()
            : 0;


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


    const newBalance =
        currentBalance -
        totalStake;


    if (
        typeof setCurrentBalance ===
        "function"
    ) {

        setCurrentBalance(
            newBalance
        );

    }


    if (
        typeof updateBalanceUI ===
        "function"
    ) {

        updateBalanceUI();

    }


    updateSlipBalance();


    const singleOdds =
        betSlip.length
            ? Number(
                betSlip[0].odds
              )
            : 0;


    const totalOdds =
        getTotalOdds();


    const activeBet = {

        betId:
            "DG-" +
            Date.now(),

        match:
            currentMode ===
            "single"
                ? betSlip[0].eventName
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
                ? singleOdds
                : totalOdds,

        stake:
            totalStake,

        possibleWin:
            Number(
                (
                    totalStake *
                    (
                        currentMode ===
                        "single"
                            ? singleOdds
                            : totalOdds
                    )
                ).toFixed(2)
            ),

        cashOut:
            totalStake,

        currency:
            typeof walletManager !==
            "undefined"
                ? walletManager.currentCurrency
                : "USDT",

        status:
            "ACTIVE",

        placedTime:
            new Date()
                .toLocaleString()

    };


    if (
        typeof walletManager !==
            "undefined" &&
        Array.isArray(
            walletManager.activeBets
        )
    ) {

        walletManager.activeBets.push(
            activeBet
        );


        if (
            typeof saveWalletManager ===
            "function"
        ) {

            saveWalletManager();

        }

    }


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


    showToast(
        "Bet placed successfully!",
        "success"
    );


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
// INITIALIZE FULL GAME EVENTS
// ==========================================

function initializeCurrentSportsGameView() {

    const gamePage =
        document.getElementById(
            "sports-game-page"
        );


    if (
        !gamePage
    ) {

        return;

    }


    const gameId =
        gamePage.dataset.gameId;


    if (!gameId) {

        return;

    }


    const game =
        sportsGames[
            gameId
        ];


    if (game) {

        initializeSportsFullGameView(
            game
        );

    }

}


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
