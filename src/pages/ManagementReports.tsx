import React, { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
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

async function uploadFile(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/management/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let message = "Upload failed";
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
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading: loadingProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson<Task[]>("/api/management/tasks"),
  });

  const { data: budgetItems = [] } = useQuery({
    queryKey: ["budgetItems"],
    queryFn: () => fetchJson<BudgetItem[]>("/api/management/budget-items"),
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ["compliance"],
    queryFn: () => fetchJson<Compliance[]>("/api/management/compliance"),
  });

  const { data: changeOrders = [] } = useQuery({
    queryKey: ["changeOrders"],
    queryFn: () => fetchJson<ChangeOrder[]>("/api/management/change-orders"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson<Vendor[]>("/api/management/vendors"),
  });

  const vendorMap = useMemo(() => {
    return vendors.reduce<Record<string, Vendor>>((acc, vendor) => {
      acc[vendor.id] = vendor;
      return acc;
    }, {});
  }, [vendors]);

  const project = useMemo(
    () => projects.find((p) => p.id === selectedProject),
    [projects, selectedProject]
  );

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project_id === selectedProject),
    [tasks, selectedProject]
  );

  const projectBudget = useMemo(
    () => budgetItems.filter((item) => item.project_id === selectedProject),
    [budgetItems, selectedProject]
  );

  const projectCompliance = useMemo(
    () => compliance.find((item) => item.project_id === selectedProject),
    [compliance, selectedProject]
  );

  const projectChangeOrders = useMemo(
    () => changeOrders.filter((item) => item.project_id === selectedProject),
    [changeOrders, selectedProject]
  );

  const totalEstimated = projectBudget.reduce(
    (sum, item) => sum + (item.estimated_cost || 0),
    0
  );

  const totalActual = projectBudget.reduce(
    (sum, item) => sum + (item.actual_cost || 0),
    0
  );

  const variance = totalActual - totalEstimated;
  const grossProfit = project ? (project.selling_price || 0) - totalActual : 0;
  const profitMargin =
    project?.selling_price && project.selling_price !== 0
      ? ((grossProfit / project.selling_price) * 100).toFixed(1)
      : "0.0";

  const completedTasks = projectTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const taskProgress =
    projectTasks.length > 0
      ? ((completedTasks / projectTasks.length) * 100).toFixed(0)
      : "0";

  const changeOrderImpact = projectChangeOrders
    .filter((item) => item.client_approval_status === "Approved")
    .reduce((sum, item) => sum + (item.cost_impact || 0), 0);

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
      for (let i = 1; i <= pageCount; i += 1) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text("ESTATE NEST CAPITAL INC.", pdfWidth / 2, pdfHeight - 15, {
          align: "center",
        });
        pdf.text(
          "5619 KOOTOOK PLACE SW, EDMONTON, AB T6W 4V9, CANADA",
          pdfWidth / 2,
          pdfHeight - 11,
          { align: "center" }
        );
        pdf.text(
          "HELLO@ESTATENEST.CAPITAL | www.estatenest.capital",
          pdfWidth / 2,
          pdfHeight - 7,
          { align: "center" }
        );
      }

      const safeProjectName = (project.project_name || "Project")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "_");

      const fileName = `Report_${safeProjectName}_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`;

      pdf.save(fileName);

      const blob = pdf.output("blob");
      const file = new File([blob], fileName, { type: "application/pdf" });

      const uploadResult = await uploadFile(file);

      await fetchJson("/api/management/documents", {
        method: "POST",
        body: JSON.stringify({
          project_id: selectedProject,
          file_url: uploadResult.file_url,
          document_type: "Generated Report",
          uploaded_date: new Date().toISOString().split("T")[0],
          file_name: fileName,
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      await queryClient.invalidateQueries({ queryKey: ["projectDocuments"] });
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert(error instanceof Error ? error.message : "Failed to generate report.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Project Reports
          </h1>
          <p className="text-slate-500 mt-1">
            Generate detailed project reports
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-sm print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Select Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project to generate report" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.project_name || "Unnamed Project"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <>
                <Button
                  onClick={handleDownloadAndArchive}
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Download & Archive Report
                </Button>

                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {project && (
        <div ref={reportRef} className="space-y-6 print:space-y-4">
          <Card className="border-0 shadow-sm print:shadow-none print:border">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {project.project_name}
                  </h2>
                  <div className="flex items-center gap-1 text-slate-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    {project.civic_address || "—"}
                  </div>
                  {project.legal_land_description && (
                    <p className="text-sm text-slate-500 mt-1">
                      Legal: {project.legal_land_description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <Badge className={statusColors[project.status || ""] || "bg-slate-100 text-slate-700"}>
                    {project.status || "Unknown"}
                  </Badge>
                  {project.zoning_code && (
                    <p className="text-sm text-slate-500 mt-2">
                      Zoning: {project.zoning_code}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Start Date</p>
                  <p className="font-medium">
                    {project.start_date
                      ? format(new Date(project.start_date), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Est. End Date</p>
                  <p className="font-medium">
                    {project.estimated_end_date
                      ? format(new Date(project.estimated_end_date), "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>

                {project.warranty_start_date && (
                  <>
                    <div>
                      <p className="text-slate-500">Warranty Start</p>
                      <p className="font-medium">
                        {format(new Date(project.warranty_start_date), "MMM d, yyyy")}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Warranty Expiry</p>
                      <p className="font-medium">
                        {format(
                          addYears(new Date(project.warranty_start_date), 1),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Budget</p>
                  <p className="text-xl font-bold">
                    ${project.estimated_budget?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Actual Cost</p>
                  <p className="text-xl font-bold">${totalActual.toLocaleString()}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Selling Price</p>
                  <p className="text-xl font-bold">
                    ${project.selling_price?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Gross Profit</p>
                  <p
                    className={`text-xl font-bold ${
                      grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    ${grossProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Variance</p>
                  <p
                    className={`font-semibold ${
                      variance > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {variance > 0 ? "+" : ""}
                    ${variance.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Profit Margin</p>
                  <p
                    className={`font-semibold ${
                      parseFloat(profitMargin) >= 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {profitMargin}%
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Change Orders Impact</p>
                  <p
                    className={`font-semibold ${
                      changeOrderImpact > 0
                        ? "text-rose-600"
                        : changeOrderImpact < 0
                        ? "text-emerald-600"
                        : ""
                    }`}
                  >
                    {changeOrderImpact > 0 ? "+" : ""}
                    ${changeOrderImpact.toLocaleString()}
                  </p>
                </div>
              </div>

              {projectBudget.length > 0 && (
                <>
                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Cost Breakdown</h4>
                    <div className="space-y-2">
                      {projectBudget.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0"
                        >
                          <span className="text-slate-600">
                            {item.category_name || "Uncategorized"}
                          </span>
                          <div className="text-right">
                            <span className="font-medium">
                              ${item.actual_cost?.toLocaleString() || 0}
                            </span>
                            <span className="text-slate-400 ml-2">
                              (est: ${item.estimated_cost?.toLocaleString() || 0})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm print:shadow-none print:border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Task Progress</span>
                <span className="text-sm font-normal text-slate-500">
                  {completedTasks} of {projectTasks.length} completed
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Progress value={parseFloat(taskProgress)} className="h-3" />

              {projectTasks.length > 0 && (
                <div className="space-y-2">
                  {projectTasks.map((task) => {
                    const vendor = task.vendor_id ? vendorMap[task.vendor_id] : undefined;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {task.task_name || "Untitled Task"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.phase || "—"}
                            {vendor?.company_name ? ` • ${vendor.company_name}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.city_inspection_passed && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          <Badge
                            className={
                              taskStatusColors[task.status || ""] ||
                              "bg-slate-100 text-slate-700"
                            }
                            variant="secondary"
                          >
                            {task.status || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {projectCompliance && (
            <Card className="border-0 shadow-sm print:shadow-none print:border">
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {projectCompliance.alberta_one_call_status === "Cleared" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">Alberta One-Call</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projectCompliance.development_permit_issued ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">Development Permit</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projectCompliance.building_permit_issued ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">Building Permit</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projectCompliance.new_home_warranty_enrolled ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">New Home Warranty</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projectCompliance.final_grade_certificate_issued ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">Final Grade</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {projectCompliance.occupancy_permit_issued ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="text-sm">Occupancy Permit</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm text-slate-500 pt-4">
            <p>
              Report generated on{" "}
              {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      )}

      {!selectedProject && (
        <div className="text-center py-16 text-slate-500">
          <p>Select a project above to generate a detailed report</p>
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
