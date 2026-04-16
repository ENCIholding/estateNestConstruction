import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  MapPin,
} from "lucide-react";
import ManagementComplianceForm from "@/components/compliance/ManagementComplianceForm";

type User = {
  id: string;
  app_role?: string;
};

type Project = {
  id: string;
  project_name?: string;
  civic_address?: string;
};

type ComplianceItem = {
  id: string;
  project_id?: string;
  alberta_one_call_status?: string;
  one_call_ticket_number?: string;
  development_permit_issued?: boolean;
  development_permit_number?: string;
  building_permit_issued?: boolean;
  building_permit_number?: string;
  new_home_warranty_enrolled?: boolean;
  warranty_certificate_number?: string;
  final_grade_certificate_issued?: boolean;
  occupancy_permit_issued?: boolean;
  notes?: string;
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export default function ManagementCompliance() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState<ComplianceItem | null>(null);
  const [deleteCompliance, setDeleteCompliance] = useState<ComplianceItem | null>(null);

  const queryClient = useQueryClient();

  const { data: sessionData } = useQuery<{ user?: User } | null>({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user?: User }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin" || userRole === "Project Manager";

  const { data: compliance = [], isLoading } = useQuery<ComplianceItem[]>({
    queryKey: ["compliance"],
    queryFn: () => fetchJson<ComplianceItem[]>("/api/management/compliance"),
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project: Project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return compliance.filter((item: ComplianceItem) => {
      const project = item.project_id ? projectMap[item.project_id] : undefined;
      const projectName = project?.project_name || "";
      const civicAddress = project?.civic_address || "";

      if (!q) return true;

      return (
        projectName.toLowerCase().includes(q) ||
        civicAddress.toLowerCase().includes(q) ||
        item.one_call_ticket_number?.toLowerCase().includes(q) ||
        item.development_permit_number?.toLowerCase().includes(q) ||
        item.building_permit_number?.toLowerCase().includes(q) ||
        item.warranty_certificate_number?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    });
  }, [compliance, projectMap, search]);

  const getScore = (item: ComplianceItem) => {
    const total = 6;
    let done = 0;

    if (item.alberta_one_call_status === "Cleared") done++;
    if (item.development_permit_issued) done++;
    if (item.building_permit_issued) done++;
    if (item.new_home_warranty_enrolled) done++;
    if (item.final_grade_certificate_issued) done++;
    if (item.occupancy_permit_issued) done++;

    return Math.round((done / total) * 100);
  };

  const handleDelete = async () => {
    if (!deleteCompliance?.id) return;

    try {
      await fetchJson(`/api/management/compliance/${deleteCompliance.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({ queryKey: ["compliance"] });
      setDeleteCompliance(null);
    } catch (error) {
      console.error("Failed to delete compliance record:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete compliance record."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compliance & Safety</h1>
          <p className="text-slate-600">
            Track permits and regulatory requirements
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={() => {
              setEditingCompliance(null);
              setShowForm(true);
            }}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Compliance Record
          </Button>
        )}
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <Input
            placeholder="Search compliance records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((item: ComplianceItem) => {
          const project = item.project_id
            ? projectMap[item.project_id]
            : undefined;
          const score = getScore(item);

          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {project?.project_name || "—"}
                      </h3>
                      {project?.civic_address && (
                        <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                          <MapPin className="h-3 w-3" />
                          {project.civic_address}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          score >= 80
                            ? "text-green-600"
                            : score >= 60
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {score}%
                      </p>
                      <p className="text-xs text-slate-600">Completion</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">One-Call</p>
                      <p className="text-sm font-medium">
                        {item.alberta_one_call_status || "Pending"}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">Dev Permit</p>
                      {item.development_permit_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mx-auto" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">Build Permit</p>
                      {item.building_permit_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mx-auto" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">Warranty</p>
                      {item.new_home_warranty_enrolled ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mx-auto" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">Final Grade</p>
                      {item.final_grade_certificate_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mx-auto" />
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-slate-600 mb-1">Occupancy</p>
                      {item.occupancy_permit_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400 mx-auto" />
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCompliance(item);
                          setShowForm(true);
                        }}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteCompliance(item)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No compliance records found</p>
        </div>
      )}

      <ManagementComplianceForm
        open={showForm}
        compliance={editingCompliance}
        projects={projects}
        onClose={() => {
          setShowForm(false);
          setEditingCompliance(null);
        }}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["compliance"] });
          setShowForm(false);
          setEditingCompliance(null);
        }}
      />

      <AlertDialog
        open={!!deleteCompliance}
        onOpenChange={() => setDeleteCompliance(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Compliance Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this compliance record? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
