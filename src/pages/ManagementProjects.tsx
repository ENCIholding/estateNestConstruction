import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileCheck2,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import ManagementProjectForm from "@/components/projects/ManagementProjectForm";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ManagementProject,
  fetchManagementJson,
} from "@/lib/managementData";
import {
  deleteProjectFromWorkspace,
  getProjectWorkspaceBadge,
  mergeProjectsWithWorkspace,
  saveProjectToWorkspace,
} from "@/lib/managementWorkspace";
import {
  loadBuildOsProjectParticipantAssignments,
  loadBuildOsDocuments,
  loadBuildOsTasks,
} from "@/lib/buildosShared";

type ProjectsStatus = {
  projectRegistry: {
    editable: boolean;
    source: "environment" | "temporary" | "unconfigured";
  };
};

function formatCurrency(value?: number) {
  if (!value) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusClass(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "active") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (normalized === "pre-construction" || normalized === "planning") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (normalized === "completed" || normalized === "warranty") {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  }

  return "bg-muted text-muted-foreground";
}

function getRegistryMessage(source: ProjectsStatus["projectRegistry"]["source"]) {
  if (source === "environment") {
    return "Deployment records are loaded from MANAGEMENT_PROJECTS_JSON. You can now create browser workspace drafts, overrides, and local removals without changing the deployment dataset.";
  }

  if (source === "temporary") {
    return "Server memory records are available, and browser workspace changes will layer on top inside this device.";
  }

  return "No deployment-backed project registry is configured yet. You can still add browser workspace projects right now so operations can move forward honestly.";
}

function invalidateProjectQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) &&
        typeof query.queryKey[0] === "string" &&
        query.queryKey[0].startsWith("management"),
    }),
  ]);
}

export default function ManagementProjects() {
  const queryClient = useQueryClient();
  const [workspaceRevision, setWorkspaceRevision] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<ManagementProject | null>(null);

  const {
    data: serverProjects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["management-projects-server"],
    queryFn: async () => {
      try {
        return await fetchManagementJson<ManagementProject[]>("/api/management/projects");
      } catch {
        return [];
      }
    },
  });

  const { data: status } = useQuery({
    queryKey: ["management-status"],
    queryFn: () => fetchManagementJson<ProjectsStatus>("/api/management/status"),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadBuildOsTasks(),
  });
  const { data: documents = [] } = useQuery({
    queryKey: ["buildos-documents"],
    queryFn: async () => loadBuildOsDocuments(),
  });
  const { data: participantAssignments = [] } = useQuery({
    queryKey: ["buildos-project-participants"],
    queryFn: async () => loadBuildOsProjectParticipantAssignments(),
  });

  const mergedRegistry = useMemo(
    () => mergeProjectsWithWorkspace(serverProjects),
    [serverProjects, workspaceRevision]
  );

  const handleSave = async (project: ManagementProject) => {
    saveProjectToWorkspace(project);
    setWorkspaceRevision((value) => value + 1);
    await invalidateProjectQueries(queryClient);
  };

  const handleDelete = async (project: ManagementProject) => {
    deleteProjectFromWorkspace(project.id, mergedRegistry.serverIds.has(project.id));
    setWorkspaceRevision((value) => value + 1);
    await invalidateProjectQueries(queryClient);
  };

  return (
    <ManagementLayout currentPageName="projects">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                Project Registry
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Projects</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                Deployment records stay honest and read-only, while browser workspace records let you add, update, and remove projects on this device right now.
              </p>
            </div>

            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={() => {
                setEditingProject(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Registry status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              {getRegistryMessage(status?.projectRegistry.source || "unconfigured")}
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge className="rounded-full bg-muted text-muted-foreground">Deployment Record</Badge>
              <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">Workspace Draft</Badge>
              <Badge className="rounded-full bg-enc-yellow/20 text-foreground">Workspace Override</Badge>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading project registry...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
              Deployment-backed projects could not be loaded, but browser workspace records can still be added on this device.
            </CardContent>
          </Card>
        ) : mergedRegistry.projects.length ? (
          <div className="grid gap-4">
            {mergedRegistry.projects.map((project) => {
              const diligenceLinks = [
                project.development_permit_pdf,
                project.building_permit_pdf,
                project.real_property_report,
              ].filter(Boolean).length;

              const sourceBadge = getProjectWorkspaceBadge(
                project.id,
                mergedRegistry.serverIds,
                mergedRegistry.upserts
              );

              return (
                <Card key={project.id} className="dashboard-panel p-2">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {project.project_name}
                          </h2>
                          <Badge className={`rounded-full ${getStatusClass(project.status)}`}>
                            {project.status}
                          </Badge>
                          <Badge
                            className={
                              sourceBadge === "Deployment Record"
                                ? "rounded-full bg-muted text-muted-foreground"
                                : sourceBadge === "Workspace Override"
                                  ? "rounded-full bg-enc-yellow/20 text-foreground"
                                  : "rounded-full bg-enc-orange/10 text-enc-orange"
                            }
                          >
                            {sourceBadge}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-enc-orange" />
                            {project.civic_address}
                          </span>
                          <span>Budget baseline: {formatCurrency(project.estimated_budget)}</span>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Responsibility</p>
                            <p className="mt-2">
                              {project.project_manager || project.project_owner || "Not assigned"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Primary contact</p>
                            <p className="mt-2 flex items-center gap-2">
                              <Mail className="h-4 w-4 text-enc-orange" />
                              {project.primary_contact_email || "Not set"}
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Diligence references</p>
                            <p className="mt-2 flex items-center gap-2">
                              <FileCheck2 className="h-4 w-4 text-enc-orange" />
                              {diligenceLinks} linked document{diligenceLinks === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Execution tasks</p>
                            <p className="mt-2">
                              {tasks.filter((task) => task.projectId === project.id).length} linked task(s)
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">BuildOS documents</p>
                            <p className="mt-2">
                              {documents.filter((item) => item.projectId === project.id).length} linked record(s)
                            </p>
                          </div>
                          <div className="dashboard-item p-3">
                            <p className="font-medium text-foreground">Deal participants</p>
                            <p className="mt-2">
                              {(() => {
                                const assignment = participantAssignments.find(
                                  (item) => item.projectId === project.id
                                );
                                if (!assignment) return "Not assigned";
                                return (
                                  [
                                    assignment.sellerSideRealtorId,
                                    assignment.buyerSideRealtorId,
                                    assignment.sellerSideLawyerId,
                                    assignment.buyerSideLawyerId,
                                    ...assignment.stakeholderClientIds,
                                    ...assignment.buyerIds,
                                    ...assignment.lenderIds,
                                    ...assignment.investorIds,
                                    ...assignment.otherRecordIds,
                                  ].filter(Boolean).length || "Not assigned"
                                );
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="rounded-full">
                          <Link to={`/management/project-details?id=${project.id}`}>
                            <Link2 className="mr-2 h-4 w-4" />
                            Open project
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setEditingProject(project);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full text-rose-600 hover:text-rose-700"
                          onClick={() => void handleDelete(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardContent className="space-y-4 p-6">
              <p className="text-base font-semibold text-foreground">No project records are available yet</p>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Use the Add Record button to start your browser workspace registry now. Those records are honest device-local drafts until a durable backend is connected.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <ManagementProjectForm
        open={showForm}
        project={editingProject}
        onClose={() => {
          setShowForm(false);
          setEditingProject(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingProject(null);
        }}
        onSubmitRecord={handleSave}
      />
    </ManagementLayout>
  );
}
