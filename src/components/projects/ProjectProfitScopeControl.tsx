import { useRef, type ReactNode } from "react";
import { Download, FileDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagementProject } from "@/lib/managementData";
import {
  buildProjectControlExportSheets,
  type ProjectControlSnapshot,
} from "@/lib/projectControl";
import { cn } from "@/lib/utils";

type ProjectProfitScopeControlProps = {
  project: ManagementProject;
  snapshot: ProjectControlSnapshot;
};

function formatCurrency(value?: number | null, fallback = "Pending") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedCurrency(value?: number | null, fallback = "Pending") {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const formatted = formatCurrency(Math.abs(value), fallback);
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted;
}

function toneClasses(tone: ProjectControlSnapshot["financialHealthTone"]) {
  if (tone === "red") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  if (tone === "yellow") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

function toneTextClasses(tone: ProjectControlSnapshot["financialHealthTone"]) {
  if (tone === "red") {
    return "text-rose-700 dark:text-rose-300";
  }

  if (tone === "yellow") {
    return "text-amber-700 dark:text-amber-300";
  }

  return "text-emerald-700 dark:text-emerald-300";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function MetricCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone?: ProjectControlSnapshot["financialHealthTone"];
  value: ReactNode;
}) {
  return (
    <div className="dashboard-item p-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-base font-semibold text-foreground">
        {value}
      </div>
      <p
        className={cn(
          "mt-2 text-sm leading-6 text-muted-foreground",
          tone ? toneTextClasses(tone) : ""
        )}
      >
        {detail}
      </p>
    </div>
  );
}

