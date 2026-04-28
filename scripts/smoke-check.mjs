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
const header = read("src/components/Header.tsx");
const careers = read("src/pages/Careers.tsx");

const navOrderChecks = [
  '{ label: "Home", path: "/" }',
  '{ label: "About Us", path: "/#about" }',
  '{ label: "Builder Profile", path: "/builder-profile" }',
  '{ label: "Capabilities", path: "/#projects" }',
  '{ label: "Investor Relations", path: "/investor-relations" }',
  '{ label: "Contact", path: "/#appointment", isContact: true }',
];

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
    name: "terms route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/terms-and-conditions"),
  },
  {
    name: "privacy route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/privacy"),
  },
  {
    name: "cookies route in sitemap",
    ok: sitemap.includes("https://www.estatenest.capital/cookies"),
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
    name: "tasks route exists in app",
    ok: app.includes('path="/management/tasks"'),
  },
  {
    name: "gantt route exists in app",
    ok: app.includes('path="/management/gantt-chart"'),
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
    name: "presentations route exists in app",
    ok: app.includes('path="/management/presentations"'),
  },
  {
    name: "videos route exists in app",
    ok: app.includes('path="/management/videos"'),
  },
  {
    name: "client reports route exists in app",
    ok: app.includes('path="/management/client-reports"'),
  },
  {
    name: "analytics route exists in app",
    ok: app.includes('path="/management/analytics"'),
  },
  {
    name: "automation route exists in app",
    ok: app.includes('path="/management/automation"'),
  },
  {
    name: "mobile tasks route exists in app",
    ok: app.includes('path="/management/mobile-tasks"'),
  },
  {
    name: "warranty route exists in app",
    ok: app.includes('path="/management/warranty-reminder"'),
  },
  {
    name: "scroll-to-top component mounted in app",
    ok: app.includes("<ScrollToTop />"),
  },
  {
    name: "tasks are enabled in management navigation",
    ok: management.includes('{ name: "Project Tasks", page: "tasks", enabled: true }'),
  },
  {
    name: "schedule is enabled in management navigation",
    ok: management.includes('{ name: "Schedule", page: "schedule", enabled: true }'),
  },
  {
    name: "gantt is enabled in management navigation",
    ok: management.includes('{ name: "Gantt Chart", page: "gantt-chart", enabled: true }'),
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
    name: "presentations are enabled in management navigation",
    ok: management.includes('{ name: "Presentations", page: "presentations", enabled: true }'),
  },
  {
    name: "videos are enabled in management navigation",
    ok: management.includes('{ name: "Video Library", page: "videos", enabled: true }'),
  },
  {
    name: "client reports are enabled in management navigation",
    ok: management.includes('{ name: "Client Reports", page: "client-reports", enabled: true }'),
  },
  {
    name: "automation is enabled in management navigation",
    ok: management.includes('{ name: "Automation", page: "automation", enabled: true }'),
  },
  {
    name: "analytics is enabled in management navigation",
    ok: management.includes('{ name: "Analytics", page: "analytics", enabled: true }'),
  },
  {
    name: "mobile tasks are enabled in management navigation",
    ok: management.includes('{ name: "Mobile Tasks", page: "mobile-tasks", enabled: true }'),
  },
  {
    name: "warranty reminder is enabled in management navigation",
    ok: management.includes('{ name: "Warranty Reminder", page: "warranty-reminder", enabled: true }'),
  },
  {
    name: "capabilities navigation exists in public header",
    ok: header.includes('{ label: "Capabilities", path: "/#projects" }'),
  },
  {
    name: "public header navigation order matches requested order",
    ok: navOrderChecks.every((entry, index) => {
      const currentIndex = header.indexOf(entry);
      const nextIndex = navOrderChecks[index + 1]
        ? header.indexOf(navOrderChecks[index + 1])
        : Number.POSITIVE_INFINITY;

      return currentIndex !== -1 && currentIndex < nextIndex;
    }),
  },
  {
    name: "careers form supports resume upload",
    ok: careers.includes('name="resume_file"'),
  },
  {
    name: "careers form includes human verification",
    ok: careers.includes('name="human-check"'),
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
