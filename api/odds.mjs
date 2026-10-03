export default async function handler(req, res) {

/*
============================================================
    CORS
============================================================
*/

res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
);

res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
);

res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept"
);


/*
============================================================
    HANDLE PREFLIGHT
============================================================
*/

if (
    req.method === "OPTIONS"
) {

    return res
        .status(200)
        .end();

}


    /*
    ============================================================
        METHOD CHECK
    ============================================================
    */

    if (
        req.method !== "GET" &&
        req.method !== "POST"
    ) {

        return res
            .status(405)
            .json({
                success: false,
                error: "Method not allowed."
            });

    }


    /*
    ============================================================
        HELPER
    ============================================================
    */

    function normalizeText(value) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase();

    }


    /*
    ============================================================
        SPORT FAMILY MATCHING
    ============================================================
    */

    function isSportKeyMatch(
        sportKey,
        selectedSport
    ) {

        const key =
            normalizeText(
                sportKey
            );

        const sport =
            normalizeText(
                selectedSport
            );


        if (!key || !sport) {
            return false;
        }


        /*
        --------------------------------------------------------
            CRICKET
        --------------------------------------------------------
        */

        if (sport === "cricket") {

            return key.startsWith(
                "cricket_"
            );

        }


        /*
        --------------------------------------------------------
            FOOTBALL / SOCCER
        --------------------------------------------------------
        */

        if (
            sport === "football" ||
            sport === "soccer"
        ) {

            return (
                key.startsWith(
                    "soccer_"
                ) ||
                key.startsWith(
                    "football_"
                )
            );

        }


        /*
        --------------------------------------------------------
            BASKETBALL
        --------------------------------------------------------
        */

        if (
            sport === "basketball"
        ) {

            return key.startsWith(
                "basketball_"
            );

        }


        /*
        --------------------------------------------------------
            TENNIS
        --------------------------------------------------------
        */

        if (
            sport === "tennis"
        ) {

            return key.startsWith(
                "tennis_"
            );

        }


        /*
        --------------------------------------------------------
            ICE HOCKEY
        --------------------------------------------------------
        */

        if (
            sport === "hockey" ||
            sport === "ice_hockey"
        ) {

            return (
                key.startsWith(
                    "icehockey_"
                ) ||
                key.startsWith(
                    "hockey_"
                )
            );

        }


        /*
        --------------------------------------------------------
            BASEBALL
        --------------------------------------------------------
        */

        if (
            sport === "baseball"
        ) {

            return key.startsWith(
                "baseball_"
            );

        }


        /*
        --------------------------------------------------------
            AMERICAN FOOTBALL
        --------------------------------------------------------
        */

        if (
            sport === "american football" ||
            sport === "american_football" ||
            sport === "nfl"
        ) {

            return (
                key.startsWith(
                    "americanfootball_"
                ) ||
                key === "americanfootball_nfl"
            );

        }


        /*
        --------------------------------------------------------
            VOLLEYBALL
        --------------------------------------------------------
        */

        if (
            sport === "volleyball"
        ) {

            return key.startsWith(
                "volleyball_"
            );

        }


        /*
        --------------------------------------------------------
            RUGBY
        --------------------------------------------------------
        */

        if (
            sport === "rugby"
        ) {

            return (
                key.startsWith(
                    "rugby_"
                ) ||
                key.startsWith(
                    "rugbyunion_"
                )
            );

        }


        /*
        --------------------------------------------------------
            GENERIC FALLBACK
        --------------------------------------------------------
        */

        return key.startsWith(
            sport + "_"
        );

    }


    /*
    ============================================================
        DETERMINE EVENT STATUS
    ============================================================
    */

    function getEventStatus(
        event,
        scoreMap
    ) {

        const eventId =
            String(
                event.id || ""
            );


        const score =
            scoreMap[
                eventId
            ];


        /*
        --------------------------------------------------------
            IF SCORE DATA SAYS COMPLETED
        --------------------------------------------------------
        */

        if (score) {

            if (
                score.completed === true
            ) {

                return "completed";

            }

        }


        /*
        --------------------------------------------------------
            CHECK COMMENCE TIME
        --------------------------------------------------------
        */

        const commenceTime =
            event.commence_time
                ? new Date(
                    event.commence_time
                )
                : null;


        if (
            commenceTime &&
            !Number.isNaN(
                commenceTime.getTime()
            )
        ) {

            const now =
                new Date();


            /*
            ----------------------------------------------------
                GAME HAS STARTED
            ----------------------------------------------------
            */

            if (
                commenceTime <= now
            ) {

                /*
                ------------------------------------------------
                    If score information exists and game is
                    not completed, treat as LIVE.
                ------------------------------------------------
                */

                if (score) {

                    return "live";

                }


                /*
                ------------------------------------------------
                    If no score object exists, don't invent
                    a completed result.
                ------------------------------------------------
                */

                return "live";

            }

        }


        return "upcoming";

    }


    /*
    ============================================================
        BUILD SCORE MAP
    ============================================================
    */

    function createScoreMap(
        scores
    ) {

        const map = {};


        if (
            !Array.isArray(
                scores
            )
        ) {

            return map;

        }


        scores.forEach(
            score => {

                if (!score) {
                    return;
                }


                const id =
                    String(
                        score.id || ""
                    );


                if (!id) {
                    return;
                }


                map[id] =
                    score;

            }
        );


        return map;

    }


    /*
    ============================================================
        FETCH ODDS SPORTS LIST
    ============================================================
    */

