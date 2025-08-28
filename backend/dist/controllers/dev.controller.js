"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEmail = testEmail;
exports.mailerInfo = mailerInfo;
const mailer_1 = require("../utils/mailer");
const env_1 = require("../config/env");
async function testEmail(req, res) {
    try {
        const to = req.query.to ||
            env_1.ENV.ADMIN_EMAIL ||
            process.env.ADMIN_EMAIL ||
            "";
        if (!to)
            return res.status(400).json({ error: "no recipient (use ?to=... or set ADMIN_EMAIL)" });
        await (0, mailer_1.sendMail)(to, "Lampadina B2B – SMTP Test", `<p>Hallo! Das ist ein Test vom Lampadina-Backend.</p><p>Zeit: ${new Date().toISOString()}</p>`);
        res.json({ ok: true, to });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
}
async function mailerInfo(_req, res) {
    res.json({
        host: env_1.ENV.SMTP_HOST || process.env.SMTP_HOST,
        port: Number(env_1.ENV.SMTP_PORT || process.env.SMTP_PORT),
        secure: String(env_1.ENV.SMTP_SECURE || process.env.SMTP_SECURE),
        from: env_1.ENV.MAIL_FROM || process.env.MAIL_FROM,
    });
}
