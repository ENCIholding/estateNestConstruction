import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
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

  const { data: sessionData } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson<{ user: User | null }>("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const canEdit = userRole === "Admin" || userRole === "Project Manager";

  const {
    data: compliance = [],
    isLoading,
  } = useQuery({
    queryKey: ["compliance"],
    queryFn: () => fetchJson<ComplianceItem[]>("/api/management/compliance"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const projectMap = useMemo(() => {
    return projects.reduce<Record<string, Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {});
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return compliance.filter((item) => {
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
    let total = 6;
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Compliance & Safety
          </h1>
          <p className="text-slate-500">
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
            <Plus className="h-4 w-4 mr-2" />
            Add Compliance Record
          </Button>
        )}
      </div>

      <Input
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Project</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>One-Call</TableHead>
                <TableHead>Permits</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Final Grade</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((item) => {
                const project = item.project_id ? projectMap[item.project_id] : undefined;
                const score = getScore(item);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">
                          {project?.project_name || "—"}
                        </p>
                        {project?.civic_address ? (
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.civic_address}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`font-semibold ${
                          score === 100
                            ? "text-emerald-600"
                            : score >= 60
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {score}%
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          item.alberta_one_call_status === "Cleared"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }
                      >
                        {item.alberta_one_call_status || "Pending"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {item.development_permit_issued ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                        {item.building_permit_issued ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.new_home_warranty_enrolled ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>

                    <TableCell>
                      {item.final_grade_certificate_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>

                    <TableCell>
                      {item.occupancy_permit_issued ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>

                    <TableCell>
                      {canEdit && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCompliance(item);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteCompliance(item)}
                              className="text-rose-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          No compliance records found
        </div>
      )}

      <ManagementComplianceForm
        compliance={editingCompliance}
        projects={projects}
        open={showForm}
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
