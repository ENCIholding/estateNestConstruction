import nodemailer from "nodemailer";
import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../../_lib/auth.ts";
import {
  buildEmailContent,
  getSmtpConfig,
  normalizeEmailList,
} from "../../_lib/email.ts";

type SendEmailBody = {
  to?: string[] | string;
  cc?: string[] | string;
  bcc?: string[] | string;
  subject?: string;
  body?: string;
};

function uniqueEmails(emails: string[]) {
  return [...new Set(emails.map((email) => email.toLowerCase()))];
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const token = getCookie(req, getSessionCookieName());

    if (!verifySessionToken(token)) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    const payload: SendEmailBody =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const to = normalizeEmailList(payload.to);
    const cc = normalizeEmailList(payload.cc);
    const bcc = normalizeEmailList(payload.bcc);
    const subject = String(payload.subject || "").trim();
    const body = String(payload.body || "");

    if (to.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "At least one recipient is required",
      });
    }

    if (!subject) {
      return res.status(400).json({
        ok: false,
        message: "Email subject is required",
      });
    }

    const config = getSmtpConfig();
    const allRecipients = uniqueEmails([...to, ...cc, ...bcc]);
    const finalBcc = [...bcc];

    if (!allRecipients.includes(config.inboxCopy.toLowerCase())) {
      finalBcc.push(config.inboxCopy.toLowerCase());
    }

    const emailContent = buildEmailContent(body, {
      fromAddress: config.fromAddress,
      logoUrl: config.logoUrl,
    });

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      replyTo: config.replyTo,
      to,
      cc: cc.length > 0 ? cc : undefined,
      bcc: finalBcc.length > 0 ? uniqueEmails(finalBcc) : undefined,
      subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    return res.status(200).json({
      ok: true,
      message: "Email sent successfully",
      messageId: info.messageId,
      inboxCopy: config.inboxCopy,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Email send failed",
    });
  }
}
