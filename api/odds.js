export default async function handler(req, res) {

    // ==================================================
    // CORS
    // ==================================================

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


    // ==================================================
    // OPTIONS
    // ==================================================

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    // ==================================================
    // METHOD CHECK
    // ==================================================

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });

    }


    try {

        // ==================================================
        // API KEY
        // ==================================================

        const apiKey =
            process.env.ODDS_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "ODDS_API_KEY is not configured."
            });

        }


        // ==================================================
        // SPORT KEY
        // ==================================================

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


        // ==================================================
        // REGIONS
        // ==================================================

        const regions =
            String(
                req.query?.regions ||
                "uk,eu,au"
            ).trim();


        // ==================================================
        // MARKETS
        // ==================================================

        const markets =
            String(
                req.query?.markets ||
                "h2h"
            ).trim();


        // ==================================================
        // ODDS FORMAT
        // ==================================================

        const oddsFormat =
            String(
                req.query?.oddsFormat ||
                "decimal"
            ).trim();


        // ==================================================
        // BUILD API URL
        // ==================================================

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
            encodeURIComponent(sportKey) +
            "/odds?" +
            params.toString();


        // ==================================================
        // FETCH ODDS
        // ==================================================

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


        // ==================================================
        // RETURN RESPONSE
        // ==================================================

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
