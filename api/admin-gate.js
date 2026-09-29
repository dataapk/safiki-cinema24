// =============================
// SAFIKI ADMIN SECRET GATE
// =============================

export default function handler(req, res) {

    const requestPath =
        req.query?.path || "";

    const secretPath =
        process.env.ADMIN_SECRET_PATH || "";

    // Secret path must exist in Vercel Environment Variables
    if (
        !secretPath ||
        requestPath !== secretPath
    ) {
        return res.status(404).send("Not Found");
    }

    // Secret path is correct
    return res.redirect(
        302,
        "/admin-login.html"
    );
}
