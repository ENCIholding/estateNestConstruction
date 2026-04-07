import React, { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Printer,
  MapPin,
  CheckCircle2,
  Clock,
  DollarSign,
  Save,
} from "lucide-react";
import { format, addYears } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Project = {
  id: string;
  project_name?: string;
  civic_address?: string;
  legal_land_description?: string;
  zoning_code?: string;
  status?: string;
  start_date?: string;
  estimated_end_date?: string;
  warranty_start_date?: string;
  estimated_budget?: number;
  selling_price?: number;
};

type Task = {
  id: string;
  project_id?: string;
  vendor_id?: string;
  task_name?: string;
  phase?: string;
  status?: string;
  city_inspection_passed?: boolean;
};

type BudgetItem = {
  id: string;
  project_id?: string;
  category_name?: string;
  estimated_cost?: number;
  actual_cost?: number;
};

type Compliance = {
  id: string;
  project_id?: string;
  alberta_one_call_status?: string;
  development_permit_issued?: boolean;
  building_permit_issued?: boolean;
  new_home_warranty_enrolled?: boolean;
  final_grade_certificate_issued?: boolean;
  occupancy_permit_issued?: boolean;
};

type ChangeOrder = {
  id: string;
  project_id?: string;
  client_approval_status?: string;
  cost_impact?: number;
};

type Vendor = {
  id: string;
  company_name?: string;
};

const statusColors: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700",
  "Pre-Construction": "bg-amber-50 text-amber-700",
  Active: "bg-emerald-50 text-emerald-700",
  Warranty: "bg-purple-50 text-purple-700",
  Completed: "bg-slate-100 text-slate-700",
};