async function fetchSportsList(
    apiKey
) {

    const apiUrl =
        "https://parlay-api.com/v1/sports";


    const response =
        await fetch(
            apiUrl,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json",

                    "X-API-Key":
                        apiKey,

                    "User-Agent":
                        "SportsWebsite/1.0"
                }
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    } catch (error) {

        data = null;

    }


    return {
        response,
        data
    };

}


    // ============================================================
// FETCH SPORTS MARKET CATALOG
// ============================================================

async function fetchSportsMarketCatalog(
    apiKey,
    sportKey
) {

    /*
    ========================================================
        VALIDATE SPORT KEY
    ========================================================
    */

    const normalizedSportKey =
        String(
            sportKey || ""
        )
        .trim();


    if (
        !normalizedSportKey
    ) {

        return {
            success: false,
            sportKey: "",
            markets: [],
            oddsMarketKeys: [],
            propsMarketKeys: [],
            error:
                "Sport key is required."
        };

    }


    /*
    ========================================================
        HELPER
        NORMALIZE ARRAY RESPONSE
    ========================================================
    */

    function normalizeArrayResponse(
        data
    ) {

        if (
            Array.isArray(
                data
            )
        ) {

            return data;

        }


        if (
            data &&
            Array.isArray(
                data.markets
            )
        ) {

            return data.markets;

        }


        if (
            data &&
            Array.isArray(
                data.data
            )
        ) {

            return data.data;

        }


        if (
            data &&
            Array.isArray(
                data.market_keys
            )
        ) {

            return data.market_keys;

        }


        if (
            data &&
            Array.isArray(
                data.keys
            )
        ) {

            return data.keys;

        }


        return [];

    }


    /*
    ========================================================
        FETCH GLOBAL MARKET CATALOG
        0 CREDITS
    ========================================================
    */

    let globalMarketsData =
        [];


    try {

        const globalResponse =
            await fetch(
                "https://parlay-api.com/v1/markets",
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json",

                        "User-Agent":
                            "SportsWebsite/1.0"
                    }
                }
            );


        if (
            globalResponse.ok
        ) {

            let responseData =
                null;


            try {

                responseData =
                    await globalResponse.json();

            } catch (
                error
            ) {

                responseData =
                    null;

            }


            globalMarketsData =
                normalizeArrayResponse(
                    responseData
                );

        }


    } catch (
        error
    ) {

        console.error(
            "❌ Failed to fetch global ParlayAPI market catalog."
        );

    }


    /*
    ========================================================
        FETCH SPORT PROP MARKET CATALOG
        0 CREDITS
    ========================================================
    */

    let sportPropMarkets =
        [];


    if (
        apiKey
    ) {

        try {

            const propsUrl =
                "https://parlay-api.com/v1/sports/" +
                encodeURIComponent(
                    normalizedSportKey
                ) +
                "/props/markets";


            const propsResponse =
                await fetch(
                    propsUrl,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json",

                            "X-API-Key":
                                apiKey,

                            "User-Agent":
                                "SportsWebsite/1.0"
                        }
                    }
                );


            if (
                propsResponse.ok
            ) {

                let propsData =
                    null;


                try {

                    propsData =
                        await propsResponse.json();

                } catch (
                    error
                ) {

                    propsData =
                        null;

                }


                sportPropMarkets =
                    normalizeArrayResponse(
                        propsData
                    );

            }


        } catch (
            error
        ) {

            console.error(
                "❌ Failed to fetch sport prop market catalog."
            );

        }

    }


    /*
    ========================================================
        BUILD CANONICAL MARKET MAP
    ========================================================
    */

    const marketMap =
        new Map();


    /*
    --------------------------------------------------------
        GLOBAL MARKET CATALOG
    --------------------------------------------------------
    */

    globalMarketsData.forEach(
        market => {

            let marketKey = "";
            let servedBy = [];


            /*
            ------------------------------------------------
                STRING MARKET KEY
            ------------------------------------------------
            */

            if (
                typeof market ===
                    "string"
            ) {

                marketKey =
                    String(
                        market
                    )
                    .trim();

            }


            /*
            ------------------------------------------------
                OBJECT MARKET
            ------------------------------------------------
            */

            else if (
                market &&
                typeof market ===
                    "object"
            ) {

                marketKey =
                    String(
                        market.market_key ||
                        market.key ||
                        market.name ||
                        ""
                    )
                    .trim();


                const rawServedBy =
                    market.served_by;


                if (
                    Array.isArray(
                        rawServedBy
                    )
                ) {

                    servedBy =
                        rawServedBy
                            .map(
                                value =>
                                    String(
                                        value || ""
                                    )
                                    .trim()
                            )
                            .filter(
                                Boolean
                            );

                }
                else if (
                    rawServedBy
                ) {

                    servedBy =
                        String(
                            rawServedBy
                        )
                        .split(",")
                        .map(
                            value =>
                                value.trim()
                        )
                        .filter(
                            Boolean
                        );

                }

            }


            if (
                !marketKey
            ) {

                return;

            }


            marketMap.set(
                marketKey,
                {
                    market_key:
                        marketKey,

                    served_by:
                        servedBy,

                    source:
                        "global_catalog"
                }
            );

        }
    );


    /*
    --------------------------------------------------------
        SPORT PROP MARKETS
    --------------------------------------------------------
    */

    sportPropMarkets.forEach(
        market => {

            let marketKey = "";


            if (
                typeof market ===
                    "string"
            ) {

                marketKey =
                    String(
                        market
                    )
                    .trim();

            }
            else if (
                market &&
                typeof market ===
                    "object"
            ) {

                marketKey =
                    String(
                        market.market_key ||
                        market.key ||
                        market.name ||
                        ""
                    )
                    .trim();

            }


            if (
                !marketKey
            ) {

                return;

            }


            const existing =
                marketMap.get(
                    marketKey
                );


            if (
                existing
            ) {

                const servedBy =
                    Array.isArray(
                        existing.served_by
                    )
                        ? [
                            ...existing.served_by
                        ]
                        : [];


                if (
                    !servedBy.includes(
                        "props"
                    )
                ) {

                    servedBy.push(
                        "props"
                    );

                }


                existing.served_by =
                    servedBy;


                existing.source =
                    "global_catalog+props";

            }
            else {

                marketMap.set(
                    marketKey,
                    {
                        market_key:
                            marketKey,

                        served_by: [
                            "props"
                        ],

                        source:
                            "sport_props_catalog"
                    }
                );

            }

        }
    );


    /*
    ========================================================
        CONVERT MAP TO ARRAY
    ========================================================
    */

    const markets =
        Array.from(
            marketMap.values()
        );


    /*
    ========================================================
        CLASSIFY ENDPOINTS
    ========================================================
    */

    const oddsMarketKeys = [];
    const propsMarketKeys = [];


    markets.forEach(
        market => {

            const servedBy =
                Array.isArray(
                    market.served_by
                )
                    ? market.served_by
                    : [];


            const key =
                String(
                    market.market_key ||
                    ""
                )
                .trim();


            if (
                !key
            ) {

                return;

            }


            /*
            ------------------------------------------------
                PARLAY ODDS SERVED MARKET
            ------------------------------------------------
            */

            const isOddsMarket =
                servedBy.some(
                    endpoint =>
                        String(
                            endpoint
                        )
                        .toLowerCase()
                        .includes(
                            "odds"
                        )
                );


            /*
            ------------------------------------------------
                PROP SERVED MARKET
            ------------------------------------------------
            */

            const isPropsMarket =
                servedBy.some(
                    endpoint =>
                        String(
                            endpoint
                        )
                        .toLowerCase()
                        .includes(
                            "prop"
                        )
                );


            if (
                isOddsMarket
            ) {

                oddsMarketKeys.push(
                    key
                );

            }


            if (
                isPropsMarket
            ) {

                propsMarketKeys.push(
                    key
                );

            }

        }
    );


    /*
    ========================================================
        RETURN DISCOVERY RESULT
    ========================================================
    */

    const uniqueOddsMarketKeys =
        [
            ...new Set(
                oddsMarketKeys
            )
        ];


    const uniquePropsMarketKeys =
        [
            ...new Set(
                propsMarketKeys
            )
        ];


    markets.sort(
        (
            a,
            b
        ) =>
            String(
                a.market_key
            )
            .localeCompare(
                String(
                    b.market_key
                )
            )
    );


    console.log(
        "✅ PARLAYAPI MARKET CATALOG DISCOVERED:",
        {
            sportKey:
                normalizedSportKey,

            totalMarkets:
                markets.length,

            oddsMarketCount:
                uniqueOddsMarketKeys.length,

            propsMarketCount:
                uniquePropsMarketKeys.length,

            markets:
                markets
        }
    );


    return {

        success:
            markets.length > 0,

        sportKey:
            normalizedSportKey,

        markets:
            markets,

        oddsMarketKeys:
            uniqueOddsMarketKeys,

        propsMarketKeys:
            uniquePropsMarketKeys

    };

}


