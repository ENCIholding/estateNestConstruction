import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const reportDir = join(root, "reports", "accessibility");
const checklistPath = join(reportDir, "accessibility-checklist.md");
const contrastCsvPath = join(reportDir, "contrast-tracking.csv");

function readText(relativePath) {
  try {
    return readFileSync(join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function hasPattern(source, pattern) {
  return pattern.test(source);
}

const careersSource = readText("src/pages/Careers.tsx");
const appSource = readText("src/App.tsx");
const pageSources = [
  "src/pages/Careers.tsx",
  "src/pages/Contact.tsx",
  "src/pages/RequestQuote.tsx",
  "src/pages/BuilderProfile.tsx",
  "src/pages/InvestorRelations.tsx",
  "src/pages/ManagementLogin.tsx",
  "src/components/AppointmentSection.tsx",
]
  .map((path) => ({ path, source: readText(path) }))
  .filter((entry) => entry.source.length > 0);

const requiredCareerInputs = [
  "career-name",
  "career-email",
  "career-phone",
  "career-role",
  "career-message",
  "career-resume",
  "career-portfolio",
  "career-human-check",
];

const careersLabelChecks = requiredCareerInputs.map((id) => {
  const hasLabel = hasPattern(careersSource, new RegExp(`htmlFor=["']${id}["']`));
  const hasInputId = hasPattern(careersSource, new RegExp(`id=["']${id}["']`));
  return hasLabel && hasInputId;
});

const careersLabelsPass = careersLabelChecks.every(Boolean);

const ariaLiveSignals = pageSources.reduce(
  (acc, entry) => {
    const alertMatches = (entry.source.match(/role=["']alert["']/g) || []).length;
    const ariaLiveMatches = (entry.source.match(/aria-live=["'](polite|assertive)["']/g) || [])
      .length;
    return {
      alertCount: acc.alertCount + alertMatches,
      ariaLiveCount: acc.ariaLiveCount + ariaLiveMatches,
    };
  },
  { alertCount: 0, ariaLiveCount: 0 }
);

const managementRoutesPresent = [
  "/management/presentations",
  "/management/videos",
  "/management/client-reports",
].every((route) => appSource.includes(route));

const checklistRows = [
  {
    area: "Careers form uses explicit labels + ids",
    status: careersLabelsPass ? "DONE" : "PARTIAL",
    evidence: careersLabelsPass
      ? "All required Careers fields have matching label + id pairs."
      : "One or more required Careers fields are missing explicit label/id pairing.",
    action: careersLabelsPass ? "No action." : "Complete missing labels/ids in Careers form.",
  },
  {
    area: "ARIA live/alert error messaging coverage",
    status:
      ariaLiveSignals.alertCount > 0 && ariaLiveSignals.ariaLiveCount > 0
        ? "PARTIAL"
        : "PENDING",
    evidence: `Found ${ariaLiveSignals.alertCount} role=\"alert\" and ${ariaLiveSignals.ariaLiveCount} aria-live markers in targeted forms/pages.`,
    action:
      "Expand a consistent aria-live + aria-describedby pattern across all form errors and toast-to-inline fallbacks.",
  },
  {
    area: "Management report modules are routable",
    status: managementRoutesPresent ? "DONE" : "PARTIAL",
    evidence: managementRoutesPresent
      ? "Routes for presentations, videos, and client reports are present."
      : "At least one management report route is missing.",
    action: managementRoutesPresent ? "No action." : "Restore missing routes in app router.",
  },
  {
    area: "Live color contrast validation",
    status: "PENDING",
    evidence: "Contrast ratios require computed browser colors and cannot be confirmed statically.",
    action:
      "Run live contrast checks and record measured ratios in contrast-tracking.csv before deployment sign-off.",
  },
  {
    area: "Keyboard/screen-reader regression pass",
    status: "PENDING",
    evidence: "Requires live browser walkthrough (tab order, focus ring, screen reader output).",
    action: "Execute assisted QA on public forms + management key flows and document findings.",
  },
];

const generatedAt = new Date().toISOString();

const checklistContent = [
  "# ENCI Accessibility QA Checklist",
  "",
  `Generated: ${generatedAt}`,
  "",
  "| Area | Status | Evidence | Action |",
  "| --- | --- | --- | --- |",
  ...checklistRows.map(
    (row) => `| ${row.area} | ${row.status} | ${row.evidence} | ${row.action} |`
  ),
  "",
  "## Contrast Test Targets",
  "",
  "Use reports/accessibility/contrast-tracking.csv to store measured values from live browser checks.",
  "",
  "1. Hero white text over image overlay",
  "2. Gradient headings",
  "3. Orange text on white/background surfaces",
  "4. White text on green/yellow gradients",
  "5. Footer links",
  "6. Management dashboard badges",
  "7. Disabled/offline module labels",
  "8. Toast messages and error states",
  "",
].join("\n");

const contrastRows = [
  ["surface", "context", "foreground", "background", "ratio", "target", "status", "notes"],
  ["Hero heading", "/", "", "", "", ">=4.5:1", "pending", ""],
  ["Gradient heading", "/", "", "", "", ">=3:1 (large) / >=4.5:1", "pending", ""],
  ["Orange text blocks", "/", "", "", "", ">=4.5:1", "pending", ""],
  ["Light text on brand gradients", "/", "", "", "", ">=4.5:1", "pending", ""],
  ["Footer links", "/", "", "", "", ">=4.5:1", "pending", ""],
  ["Management badges", "/management/dashboard", "", "", "", ">=3:1 / >=4.5:1", "pending", ""],
  ["Disabled module labels", "/management/*", "", "", "", ">=4.5:1", "pending", ""],
  ["Toast + inline errors", "forms", "", "", "", ">=4.5:1", "pending", ""],
];

const contrastCsv = contrastRows
  .map((row) =>
    row
      .map((cell) => {
        const value = String(cell ?? "");
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      })
      .join(",")
  )
  .join("\n");

mkdirSync(reportDir, { recursive: true });
writeFileSync(checklistPath, checklistContent, "utf8");
writeFileSync(contrastCsvPath, contrastCsv, "utf8");

console.log(`Generated accessibility QA checklist: ${checklistPath}`);
console.log(`Generated contrast tracking sheet: ${contrastCsvPath}`);
