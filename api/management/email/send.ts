import nodemailer from "nodemailer";
import {
  getCookie,
  getSessionCookieName,
  verifySessionToken,
} from "../../_lib/auth.ts";
import {
  jsonResponse,
  methodNotAllowed,
  readJsonBody,
} from "../../_lib/http.ts";
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

async function handlePost(request: Request) {
  try {
    const token = getCookie(request, getSessionCookieName());

    if (!verifySessionToken(token)) {
      return jsonResponse(
        {
          ok: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await readJsonBody<SendEmailBody>(request);

    const to = normalizeEmailList(payload.to);
    const cc = normalizeEmailList(payload.cc);
    const bcc = normalizeEmailList(payload.bcc);
    const subject = String(payload.subject || "").trim();
    const body = String(payload.body || "");

    if (to.length === 0) {
      return jsonResponse(
        {
          ok: false,
          message: "At least one recipient is required",
        },
        { status: 400 }
      );
    }

    if (!subject) {
      return jsonResponse(
        {
          ok: false,
          message: "Email subject is required",
        },
        { status: 400 }
      );
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

    return jsonResponse(
      {
        ok: true,
        message: "Email sent successfully",
        messageId: info.messageId,
        inboxCopy: config.inboxCopy,
      },
      { status: 200 }
    );
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Email send failed",
      },
      { status: 500 }
    );
  }
}

export default {
  fetch(request: Request) {
    if (request.method !== "POST") {
      return methodNotAllowed(["POST"]);
    }

    return handlePost(request);
  },
};
