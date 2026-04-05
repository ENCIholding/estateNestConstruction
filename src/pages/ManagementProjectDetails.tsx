import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import ProjectForm from "@/components/projects/ProjectForm";

const statusColors: Record<string, string> = {
  Planning: "bg-blue-50 text-blue-700 border-blue-200",
  "Pre-Construction": "bg-amber-50 text-amber-700 border-amber-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Warranty: "bg-purple-50 text-purple-700 border-purple-200",
  Completed: "bg-slate-100 text-slate-700 border-slate-200",
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) throw new Error("API error");
  return res.json();
}

export default function ManagementProjectDetails() {
  const [showForm, setShowForm] = useState(false);
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
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  // ===== CALCULATIONS =====
  const totalActual = budgetItems.reduce(
    (s: number, i: any) => s + (i.actual_cost || 0),
    0
  );

  const grossProfit = (project.selling_price || 0) - totalActual;

  const profitMargin = project.selling_price
    ? ((grossProfit / project.selling_price) * 100).toFixed(1)
    : 0;

  const completedTasks = tasks.filter(
    (t: any) => t.status === "Completed"
  ).length;

  const taskProgress = tasks.length
    ? ((completedTasks / tasks.length) * 100).toFixed(0)
    : 0;

  const warrantyExpiry = project.warranty_start_date
    ? addYears(new Date(project.warranty_start_date), 1)
    : null;

  const projectCompliance = compliance[0];

  // ===== UI =====
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link to="/management/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
            <Badge className={statusColors[project.status]}>
              {project.status}
            </Badge>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {project.civic_address}
            </p>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => setShowForm(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm">Task Progress</p>
          <p className="text-xl font-bold">{taskProgress}%</p>
          <Progress value={parseInt(taskProgress)} />
        </Card>

        {showFinancials && (
          <>
            <Card className="p-4">
              <p className="text-sm">Budget Used</p>
              <p className="text-xl font-bold">
                ${totalActual.toLocaleString()}
              </p>
            </Card>

            <Card className="p-4">
              <p className="text-sm">Profit</p>
              <p className="text-xl font-bold">
                ${grossProfit.toLocaleString()}
              </p>
              <p className="text-xs">Margin {profitMargin}%</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm">Change Orders</p>
              <p className="text-xl font-bold">
                {changeOrders.length}
              </p>
            </Card>
          </>
        )}
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          {showFinancials && (
            <TabsTrigger value="financials">Financials</TabsTrigger>
          )}
          <TabsTrigger value="documents">Docs</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <Card>
            <CardContent className="space-y-2">
              <p>Start: {project.start_date}</p>
              <p>End: {project.estimated_end_date}</p>
              <p>
                Warranty Expiry:{" "}
                {warrantyExpiry
                  ? format(warrantyExpiry, "MMM d yyyy")
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TASKS */}
        <TabsContent value="tasks">
          {tasks.map((t: any) => (
            <Card key={t.id} className="p-4 mb-2">
              <p>{t.task_name}</p>
              <Badge>{t.status}</Badge>
            </Card>
          ))}
        </TabsContent>

        {/* FINANCIALS */}
        <TabsContent value="financials">
          {budgetItems.map((b: any) => (
            <Card key={b.id} className="p-4 mb-2">
              <p>{b.category_name}</p>
              <p>${b.actual_cost}</p>
            </Card>
          ))}
        </TabsContent>

        {/* DOCUMENTS */}
        <TabsContent value="documents">
          {documents.map((doc: any) => (
            <a
              key={doc.id}
              href={doc.file_url}
              target="_blank"
              className="flex gap-2 p-2 border"
            >
              <FileText />
              {doc.file_name}
              <ExternalLink />
            </a>
          ))}
        </TabsContent>
      </Tabs>

      {/* FORM */}
      {showForm && (
        <ProjectForm
          project={project}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries({
              queryKey: ["project", projectId],
            });
          }}
        />
      )}
    </div>
  );
}
