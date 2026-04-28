import type { ManagementProject } from "./managementData";
import {
  buildProjectCompliance,
  formatCurrency,
  formatDate,
} from "./managementData";
import { buildProjectControlSnapshot } from "./projectControl";
import type {
  BuildOsChangeOrder,
  BuildOsClientInvoice,
  BuildOsClientReportRecord,
  BuildOsClientReportSection,
  BuildOsDailyLog,
  BuildOsDeficiency,
  BuildOsDocumentRecord,
  BuildOsMasterRecord,
  BuildOsPresentationRecord,
  BuildOsProjectParticipantAssignment,
  BuildOsTask,
  BuildOsVendorBill,
} from "./buildosWorkspace";

export type BuildOsClientOutputContext = {
  assignment?: BuildOsProjectParticipantAssignment | null;
  changeOrders: BuildOsChangeOrder[];
  clientInvoices: BuildOsClientInvoice[];
  dailyLogs: BuildOsDailyLog[];
  deficiencies: BuildOsDeficiency[];
  documents: BuildOsDocumentRecord[];
  project: ManagementProject;
  records: BuildOsMasterRecord[];
  tasks: BuildOsTask[];
  vendorBills: BuildOsVendorBill[];
};

export type BuildOsClientReportDraft = {
  sectionOrder: string[];
  sections: BuildOsClientReportSection[];
  summary: string;
};

function summarizeDailyLogs(logs: BuildOsDailyLog[]) {
  return logs
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 4)
    .map(
      (item) =>
        `${formatDate(item.date)} | ${item.weather || "Weather not noted"} | ${
          item.comments || "Field update recorded."
        }`
    );
}

function summarizeDeficiencies(deficiencies: BuildOsDeficiency[]) {
  const open = deficiencies.filter((item) => item.status !== "Closed");
  if (!open.length) {
    return ["No open deficiencies are currently recorded in the project register."];
  }

  return open.slice(0, 6).map(
    (item) =>
      `${item.title} | ${item.status} | ${item.severity}${item.location ? ` | ${item.location}` : ""}`
  );
}

function summarizeChangeOrders(changeOrders: BuildOsChangeOrder[]) {
  if (!changeOrders.length) {
    return ["No change orders are currently recorded for this project."];
  }

  return changeOrders.slice(0, 6).map((item) => {
    const scopeLine = item.clientSummary || item.scopeSummary;
    return `${item.title} | ${item.status} | ${formatCurrency(item.budgetImpact)} | ${scopeLine}`;
  });
}

function summarizeDocuments(
  project: ManagementProject,
  documents: BuildOsDocumentRecord[]
) {
  const items: string[] = [];

  if (project.development_permit_pdf) {
    items.push("Development permit reference linked in the project registry.");
  }

  if (project.building_permit_pdf) {
    items.push("Building permit reference linked in the project registry.");
  }

  if (project.real_property_report) {
    items.push("Real property report reference linked in the project registry.");
  }

  documents
    .slice(0, 6)
    .forEach((item) =>
      items.push(
        `${item.documentType} | ${item.title}${item.versionLabel ? ` | ${item.versionLabel}` : ""}`
      )
    );

  return items.length
    ? items
    : ["Permit and diligence references still need to be attached in the project record."];
}

function summarizeRisks(scopeDraft: ReturnType<typeof buildProjectControlSnapshot>) {
  const riskLines = scopeDraft.riskSignals.map(
    (signal) => `${signal.label}: ${signal.level} | ${signal.detail}`
  );

  const scopeLines = scopeDraft.scopeReasons.map((reason) => `Scope note: ${reason}`);

  return [...riskLines, ...scopeLines].length
    ? [...riskLines, ...scopeLines]
    : ["No major risk notes are currently generated from the available project records."];
}

