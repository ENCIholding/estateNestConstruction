import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Pencil, Plus, Search, Trash2 } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchManagementProjects } from "@/lib/managementData";
import { deleteDailyLog, loadDailyLogs, saveDailyLog, type BuildOsDailyLog } from "@/lib/buildosShared";

type DailyLogFormState = {
  projectId: string;
  date: string;
  weather: string;
  crewCount: string;
  tradesOnsite: string;
  materialsDelivered: string;
  inspections: string;
  delaysBlockers: string;
  safetyNotes: string;
  comments: string;
  photoUrl: string;
  createdBy: string;
};

function initialForm(record?: BuildOsDailyLog | null): DailyLogFormState {
  return {
    projectId: record?.projectId || "",
    date: record?.date || new Date().toISOString().slice(0, 10),
    weather: record?.weather || "",
    crewCount: record?.crewCount ? String(record.crewCount) : "",
    tradesOnsite: (record?.tradesOnsite || []).join(", "),
    materialsDelivered: record?.materialsDelivered || "",
    inspections: record?.inspections || "",
    delaysBlockers: record?.delaysBlockers || "",
    safetyNotes: record?.safetyNotes || "",
    comments: record?.comments || "",
    photoUrl: record?.photoUrl || "",
    createdBy: record?.createdBy || "Estate Nest Team",
  };
}

export default function ManagementDailyLog() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsDailyLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsDailyLog | null>(null);
  const [form, setForm] = useState<DailyLogFormState>(initialForm());
  const [error, setError] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["buildos-daily-logs"],
    queryFn: async () => loadDailyLogs(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project.project_name])),
    [projects]
  );

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesProject = projectFilter === "all" || log.projectId === projectFilter;
      const matchesSearch =
        !query ||
        (projectMap.get(log.projectId) || "").toLowerCase().includes(query) ||
        (log.weather || "").toLowerCase().includes(query) ||
        (log.comments || "").toLowerCase().includes(query) ||
        (log.delaysBlockers || "").toLowerCase().includes(query) ||
        (log.tradesOnsite || []).some((trade) => trade.toLowerCase().includes(query));

      return matchesProject && matchesSearch;
    });
  }, [logs, projectFilter, projectMap, search]);

  const openForm = (record?: BuildOsDailyLog | null) => {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setError("");
    setShowForm(true);
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.projectId || !form.date) {
      setError("Project and date are required.");
      return;
    }

    await saveDailyLog({
      id: editingRecord?.id,
      projectId: form.projectId,
      date: form.date,
      weather: form.weather,
      crewCount: Number(form.crewCount) || undefined,
      tradesOnsite: form.tradesOnsite.split(",").map((item) => item.trim()).filter(Boolean),
      materialsDelivered: form.materialsDelivered,
      inspections: form.inspections,
      delaysBlockers: form.delaysBlockers,
      safetyNotes: form.safetyNotes,
      comments: form.comments,
      photoUrl: form.photoUrl,
      createdBy: form.createdBy,
    });

    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });

    setShowForm(false);
    setEditingRecord(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDailyLog(deleteTarget.id);
    setDeleteTarget(null);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        (query.queryKey[0].startsWith("buildos") || query.queryKey[0].startsWith("management")),
    });
  };

  return (
    <ManagementLayout currentPageName="daily-log">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Field Execution
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Daily Log</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                Daily logs capture weather, crews, trades onsite, materials, inspections, delays, safety notes, and field comments without forcing a bloated site diary workflow.
              </p>
            </div>

            <Button className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow" onClick={() => openForm()}>
              <Plus className="mr-2 h-4 w-4" />
              New Daily Log
            </Button>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter field logs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search project, weather, comments, delays, or trades"
              />
            </div>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {filteredLogs.length ? (
          <div className="grid gap-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="dashboard-panel p-2">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">
                          {projectMap.get(log.projectId) || "Unlinked project"}
                        </h2>
                        <Badge className="rounded-full bg-muted text-muted-foreground">{log.date}</Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Weather</p>
                          <p className="mt-2 text-sm text-muted-foreground">{log.weather || "Not recorded"}</p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Crew count</p>
                          <p className="mt-2 text-sm text-muted-foreground">{log.crewCount || 0}</p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Trades onsite</p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {log.tradesOnsite.join(", ") || "Not recorded"}
                          </p>
                        </div>
                        <div className="dashboard-item p-3">
                          <p className="text-sm font-medium text-foreground">Created by</p>
                          <p className="mt-2 text-sm text-muted-foreground">{log.createdBy || "Not recorded"}</p>
                        </div>
                      </div>

                      {[
                        ["Materials delivered", log.materialsDelivered],
                        ["Inspections", log.inspections],
                        ["Delays / blockers", log.delaysBlockers],
                        ["Safety / compliance notes", log.safetyNotes],
                        ["Comments", log.comments],
                      ].map(([label, value]) =>
                        value ? (
                          <div key={`${log.id}-${label}`} className="dashboard-item p-3">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
                          </div>
                        ) : null
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="rounded-full" onClick={() => openForm(log)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteTarget(log)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              No daily logs match the current filter yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={(nextOpen) => !nextOpen && setShowForm(false)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Daily Log" : "New Daily Log"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6">
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project</Label>
                <select
                  value={form.projectId}
                  onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Weather</Label>
                <Input value={form.weather} onChange={(event) => setForm((current) => ({ ...current, weather: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Crew count</Label>
                <Input type="number" value={form.crewCount} onChange={(event) => setForm((current) => ({ ...current, crewCount: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Trades onsite</Label>
                <Input value={form.tradesOnsite} onChange={(event) => setForm((current) => ({ ...current, tradesOnsite: event.target.value }))} placeholder="Framing, Electrical, Plumbing" />
              </div>
              <div className="space-y-2">
                <Label>Materials delivered</Label>
                <Textarea rows={2} value={form.materialsDelivered} onChange={(event) => setForm((current) => ({ ...current, materialsDelivered: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Inspections</Label>
                <Textarea rows={2} value={form.inspections} onChange={(event) => setForm((current) => ({ ...current, inspections: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Delays / blockers</Label>
                <Textarea rows={3} value={form.delaysBlockers} onChange={(event) => setForm((current) => ({ ...current, delaysBlockers: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Safety / compliance notes</Label>
                <Textarea rows={3} value={form.safetyNotes} onChange={(event) => setForm((current) => ({ ...current, safetyNotes: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Photo URL</Label>
                <Input value={form.photoUrl} onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Created by</Label>
                <Input value={form.createdBy} onChange={(event) => setForm((current) => ({ ...current, createdBy: event.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Comments</Label>
                <Textarea rows={4} value={form.comments} onChange={(event) => setForm((current) => ({ ...current, comments: event.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingRecord ? "Update Daily Log" : "Save Daily Log"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove daily log</AlertDialogTitle>
            <AlertDialogDescription>
              Remove this daily log entry from the project record?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => void handleDelete()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
