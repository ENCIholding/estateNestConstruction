import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clapperboard,
  ExternalLink,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  appendBuildOsAuditEntry,
  BUILDOS_VIDEO_CATEGORIES,
  BUILDOS_VISIBILITY_LEVELS,
  type BuildOsVideoRecord,
} from "@/lib/buildosWorkspace";
import {
  deleteVideo,
  loadVideos,
  purgeVideo,
  restoreVideo,
  saveVideo,
} from "@/lib/buildosShared";
import {
  fetchManagementJson,
  fetchManagementProjects,
  formatDate,
} from "@/lib/managementData";

type VideoFormState = {
  accessLevel: BuildOsVideoRecord["accessLevel"];
  category: BuildOsVideoRecord["category"];
  date: string;
  description: string;
  projectId: string;
  sourceUrl: string;
  thumbnailUrl: string;
  title: string;
  visibility: BuildOsVideoRecord["visibility"];
};

type ManagementSessionResponse = {
  authenticated: boolean;
  user: {
    app_role: string;
    username: string;
  } | null;
};

function initialForm(record?: BuildOsVideoRecord | null): VideoFormState {
  return {
    accessLevel: record?.accessLevel || "Internal",
    category: record?.category || "Project Walkthrough",
    date: record?.date || new Date().toISOString().slice(0, 10),
    description: record?.description || "",
    projectId: record?.projectId || "",
    sourceUrl: record?.sourceUrl || "",
    thumbnailUrl: record?.thumbnailUrl || "",
    title: record?.title || "",
    visibility: record?.visibility || "Internal",
  };
}

