// =============================
// SAFIKI ADMIN SECRET GATE
// =============================

import fs from "fs";
import path from "path";

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

    // Secret gate verified
    res.setHeader(
        "Set-Cookie",
        "admin_gate=verified; Path=/; HttpOnly; SameSite=Lax; Max-Age=300"
    );

    // Serve admin-login.html internally
    const filePath = path.join(
    process.cwd(),
    "admin-login.html"
);

    try {

        const html = fs.readFileSync(
            filePath,
            "utf8"
        );

        res.setHeader(
            "Content-Type",
            "text/html; charset=utf-8"
        );

        return res.status(200).send(html);

    } catch (error) {

        return res
            .status(500)
            .send("Admin Login page unavailable");
    }
}
