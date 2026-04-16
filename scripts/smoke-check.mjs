import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const app = read("src/App.tsx");
const management = read("src/lib/management.ts");

const expectations = [
  {
    name: "accessibility route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/accessibility"),
  },
  {
    name: "builder profile route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/builder-profile"),
  },
  {
    name: "investor relations route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/investor-relations"),
  },
  {
    name: "careers route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/careers"),
  },
  {
    name: "thank-you route excluded from indexing",
    ok: robots.includes("Disallow: /thank-you"),
  },
  {
    name: "management login blocked in robots",
    ok: robots.includes("Disallow: /management/login"),
  },
  {
    name: "management dashboard blocked in robots",
    ok: robots.includes("Disallow: /management/dashboard"),
  },
  {
    name: "thank-you route exists in app",
    ok: app.includes('path="/thank-you"'),
  },
  {
    name: "management project details route exists in app",
    ok: app.includes('path="/management/project-details"'),
  },
  {
    name: "schedule route exists in app",
    ok: app.includes('path="/management/schedule"'),
  },
  {
    name: "budget route exists in app",
    ok: app.includes('path="/management/budget-costs"'),
  },
  {
    name: "documents route exists in app",
    ok: app.includes('path="/management/documents"'),
  },
  {
    name: "compliance route exists in app",
    ok: app.includes('path="/management/compliance"'),
  },
  {
    name: "reports route exists in app",
    ok: app.includes('path="/management/reports"'),
  },
  {
    name: "analytics route exists in app",
    ok: app.includes('path="/management/analytics"'),
  },
  {
    name: "warranty route exists in app",
    ok: app.includes('path="/management/warranty-reminder"'),
  },
  {
    name: "schedule is enabled in management navigation",
    ok: management.includes('{ name: "Schedule", page: "schedule", enabled: true }'),
  },
  {
    name: "budget is enabled in management navigation",
    ok: management.includes('{ name: "Budget & Costs", page: "budget-costs", enabled: true }'),
  },
  {
    name: "documents are enabled in management navigation",
    ok: management.includes('{ name: "Documents", page: "documents", enabled: true }'),
  },
  {
    name: "compliance is enabled in management navigation",
    ok: management.includes('{ name: "Compliance", page: "compliance", enabled: true }'),
  },
  {
    name: "reports are enabled in management navigation",
    ok: management.includes('{ name: "Reports", page: "reports", enabled: true }'),
  },
  {
    name: "analytics is enabled in management navigation",
    ok: management.includes('{ name: "Analytics", page: "analytics", enabled: true }'),
  },
  {
    name: "warranty reminder is enabled in management navigation",
    ok: management.includes('{ name: "Warranty Reminder", page: "warranty-reminder", enabled: true }'),
  },
];

const failures = expectations.filter((expectation) => !expectation.ok);

if (failures.length) {
  for (const failure of failures) {
    console.error(`Smoke check failed: ${failure.name}`);
  }

  process.exit(1);
}

console.log(`Smoke checks passed (${expectations.length} assertions).`);