// ======================================================
// END FETCH SPORTS MARKET CATALOG
// ======================================================


/*
============================================================
    FETCH EVENTS FOR ONE SPORT KEY
============================================================
*/

async function fetchSportEvents(
    apiKey,
    sportKey
) {

    const params =
        new URLSearchParams({

            dateFormat:
                "iso"

        });


    const apiUrl =
        "https://parlay-api.com/v1/sports/" +
        encodeURIComponent(
            sportKey
        ) +
        "/events?" +
        params.toString();


    const response =
        await fetch(
            apiUrl,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json",

                    "X-API-Key":
                        apiKey,

                    "User-Agent":
                        "SportsWebsite/1.0"
                }
            }
        );


    let data = [];


    try {

        data =
            await response.json();

    } catch (error) {

        data = [];

    }


    return {
        response,
        data
    };

}


/*
============================================================
    FETCH ODDS FOR ONE SPORT KEY + EVENT
============================================================
*/

async function fetchSportOdds(
    apiKey,
    sportKey,
    eventId,
    marketKeys
) {


    /*
    ========================================================
        NORMALIZE MARKET KEYS
    ========================================================
    */

    const normalizedMarketKeys =
        Array.isArray(
            marketKeys
        )
            ? [
                ...new Set(
                    marketKeys
                        .map(
                            market =>
                                String(
                                    market || ""
                                )
                                .trim()
                        )
                        .filter(
                            Boolean
                        )
                )
            ]
            : [];


    /*
    ========================================================
        BUILD REQUEST PARAMETERS
    ========================================================
    */

    const params =
        new URLSearchParams({

            regions:
                "us",

            oddsFormat:
                "decimal"

        });


    /*
    --------------------------------------------------------
        ADD DYNAMIC MARKET KEYS
    --------------------------------------------------------
    */

    if (
        normalizedMarketKeys.length > 0
    ) {

        params.set(
            "markets",
            normalizedMarketKeys.join(",")
        );

    }


    /*
    ========================================================
        ADD SPECIFIC PROVIDER EVENT ID
    ========================================================
    */

    if (
        eventId
    ) {

        params.set(
            "eventIds",
            String(
                eventId
            ).trim()
        );

    }


    /*
    ========================================================
        BUILD API URL
    ========================================================
    */

    const apiUrl =
        "https://parlay-api.com/v1/sports/" +
        encodeURIComponent(
            sportKey
        ) +
        "/odds?" +
        params.toString();


    console.log(
        "🎯 Parlay Odds URL:",
        apiUrl
    );


    /*
    ========================================================
        REQUEST
    ========================================================
    */

    const response =
        await fetch(
            apiUrl,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json",

                    "X-API-Key":
                        apiKey,

                    "User-Agent":
                        "SportsWebsite/1.0"
                }
            }
        );


    /*
    ========================================================
        READ RESPONSE
    ========================================================
    */

    let data = [];


    try {

        data =
            await response.json();

    } catch (error) {

        data = [];

    }


    /*
    ========================================================
        READ PARLAY MARKET HEADERS
    ========================================================
    */

    const marketsServed =
        String(
            response.headers.get(
                "x-markets-served"
            ) ||
            ""
        )
        .split(",")
        .map(
            value =>
                value.trim()
        )
        .filter(
            Boolean
        );


    const marketsUnservable =
        String(
            response.headers.get(
                "x-markets-unservable"
            ) ||
            ""
        )
        .split(",")
        .map(
            value =>
                value.trim()
        )
        .filter(
            Boolean
        );


    const marketsServedElsewhere =
        String(
            response.headers.get(
                "x-markets-served-elsewhere"
            ) ||
            ""
        )
        .trim();


    /*
    ========================================================
        RETURN COMPLETE RESULT
    ========================================================
    */

    return {

        response,

        data,

        marketsRequested:
            normalizedMarketKeys,

        marketsServed,

        marketsUnservable,

        marketsServedElsewhere

    };

}


