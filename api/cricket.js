export default async function handler(req, res) {
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
                        "application/json"
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
