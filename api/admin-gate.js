// =============================
// SAFIKI ADMIN SECRET GATE
// =============================

export default function handler(req, res) {

    const requestPath =
        req.query?.path || "";

    const secretPath =
        process.env.ADMIN_SECRET_PATH || "";

    // Wrong path
    if (
        !secretPath ||
        requestPath !== secretPath
    ) {
        return res.status(404).send("Not Found");
    }

    // Allow Admin Login page only through the secret gate
    res.setHeader(
        "Set-Cookie",
        "admin_gate=verified; Path=/; HttpOnly; SameSite=Lax; Max-Age=300"
    );

    return res.redirect(
        302,
        "/admin-login.html"
    );
}