export default function ManagementVideos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BuildOsVideoRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsVideoRecord | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState<VideoFormState>(initialForm());
  const [saving, setSaving] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["management-session"],
    queryFn: async () =>
      fetchManagementJson<ManagementSessionResponse>("/api/management/session"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-videos", showArchived],
    queryFn: async () => loadVideos({ includeDeleted: showArchived }),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project.project_name])),
    [projects]
  );
  const username = session?.user?.username || "ENCI BuildOS";
  const isAdmin = session?.user?.app_role === "Admin";

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const projectName = projectMap.get(record.projectId) || "";
      return (
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        projectName.toLowerCase().includes(query)
      );
    });
  }, [projectMap, records, search]);

  async function refreshRecords() {
    await queryClient.invalidateQueries({ queryKey: ["buildos-videos"] });
  }

  function openForm(record?: BuildOsVideoRecord | null) {
    setEditingRecord(record || null);
    setForm(initialForm(record));
    setShowForm(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await saveVideo({
        ...(editingRecord || {}),
        accessLevel: form.accessLevel,
        category: form.category,
        createdBy: editingRecord?.createdBy || username,
        date: form.date,
        description: form.description,
        projectId: form.projectId,
        sourceUrl: form.sourceUrl,
        thumbnailUrl: form.thumbnailUrl,
        title: form.title,
        updatedBy: username,
        visibility: form.visibility,
      });
      toast.success("Video record saved.");
      setShowForm(false);
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video record could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteVideo(deleteTarget.id, {
        actor: username,
        reason: deleteReason,
      });
      toast.success("Video archived.");
      setDeleteTarget(null);
      setDeleteReason("");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video could not be archived.");
    }
  }

  async function handleRestore(record: BuildOsVideoRecord) {
    try {
      await restoreVideo(record.id, {
        actor: username,
        reason: "Video restored for active review.",
      });
      toast.success("Video restored.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video could not be restored.");
    }
  }

  async function handlePurge(record: BuildOsVideoRecord) {
    if (!isAdmin) {
      toast.error("Only admins can purge archived video records.");
      return;
    }

    try {
      await purgeVideo(record.id);
      toast.success("Video permanently removed.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Video purge failed.");
    }
  }

  async function markReviewed(record: BuildOsVideoRecord) {
    try {
      await saveVideo(
        appendBuildOsAuditEntry(
          {
            ...record,
            updatedBy: username,
          },
          "reviewed",
          username,
          "Video metadata reviewed for visibility and audience fit."
        )
      );
      toast.success("Review entry recorded.");
      await refreshRecords();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review entry failed.");
    }
  }

  return (
    <ManagementLayout currentPageName="videos">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Controlled Media Library
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Video Library</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              ENCI BuildOS keeps project walkthroughs, before-and-after clips, site progress
              footage, diligence explainers, and meeting videos in a controlled internal library
              before anything is shared outward.
            </p>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardContent className="flex flex-col gap-4 p-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, category, or project"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setShowArchived((value) => !value)}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {showArchived ? "Hide archived" : "Show archived"}
              </Button>
              <Button
                type="button"
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                onClick={() => openForm(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New video record
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {visibleRecords.length ? (
            visibleRecords.map((record) => {
              const latestAudit = record.auditLog?.slice(-3).reverse() || [];

              return (
                <Card key={record.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{record.title}</p>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.category}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.visibility}
                          </Badge>
                          <Badge className="rounded-full bg-muted text-muted-foreground">
                            {record.accessLevel}
                          </Badge>
                          {record.deletedAt ? (
                            <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              Archived
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {projectMap.get(record.projectId) || "Project not linked"} | Recorded{" "}
                          {formatDate(record.date)}
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {record.description || "No description recorded yet."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!record.deletedAt ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => openForm(record)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void markReviewed(record)}
                            >
                              <Clapperboard className="mr-2 h-4 w-4" />
                              Mark reviewed
                            </Button>
                            {record.sourceUrl ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => window.open(record.sourceUrl, "_blank", "noopener,noreferrer")}
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open source
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setDeleteTarget(record);
                                setDeleteReason("");
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Archive
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              onClick={() => void handleRestore(record)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restore
                            </Button>
                            {isAdmin ? (
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void handlePurge(record)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Purge
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                      <div className="dashboard-item p-4 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Record details</p>
                        <div className="mt-3 space-y-2">
                          <p>Source URL: {record.sourceUrl}</p>
                          <p>Thumbnail URL: {record.thumbnailUrl || "Not recorded"}</p>
                          <p>Created by: {record.createdBy || "Not recorded"}</p>
                          <p>Updated by: {record.updatedBy || "Not recorded"}</p>
                        </div>
                      </div>
                      <div className="dashboard-item p-4 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Latest audit entries</p>
                        <div className="mt-3 space-y-2">
                          {latestAudit.length ? (
                            latestAudit.map((entry) => (
                              <p key={entry.id}>
                                {entry.action} | {entry.actor} | {formatDate(entry.occurredAt)} |{" "}
                                {entry.detail}
                              </p>
                            ))
                          ) : (
                            <p>No audit entries recorded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="dashboard-panel p-2">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No video records match the current view.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit video record" : "Create video record"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="video-project">Project *</Label>
                <select
                  id="video-project"
                  value={form.projectId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, projectId: event.target.value }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-title">Title *</Label>
                <Input
                  id="video-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-category">Category *</Label>
                <select
                  id="video-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as BuildOsVideoRecord["category"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_VIDEO_CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-date">Date *</Label>
                <Input
                  id="video-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-visibility">Visibility *</Label>
                <select
                  id="video-visibility"
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as BuildOsVideoRecord["visibility"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_VISIBILITY_LEVELS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-access-level">Access level *</Label>
                <select
                  id="video-access-level"
                  value={form.accessLevel}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      accessLevel: event.target.value as BuildOsVideoRecord["accessLevel"],
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BUILDOS_VISIBILITY_LEVELS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Textarea
                id="video-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="video-source-url">Upload / source URL *</Label>
                <Input
                  id="video-source-url"
                  value={form.sourceUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sourceUrl: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-thumbnail-url">Thumbnail URL</Label>
                <Input
                  id="video-thumbnail-url"
                  value={form.thumbnailUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              >
                {saving ? "Saving..." : "Save video record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive video record?</AlertDialogTitle>
            <AlertDialogDescription>
              Record the reason before moving this clip out of the active ENCI media library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="video-delete-reason">Reason for archive *</Label>
            <Textarea
              id="video-delete-reason"
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()} disabled={!deleteReason.trim()}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