// ======================================================
// END FETCH ODDS
// ======================================================


/*
============================================================
    POST
    SPORTS API CHECK
============================================================
*/

if (
    req.method === "POST"
) {

    try {

        /*
        ====================================================
            STEP 1
            VALIDATE TEMPORARY API KEY
        ====================================================
        */

    const sportsResult =
        await fetchSportsList(
            temporaryApiKey
        );


         /*
----------------------------------------------------
    PROVIDER RESPONSE DIAGNOSTIC
----------------------------------------------------
*/

if (
    !sportsResult.response.ok
) {

    console.error(
        "❌ PARLAY PROVIDER RESPONSE:",
        {
            status:
                sportsResult.response.status,

            statusText:
                sportsResult.response.statusText,

            data:
                sportsResult.data
        }
    );


    /*
    ------------------------------------------------
        INVALID API KEY / AUTH
    ------------------------------------------------
    */

    if (
        sportsResult.response.status === 401 ||
        sportsResult.response.status === 403
    ) {

        return res
            .status(401)
            .json({
                success: false,
                code: "WRONG_API",
                message: "Wrong API"
            });

    }


    /*
    ------------------------------------------------
        OTHER PROVIDER ERROR
    ------------------------------------------------
    */

    return res
        .status(
            sportsResult.response.status
        )
        .json({
            success: false,

            code:
                "PROVIDER_API_ERROR",

            message:
                "Provider API error.",

            provider_status:
                sportsResult.response.status,

            provider_error:
                sportsResult.data
        });

}




            /*
            ====================================================
                STEP 2
                MAKE SURE PROVIDER RETURNED SPORT DATA
            ====================================================
            */

            const providerSports =
                Array.isArray(
                    sportsResult.data
                )
                    ? sportsResult.data
                    : [];


            /*
            ====================================================
                STEP 3
                FIND ONLY CURRENT SPORT'S KEYS
            ====================================================
            */

            const matchingSportKeys =
                providerSports
                    .filter(
                        sportItem => {

                            if (
                                !sportItem
                            ) {

                                return false;

                            }


                            return isSportKeyMatch(
                                sportItem.key,
                                selectedSport
                            );

                        }
                    )
                    .map(
                        sportItem =>
                            String(
                                sportItem.key || ""
                            ).trim()
                    )
                    .filter(
                        key =>
                            Boolean(key)
                    );


            /*
            ----------------------------------------------------
                NO SPORT FOUND IN THIS API
            ----------------------------------------------------
            */

            if (
                matchingSportKeys.length === 0
            ) {

                return res
                    .status(200)
                    .json({
                        success: true,
                        code:
                            "NO_GAMES_AVAILABLE",
                        message:
                            "No Games Available",
                        sport:
                            selectedSport,
                        games: []
                    });

            }


         /*
====================================================
    STEP 4
    GET REAL EVENTS
====================================================
*/

const allGames = [];


/*
----------------------------------------------------
    QUERY EACH MATCHING PROVIDER SPORT KEY
----------------------------------------------------
*/

for (
    const sportKey
    of matchingSportKeys
) {

    try {

        const eventsResult =
            await fetchSportEvents(
                temporaryApiKey,
                sportKey
            );


        if (
            !eventsResult.response.ok
        ) {

            continue;

        }


        const games =
            Array.isArray(
                eventsResult.data
            )
                ? eventsResult.data
                : [];


        games.forEach(
            game => {

                if (
                    !game ||
                    !game.id
                ) {

                    return;

                }


                allGames.push({

                    ...game,

                    api_sport_key:
                        sportKey,

                    api_sport_title:
                        providerSports
                            .find(
                                item =>
                                    item.key ===
                                    sportKey
                            )
                            ?.title || ""

                });

            }
        );

    } catch (error) {

        continue;

    }

}
            /*
            ====================================================
                STEP 5
                REMOVE DUPLICATES
            ====================================================
            */

            const uniqueGamesMap =
                new Map();


            allGames.forEach(
                game => {

                    if (
                        !game ||
                        !game.id
                    ) {

                        return;

                    }


                    uniqueGamesMap.set(
                        String(
                            game.id
                        ),
                        game
                    );

                }
            );


            const uniqueGames =
                Array.from(
                    uniqueGamesMap.values()
                );


            /*
            ====================================================
                STEP 6
                GET SCORE DATA
            ====================================================
            */

            const scoreMap = {};


            for (
                const sportKey
                of matchingSportKeys
            ) {

                try {

                    const scoresResult =
                        await fetchSportScores(
                            temporaryApiKey,
                            sportKey
                        );


                    if (
                        !scoresResult.response.ok
                    ) {

                        continue;

                    }


                    const currentScoreMap =
                        createScoreMap(
                            scoresResult.data
                        );


                    Object.assign(
                        scoreMap,
                        currentScoreMap
                    );

                } catch (error) {

                    continue;

                }

            }


            /*
============================================================
    TEMPORARY H2H RESPONSE CHECK
    DO NOT CHANGE GAME LOGIC
============================================================
*/

uniqueGames.forEach(
    game => {

        console.log(
            "🔎 H2H RAW API GAME:",
            {
                gameId:
                    game?.id,

                homeTeam:
                    game?.home_team,

                awayTeam:
                    game?.away_team,

                bookmakers:
                    game?.bookmakers,

                markets:
                    game?.markets
            }
        );

    }
);


           /*
============================================================
    STEP 7
    FILTER + FORMAT EVENTS
============================================================
*/

const finalGames =
    uniqueGames
        .map(
            game => {

                const status =
                    getEventStatus(
                        game,
                        scoreMap
                    );


                /*
                ------------------------------------------------
                    PRESERVE FULL PROVIDER GAME RESPONSE
                ------------------------------------------------

                    Keep the complete original provider
                    object so that bookmakers, markets,
                    outcomes, prices, etc. are not removed.
                ------------------------------------------------
                */

                return {

                    ...game,

                    id:
                        String(
                            game.id || ""
                        ),

                    home_team:
                        game.home_team ||
                        "",

                    away_team:
                        game.away_team ||
                        "",

                    commence_time:
                        game.commence_time ||
                        null,

                    api_sport_key:
                        game.api_sport_key ||
                        "",

                    api_sport_title:
                        game.api_sport_title ||
                        "",

                    status:
                        status

                };

            }
        )
        .filter(
            game =>
                game.status !==
                "completed"
        );

            /*
            ====================================================
                STEP 8
                NO REAL EVENTS
            ====================================================
            */

            if (
                finalGames.length === 0
            ) {

                return res
                    .status(200)
                    .json({
                        success: true,
                        code:
                            "NO_GAMES_AVAILABLE",
                        message:
                            "No Games Available",
                        sport:
                            selectedSport,
                        games: []
                    });

            }


            /*
            ====================================================
                STEP 9
                SORT
                    LIVE FIRST
                    UPCOMING AFTER
            ====================================================
            */

            finalGames.sort(
                (
                    a,
                    b
                ) => {

                    const statusOrder = {
                        live: 0,
                        upcoming: 1
                    };


                    const statusDifference =
                        (
                            statusOrder[
                                a.status
                            ] ?? 2
                        ) -
                        (
                            statusOrder[
                                b.status
                            ] ?? 2
                        );


                    if (
                        statusDifference !== 0
                    ) {

                        return statusDifference;

                    }


                    const timeA =
                        a.commence_time
                            ? new Date(
                                a.commence_time
                            ).getTime()
                            : 0;


                    const timeB =
                        b.commence_time
                            ? new Date(
                                b.commence_time
                            ).getTime()
                            : 0;


                    return timeA - timeB;

                }
            );


            /*
            ====================================================
                SUCCESS
            ====================================================
            */

            return res
                .status(200)
                .json({

                    success: true,

                    code:
                        "GAMES_AVAILABLE",

                    message:
                        "Games Available",

                    sport:
                        selectedSport,

                    games:
                        finalGames

                });


        } catch (error) {

            /*
            ----------------------------------------------------
                NEVER RETURN API KEY
            ----------------------------------------------------
            */

            console.error(
                "Sports API check error."
            );


            return res
                .status(500)
                .json({
                    success: false,
                    code:
                        "API_CHECK_ERROR",
                    message:
                        "Wrong API"
                });

        }

    }


    /*
    ============================================================
        GET
        EXISTING PRODUCTION ODDS FLOW
    ============================================================
    */

    if (
        req.method === "GET"
    ) {

        try {

            const apiKey =
                process.env.ODDS_API_KEY;


            /*
            ----------------------------------------------------
                PRODUCTION API KEY MISSING
            ----------------------------------------------------
            */

            if (!apiKey) {

                return res
                    .status(500)
                    .json({
                        success: false,
                        error:
                            "ODDS_API_KEY is not configured."
                    });

            }


            /*
            ====================================================
                SPORTS LIST
            ====================================================
            */

            if (
                req.query?.sports ===
                "list"
            ) {

                const sportsResult =
                    await fetchSportsList(
                        apiKey
                    );


                return res
                    .status(
                        sportsResult.response.status
                    )
                    .json({

                        success:
                            sportsResult.response.ok,

                        data:
                            sportsResult.data

                    });

            }


            /*
            ====================================================
                SINGLE SPORT ODDS
            ====================================================
            */

            const sportKey =
                String(
                    req.query?.sport ||
                    "cricket_caribbean_premier_league"
                ).trim();


            if (!sportKey) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        error:
                            "Sport key is required."
                    });

            }


            const regions =
                String(
                    req.query?.regions ||
                    "uk,eu,au"
                ).trim();


            const markets =
                String(
                    req.query?.markets ||
                    "h2h"
                ).trim();


            const oddsFormat =
                String(
                    req.query?.oddsFormat ||
                    "decimal"
                ).trim();

            const eventIds =
    String(
        req.query?.eventIds ||
        ""
    ).trim();


            const params =
    new URLSearchParams({

        apiKey:
            apiKey,

        regions:
            regions,

        markets:
            markets,

        oddsFormat:
            oddsFormat,

        ...(eventIds
            ? {
                eventIds:
                    eventIds
            }
            : {})

    });


            const apiUrl =
    "https://parlay-api.com/v1/sports/" +
    encodeURIComponent(
        sportKey
    ) +
    "/odds?" +
    params.toString();

            const response =
    await fetch(
        apiUrl,
        {
            method: "GET",

            headers: {
                "Accept":
                    "application/json",

                "X-API-Key":
                    apiKey,

                "User-Agent":
                    "SportsWebsite/1.0"
            }
        }
    );


            let data = null;


            try {

                data =
                    await response.json();

            } catch (error) {

                data = null;

            }


            return res
                .status(
                    response.status
                )
                .json({

                    success:
                        response.ok,

                    sport:
                        sportKey,

                    data:
                        data

                });

        } catch (error) {

            console.error(
                "Odds API relay error."
            );


            return res
                .status(500)
                .json({
                    success: false,
                    error:
                        "Odds API relay error."
                });

        }

    }

}
