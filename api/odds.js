export default async function handler(req, res) {

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
        return res.status(200).end();
    }


    /*
    ======================================================
        POST
        TEMPORARY API KEY CHECK
    ======================================================
    */

    if (req.method === "POST") {

        try {

            const body =
                req.body || {};

            const temporaryApiKey =
                String(
                    body.apiKey || ""
                ).trim();

            const sportKey =
                String(
                    body.sport || ""
                ).trim();

            if (!temporaryApiKey) {

                return res.status(400).json({
                    success: false,
                    error:
                        "API key is required."
                });
            }


            if (!sportKey) {

                return res.status(400).json({
                    success: false,
                    error:
                        "Sport key is required."
                });
            }


            /*
            ==================================================
                1. GET EVENTS

                This endpoint gives in-play and pre-match
                events without spending an odds request.
            ==================================================
            */

            const eventsUrl =
                "https://api.the-odds-api.com/v4/sports/" +
                encodeURIComponent(
                    sportKey
                ) +
                "/events?apiKey=" +
                encodeURIComponent(
                    temporaryApiKey
                );


            const eventsResponse =
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


            const eventsData =
                await eventsResponse.json();


            if (!eventsResponse.ok) {

                return res.status(
                    eventsResponse.status
                ).json({

                    success: false,

                    error:
                        eventsData?.message ||
                        eventsData?.error ||
                        "API request failed."

                });

            }


            /*
            ==================================================
                2. GET LIVE / RECENT SCORE STATUS

                daysFrom is NOT used here.

                Therefore completed historical games are
                not requested.

                Live + upcoming only.
            ==================================================
            */

            const scoresUrl =
                "https://api.the-odds-api.com/v4/sports/" +
                encodeURIComponent(
                    sportKey
                ) +
                "/scores?apiKey=" +
                encodeURIComponent(
                    temporaryApiKey
                );


            const scoresResponse =
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


            let scoresData = [];


            if (scoresResponse.ok) {

                const scoreJson =
                    await scoresResponse.json();

                scoresData =
                    Array.isArray(
                        scoreJson
                    )
                        ? scoreJson
                        : [];

            }


            /*
            ==================================================
                3. CREATE SCORE LOOKUP
            ==================================================
            */

            const scoreMap =
                new Map();


            scoresData.forEach(
                scoreGame => {

                    if (
                        scoreGame &&
                        scoreGame.id
                    ) {

                        scoreMap.set(
                            String(
                                scoreGame.id
                            ),
                            scoreGame
                        );

                    }

                }
            );


            /*
            ==================================================
                4. NORMALIZE ONLY NON-COMPLETED EVENTS
            ==================================================
            */

            const now =
                Date.now();


            const games =
                (
                    Array.isArray(
                        eventsData
                    )
                        ? eventsData
                        : []
                )
                .map(
                    event => {

                        if (!event) {
                            return null;
                        }


                        const eventId =
                            String(
                                event.id || ""
                            );


                        if (!eventId) {
                            return null;
                        }


                        const scoreGame =
                            scoreMap.get(
                                eventId
                            );


                        /*
                        --------------------------------------
                            COMPLETED CHECK
                        --------------------------------------
                        */

                        if (
                            scoreGame &&
                            scoreGame.completed === true
                        ) {

                            return null;

                        }


                        const commenceTime =
                            event.commence_time
                                ? new Date(
                                    event.commence_time
                                ).getTime()
                                : 0;


                        /*
                        --------------------------------------
                            STATUS
                        --------------------------------------
                        */

                        let status =
                            "upcoming";


                        /*
                            If provider score data says
                            completed=false and the match
                            has already started, treat it
                            as LIVE.
                        */

                        if (
                            scoreGame &&
                            scoreGame.completed === false &&
                            commenceTime <= now
                        ) {

                            status =
                                "live";

                        }


                        /*
                            If event has already started but
                            score endpoint didn't return it,
                            don't incorrectly call it LIVE.

                            Keep it out rather than showing
                            a potentially completed match.
                        */

                        if (
                            commenceTime &&
                            commenceTime <= now &&
                            !scoreGame
                        ) {

                            return null;

                        }


                        return {

                            id:
                                eventId,

                            sport_key:
                                event.sport_key ||
                                sportKey,

                            sport_title:
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
                                "",

                            status:
                                status,

                            completed:
                                scoreGame
                                    ? Boolean(
                                        scoreGame.completed
                                    )
                                    : false,

                            scores:
                                scoreGame
                                    ? (
                                        scoreGame.scores ||
                                        null
                                    )
                                    : null

                        };

                    }
                )
                .filter(
                    Boolean
                );


            /*
            ==================================================
                5. SORT
                LIVE FIRST
                THEN UPCOMING BY TIME
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


                    const timeA =
                        new Date(
                            a.commence_time || 0
                        ).getTime();


                    const timeB =
                        new Date(
                            b.commence_time || 0
                        ).getTime();


                    return timeA - timeB;

                }
            );


            /*
            ==================================================
                FINAL RESPONSE

                IMPORTANT:
                temporaryApiKey is NEVER returned.
            ==================================================
            */

            return res.status(200).json({

                success: true,

                sport:
                    sportKey,

                games:
                    games

            });


        } catch (error) {

            console.error(
                "Temporary Sports API check error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Unable to check API."

            });

        }

    }


    /*
    ======================================================
        EXISTING GET FLOW
        KEEPING YOUR CURRENT VERCEL API
    ======================================================
    */

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });

    }


    try {

        const apiKey =
            process.env.ODDS_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "ODDS_API_KEY is not configured."
            });

        }


        if (
            req.query?.sports === "list"
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


            const data =
                await response.json();


            return res.status(
                response.status
            ).json({

                success:
                    response.ok,

                data:
                    data

            });

        }


        const sportKey =
            String(
                req.query?.sport ||
                "cricket_caribbean_premier_league"
            ).trim();


        if (!sportKey) {

            return res.status(400).json({
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


        const data =
            await response.json();


        return res.status(
            response.status
        ).json({

            success:
                response.ok,

            sport:
                sportKey,

            data:
                data

        });


    } catch (error) {

        console.error(
            "Odds API relay error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                String(error)

        });

    }

}
