const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const DEFAULT_LOGO_URL =
  "https://www.estatenest.capital/brand/estate-nest-capital-logo.jpg";
const DEFAULT_FROM_NAME = "Estate Nest Capital Inc.";
const DEFAULT_INBOX_COPY = "hello@estatenest.capital";
const CONFIDENTIALITY_NOTICE =
  "The contents of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information and may be legally protected from disclosure. If you are not the intended recipient of this message or their agent, or if this message has been addressed to you in error, please immediately alert the sender by reply email and then delete this message and any attachments. If you are not the intended recipient, you are hereby notified that any use, dissemination, copying, or storage of this message or its attachments is strictly prohibited. Please note that any views or opinions presented in this email are solely those of the author and do not necessarily represent those of Estate Nest Capital Inc. Finally, the recipient should check this email and any attachments for the presence of viruses. Estate Nest Capital Inc accepts no liability for any damage caused by any virus transmitted by this email.";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
  replyTo: string;
  inboxCopy: string;
  logoUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeEmailList(input: unknown): string[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];

  const deduped = new Set<string>();

  for (const value of values) {
    const email = String(value || "").trim();

    if (!email) {
      continue;
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }

    deduped.add(email.toLowerCase());
  }

  return [...deduped];
}

function getBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getSmtpConfig(): SmtpConfig {
  const user =
    process.env.EMAIL_SMTP_USER?.trim() ||
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim();
  const pass =
    process.env.EMAIL_SMTP_PASS?.trim() ||
    process.env.EMAIL_APP_PASSWORD?.trim() ||
    process.env.GOOGLE_APP_PASSWORD?.trim() ||
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    process.env.SMTP_PASSWORD?.trim();

  if (!user || !pass) {
    throw new Error(
      "Dashboard email is not configured on this deployment yet. EMAIL_SMTP_USER and EMAIL_SMTP_PASS are required for the system to send email."
    );
  }

  const host = process.env.EMAIL_SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_SMTP_PORT || "465");
  const secure = getBoolean(process.env.EMAIL_SMTP_SECURE, port === 465);
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim() || user;
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME;
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || fromAddress;
  const inboxCopy =
    process.env.EMAIL_INBOX_COPY?.trim() || DEFAULT_INBOX_COPY;
  const logoUrl = process.env.EMAIL_LOGO_URL?.trim() || DEFAULT_LOGO_URL;

  if (!EMAIL_REGEX.test(fromAddress)) {
    throw new Error("EMAIL_FROM_ADDRESS must be a valid email address");
  }

  if (!EMAIL_REGEX.test(replyTo)) {
    throw new Error("EMAIL_REPLY_TO must be a valid email address");
  }

  if (!EMAIL_REGEX.test(inboxCopy)) {
    throw new Error("EMAIL_INBOX_COPY must be a valid email address");
  }

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("EMAIL_SMTP_PORT must be a valid port number");
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromAddress,
    fromName,
    replyTo,
    inboxCopy,
    logoUrl,
  };
}

function formatBodyHtml(body: string): string {
  return body
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => {
      const lineHtml = escapeHtml(paragraph).replace(/\n/g, "<br />");
      return `<p style="margin:0 0 16px;color:#0f172a;font-size:15px;line-height:1.75;">${lineHtml}</p>`;
    })
    .join("");
}

function getSignatureText(fromAddress: string): string {
  return [
    "",
    "",
    "Estate Nest Capital Inc.",
    "@KS:ks",
    "",
    "Kanwar Sharma, Founder",
    "",
    fromAddress.toUpperCase(),
    "www.estatenest.capital",
    "",
    CONFIDENTIALITY_NOTICE,
  ].join("\n");
}

function getSignatureHtml(config: Pick<SmtpConfig, "fromAddress" | "logoUrl">) {
  return `
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <img
          src="${escapeHtml(config.logoUrl)}"
          alt="Estate Nest Capital Inc. logo"
          width="88"
          height="88"
          style="display:block;width:88px;height:88px;object-fit:contain;border-radius:20px;background:#ffffff;padding:6px;box-shadow:0 14px 32px rgba(15,23,42,0.14);"
        />
        <div>
          <div style="font-size:24px;font-weight:800;line-height:1.05;letter-spacing:0.08em;text-transform:uppercase;color:#0f172a;">
            Estate Nest Capital Inc.
          </div>
          <div style="margin-top:6px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#f97316;">
            @KS:ks
          </div>
        </div>
      </div>

      <div style="margin-top:20px;color:#0f172a;">
        <div style="font-size:18px;font-weight:700;">Kanwar Sharma, Founder</div>
        <div style="margin-top:10px;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
          ${escapeHtml(config.fromAddress)}
        </div>
        <div style="margin-top:6px;font-size:14px;">
          <a href="https://www.estatenest.capital" style="color:#2563eb;text-decoration:none;">www.estatenest.capital</a>
        </div>
      </div>

      <p style="margin:24px 0 0;color:#64748b;font-size:12px;line-height:1.7;">
        ${escapeHtml(CONFIDENTIALITY_NOTICE)}
      </p>
    </div>
  `;
}

export function buildEmailContent(
  body: string,
  config: Pick<SmtpConfig, "fromAddress" | "logoUrl">
) {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error("Email body is required");
  }

  return {
    text: `${trimmedBody}${getSignatureText(config.fromAddress)}`,
    html: `
      <div style="margin:0 auto;max-width:720px;padding:32px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
        ${formatBodyHtml(trimmedBody)}
        ${getSignatureHtml(config)}
      </div>
    `,
  };
}
