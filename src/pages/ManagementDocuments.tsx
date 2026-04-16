import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileStack, Search, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import {
  buildProjectDocuments,
  fetchManagementProjects,
} from "@/lib/managementData";

export default function ManagementDocuments() {
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");

  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const documents = useMemo(() => buildProjectDocuments(projects), [projects]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.projectName.toLowerCase().includes(query) ||
        document.kind.toLowerCase().includes(query);
      const matchesKind = kindFilter === "all" || document.kind === kindFilter;
      return matchesSearch && matchesKind;
    });
  }, [documents, kindFilter, search]);

  const projectsWithoutDocuments = projects.filter((project) => {
    return ![
      project.development_permit_pdf,
      project.building_permit_pdf,
      project.real_property_report,
    ].some(Boolean);
  }).length;

  return (
    <ManagementLayout currentPageName="documents">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Document Register
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Documents</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              This module now lists only the real diligence links attached to each project. File uploads remain offline until storage, authorization, and retention rules are in place.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Linked diligence records</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{documents.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects with no linked files</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{projectsWithoutDocuments}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects represented</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {new Set(documents.map((document) => document.projectId)).size}
              </p>
            </CardContent>
          </Card>
        </div>

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
                placeholder="Search by project or document type"
              />
            </div>
            <select
              value={kindFilter}
              onChange={(event) => setKindFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All document types</option>
              {Array.from(new Set(documents.map((document) => document.kind))).map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading linked documents...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Document links could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-foreground">Linked records</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Only project-linked URLs are displayed here.
                </p>
              </div>
              <Badge className="rounded-full bg-muted text-muted-foreground">
                {filteredDocuments.length} shown
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredDocuments.length ? (
                filteredDocuments.map((document) => (
                  <a
                    key={document.id}
                    href={document.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dashboard-item flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="dashboard-icon h-11 w-11">
                        <FileStack className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{document.projectName}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{document.kind}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge className="rounded-full bg-muted text-muted-foreground">
                        External link
                      </Badge>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No linked documents match the current filter.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}
