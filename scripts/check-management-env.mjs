const requiredVars = [
  "MANAGEMENT_USERNAME",
  "MANAGEMENT_PASSWORD",
  "MANAGEMENT_SESSION_SECRET",
];

const emailUserAliases = [
  "EMAIL_SMTP_USER",
  "EMAIL_SMTP_USE",
  "EMAIL_SMTP_USERNAME",
  "EMAIL_FROM_ADDRESS",
  "EMAIL_USERNAME",
  "EMAIL_USER",
  "SMTP_USER",
  "SMTP_USERNAME",
  "GMAIL_USER",
  "GOOGLE_WORKSPACE_USER",
  "MAIL_USER",
];

const emailPassAliases = [
  "EMAIL_SMTP_PASS",
  "EMAIL_SMTP_PASSWORD",
  "EMAIL_APP_PASSWORD",
  "EMAIL_PASSWORD",
  "EMAIL_PASS",
  "GOOGLE_APP_PASSWORD",
  "GMAIL_APP_PASSWORD",
  "GMAIL_PASS",
  "GOOGLE_WORKSPACE_APP_PASSWORD",
  "SMTP_PASSWORD",
  "SMTP_PASS",
  "MAIL_PASSWORD",
  "MAIL_PASS",
];
const googleOAuthClientIdAliases = [
  "EMAIL_GOOGLE_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_ID",
  "OOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_OAUTH_KEY",
  "GOOGLE_CLIENT_KEY",
];
const googleOAuthClientSecretAliases = [
  "EMAIL_GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "OOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_OAUTH_SECRET",
  "GOOGLE_CLIENT_SECRET_KEY",
];
const googleOAuthRefreshTokenAliases = [
  "EMAIL_GOOGLE_REFRESH_TOKEN",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "OOGLE_OAUTH_REFRESH_TOKEN",
  "GOOGLE_REFRESH_TOKEN",
  "GOOGLE_OAUTH_TOKEN",
  "GOOGLE_REFRESH",
];

const missingVars = requiredVars.filter((name) => !process.env[name]);
const hasEmailUser = emailUserAliases.some((name) => process.env[name]);
const hasEmailPass = emailPassAliases.some((name) => process.env[name]);
const hasGoogleClientId = googleOAuthClientIdAliases.some((name) => process.env[name]);
const hasGoogleClientSecret = googleOAuthClientSecretAliases.some((name) => process.env[name]);
const hasGoogleRefreshToken = googleOAuthRefreshTokenAliases.some((name) => process.env[name]);
const hasGoogleOAuthMail =
  hasEmailUser && hasGoogleClientId && hasGoogleClientSecret && hasGoogleRefreshToken;

if (missingVars.length > 0) {
  console.error("Missing required management environment variables:");
  for (const name of missingVars) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

if (!(hasEmailUser && hasEmailPass) && !hasGoogleOAuthMail) {
  console.error("Missing dashboard email environment variables:");
  if (!hasEmailUser) {
    console.error(`- one of: ${emailUserAliases.join(", ")}`);
  }
  if (!hasEmailPass && !hasGoogleOAuthMail) {
    console.error(`- one of: ${emailPassAliases.join(", ")}`);
    console.error(
      `- or Google OAuth mail variables in Vercel: ${googleOAuthClientIdAliases.join(", ")} | ${googleOAuthClientSecretAliases.join(", ")} | ${googleOAuthRefreshTokenAliases.join(", ")}`
    );
  }
  process.exit(1);
}

console.log("Management environment variables look present.");
