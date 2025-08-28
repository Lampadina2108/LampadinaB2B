import { Request, Response } from "express";
import { sendMail } from "../utils/mailer";
import { ENV } from "../config/env";

export async function testEmail(req: Request, res: Response) {
  try {
    const to =
      (req.query.to as string) ||
      (ENV as any).ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "";
    if (!to) return res.status(400).json({ error: "no recipient (use ?to=... or set ADMIN_EMAIL)" });

    await sendMail(
      to,
      "Lampadina B2B – SMTP Test",
      `<p>Hallo! Das ist ein Test vom Lampadina-Backend.</p><p>Zeit: ${new Date().toISOString()}</p>`
    );
    res.json({ ok: true, to });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

export async function mailerInfo(_req: Request, res: Response) {
  res.json({
    host: (ENV as any).SMTP_HOST || process.env.SMTP_HOST,
    port: Number((ENV as any).SMTP_PORT || process.env.SMTP_PORT),
    secure: String((ENV as any).SMTP_SECURE || process.env.SMTP_SECURE),
    from: (ENV as any).MAIL_FROM || process.env.MAIL_FROM,
  });
}
