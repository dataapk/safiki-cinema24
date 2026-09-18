// ==========================================
// SPORTS.JS
// SPORTS FULL GAME VIEW
// COMMON SPORTS RENDERING SYSTEM
// =========================================

console.log("🚀 SPORTS.JS STARTED");


// ==========================================
// SPORTS GAME DATA CACHE
// ==========================================

let sportsGames = {};
let sportsGamesLoaded = false;

// ======================================================
// CRICKET API DATA
// ======================================================

let cricketApiGames = [];


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

// এই ফাংশনটি Sport ও Status অনুযায়ী Main UI-এর সঠিক Game Container খুঁজে বের করে।
// অর্থাৎ Cricket/Football এবং Live/Upcoming/Featured অনুযায়ী যেখানে Game Card দেখাবে, সেই Container নির্ধারণ করে।

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
// CRICKET API TEST
// ==========================================

async function testCricketApiConnection() {

    console.log("🔄 Testing Vercel Cricket API...");

    try {

        const response =
            await fetch(
                "https://safiki-cinema24.vercel.app/api/cricket"
            );

        console.log(
            "🌐 HTTP STATUS:",
            response.status
        );

        console.log(
            "🌐 RESPONSE OK:",
            response.ok
        );

        const rawText =
            await response.text();

        console.log(
            "📦 RAW API RESPONSE:",
            rawText
        );

        let result;

        try {

            result =
                JSON.parse(rawText);

        } catch (jsonError) {

            console.error(
                "❌ Response is NOT valid JSON:",
                jsonError
            );

            return false;
        }

        console.log(
            "🏏 PARSED CRICKET API RESPONSE:",
            result
        );

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "❌ Cricket API test failed."
            );

            return false;
        }

        console.log(
            "✅ Cricket API connection successful!"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Cricket API request error:",
            error
        );

        return false;
    }
}



// ======================================================
// LOAD CRICKET API DATA
// ======================================================

async function loadCricketApiGames() {

    console.log(
        "🏏 Loading Cricket API data..."
    );

    try {

        const response =
            await fetch(
                "https://safiki-cinema24.vercel.app/api/cricket"
            );

        if (!response.ok) {

            console.error(
                "❌ Cricket API HTTP error:",
                response.status
            );

            return false;
        }

        const result =
            await response.json();

        if (
            !result ||
            !result.success ||
            !result.data
        ) {

            console.error(
                "❌ Invalid Cricket API response:",
                result
            );

            return false;
        }

        const apiData =
            result.data;

        cricketApiGames =
            Array.isArray(apiData.data)
                ? apiData.data
                : [];

        console.log(
            "🏏 Cricket API games loaded:",
            cricketApiGames.length
        );

        console.log(
            "🏏 Cricket API games:",
            cricketApiGames
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Failed to load Cricket API games:",
            error
        );

        return false;
    }
}

// ======================================================
// START SPORTS API SYSTEM
// ======================================================

async function startSportsApiSystem() {

    console.log(
        "🏏 Starting Cricket API system..."
    );

    const loaded =
        await loadCricketApiGames();

    if (loaded) {

        renderAllSportsGames();

    }

    startCricketApiAutoRefresh();

}


// ======================================================
// GLOBAL SPORTS API SYSTEM
// ======================================================

window.startSportsApiSystem =
    startSportsApiSystem;

// ======================================================
// GET LIVE CRICKET API GAMES
// ======================================================

function getLiveCricketApiGames() {

    const liveGames =
        cricketApiGames.filter(game => {

            return (
                game &&
                game.matchStarted === true &&
                game.matchEnded === false
            );

        });

    console.log(
        "🏏 LIVE CRICKET API GAMES:",
        liveGames.length
    );

    console.log(
        "🏏 LIVE CRICKET MATCHES:",
        liveGames
    );

    return liveGames;
}

// ======================================================
// RENDER CRICKET API GAMES
// ======================================================

