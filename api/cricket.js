export default async function handler(req, res) {

    // ==========================================
    // CORS
    // ==========================================

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

    // Browser preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ==========================================
    // ONLY GET REQUEST
    // ==========================================

    if (req.method !== "GET") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed."
        });

    }

    // ==========================================
    // CRICKET API
    // ==========================================

    try {

        const apiKey =
            process.env.CRICKET_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                success: false,
                error:
                    "CRICKET_API_KEY is not configured."
            });

        }

        const apiUrl =
            "https://api.cricapi.com/v1/currentMatches" +
            "?apikey=" +
            encodeURIComponent(apiKey) +
            "&offset=0";

        const response =
            await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Accept":
                        "application/json",
                    "User-Agent":
                        "SportsWebsite/1.0"
                }
            });

        const data =
            await response.json();

        return res.status(response.status).json({
            success: response.ok,
            data: data
        });

    } catch (error) {

        console.error(
            "Cricket API relay error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                String(error)
        });

    }

}