export default function ProjectProfitScopeControl({
  project,
  snapshot,
}: ProjectProfitScopeControlProps) {
  const captureRef = useRef<HTMLDivElement | null>(null);

  const downloadWorkbook = async () => {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    const sheets = buildProjectControlExportSheets(project, snapshot);

    Object.entries(sheets).forEach(([sheetName, rows]) => {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
    });

    XLSX.writeFile(workbook, `${slugify(project.project_name)}-profit-scope-control.xlsx`);
  };

  const downloadPdf = async () => {
    if (!captureRef.current) {
      return;
    }

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(captureRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      format: "letter",
      unit: "pt",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const imageWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`${project.project_name} | Profit & Scope Control`, margin, 24);

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      40,
      imageWidth,
      Math.min(imageHeight, pageHeight - 80)
    );

    let y = pageHeight - 160;
    if (imageHeight > pageHeight - 140) {
      pdf.addPage();
      y = 48;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Automated Summary", margin, y);
    y += 18;

    const sections = [
      ["What Changed", snapshot.automationSummary.whatChanged],
      ["Profit Pressure", snapshot.automationSummary.profitPressure],
      ["Scope Items Requiring Decision", snapshot.automationSummary.scopeItems],
      ["Immediate Next Actions", snapshot.automationSummary.immediateNextActions],
    ] as const;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    sections.forEach(([title, bullets]) => {
      if (y > pageHeight - 100) {
        pdf.addPage();
        y = 48;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, y);
      y += 14;
      pdf.setFont("helvetica", "normal");

      bullets.forEach((bullet) => {
        const lines = pdf.splitTextToSize(`• ${bullet}`, pageWidth - margin * 2);
        pdf.text(lines, margin, y);
        y += lines.length * 12 + 4;
      });
      y += 6;
    });

    pdf.save(`${slugify(project.project_name)}-profit-scope-control.pdf`);
  };

  return (
    <Card className="dashboard-panel p-2">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-2xl text-foreground">Profit & Scope Control</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This section turns budgets, scope pressure, change exposure, and margin movement into owner-readable decisions instead of raw accounting support.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => void downloadWorkbook()}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button
            className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
            onClick={() => void downloadPdf()}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF Sheet
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div ref={captureRef} className="space-y-6 bg-background">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Expected Budget"
              value={formatCurrency(snapshot.projectSummary.originalBudget)}
              detail="Original baseline before approved changes or cost pressure."
            />
            <MetricCard
              label="Current / Revised Budget"
              value={formatCurrency(snapshot.projectSummary.revisedBudget)}
              detail={`Current cost projection ${formatCurrency(snapshot.currentCostProjection)}.`}
            />
            <MetricCard
              label="Expected Profit"
              value={formatCurrency(snapshot.expectedProfit)}
              detail="Revenue baseline less the expected budget."
              tone={
                snapshot.expectedProfit !== null && snapshot.expectedProfit < 0 ? "red" : "green"
              }
            />
            <MetricCard
              label="Current Profit"
              value={formatCurrency(snapshot.currentProfit)}
              detail="Revenue baseline less the live cost projection."
              tone={
                snapshot.currentProfit !== null && snapshot.currentProfit < 0 ? "red" : "green"
              }
            />
            <MetricCard
              label="Profit At Risk"
              value={formatCurrency(snapshot.profitAtRisk)}
              detail="Margin already compressed plus pending change-order exposure."
              tone={
                snapshot.profitAtRisk > 0
                  ? snapshot.profitAtRisk >= 50000
                    ? "red"
                    : "yellow"
                  : "green"
              }
            />
            <MetricCard
              label="Pending Change Orders"
              value={formatCurrency(snapshot.projectSummary.pendingChangeOrderExposure)}
              detail={`${snapshot.pendingChangeOrderCount} item(s) pending | ${snapshot.pendingChangeOrderAgingDays} day max aging`}
              tone={snapshot.pendingChangeOrderCount ? "yellow" : "green"}
            />
            <MetricCard
              label="Scope Status"
              value={
                <span
                  className={cn(
                    "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
                    toneClasses(snapshot.scopeTone)
                  )}
                >
                  {snapshot.scopeStatus}
                </span>
              }
              detail={snapshot.scopeReasons[0] || "Scope currently appears aligned."}
            />
            <MetricCard
              label="Margin Impact"
              value={formatSignedCurrency(snapshot.marginImpact)}
              detail="Current profit compared with the original profit expectation."
              tone={
                typeof snapshot.marginImpact === "number"
                  ? snapshot.marginImpact < 0
                    ? "red"
                    : "green"
                  : undefined
              }
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="dashboard-item p-4">
              <div className="mb-4">
                <p className="text-base font-semibold text-foreground">Budget vs Actual vs Revised</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Simple grouped bars so the team can see budget drift without digging through multiple tabs.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={snapshot.budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 16, borderColor: "rgba(15, 23, 42, 0.12)" }}
                  />
                  <Bar
                    dataKey="expectedBudget"
                    name="Expected Budget"
                    fill="#0f172a"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="revisedBudget"
                    name="Revised Budget"
                    fill="#f97316"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="actualCost"
                    name="Actual Cost"
                    fill="#ef4444"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-item p-4">
              <div className="mb-4">
                <p className="text-base font-semibold text-foreground">Profit Bridge</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Starts at expected profit, then shows how approved scope, pending exposure, and overrun pressure are moving the job.
                </p>
              </div>
              {snapshot.profitBridgeData.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={snapshot.profitBridgeData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="label" />
                    <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                    <Tooltip
                      formatter={(_, __, item) => {
                        const payload = item?.payload as (typeof snapshot.profitBridgeData)[number];
                        return [
                          `${formatSignedCurrency(payload.change)} | Result ${formatCurrency(payload.resulting)}`,
                          payload.label,
                        ];
                      }}
                      contentStyle={{ borderRadius: 16, borderColor: "rgba(15, 23, 42, 0.12)" }}
                    />
                    <Bar dataKey="base" stackId="bridge" fill="transparent" />
                    <Bar dataKey="magnitude" stackId="bridge" radius={[10, 10, 0, 0]}>
                      {snapshot.profitBridgeData.map((step) => (
                        <Cell
                          key={step.label}
                          fill={
                            step.tone === "green"
                              ? "#22c55e"
                              : step.tone === "yellow"
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm leading-6 text-muted-foreground">
                  Revenue baseline still needs to be confirmed before the profit bridge can be rendered honestly.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <div className="dashboard-item p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-base font-semibold text-foreground">Scope Drift Status</p>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-sm font-semibold",
                    toneClasses(snapshot.scopeTone)
                  )}
                >
                  {snapshot.scopeStatus}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {project.scope_subject || "Scope subject still needs to be defined"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {project.scope_summary ||
                  "Add a clear scope summary so the team can quickly compare the recorded intent against cost and execution drift."}
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                {snapshot.scopeReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>

            <div className="dashboard-item p-4">
              <p className="text-base font-semibold text-foreground">Automated Summary</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Generated from structured project data only. It helps frame the conversation, but it never changes numbers or sends anything automatically.
              </p>
              <div className="mt-4 grid gap-3">
                {([
                  ["What Changed", snapshot.automationSummary.whatChanged],
                  ["Profit Pressure", snapshot.automationSummary.profitPressure],
                  ["Scope Items Requiring Decision", snapshot.automationSummary.scopeItems],
                  ["Immediate Next Actions", snapshot.automationSummary.immediateNextActions],
                ] as const).map(([title, bullets]) => (
                  <div key={title} className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
