import nodemailer from "nodemailer";
import { promises as dns } from "dns";
import { ENV } from "../config/env";

const HOST = ENV.SMTP_HOST;                  // smtp-relay.gmail.com
const FROM = ENV.MAIL_FROM || "no-reply@lampadina.icu";

// Envelope-From (nur Adresse)
const ENVELOPE_FROM = (() => {
  const m = FROM.match(/<([^>]+)>/);
  return m ? m[1] : FROM;
})();

async function resolveIPv4(host: string) {
  try {
    const a = await dns.resolve4(host);
    if (a?.length) return a[0];
  } catch {}
  return host;
}

async function makeTransport(port: number, secure: boolean) {
  const ipv4 = await resolveIPv4(HOST);
  return nodemailer.createTransport({
    name: "lampadina.icu",     // EHLO name
    host: ipv4,                // erzwinge IPv4
    port,
    secure,                    // 25: false (kein TLS), 587: false (STARTTLS)
    auth: ENV.SMTP_USER && ENV.SMTP_PASS ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
    // wichtig: SNI -> Original-Hostname
    tls: { servername: HOST, rejectUnauthorized: true },
    greetingTimeout: 15000,
    connectionTimeout: 15000,
  });
}

async function sendWith(port: number, secure: boolean, to: string, subject: string, html: string, text?: string) {
  const t = await makeTransport(port, secure);
  if (ENV.MAIL_DEBUG) console.log("[mailer] try", { host: HOST, port, secure, from: FROM, to });
  const info = await t.sendMail({
    from: FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, " "),
    envelope: { from: ENVELOPE_FROM, to },
  });
  if (ENV.MAIL_DEBUG) console.log("[mailer] sent", info.messageId, info.envelope);
}

export async function sendMail(to: string, subject: string, html: string, text?: string) {
  if (!HOST) {
    console.warn("[mailer] SMTP_HOST fehlt – skip", { to, subject });
    return;
  }
  // 1) Erst Port 25 (IP-basiertes Relay ohne Auth liebt Port 25)
  try {
    await sendWith(25, false, to, subject, html, text);
    return;
  } catch (e) {
    if (ENV.MAIL_DEBUG) console.warn("[mailer] port 25 failed, fallback 587 STARTTLS:", (e as any)?.message || e);
  }
  // 2) Fallback 587 (Submission/STARTTLS)
  await sendWith(587, false, to, subject, html, text);
}