export function buildClientReportDraft(
  report: Pick<BuildOsClientReportRecord, "preparedFor" | "safeContextNotes">,
  context: BuildOsClientOutputContext
): BuildOsClientReportDraft {
  const compliance = buildProjectCompliance([context.project])[0];
  const snapshot = buildProjectControlSnapshot({
    assignment: context.assignment || null,
    changeOrders: context.changeOrders,
    clientInvoices: context.clientInvoices,
    deficiencies: context.deficiencies,
    documents: context.documents,
    project: context.project,
    records: context.records,
    tasks: context.tasks,
    vendorBills: context.vendorBills,
  });

  const projectTasks = context.tasks.filter((item) => item.projectId === context.project.id);
  const completedTasks = projectTasks.filter((item) => item.status === "Completed").length;
  const openTasks = projectTasks.length - completedTasks;
  const relatedChangeOrders = context.changeOrders.filter(
    (item) => item.projectId === context.project.id
  );
  const relatedLogs = context.dailyLogs.filter((item) => item.projectId === context.project.id);
  const relatedDeficiencies = context.deficiencies.filter(
    (item) => item.projectId === context.project.id
  );
  const relatedDocuments = context.documents.filter(
    (item) => item.projectId === context.project.id
  );

  const sections: BuildOsClientReportSection[] = [
    {
      heading: "Project Snapshot",
      safe: true,
      body: [
        `Prepared for: ${report.preparedFor}`,
        `Project status: ${context.project.status}`,
        `Address: ${context.project.civic_address}`,
        `Scope summary: ${context.project.scope_summary || context.project.scope_subject || "Scope summary still being finalized."}`,
        `Project manager: ${context.project.project_manager || "Project manager not recorded."}`,
      ],
    },
    {
      heading: "Schedule",
      safe: true,
      body: [
        `Start date: ${formatDate(context.project.start_date)}`,
        `Target completion: ${formatDate(context.project.estimated_end_date)}`,
        `Actual completion: ${formatDate(context.project.actual_end_date)}`,
        `Next milestone: ${context.project.next_milestone || "Next milestone not recorded."}`,
        `Open tasks: ${openTasks} | Completed tasks: ${completedTasks}`,
      ],
    },
    {
      heading: "Budget",
      safe: true,
      body: [
        `Estimated budget: ${formatCurrency(context.project.estimated_budget)}`,
        `Approved change impact: ${formatCurrency(
          relatedChangeOrders
            .filter((item) => ["Approved", "Implemented"].includes(item.status))
            .reduce((sum, item) => sum + item.budgetImpact, 0)
        )}`,
        `Pending change exposure: ${formatCurrency(snapshot.projectSummary.pendingChangeOrderExposure)}`,
        `Cash position signal: ${snapshot.cashPositionLabel} | ${snapshot.cashPositionDetail}`,
      ],
    },
    {
      heading: "Documents",
      safe: true,
      body: summarizeDocuments(context.project, relatedDocuments),
    },
    {
      heading: "Daily Log Summary",
      safe: true,
      body: summarizeDailyLogs(relatedLogs),
    },
    {
      heading: "Deficiencies",
      safe: true,
      body: summarizeDeficiencies(relatedDeficiencies),
    },
    {
      heading: "Change Orders",
      safe: true,
      body: summarizeChangeOrders(relatedChangeOrders),
    },
    {
      heading: "Risks",
      safe: true,
      body: summarizeRisks(snapshot),
    },
    {
      heading: "Next Actions",
      safe: true,
      body: snapshot.nextThreeActions.length
        ? snapshot.nextThreeActions
        : ["No next actions have been generated yet from the current project record."],
    },
    {
      heading: "Disclaimer",
      safe: true,
      body: [
        "Generated by ENCI BuildOS for project communication and review purposes only.",
        "This report is based on information available in the project record as of the report date.",
        "It is not legal, financial, engineering, accounting, or municipal approval advice.",
        "Final decisions should be verified against contracts, permits, drawings, professional advice, and applicable law.",
      ],
    },
  ];

  if (report.safeContextNotes?.trim()) {
    sections.splice(1, 0, {
      heading: "Prepared Context",
      safe: true,
      body: [report.safeContextNotes.trim()],
    });
  }

  sections.splice(4, 0, {
    heading: "Permit Status",
    safe: true,
    body: [
      `Compliance score: ${compliance.score}%`,
      ...compliance.checks.map(
        (check) => `${check.label}: ${check.ready ? "Ready" : "Needs attention"} | ${check.detail}`
      ),
    ],
  });

  return {
    sectionOrder: sections.map((section) => section.heading),
    sections,
    summary: `Prepared for ${report.preparedFor}. ${context.project.project_name} is currently ${context.project.status.toLowerCase()} with ${snapshot.scopeStatus.toLowerCase()} and ${snapshot.projectHealth.toLowerCase()} operating signals.`,
  };
}

export async function exportClientReportPdf(options: {
  project: ManagementProject;
  report: Pick<BuildOsClientReportRecord, "preparedFor" | "reportDate" | "title">;
  draft: BuildOsClientReportDraft;
}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    format: "letter",
    unit: "pt",
  });

  let y = 52;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(options.report.title, 48, y);
  y += 24;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Project: ${options.project.project_name}`, 48, y);
  y += 16;
  pdf.text(`Prepared for: ${options.report.preparedFor}`, 48, y);
  y += 16;
  pdf.text(`Report date: ${formatDate(options.report.reportDate)}`, 48, y);
  y += 24;

  options.draft.sections.forEach((section) => {
    if (y > 710) {
      pdf.addPage();
      y = 52;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(section.heading, 48, y);
    y += 16;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    section.body.forEach((line) => {
      const wrapped = pdf.splitTextToSize(`- ${line}`, 500);
      wrapped.forEach((wrappedLine: string) => {
        if (y > 730) {
          pdf.addPage();
          y = 52;
        }
        pdf.text(wrappedLine, 60, y);
        y += 14;
      });
    });

    y += 10;
  });

  pdf.save(
    `${options.project.project_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-client-report.pdf`
  );
}

export async function exportPresentationPdf(options: {
  presentation: BuildOsPresentationRecord;
  project: ManagementProject;
}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    format: "letter",
    unit: "pt",
  });

  const lines = [
    options.presentation.title,
    `Project: ${options.project.project_name}`,
    `Prepared for: ${options.presentation.preparedFor}`,
    `Type: ${options.presentation.presentationType}`,
    `Visibility: ${options.presentation.visibility}`,
    `Status: ${options.presentation.status}`,
    `Scope summary: ${options.presentation.scopeSummary || "Not recorded."}`,
    `Permit status: ${options.presentation.permitStatus || "Not recorded."}`,
    `Budget snapshot: ${options.presentation.budgetSnapshot || "Not recorded."}`,
    `Schedule milestones: ${options.presentation.scheduleMilestones || "Not recorded."}`,
    `Risk register: ${options.presentation.riskRegister || "Not recorded."}`,
    `Next steps: ${options.presentation.nextSteps || "Not recorded."}`,
  ];

  let y = 52;
  lines.forEach((line, index) => {
    pdf.setFont("helvetica", index === 0 ? "bold" : "normal");
    pdf.setFontSize(index === 0 ? 18 : 10);
    const wrapped = pdf.splitTextToSize(line, 500);
    wrapped.forEach((wrappedLine: string) => {
      if (y > 730) {
        pdf.addPage();
        y = 52;
      }
      pdf.text(wrappedLine, 48, y);
      y += index === 0 ? 22 : 14;
    });
  });

  pdf.save(
    `${options.project.project_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-presentation.pdf`
  );
}