function renderCricketApiGames() {

    console.log(
        "🏏 Rendering Cricket API games..."
    );

    if (
        !Array.isArray(cricketApiGames) ||
        cricketApiGames.length === 0
    ) {

        console.warn(
            "⚠️ No Cricket API games available."
        );

        return;
    }


    // ==========================================
    // GET CRICKET LIVE CONTAINER
    // ==========================================

    const container =
        getSportsGamesContainer(
            "cricket",
            "live"
        );


    if (!container) {

        console.error(
            "❌ Cricket Live container not found."
        );

        return;
    }


    // ==========================================
    // CLEAR ONLY API RENDERED GAMES
    // ==========================================

    container
        .querySelectorAll(
            ".cricket-api-game-card"
        )
        .forEach(card => {
            card.remove();
        });


    // ==========================================
    // CREATE API GAME CARDS
    // ==========================================

    cricketApiGames.forEach(
        (game, index) => {

            const card =
                createCricketApiGameCard(
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
        `🏏 ${cricketApiGames.length} Cricket API game(s) rendered.`
    );
}

// ======================================================
// ODDS API GAMES
// ======================================================

let oddsApiGames = [];

async function loadOddsApiGames(
    sportKey = "cricket_caribbean_premier_league"
) {

    console.log(
        "🎯 Loading Odds API games..."
    );

    try {

        const response =
            await fetch(
                "https://safiki-cinema24.vercel.app/api/odds" +
                "?sport=" +
                encodeURIComponent(
                    sportKey
                ) +
                "&markets=" +
                encodeURIComponent(
                    "h2h,spreads,totals"
                ) +
                "&oddsFormat=decimal"
            );

        if (!response.ok) {

            console.error(
                "❌ Odds API HTTP error:",
                response.status
            );

            oddsApiGames = [];

            return false;
        }

        const result =
            await response.json();

        if (
            !result ||
            !result.success ||
            !Array.isArray(
                result.data
            )
        ) {

            console.error(
                "❌ Invalid Odds API response:",
                result
            );

            oddsApiGames = [];

            return false;
        }

        oddsApiGames =
            result.data;

        console.log(
            "🎯 Odds API games loaded:",
            oddsApiGames.length
        );

        console.log(
            "🎯 Odds API games:",
            oddsApiGames
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Failed to load Odds API games:",
            error
        );

        oddsApiGames = [];

        return false;
    }
}

// ======================================================
// FIND ODDS API GAME FOR SPORTS GAME
// ======================================================

function findOddsApiGameForSportsGame(
    game
) {

    if (!game) {
        return null;
    }

    if (
        !Array.isArray(
            oddsApiGames
        ) ||
        oddsApiGames.length === 0
    ) {
        return null;
    }

    const homeTeam =
        String(
            game.home_team || ""
        )
        .trim()
        .toLowerCase();

    const awayTeam =
        String(
            game.away_team || ""
        )
        .trim()
        .toLowerCase();

    if (
        !homeTeam ||
        !awayTeam
    ) {
        return null;
    }

    const matchedGame =
        oddsApiGames.find(
            apiGame => {

                const apiHome =
                    String(
                        apiGame.home_team || ""
                    )
                    .trim()
                    .toLowerCase();

                const apiAway =
                    String(
                        apiGame.away_team || ""
                    )
                    .trim()
                    .toLowerCase();

                return (
                    apiHome === homeTeam &&
                    apiAway === awayTeam
                );
            }
        );

    return (
        matchedGame ||
        null
    );
}

// ======================================================
// LOAD MASTER MARKET CONFIGURATION
// ======================================================

let sportsMasterMarketsCache = {};

async function loadSportsMasterMarketsForGame(
    game
) {

    sportsMasterMarketsCache = {};

    if (
        !window.supabaseClient
    ) {

        console.warn(
            "⚠️ Supabase connection unavailable for master markets."
        );

        return {};
    }

    const sport =
        String(
            game?.sport || "cricket"
        )
        .trim()
        .toLowerCase();

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from(
                "sports_markets"
            )
            .select(
                "market_key, market_name, enabled, display_order"
            )
            .eq(
                "sport",
                sport
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            );

    if (error) {

        console.error(
            "❌ Failed to load master markets:",
            error
        );

        return {};
    }

    if (
        !Array.isArray(data)
    ) {
        return {};
    }

    data.forEach(
        market => {

            const key =
                String(
                    market.market_key || ""
                )
                .trim()
                .toLowerCase();

            if (!key) {
                return;
            }

            sportsMasterMarketsCache[
                key
            ] = {
                market_key:
                    key,

                market_name:
                    String(
                        market.market_name || key
                    ),

                enabled:
                    market.enabled !== false,

                display_order:
                    Number(
                        market.display_order || 0
                    )
            };
        }
    );

    return (
        sportsMasterMarketsCache
    );
}

// ======================================================
// COLLECT MATCHING ODDS MARKETS
// ======================================================

function getMatchingOddsMarkets(
    game
) {

    const apiGame =
        findOddsApiGameForSportsGame(
            game
        );

    if (!apiGame) {

        console.log(
            "ℹ️ No Odds API match found:",
            game?.game_id
        );

        return [];
    }

    const enabledMarkets =
        game.enabled_markets &&
        typeof game.enabled_markets === "object"
            ? game.enabled_markets
            : {};

    const marketMap = {};

    const bookmakers =
        Array.isArray(
            apiGame.bookmakers
        )
            ? apiGame.bookmakers
            : [];

    bookmakers.forEach(
        bookmaker => {

            const markets =
                Array.isArray(
                    bookmaker.markets
                )
                    ? bookmaker.markets
                    : [];

            markets.forEach(
                providerMarket => {

                    const providerKey =
                        normalizeOddsMarketKey(
                            providerMarket.key
                        );

                    const masterKey =
                        mapOddsMarketToMasterMarket(
                            providerKey
                        );

                    if (!masterKey) {
                        return;
                    }

                    const masterMarket =
                        sportsMasterMarketsCache[
                            masterKey
                        ];

                    if (!masterMarket) {
                        return;
                    }

                    if (
                        masterMarket.enabled !== true
                    ) {
                        return;
                    }

                    if (
                        enabledMarkets[
                            masterKey
                        ] !== true
                    ) {
                        return;
                    }

                    const outcomes =
                        Array.isArray(
                            providerMarket.outcomes
                        )
                            ? providerMarket.outcomes
                            : [];

                    if (
                        outcomes.length === 0
                    ) {
                        return;
                    }

                    if (
                        !marketMap[
                            masterKey
                        ]
                    ) {

                        marketMap[
                            masterKey
                        ] = {

                            market_key:
                                masterKey,

                            market_name:
                                masterMarket.market_name,

                            display_order:
                                masterMarket.display_order,

                            outcomes: [],

                            bookmakers: []
                        };
                    }

                    outcomes.forEach(
                        outcome => {

                            marketMap[
                                masterKey
                            ]
                            .outcomes
                            .push({

                                name:
                                    outcome.name,

                                price:
                                    outcome.price,

                                point:
                                    outcome.point ??
                                    null,

                                description:
                                    outcome.description ??
                                    null,

                                bookmaker:
                                    bookmaker.title ||
                                    bookmaker.key

                            });
                        }
                    );

                    if (
                        !marketMap[
                            masterKey
                        ]
                        .bookmakers
                        .includes(
                            bookmaker.title ||
                            bookmaker.key
                        )
                    ) {

                        marketMap[
                            masterKey
                        ]
                        .bookmakers
                        .push(
                            bookmaker.title ||
                            bookmaker.key
                        );
                    }

                }
            );
        }
    );

    return Object.values(
        marketMap
    )
    .sort(
        (
            a,
            b
        ) =>
            a.display_order -
            b.display_order
    );
}

// ======================================================
// GET MATCH WINNER ODDS FOR SPORTS GAME CARD
// ======================================================

function getSportsCardMatchWinnerHtml(
    game
) {

    const matchingMarkets =
        getMatchingOddsMarkets(
            game
        );

    const matchWinnerMarket =
        matchingMarkets.find(
            market =>
                market.market_key === "h2h"
        );

    if (
        !matchWinnerMarket ||
        !Array.isArray(
            matchWinnerMarket.outcomes
        )
    ) {
        return "";
    }

    const outcomes =
        matchWinnerMarket.outcomes
            .filter(
                outcome =>
                    outcome &&
                    outcome.name &&
                    outcome.price !== undefined &&
                    outcome.price !== null
            )
            .slice(
                0,
                2
            );

    if (
        outcomes.length < 2
    ) {
        return "";
    }

    return `
        <div class="sports-card-match-winner">

            <div class="sports-card-winner-team">

                <span class="sports-card-winner-name">
                    ${escapeSportsHtml(
                        outcomes[0].name
                    )}
                </span>

                <span class="sports-card-winner-odds">
                    ${escapeSportsHtml(
                        String(
                            outcomes[0].price
                        )
                    )}
                </span>

            </div>


            <div class="sports-card-winner-team">

                <span class="sports-card-winner-name">
                    ${escapeSportsHtml(
                        outcomes[1].name
                    )}
                </span>

                <span class="sports-card-winner-odds">
                    ${escapeSportsHtml(
                        String(
                            outcomes[1].price
                        )
                    )}
                </span>

            </div>

        </div>
    `;
}




// ======================================================
// CRICKET API AUTO REFRESH
// ======================================================

let cricketApiRefreshTimer = null;


// ======================================================
// START CRICKET API AUTO REFRESH
// ======================================================

function startCricketApiAutoRefresh() {

    console.log(
        "🏏 Starting Cricket API auto refresh..."
    );


    // Prevent duplicate timers
    if (cricketApiRefreshTimer) {

        console.log(
            "⚠️ Cricket API auto refresh is already running."
        );

        return;
    }


    // Refresh every 20 minutes
    cricketApiRefreshTimer =
        setInterval(
            async function () {

                console.log(
                    "🔄 Refreshing Cricket API data..."
                );


                const loaded =
                    await loadCricketApiGames();


                if (loaded) {

                    renderCricketApiGames();

                }

            },
            20 * 60 * 1000
        );


    console.log(
        "✅ Cricket API auto refresh started."
    );
}


// ======================================================
// STOP CRICKET API AUTO REFRESH
// ======================================================

function stopCricketApiAutoRefresh() {

    if (!cricketApiRefreshTimer) {

        console.log(
            "⚠️ Cricket API auto refresh is not running."
        );

        return;
    }


    clearInterval(
        cricketApiRefreshTimer
    );


    cricketApiRefreshTimer =
        null;


    console.log(
        "🛑 Cricket API auto refresh stopped."
    );
}

// ======================================================
// CREATE CRICKET API GAME CARD
// ======================================================

function createCricketApiGameCard(
    game,
    index
) {

    const gameCard =
        document.createElement("div");

    gameCard.className =
        "cricket-api-game-card";


    // ==========================================
    // BASIC MATCH DATA
    // ==========================================

    const matchName =
        game.name ||
        "Cricket Match";

    const status =
        game.status ||
        "Status unavailable";

    const date =
        game.date ||
        "";

    const matchType =
        game.matchType ||
        "";

    const venue =
        game.venue ||
        "";


    // ==========================================
    // TEAMS
    // ==========================================

    const teams =
        Array.isArray(game.teams)
            ? game.teams
            : [];

    const homeTeam =
        teams[0] ||
        "Home";

    const awayTeam =
        teams[1] ||
        "Away";


    // ==========================================
    // SCORE
    // ==========================================

    const scores =
        Array.isArray(game.score)
            ? game.score
            : [];


    let scoreHtml = "";


    if (scores.length > 0) {

        scoreHtml = scores
            .map(score => {

                const inning =
                    score.inning ||
                    "";

                const runs =
                    score.r ??
                    "-";

                const wickets =
                    score.w ??
                    "-";

                const overs =
                    score.o ??
                    "-";


                return `

                    <div class="cricket-api-score-row">

                        <div class="cricket-api-score-inning">

                            ${escapeSportsHtml(inning)}

                        </div>


                        <div class="cricket-api-score-value">

                            ${runs}/${wickets}

                        </div>


                        <div class="cricket-api-score-overs">

                            (${overs} ov)

                        </div>

                    </div>

                `;

            })
            .join("");

    } else {

        scoreHtml = `

            <div class="cricket-api-no-score">

                Score not available

            </div>

        `;

    }


    // ==========================================
    // GAME CARD HTML
    // ==========================================

    gameCard.innerHTML = `

        <div class="sports-game-card-header">

            <div class="sports-game-status-label">

                API

            </div>


            <div class="sports-game-serial">

                #${index + 1}

            </div>

        </div>


        <div class="sports-game-card-title">

            ${escapeSportsHtml(matchName)}

        </div>


        <div class="sports-game-card-league">

            ${escapeSportsHtml(matchType)}

            ${
                date
                    ? ` • ${escapeSportsHtml(date)}`
                    : ""
            }

        </div>


        <div class="sports-game-card-teams">

            <div class="sports-game-team">

                ${escapeSportsHtml(homeTeam)}

            </div>


            <div class="sports-game-vs">

                VS

            </div>


            <div class="sports-game-team">

                ${escapeSportsHtml(awayTeam)}

            </div>

        </div>


        <div class="cricket-api-score-container">

            ${scoreHtml}

        </div>


        <div class="sports-game-card-league">

            ${escapeSportsHtml(status)}

        </div>


        ${
            venue
                ? `
                    <div class="sports-game-card-league">

                        ${escapeSportsHtml(venue)}

                    </div>
                  `
                : ""
        }

    `;


    return gameCard;
}

// ==========================================
// LOAD SPORTS GAMES
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

// ======================================================
// BUILD CRICKET API SCORE HTML
// ======================================================

function getCricketApiScoreHtml(game) {

    if (
        normalizeSportsSport(game.sport) !==
        "cricket"
    ) {
        return "";
    }

    const apiGame =
        findCricketApiMatchForSportsGame(
            game
        );

    if (!apiGame) {
        return "";
    }

    const scores =
        Array.isArray(apiGame.score)
            ? apiGame.score
            : [];

    if (scores.length === 0) {
        return "";
    }

    const scoreRows =
        scores
            .map(score => {

                const inning =
                    String(
                        score.inning || ""
                    );

                const runs =
                    score.r ??
                    "-";

                const wickets =
                    score.w ??
                    "-";

                const overs =
                    score.o ??
                    "-";

                return `
                    <div class="cricket-api-score-row">

                        <div class="cricket-api-score-team">
                            ${escapeSportsHtml(
                                inning.replace(
                                    /\s+Inning\s+\d+$/i,
                                    ""
                                )
                            )}
                        </div>

                        <div class="cricket-api-score-value">
                            ${runs}/${wickets}
                        </div>

                        <div class="cricket-api-score-overs">
                            (${overs} ov)
                        </div>

                    </div>
                `;
            })
            .join("");

    return `
        <div class="cricket-api-score-area">

            ${scoreRows}

            ${
                apiGame.status
                    ? `
                        <div class="cricket-api-match-status">
                            ${escapeSportsHtml(
                                apiGame.status
                            )}
                        </div>
                    `
                    : ""
            }

        </div>
    `;
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

    <!-- HOME TEAM -->
    <div class="sports-game-team"
         onclick="event.stopPropagation(); 
         openSportsGame('${escapeSportsHtml(game.sport)}', '${escapeSportsHtml(game.game_id)}')">

        ${getSportsTeamShortCode(game.home_team)}

    </div>


    <!-- HOME ODDS -->
    ${getSportsCardMatchWinnerHtml(
        game,
        "home"
    )}


    <!-- AWAY ODDS -->
    ${getSportsCardMatchWinnerHtml(
        game,
        "away"
    )}


    <!-- AWAY TEAM -->
    <div class="sports-game-team"
         onclick="event.stopPropagation();
         openSportsGame('${escapeSportsHtml(game.sport)}', '${escapeSportsHtml(game.game_id)}')">

        ${getSportsTeamShortCode(game.away_team)}

    </div>

</div>

${getCricketApiScoreHtml(game)}

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

// ======================================================
// FIND MATCHING CRICKET API GAME
// ======================================================

function findCricketApiMatchForSportsGame(
    game
) {

    // Only Cricket games
    if (
        normalizeSportsSport(game.sport) !==
        "cricket"
    ) {
        return null;
    }


    if (
        !Array.isArray(cricketApiGames) ||
        cricketApiGames.length === 0
    ) {
        return null;
    }


    const homeTeam =
        String(
            game.home_team || ""
        )
        .trim()
        .toLowerCase();


    const awayTeam =
        String(
            game.away_team || ""
        )
        .trim()
        .toLowerCase();


    if (
        !homeTeam ||
        !awayTeam
    ) {
        return null;
    }


    const matchedGame =
        cricketApiGames.find(
            apiGame => {

                const apiTeams =
                    Array.isArray(
                        apiGame.teams
                    )
                        ? apiGame.teams
                        : [];


                if (
                    apiTeams.length < 2
                ) {
                    return false;
                }


                const apiHome =
                    String(
                        apiTeams[0] || ""
                    )
                    .trim()
                    .toLowerCase();


                const apiAway =
                    String(
                        apiTeams[1] || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    apiHome === homeTeam &&
                    apiAway === awayTeam
                );

            }
        );


    return matchedGame || null;
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
        
        // ==========================================
// LOAD ODDS + MASTER MARKETS
// ==========================================

await loadOddsApiGames();

await loadSportsMasterMarketsForGame(
    game
);


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
// HIDE MAIN DASHBOARD FOR FOOTER GAME
// ==========================================

if (window.openedSportsGameFromFooter) {

    if (heroBanner) {

        heroBanner.style.display =
            "none";

    }

    if (mainCategorySection) {

        mainCategorySection.style.display =
            "none";

    }

    // Bet Slip show
    showSportsBetSlip();

    // Reset Footer flag
    window.openedSportsGameFromFooter = false;

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


    // ==========================================
    // CRICKET API SCORE
    // ==========================================

    let cricketScoreHtml = "";

    if (
        sport === "cricket"
    ) {

        const apiGame =
            findCricketApiMatchForSportsGame(
                game
            );

        if (apiGame) {

            const scores =
                Array.isArray(apiGame.score)
                    ? apiGame.score
                    : [];

            const scoreRows =
                scores
                    .slice(0, 2)
                    .map(score => {

                        const inning =
                            String(
                                score.inning || ""
                            )
                            .replace(
                                /\s+Inning\s+\d+$/i,
                                ""
                            );

                        const runs =
                            score.r ??
                            "-";

                        const wickets =
                            score.w ??
                            "-";

                        const overs =
                            score.o ??
                            "-";

                        return `
                            <div class="sports-full-score-row">

                                <div class="sports-full-score-team">

                                    ${escapeSportsHtml(
                                        inning
                                    )}

                                </div>


                                <div class="sports-full-score-number">

                                    ${runs}/${wickets}

                                </div>


                                <div class="sports-full-score-overs">

                                    ${overs} ov

                                </div>

                            </div>
                        `;

                    })
                    .join("");


            cricketScoreHtml = `

                <div class="sports-full-score-card">

                    <div class="sports-full-score-header">

                        <span>
                            SCORE
                        </span>

                    </div>


                    <div class="sports-full-score-list">

                        ${
                            scoreRows ||
                            `
                                <div class="sports-full-score-empty">
                                    Score not available
                                </div>
                            `
                        }

                    </div>


                    ${
                        apiGame.status
                            ? `
                                <div class="sports-full-match-result">

                                    ${escapeSportsHtml(
                                        apiGame.status
                                    )}

                                </div>
                            `
                            : ""
                    }

                </div>

            `;

        }

    }


    return `

        <!-- ==================================
             FULL GAME HEADER
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


            <div class="sports-game-league">

                ${escapeSportsHtml(
                    game.league
                )}

            </div>

        </div>


        <!-- ==================================
             GRAPHICS / VIDEO CARD
        ================================== -->

        <div class="sports-media-card">

            <div class="sports-media-controls">

                <button
                    type="button"
                    class="sports-media-control active"
                    onclick="
                        switchSportsMedia(
                            'graphics',
                            this
                        )
                    "
                >

                    <i class="fas fa-chart-line"></i>

                    <span>
                        Graphics
                    </span>

                </button>


                <button
                    type="button"
                    class="sports-media-control"
                    onclick="
                        switchSportsMedia(
                            'video',
                            this
                        )
                    "
                >

                    <i class="fas fa-video"></i>

                    <span>
                        Video
                    </span>

                </button>

            </div>


            <div
                class="sports-media-display"
                id="sportsMediaDisplay"
            >

                <div
                    class="sports-graphics-view"
                    id="sportsGraphicsView"
                >

                    <div class="sports-graphics-icon">

                        ${icon}

                    </div>


                    <div class="sports-graphics-pulse"></div>


                    <div class="sports-graphics-label">

                        LIVE GRAPHICS

                    </div>


                    <div class="sports-graphics-sport">

                        ${escapeSportsHtml(
                            sportName
                        )}

                    </div>

                </div>


                <div
                    class="sports-video-view"
                    id="sportsVideoView"
                    style="display:none;"
                >

                    <div class="sports-video-placeholder">

                        <i class="fas fa-video-slash"></i>

                        <span>
                            No video available
                        </span>

                    </div>

                </div>

            </div>

        </div>


        <!-- ==================================
             COMPACT SCORE CARD
        ================================== -->

        ${
            cricketScoreHtml
        }


        <!-- ==================================
             MATCH BETTING
        ================================== -->

        <div class="sports-betting-box">

            <div class="sports-betting-title">

                Match Betting

            </div>


            ${renderSportsMarkets(
                game
            )}

        </div>

    `;

}

// ==========================================
// SWITCH SPORTS MEDIA
// ==========================================

window.switchSportsMedia =
function (
    type,
    button
) {

    const graphics =
        document.getElementById(
            "sportsGraphicsView"
        );

    const video =
        document.getElementById(
            "sportsVideoView"
        );


    if (
        !graphics ||
        !video
    ) {
        return;
    }


    document
        .querySelectorAll(
            ".sports-media-control"
        )
        .forEach(
            control => {

                control.classList.remove(
                    "active"
                );

            }
        );


    if (
        type === "video"
    ) {

        graphics.style.display =
            "none";

        video.style.display =
            "flex";

    } else {

        video.style.display =
            "none";

        graphics.style.display =
            "flex";

    }


    if (button) {

        button.classList.add(
            "active"
        );

    }

};


// ======================================================
// RENDER SPORTS MARKETS
// ======================================================

function renderSportsMarkets(
    game
) {

    const matchingMarkets =
        getMatchingOddsMarkets(
            game
        );

    if (
        !Array.isArray(
            matchingMarkets
        ) ||
        matchingMarkets.length === 0
    ) {

        return `
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

    return matchingMarkets
        .map(
            market => {

                const outcomeHtml =
                    market.outcomes
                        .map(
                            outcome => {

                                const pointHtml =
                                    outcome.point !== null &&
                                    outcome.point !== undefined
                                        ? `
                                            <small>
                                                ${escapeSportsHtml(
                                                    String(
                                                        outcome.point
                                                    )
                                                )}
                                            </small>
                                        `
                                        : "";

                                return `
                                    <div
                                        class="sports-bet-option"
                                    >

                                        <span>
                                            ${escapeSportsHtml(
                                                outcome.name
                                            )}

                                            ${pointHtml}
                                        </span>

                                        <strong>
                                            ${escapeSportsHtml(
                                                String(
                                                    outcome.price
                                                )
                                            )}
                                        </strong>

                                    </div>
                                `;
                            }
                        )
                        .join("");

                return `
                    <div
                        class="sports-market"
                        data-market-key="${escapeSportsHtml(
                            market.market_key
                        )}"
                    >

                        <div
                            class="sports-market-title"
                        >
                            ${escapeSportsHtml(
                                market.market_name
                            )}
                        </div>

                        <div
                            class="sports-bet-options"
                        >

                            ${outcomeHtml}

                        </div>

                    </div>
                `;
            }
        )
        .join("");
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
