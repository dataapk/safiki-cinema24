export default async function handler(req, res) {

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
        return res.status(200).end();
    }


    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });
    }


    try {

        /*
        ==================================================
            SECRET API KEY

            ONLY VERCEL ENVIRONMENT VARIABLE
        ==================================================
        */

        const apiKey =
            process.env.ODDS_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "ODDS_API_KEY is not configured."
            });

        }


        /*
        ==================================================
            ADMIN REQUEST

            Example:

            /api/odds?check=1&sport=cricket
        ==================================================
        */

        const check =
            String(
                req.query?.check || ""
            )
            .trim()
            .toLowerCase();


        const requestedSport =
            String(
                req.query?.sport || ""
            )
            .trim()
            .toLowerCase();


        if (
            check !== "1" ||
            !requestedSport
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Sport check request is required."
            });

        }


        /*
        ==================================================
            SPORT FAMILY MATCHING

            ADMIN SENDS ONLY:

                cricket
                football
                basketball
                tennis
                hockey
                etc.

            WE NEVER SEND "cricket" DIRECTLY TO
            THE ODDS API.

            WE FIRST DISCOVER THE REAL SPORT KEYS.
        ==================================================
        */

        const sportPrefixes = {

            cricket:
                ["cricket_"],

            football:
                ["soccer_"],

            soccer:
                ["soccer_"],

            basketball:
                ["basketball_"],

            tennis:
                ["tennis_"],

            hockey:
                ["icehockey_"],

            icehockey:
                ["icehockey_"],

            rugby:
                ["rugby_"],

            golf:
                ["golf_"],

            baseball:
                ["baseball_"],

            boxing:
                ["boxing_"],

            mma:
                ["mma_"],

            aussie_rules:
                ["aussierules_"],

            american_football:
                ["americanfootball_"]

        };


        const prefixes =
            sportPrefixes[
                requestedSport
            ] || [];


        if (
            prefixes.length === 0
        ) {

            return res.status(400).json({
                success: false,
                error:
                    "Unsupported sport."
            });

        }


        /*
        ==================================================
            GET REAL SPORT LIST
        ==================================================
        */

        const sportsUrl =
            "https://api.the-odds-api.com/v4/sports" +
            "?apiKey=" +
            encodeURIComponent(
                apiKey
            );


        const sportsResponse =
            await fetch(
                sportsUrl,
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


        const sportsData =
            await sportsResponse.json();


        if (
            !sportsResponse.ok
        ) {

            return res.status(
                sportsResponse.status
            ).json({

                success: false,

                error:
                    sportsData?.message ||
                    sportsData?.error ||
                    "Unable to load sports."

            });

        }


        /*
        ==================================================
            ONLY ACTIVE / IN-SEASON SPORT KEYS
        ==================================================
        */

        const matchingSports =
            (
                Array.isArray(
                    sportsData
                )
                    ? sportsData
                    : []
            )
            .filter(
                sport => {

                    const key =
                        String(
                            sport.key || ""
                        )
                        .trim()
                        .toLowerCase();


                    const active =
                        sport.active !== false;


                    const prefixMatch =
                        prefixes.some(
                            prefix =>
                                key.startsWith(
                                    prefix
                                )
                        );


                    return (
                        active &&
                        prefixMatch
                    );

                }
            );


        /*
        ==================================================
            NO ACTIVE COMPETITIONS
        ==================================================
        */

        if (
            matchingSports.length === 0
        ) {

            return res.status(200).json({

                success: true,

                sport:
                    requestedSport,

                games: [],

                sports: []

            });

        }


        /*
        ==================================================
            GET EVENTS

            /events DOES NOT COUNT AGAINST QUOTA
        ==================================================
        */

        const eventResults =
            await Promise.all(
                matchingSports.map(
                    async sport => {

                        try {

                            const eventsUrl =
                                "https://api.the-odds-api.com/v4/sports/" +
                                encodeURIComponent(
                                    sport.key
                                ) +
                                "/events?apiKey=" +
                                encodeURIComponent(
                                    apiKey
                                );


                            const response =
                                await fetch(
                                    eventsUrl,
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
                                !response.ok
                            ) {

                                return [];

                            }


                            const data =
                                await response.json();


                            if (
                                !Array.isArray(
                                    data
                                )
                            ) {

                                return [];

                            }


                            return data.map(
                                event => ({

                                    id:
                                        event.id,

                                    sport_key:
                                        sport.key,

                                    sport_title:
                                        sport.title ||
                                        event.sport_title ||
                                        "",

                                    commence_time:
                                        event.commence_time ||
                                        null,

                                    home_team:
                                        event.home_team ||
                                        "",

                                    away_team:
                                        event.away_team ||
                                        ""

                                })
                            );

                        } catch (
                            error
                        ) {

                            console.error(
                                "Event request failed:",
                                sport.key
                            );

                            return [];

                        }

                    }
                )
            );


        let games =
            eventResults.flat();


        /*
        ==================================================
            REMOVE DUPLICATES
        ==================================================
        */

        const uniqueGames =
            new Map();


        games.forEach(
            game => {

                if (
                    game &&
                    game.id
                ) {

                    uniqueGames.set(
                        String(
                            game.id
                        ),
                        game
                    );

                }

            }
        );


        games =
            Array.from(
                uniqueGames.values()
            );


        /*
        ==================================================
            GET LIVE STATUS

            scores WITHOUT daysFrom
            = live + upcoming

            Cost = 1 request credit per sport.
        ==================================================
        */

        const scoreResults =
            await Promise.all(
                matchingSports.map(
                    async sport => {

                        try {

                            const scoresUrl =
                                "https://api.the-odds-api.com/v4/sports/" +
                                encodeURIComponent(
                                    sport.key
                                ) +
                                "/scores?apiKey=" +
                                encodeURIComponent(
                                    apiKey
                                );


                            const response =
                                await fetch(
                                    scoresUrl,
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
                                !response.ok
                            ) {

                                return [];

                            }


                            const data =
                                await response.json();


                            return Array.isArray(
                                data
                            )
                                ? data
                                : [];

                        } catch (
                            error
                        ) {

                            console.error(
                                "Score request failed:",
                                sport.key
                            );

                            return [];

                        }

                    }
                )
            );


        const scoreMap =
            new Map();


        scoreResults
            .flat()
            .forEach(
                score => {

                    if (
                        score &&
                        score.id
                    ) {

                        scoreMap.set(
                            String(
                                score.id
                            ),
                            score
                        );

                    }

                }
            );


        /*
        ==================================================
            BUILD LIVE / UPCOMING STATUS
        ==================================================
        */

        const now =
            Date.now();


        games =
            games
                .map(
                    game => {

                        const score =
                            scoreMap.get(
                                String(
                                    game.id
                                )
                            );


                        /*
                        ----------------------------------
                            COMPLETED
                        ----------------------------------
                        */

                        if (
                            score &&
                            score.completed === true
                        ) {

                            return null;

                        }


                        const startTime =
                            game.commence_time
                                ? new Date(
                                    game.commence_time
                                ).getTime()
                                : 0;


                        let status =
                            "upcoming";


                        /*
                        ----------------------------------
                            LIVE
                        ----------------------------------
                        */

                        if (
                            score &&
                            score.completed === false &&
                            startTime <= now
                        ) {

                            status =
                                "live";

                        }


                        /*
                        ----------------------------------
                            SAFETY FILTER

                            Started event without score
                            confirmation is not shown.
                        ----------------------------------
                        */

                        if (
                            startTime &&
                            startTime <= now &&
                            !score
                        ) {

                            return null;

                        }


                        return {

                            ...game,

                            status:
                                status,

                            completed:
                                false,

                            scores:
                                score?.scores ||
                                null

                        };

                    }
                )
                .filter(
                    Boolean
                );


        /*
        ==================================================
            SORT

            LIVE FIRST
            UPCOMING AFTER THAT
        ==================================================
        */

        games.sort(
            (a, b) => {

                if (
                    a.status === "live" &&
                    b.status !== "live"
                ) {

                    return -1;

                }


                if (
                    a.status !== "live" &&
                    b.status === "live"
                ) {

                    return 1;

                }


                return (
                    new Date(
                        a.commence_time || 0
                    ).getTime()
                    -
                    new Date(
                        b.commence_time || 0
                    ).getTime()
                );

            }
        );


        /*
        ==================================================
            RESPONSE

            API KEY IS NEVER INCLUDED
        ==================================================
        */

        return res.status(200).json({

            success: true,

            sport:
                requestedSport,

            sports:
                matchingSports.map(
                    sport => ({
                        key:
                            sport.key,

                        title:
                            sport.title,

                        group:
                            sport.group
                    })
                ),

            games:
                games

        });


    } catch (
        error
    ) {

        console.error(
            "Odds API relay error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Unable to check sports API."

        });

    }

}
