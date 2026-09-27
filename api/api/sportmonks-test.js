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
        "GET, OPTIONS"
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

    if (req.method !== "GET") {

        return res
            .status(405)
            .json({
                success: false,
                error: "Method not allowed."
            });

    }


    /*
    ============================================================
        SPORTMONKS API TOKEN
        KEEP TOKEN IN VERCEL ENVIRONMENT VARIABLES
    ============================================================
    */

    const apiToken =
        process.env.SPORTMONKS_API_TOKEN;


    if (!apiToken) {

        return res
            .status(500)
            .json({
                success: false,
                error:
                    "SPORTMONKS_API_TOKEN is not configured."
            });

    }


    /*
    ============================================================
        DATE RANGE
        DEFAULT:
        TODAY → NEXT 7 DAYS
    ============================================================
    */

    function formatDate(date) {

        return date
            .toISOString()
            .slice(0, 10);

    }


    const today =
        new Date();


    const next7 =
        new Date();


    next7.setDate(
        next7.getDate() + 7
    );


    const fromDate =
        String(
            req.query?.from ||
            formatDate(today)
        );


    const toDate =
        String(
            req.query?.to ||
            formatDate(next7)
        );


    /*
    ============================================================
        SPORTMONKS FIXTURES REQUEST
    ============================================================
    */

    const include =
        [
            "localteam",
            "visitorteam",
            "league",
            "season",
            "odds"
        ].join(",");


    const params =
        new URLSearchParams({

            api_token:
                apiToken,

            "filter[starts_between]":
                `${fromDate},${toDate}`,

            include:
                include

        });


    const apiUrl =
        "https://cricket.sportmonks.com/api/v2.0/fixtures?" +
        params.toString();


    /*
    ============================================================
        FETCH SPORTMONKS
    ============================================================
    */

    try {

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


        /*
        ========================================================
            RETURN PROVIDER ERROR
        ========================================================
        */

        if (!response.ok) {

            return res
                .status(
                    response.status
                )
                .json({

                    success: false,

                    provider_status:
                        response.status,

                    error:
                        data ||
                        "SportMonks API request failed."

                });

        }


        /*
        ========================================================
            EXTRACT FIXTURES
        ========================================================
        */

        const fixtures =
            Array.isArray(
                data?.data
            )
                ? data.data
                : [];


        /*
        ========================================================
            FORMAT MATCH DATA
        ========================================================
        */

        const games =
            fixtures.map(
                fixture => {

                    const odds =
                        Array.isArray(
                            fixture?.odds
                        )
                            ? fixture.odds
                            : [];


                    return {

                        id:
                            fixture?.id ??
                            null,

                        name:
                            fixture?.name ||
                            "",

                        status:
                            fixture?.status ||
                            "",

                        live:
                            fixture?.live ??
                            false,

                        starting_at:
                            fixture?.starting_at ||
                            null,

                        league:
                            fixture?.league?.name ||
                            "",

                        season:
                            fixture?.season?.name ||
                            "",

                        home_team:
                            fixture?.localteam?.name ||
                            "",

                        away_team:
                            fixture?.visitorteam?.name ||
                            "",

                        odds_count:
                            odds.length,

                        odds:
                            odds

                    };

                }
            );


        /*
        ========================================================
            UNIQUE MARKET NAMES
        ========================================================
        */

        const marketNames =
            [
                ...new Set(

                    games
                        .flatMap(
                            game =>
                                Array.isArray(
                                    game.odds
                                )
                                    ? game.odds
                                    : []
                        )
                        .map(
                            odd =>
                                odd?.market?.name ||
                                odd?.name ||
                                odd?.label ||
                                ""
                        )
                        .filter(
                            Boolean
                        )

                )
            ];


        /*
        ========================================================
            FINAL RESPONSE
        ========================================================
        */

        return res
            .status(200)
            .json({

                success: true,

                provider:
                    "SportMonks",

                sport:
                    "cricket",

                date_range: {

                    from:
                        fromDate,

                    to:
                        toDate

                },

                total_games:
                    games.length,

                total_markets:
                    marketNames.length,

                market_names:
                    marketNames,

                games:
                    games

            });


    } catch (error) {

        console.error(
            "SportMonks relay error."
        );


        return res
            .status(500)
            .json({

                success: false,

                error:
                    "SportMonks relay request failed."

            });

    }

}
