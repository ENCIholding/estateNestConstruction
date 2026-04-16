import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const robots = read("public/robots.txt");
const sitemap = read("public/sitemap.xml");
const app = read("src/App.tsx");

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
];

const failures = expectations.filter((expectation) => !expectation.ok);

if (failures.length) {
  for (const failure of failures) {
    console.error(`Smoke check failed: ${failure.name}`);
  }

  process.exit(1);
}

console.log(`Smoke checks passed (${expectations.length} assertions).`);
