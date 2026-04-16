const requiredVars = [
  "MANAGEMENT_USERNAME",
  "MANAGEMENT_PASSWORD",
  "MANAGEMENT_SESSION_SECRET",
  "EMAIL_SMTP_USER",
  "EMAIL_SMTP_PASS",
];

const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  console.error("Missing required management environment variables:");
  for (const name of missingVars) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Management environment variables look present.");
