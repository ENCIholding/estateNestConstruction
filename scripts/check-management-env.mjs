const requiredVars = [
  "MANAGEMENT_USERNAME",
  "MANAGEMENT_PASSWORD",
  "MANAGEMENT_SESSION_SECRET",
];

const emailUserAliases = [
  "EMAIL_SMTP_USER",
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

const missingVars = requiredVars.filter((name) => !process.env[name]);
const hasEmailUser = emailUserAliases.some((name) => process.env[name]);
const hasEmailPass = emailPassAliases.some((name) => process.env[name]);

if (missingVars.length > 0) {
  console.error("Missing required management environment variables:");
  for (const name of missingVars) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

if (!hasEmailUser || !hasEmailPass) {
  console.error("Missing dashboard email environment variables:");
  if (!hasEmailUser) {
    console.error(`- one of: ${emailUserAliases.join(", ")}`);
  }
  if (!hasEmailPass) {
    console.error(`- one of: ${emailPassAliases.join(", ")}`);
  }
  process.exit(1);
}

console.log("Management environment variables look present.");
