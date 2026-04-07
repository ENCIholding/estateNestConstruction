import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { format, addYears } from "date-fns";
import ManagementProjectForm from "@/components/projects/ManagementProjectForm";

const statusColors: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700 border-blue-200",
  "Pre-Construction": "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Warranty: "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = "API error";
    try {
      const errorData = await res.json();
      message = errorData?.error || message;
    } catch {
      message = `${res.status} ${res.statusText}`;
    }
    throw new Error(message);
  }

  return res.json();
}

export default function ManagementProjectDetails() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const projectId = searchParams.get("id");

  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn: () => fetchJson("/api/management/session"),
  });

  const user = sessionData?.user;
  const role = user?.app_role || "Admin";

  const showFinancials = role === "Admin" || role === "Accountant";
  const canEdit = role === "Admin";

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchJson(`/api/management/projects/${projectId}`),
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchJson(`/api/management/tasks?project_id=${projectId}`),
    enabled: !!projectId,
  });

  const { data: budgetItems = [] } = useQuery({
    queryKey: ["budget", projectId],
    queryFn: () =>
      fetchJson(`/api/management/budget-items?project_id=${projectId}`),
    enabled: !!projectId,
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ["compliance", projectId],
    queryFn: () =>
      fetchJson(`/api/management/compliance?project_id=${projectId}`),
    enabled: !!projectId,
  });

  const { data: changeOrders = [] } = useQuery({
    queryKey: ["changeOrders", projectId],
    queryFn: () =>
      fetchJson(`/api/management/change-orders?project_id=${projectId}`),
    enabled: !!projectId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ["docs", projectId],
    queryFn: () =>
      fetchJson(`/api/management/documents?project_id=${projectId}`),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Project not found</p>
        <Link to="/management/projects">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const totalActual = budgetItems.reduce(
    (s: number, i: any) => s + (i.actual_cost || 0),
    0
  );

  const grossProfit = (project.selling_price || 0) - totalActual;

  const profitMargin = project.selling_price
    ? ((grossProfit / project.selling_price) * 100).toFixed(1)
    : "0";

  const completedTasks = tasks.filter(
    (t: any) => t.status === "Completed"
  ).length;

  const taskProgress = tasks.length
    ? ((completedTasks / tasks.length) * 100).toFixed(0)
    : "0";

  const warrantyExpiry = project.warranty_start_date
    ? addYears(new Date(project.warranty_start_date), 1)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <Link to="/management/projects" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.project_name}</h1>
            <div className="flex items-center gap-4 text-slate-600">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  statusColors[project.status] || ""
                }`}
              >
                {project.status}
              </span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.civic_address}
              </div>
            </div>
          </div>

          {canEdit && (
            <Button onClick={() => setShowForm(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskProgress}%</div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${taskProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {showFinancials && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Budget Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalActual.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${grossProfit.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Margin {profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Change Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{changeOrders.length}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 font-medium ${
              activeTab === "tasks"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600"
            }`}
          >
            Tasks
          </button>
          {showFinancials && (
            <button
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-2 font-medium ${
                activeTab === "financials"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-slate-600"
              }`}
            >
              Financials
            </button>
          )}
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 font-medium ${
              activeTab === "documents"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600"
            }`}
          >
            Documents
          </button>
        </div>

        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Start Date</p>
                  <p className="font-medium">{project.start_date || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Estimated End</p>
                  <p className="font-medium">
                    {project.estimated_end_date || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Warranty Expiry</p>
                  <p className="font-medium">
                    {warrantyExpiry
                      ? format(warrantyExpiry, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Legal Description
                  </p>
                  <p className="font-medium">
                    {project.legal_land_description || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card>
            <CardHeader>
              <CardTitle>Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <span className="font-medium">{t.task_name}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No tasks found</p>
              )}
            </CardContent>
          </Card>
        )}

        {showFinancials && activeTab === "financials" && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Items</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetItems.length > 0 ? (
                <div className="space-y-2">
                  {budgetItems.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <span className="font-medium">{b.category_name}</span>
                      <span>${(b.actual_cost || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No budget items found</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-50 rounded hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{doc.file_name}</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No documents found</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showForm && (
        <ManagementProjectForm
          project={project}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries({
              queryKey: ["project", projectId],
            });
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
