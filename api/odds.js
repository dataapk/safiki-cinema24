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


    // ==================================================
    // GET API KEY
    // ==================================================

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


        // ==================================================
        // CRICKET ODDS API
        // ==================================================

        const sportKey =
            "cricket_caribbean_premier_league";


        const apiUrl =
    "https://api.the-odds-api.com/v4/sports/" +
    sportKey +
    "/odds" +
    "?regions=uk,eu,au" +
    "&markets=h2h" +
    "&oddsFormat=decimal" +
    "&apiKey=" +
    encodeURIComponent(apiKey);

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
