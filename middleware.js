// =============================
// SAFIKI ADMIN ROUTE GATE
// =============================

export default function middleware(request) {

    const url = new URL(request.url);
    const pathname = url.pathname;

    const secretPath =
        process.env.ADMIN_SECRET_PATH || "";

    // =====================================
    // SECRET ADMIN ENTRY
    // =====================================

    if (
        secretPath &&
        pathname === `/${secretPath}`
    ) {
        const loginUrl =
            new URL("/admin-login.html", request.url);

        return Response.redirect(
            loginUrl,
            302
        );
    }

    // =====================================
    // BLOCK DIRECT ADMIN URLS
    // =====================================

    if (
        pathname === "/admin.html" ||
        pathname === "/admin-login.html"
    ) {
        return new Response(
            "Not Found",
            {
                status: 404,
                headers: {
                    "content-type":
                        "text/plain; charset=utf-8"
                }
            }
        );
    }

    // =====================================
    // EVERYTHING ELSE
    // =====================================

    return;
}

export const config = {
    matcher: [
        "/admin.html",
        "/admin-login.html",
        "/:path*"
    ]
};
