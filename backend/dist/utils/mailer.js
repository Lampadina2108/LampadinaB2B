"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dns_1 = require("dns");
const env_1 = require("../config/env");
const HOST = env_1.ENV.SMTP_HOST; // smtp-relay.gmail.com
const FROM = env_1.ENV.MAIL_FROM || "no-reply@lampadina.icu";
// Envelope-From (nur Adresse)
const ENVELOPE_FROM = (() => {
    const m = FROM.match(/<([^>]+)>/);
    return m ? m[1] : FROM;
})();
async function resolveIPv4(host) {
    try {
        const a = await dns_1.promises.resolve4(host);
        if (a === null || a === void 0 ? void 0 : a.length)
            return a[0];
    }
    catch { }
    return host;
}
async function makeTransport(port, secure) {
    const ipv4 = await resolveIPv4(HOST);
    return nodemailer_1.default.createTransport({
        name: "lampadina.icu", // EHLO name
        host: ipv4, // erzwinge IPv4
        port,
        secure, // 25: false (kein TLS), 587: false (STARTTLS)
        auth: env_1.ENV.SMTP_USER && env_1.ENV.SMTP_PASS ? { user: env_1.ENV.SMTP_USER, pass: env_1.ENV.SMTP_PASS } : undefined,
        // wichtig: SNI -> Original-Hostname
        tls: { servername: HOST, rejectUnauthorized: true },
        greetingTimeout: 15000,
        connectionTimeout: 15000,
    });
}
async function sendWith(port, secure, to, subject, html, text) {
    const t = await makeTransport(port, secure);
    if (env_1.ENV.MAIL_DEBUG)
        console.log("[mailer] try", { host: HOST, port, secure, from: FROM, to });
    const info = await t.sendMail({
        from: FROM,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, " "),
        envelope: { from: ENVELOPE_FROM, to },
    });
    if (env_1.ENV.MAIL_DEBUG)
        console.log("[mailer] sent", info.messageId, info.envelope);
}
async function sendMail(to, subject, html, text) {
    if (!HOST) {
        console.warn("[mailer] SMTP_HOST fehlt – skip", { to, subject });
        return;
    }
    // 1) Erst Port 25 (IP-basiertes Relay ohne Auth liebt Port 25)
    try {
        await sendWith(25, false, to, subject, html, text);
        return;
    }
    catch (e) {
        if (env_1.ENV.MAIL_DEBUG)
            console.warn("[mailer] port 25 failed, fallback 587 STARTTLS:", (e === null || e === void 0 ? void 0 : e.message) || e);
    }
    // 2) Fallback 587 (Submission/STARTTLS)
    await sendWith(587, false, to, subject, html, text);
}
