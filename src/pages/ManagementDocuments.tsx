import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock3,
  Download,
  ExternalLink,
  FileStack,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import BuildOsDocumentForm from "@/components/documents/BuildOsDocumentForm";
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
import Input from "@/components/ui/input";
import {
  buildProjectDocuments,
  fetchManagementProjects,
} from "@/lib/managementData";
import {
  deleteDocument,
  loadBuildOsDocuments,
  loadMasterDatabaseRecords,
  saveDocument,
  type BuildOsDocumentRecord,
} from "@/lib/buildosShared";

type DisplayDocument = {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  linkedRecordId?: string;
  linkedRecordLabel?: string;
  documentType: string;
  tags: string[];
  uploader?: string;
  uploadDate?: string;
  versionLabel?: string;
  expiryDate?: string;
  requiredForProject: boolean;
  url?: string;
  notes?: string;
  source: "registry" | "buildos";
  editable: boolean;
};

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function buildCsv(documents: DisplayDocument[]) {
  const headers = [
    "Title",
    "Type",
    "Project",
    "Linked Entity",
    "Upload Date",
    "Expiry Date",
    "Required",
    "Source",
    "URL",
  ];

  const escapeCell = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const rows = documents.map((document) => [
    document.title,
    document.documentType,
    document.projectName || "",
    document.linkedRecordLabel || "",
    document.uploadDate || "",
    document.expiryDate || "",
    document.requiredForProject ? "Yes" : "No",
    document.source,
    document.url || "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell ?? ""))).join(","))
    .join("\n");
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function isExpiringSoon(dateValue?: string) {
  if (!dateValue) {
    return false;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const ms = parsed.getTime() - Date.now();
  const days = ms / (1000 * 60 * 60 * 24);
  return days <= 30;
}

export default function ManagementDocuments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<BuildOsDocumentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BuildOsDocumentRecord | null>(null);

  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const { data: customDocuments = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });

  const { data: masterRecords = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const registryDocuments = useMemo(
    () =>
      buildProjectDocuments(projects).map<DisplayDocument>((document) => ({
        id: `registry-${document.id}`,
        title: document.kind,
        projectId: document.projectId,
        projectName: document.projectName,
        documentType: document.kind,
        tags: ["registry"],
        uploadDate: undefined,
        requiredForProject: true,
        url: document.href,
        source: "registry",
        editable: false,
      })),
    [projects]
  );

  const displayDocuments = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project.project_name]));
    const recordMap = new Map(
      masterRecords.map((record) => [
        record.id,
        `${record.companyName || record.personName} (${record.type})`,
      ])
    );

    return [
      ...registryDocuments,
      ...customDocuments.map<DisplayDocument>((document) => ({
        id: document.id,
        title: document.title,
        projectId: document.projectId,
        projectName: document.projectId ? projectMap.get(document.projectId) : undefined,
        linkedRecordId: document.linkedRecordId,
        linkedRecordLabel: document.linkedRecordId
          ? recordMap.get(document.linkedRecordId)
          : undefined,
        documentType: document.documentType,
        tags: document.tags,
        uploader: document.uploader,
        uploadDate: document.uploadDate,
        versionLabel: document.versionLabel,
        expiryDate: document.expiryDate,
        requiredForProject: document.requiredForProject,
        url: document.url,
        notes: document.notes,
        source: "buildos",
        editable: true,
      })),
    ];
  }, [customDocuments, masterRecords, projects, registryDocuments]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return displayDocuments.filter((document) => {
      const matchesSearch =
        !query ||
        document.title.toLowerCase().includes(query) ||
        (document.projectName || "").toLowerCase().includes(query) ||
        (document.linkedRecordLabel || "").toLowerCase().includes(query) ||
        document.documentType.toLowerCase().includes(query) ||
        document.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesKind =
        kindFilter === "all" || document.documentType === kindFilter;
      return matchesSearch && matchesKind;
    });
  }, [displayDocuments, kindFilter, search]);

  const documentSummary = useMemo(() => {
    const expiring = displayDocuments.filter((document) => isExpiringSoon(document.expiryDate));
    const required = displayDocuments.filter((document) => document.requiredForProject);
    const customOnly = displayDocuments.filter((document) => document.source === "buildos");

    return {
      total: displayDocuments.length,
      customOnly: customOnly.length,
      required: required.length,
      expiring: expiring.length,
    };
  }, [displayDocuments]);

  const projectReadiness = useMemo(
    () =>
      projects.map((project) => {
        const linked = displayDocuments.filter((document) => document.projectId === project.id);
        const requiredCount = linked.filter((document) => document.requiredForProject).length;
        const expiringCount = linked.filter((document) => isExpiringSoon(document.expiryDate)).length;
        return {
          id: project.id,
          name: project.project_name,
          linkedCount: linked.length,
          requiredCount,
          expiringCount,
        };
      }),
    [displayDocuments, projects]
  );

  const kinds = Array.from(new Set(displayDocuments.map((document) => document.documentType)));

  const handleSave = async (record: Partial<BuildOsDocumentRecord>) => {
    await saveDocument(record);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("buildos"),
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    await deleteDocument(deleteTarget.id);
    setDeleteTarget(null);
    await queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("buildos"),
    });
  };

  return (
    <ManagementLayout currentPageName="documents">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Document Control Center
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Documents</h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
                ENCI BuildOS now tracks project documents, relationship-linked files,
                version labels, expiry awareness, and required-record readiness. Registry
                permit links remain visible, while BuildOS documents support structured edits
                on this device.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  downloadCsv(
                    "enci-buildos-documents.csv",
                    buildCsv(filteredDocuments)
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
                onClick={() => {
                  setEditingDocument(null);
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Tracked documents</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{documentSummary.total}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Editable BuildOS docs</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {documentSummary.customOnly}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Required records</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {documentSummary.required}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Expiring / due soon</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {documentSummary.expiring}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_340px]">
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Filter document register</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search by title, project, entity, type, or tag"
                />
              </div>
              <select
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All document types</option>
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Clock3 className="h-5 w-5 text-enc-orange" />
                Project readiness snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projectReadiness.length ? (
                projectReadiness.map((project) => (
                  <div key={project.id} className="dashboard-item p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{project.name}</p>
                    <p className="mt-2">{project.linkedCount} linked document(s)</p>
                    <p className="mt-1">{project.requiredCount} marked as required</p>
                    <p className="mt-1">{project.expiringCount} expiring or due soon</p>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                  Add project records first to start building the document control register.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading document control center...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Document records could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">Tracked records</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Registry documents stay read-only. BuildOS documents can be edited,
                  versioned, and linked to both projects and relationship records.
                </p>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                {filteredDocuments.length} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredDocuments.length ? (
                filteredDocuments.map((document) => (
                  <div key={document.id} className="dashboard-item p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="dashboard-icon h-11 w-11">
                            <FileStack className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{document.title}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge className="rounded-full bg-muted text-muted-foreground">
                                {document.documentType}
                              </Badge>
                              <Badge
                                className={
                                  document.source === "registry"
                                    ? "rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300"
                                    : "rounded-full bg-enc-orange/10 text-enc-orange"
                                }
                              >
                                {document.source === "registry" ? "Registry link" : "BuildOS"}
                              </Badge>
                              {document.requiredForProject ? (
                                <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                  Required
                                </Badge>
                              ) : null}
                              {isExpiringSoon(document.expiryDate) ? (
                                <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                  Expiring soon
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">Project</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {document.projectName || "Not linked"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Entity</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {document.linkedRecordLabel || "Not linked"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Version</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {document.versionLabel || "Current"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Audit trail</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {document.uploader || "Unknown"} on {formatDate(document.uploadDate)}
                            </p>
                          </div>
                        </div>

                        {document.tags.length ? (
                          <div className="flex flex-wrap gap-2">
                            {document.tags.map((tag) => (
                              <Badge
                                key={`${document.id}-${tag}`}
                                className="rounded-full bg-enc-orange/10 text-enc-orange"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}

                        {document.notes ? (
                          <p className="text-sm leading-6 text-muted-foreground">{document.notes}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {document.url ? (
                          <Button asChild variant="outline" className="rounded-full">
                            <a href={document.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Preview
                            </a>
                          </Button>
                        ) : null}
                        {document.editable ? (
                          <>
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                const sourceDocument = customDocuments.find(
                                  (item) => item.id === document.id
                                );
                                setEditingDocument(sourceDocument || null);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              className="rounded-full text-rose-600 hover:text-rose-700"
                              onClick={() =>
                                setDeleteTarget(
                                  customDocuments.find((item) => item.id === document.id) || null
                                )
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No document records match the current filter.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BuildOsDocumentForm
        open={showForm}
        record={editingDocument}
        onClose={() => {
          setShowForm(false);
          setEditingDocument(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingDocument(null);
        }}
        onSubmitRecord={handleSave}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove document</AlertDialogTitle>
            <AlertDialogDescription>
              Remove "{deleteTarget?.title}" from the BuildOS document register?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => void handleDelete()}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
