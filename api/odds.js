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
        "Content-Type"
    );


    if (req.method === "OPTIONS") {

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
            "https://api.the-odds-api.com/v4/sports" +
            "?apiKey=" +
            encodeURIComponent(
                apiKey
            ) +
            "&all=true";


        const response =
            await fetch(
                apiUrl,
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


    /*
    ============================================================
        FETCH ODDS FOR ONE SPORT KEY
    ============================================================
    */

    async function fetchSportOdds(
        apiKey,
        sportKey
    ) {

        const params =
            new URLSearchParams({

                apiKey:
                    apiKey,

                regions:
                    "uk,eu,au",

                markets:
                    "h2h",

                oddsFormat:
                    "decimal"

            });


        const apiUrl =
            "https://api.the-odds-api.com/v4/sports/" +
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
        FETCH SCORES FOR ONE SPORT KEY
    ============================================================
    */

    async function fetchSportScores(
        apiKey,
        sportKey
    ) {

        const apiUrl =
            "https://api.the-odds-api.com/v4/sports/" +
            encodeURIComponent(
                sportKey
            ) +
            "/scores" +
            "?apiKey=" +
            encodeURIComponent(
                apiKey
            ) +
            "&daysFrom=3";


        const response =
            await fetch(
                apiUrl,
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
        POST
        TEMPORARY API CHECK
    ============================================================
    */

    if (
        req.method === "POST"
    ) {

        /*
        --------------------------------------------------------
            ONLY THESE VALUES ARE ACCEPTED:
                apiKey
                sport

            NO TEAM TITLE
            NO MATCH TITLE
            NO SEARCH TEXT
        --------------------------------------------------------
        */

        const body =
            req.body || {};


        const temporaryApiKey =
            String(
                body.apiKey || ""
            ).trim();


        const selectedSport =
            String(
                body.sport || ""
            ).trim();


        /*
        --------------------------------------------------------
            API KEY REQUIRED
        --------------------------------------------------------
        */

        if (!temporaryApiKey) {

            return res
                .status(401)
                .json({
                    success: false,
                    code: "WRONG_API",
                    message: "Wrong API"
                });

        }


        /*
        --------------------------------------------------------
            SPORT CONTEXT REQUIRED
        --------------------------------------------------------
        */

        if (!selectedSport) {

            return res
                .status(400)
                .json({
                    success: false,
                    code: "SPORT_REQUIRED",
                    message:
                        "Sport context is required."
                });

        }


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
                INVALID API KEY
            ----------------------------------------------------
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
            ----------------------------------------------------
                OTHER PROVIDER ERROR
            ----------------------------------------------------
            */

            if (
                !sportsResult.response.ok
            ) {

                return res
                    .status(
                        sportsResult.response.status
                    )
                    .json({
                        success: false,
                        code: "WRONG_API",
                        message: "Wrong API"
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
                Query each matching provider sport key
            ----------------------------------------------------
            */

            for (
                const sportKey
                of matchingSportKeys
            ) {

                try {

                    const oddsResult =
                        await fetchSportOdds(
                            temporaryApiKey,
                            sportKey
                        );


                    /*
                    ------------------------------------------------
                        If this individual sport key fails,
                        skip it and continue.
                    ------------------------------------------------
                    */

                    if (
                        !oddsResult.response.ok
                    ) {

                        continue;

                    }


                    const games =
                        Array.isArray(
                            oddsResult.data
                        )
                            ? oddsResult.data
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

                    /*
                    ------------------------------------------------
                        Don't expose provider key or request data.
                    ------------------------------------------------
                    */

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
            ====================================================
                STEP 7
                FILTER + FORMAT EVENTS
            ====================================================
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


                            return {
                                id:
                                    String(
                                        game.id
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


            const params =
                new URLSearchParams({

                    apiKey:
                        apiKey,

                    regions:
                        regions,

                    markets:
                        markets,

                    oddsFormat:
                        oddsFormat

                });


            const apiUrl =
                "https://api.the-odds-api.com/v4/sports/" +
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