const taskStatusColors: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "On Hold": "bg-amber-50 text-amber-700",
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export default function ManagementReports() {
  const [selectedProject, setSelectedProject] = useState("");
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson("/api/management/tasks"),
  });

  const { data: budgetItems = [] } = useQuery({
    queryKey: ["budgetItems"],
    queryFn: () => fetchJson("/api/management/budget-items"),
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ["compliance"],
    queryFn: () => fetchJson("/api/management/compliance"),
  });

  const { data: changeOrders = [] } = useQuery({
    queryKey: ["changeOrders"],
    queryFn: () => fetchJson("/api/management/change-orders"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const vendorMap = useMemo(() => {
    return vendors.reduce<Record<string, Vendor>>((acc, vendor: Vendor) => {
      acc[vendor.id] = vendor;
      return acc;
    }, {});
  }, [vendors]);

  const project = useMemo(
    () => projects.find((p: Project) => p.id === selectedProject),
    [projects, selectedProject]
  );

  const projectTasks = useMemo(
    () => tasks.filter((task: Task) => task.project_id === selectedProject),
    [tasks, selectedProject]
  );

  const projectBudget = useMemo(
    () =>
      budgetItems.filter(
        (item: BudgetItem) => item.project_id === selectedProject
      ),
    [budgetItems, selectedProject]
  );

  const projectCompliance = useMemo(
    () =>
      compliance.find(
        (item: Compliance) => item.project_id === selectedProject
      ),
    [compliance, selectedProject]
  );

  const projectChangeOrders = useMemo(
    () =>
      changeOrders.filter(
        (item: ChangeOrder) => item.project_id === selectedProject
      ),
    [changeOrders, selectedProject]
  );

  const totalEstimated = projectBudget.reduce(
    (sum: number, item: BudgetItem) => sum + (item.estimated_cost || 0),
    0
  );

  const totalActual = projectBudget.reduce(
    (sum: number, item: BudgetItem) => sum + (item.actual_cost || 0),
    0
  );

  const variance = totalActual - totalEstimated;
  const grossProfit = project
    ? (project.selling_price || 0) - totalActual
    : 0;
  const profitMargin =
    project?.selling_price && project.selling_price !== 0
      ? ((grossProfit / project.selling_price) * 100).toFixed(1)
      : "0.0";

  const completedTasks = projectTasks.filter(
    (task: Task) => task.status === "Completed"
  ).length;

  const taskProgress =
    projectTasks.length > 0
      ? ((completedTasks / projectTasks.length) * 100).toFixed(0)
      : "0";

  const changeOrderImpact = projectChangeOrders
    .filter(
      (item: ChangeOrder) => item.client_approval_status === "Approved"
    )
    .reduce((sum: number, item: ChangeOrder) => sum + (item.cost_impact || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAndArchive = async () => {
    if (!reportRef.current || !project || !selectedProject) return;

    setSaving(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      pdf.save(`${project.project_name || "report"}.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download report."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Reports</h1>
        <p className="text-slate-600">Generate detailed project reports</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <label className="text-sm font-medium mb-2 block">
            Select Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="">-- Choose a project --</option>
            {projects.map((item: Project) => (
              <option key={item.id} value={item.id}>
                {item.project_name || "Unnamed Project"}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedProject && (
        <div className="mb-8 flex gap-2 print:hidden">
          <Button
            onClick={handleDownloadAndArchive}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Download & Archive Report
              </>
            )}
          </Button>

          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      )}

      {project && (
        <div ref={reportRef} className="bg-white p-12 rounded-lg shadow-lg">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">{project.project_name}</h2>
            <div className="flex items-center gap-4 text-slate-600 mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.civic_address || "—"}
              </div>
              {project.legal_land_description && (
                <span>Legal: {project.legal_land_description}</span>
              )}
            </div>

            <div className="flex gap-4">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusColors[project.status || ""] || ""
                }`}
              >
                {project.status || "Unknown"}
              </span>
              {project.zoning_code && (
                <span className="text-slate-600">Zoning: {project.zoning_code}</span>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-slate-600 mb-1">Start Date</p>
              <p className="font-semibold">
                {project.start_date
                  ? format(new Date(project.start_date), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Est. End Date</p>
              <p className="font-semibold">
                {project.estimated_end_date
                  ? format(new Date(project.estimated_end_date), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>

            {project.warranty_start_date && (
              <>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Warranty Start</p>
                  <p className="font-semibold">
                    {format(
                      new Date(project.warranty_start_date),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Warranty Expiry</p>
                  <p className="font-semibold">
                    {format(
                      addYears(new Date(project.warranty_start_date), 1),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator className="my-8" />

          <h3 className="text-2xl font-bold mb-6">Financial Summary</h3>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Budget</p>
                <p className="text-2xl font-bold">
                  ${project.estimated_budget?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Actual Cost</p>
                <p className="text-2xl font-bold">
                  ${totalActual.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Selling Price</p>
                <p className="text-2xl font-bold">
                  ${project.selling_price?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Gross Profit</p>
                <p
                  className={`text-2xl font-bold ${
                    grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  ${grossProfit.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Variance</p>
                <p
                  className={`text-2xl font-bold ${
                    variance > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {variance > 0 ? "+" : ""}${variance.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                <p
                  className={`text-2xl font-bold ${
                    parseFloat(profitMargin) >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 mb-1">
                  Change Orders Impact
                </p>
                <p
                  className={`text-2xl font-bold ${
                    changeOrderImpact > 0 ? "text-rose-600" : ""
                  }`}
                >
                  {changeOrderImpact > 0 ? "+" : ""}
                  ${changeOrderImpact.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {projectBudget.length > 0 && (
            <>
              <Separator className="my-8" />
              <h3 className="text-2xl font-bold mb-6">Cost Breakdown</h3>
              <div className="space-y-3 mb-8">
                {projectBudget.map((item: BudgetItem) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {item.category_name || "Uncategorized"}
                      </p>
                      <p className="text-sm text-slate-600">
                        (est: ${item.estimated_cost?.toLocaleString() || 0})
                      </p>
                    </div>
                    <p className="font-bold">
                      ${item.actual_cost?.toLocaleString() || 0}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          <Separator className="my-8" />

          <h3 className="text-2xl font-bold mb-6">Task Progress</h3>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">
                {completedTasks} of {projectTasks.length} completed
              </p>
              <p className="font-bold">{taskProgress}%</p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${taskProgress}%` }}
              ></div>
            </div>
          </div>

          {projectTasks.length > 0 && (
            <div className="space-y-3 mb-8">
              {projectTasks.map((task: Task) => {
                const vendor = task.vendor_id
                  ? vendorMap[task.vendor_id]
                  : undefined;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {task.task_name || "Untitled Task"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {task.phase || "—"}
                        {vendor?.company_name ? ` • ${vendor.company_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.city_inspection_passed && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          taskStatusColors[task.status || ""] || ""
                        }`}
                      >
                        {task.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {projectCompliance && (
            <>
              <Separator className="my-8" />
              <h3 className="text-2xl font-bold mb-6">Compliance Status</h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  {projectCompliance.alberta_one_call_status === "Cleared" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>Alberta One-Call</span>
                </div>

                <div className="flex items-center gap-2">
                  {projectCompliance.development_permit_issued ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>Development Permit</span>
                </div>

                <div className="flex items-center gap-2">
                  {projectCompliance.building_permit_issued ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>Building Permit</span>
                </div>

                <div className="flex items-center gap-2">
                  {projectCompliance.new_home_warranty_enrolled ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>New Home Warranty</span>
                </div>

                <div className="flex items-center gap-2">
                  {projectCompliance.final_grade_certificate_issued ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>Final Grade</span>
                </div>

                <div className="flex items-center gap-2">
                  {projectCompliance.occupancy_permit_issued ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-slate-400" />
                  )}
                  <span>Occupancy Permit</span>
                </div>
              </div>
            </>
          )}

          <Separator className="my-8" />

          <p className="text-sm text-slate-600 text-center">
            Report generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      )}

      {!selectedProject && (
        <div className="text-center py-12">
          <p className="text-slate-600">
            Select a project above to generate a detailed report
          </p>
        </div>
      )}

      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
