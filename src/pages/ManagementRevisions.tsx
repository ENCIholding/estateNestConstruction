import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Plus, RefreshCcw } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import RevisionFormDialog, {
  type RevisionFormSubmission,
} from "@/components/revisions/RevisionFormDialog";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  REVISION_AUTHORITIES,
  REVISION_SEVERITIES,
  REVISION_STATUSES,
  buildChecklistFromLessons,
  isResolvedStatus,
  revisionSeedComments,
  revisionSeedLessons,
  revisionSeedProjects,
  type LessonLearned,
  type RevisionComment,
  type RevisionProjectOption,
  type RevisionSeverity,
  type RevisionStatus,
} from "@/data/revisionSeedData";
import { fetchManagementProjects, type ManagementProject } from "@/lib/managementData";
import { cn } from "@/lib/utils";

const ALL_FILTER_VALUE = "all";

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function getStatusBadgeClass(status: RevisionStatus) {
  if (status === "Resolved" || status === "Closed") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "Awaiting Third Party" || status === "Awaiting Reviewer") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }

  if (status === "Deferred") {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  }

  if (status === "Open" || status === "In Progress") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }

  return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
}

function getSeverityBadgeClass(severity: RevisionSeverity) {
  if (severity === "Critical") {
    return "bg-rose-600/15 text-rose-700 dark:text-rose-300";
  }

  if (severity === "High") {
    return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
  }

  if (severity === "Moderate") {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }

  if (severity === "Minor") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-slate-500/15 text-slate-700 dark:text-slate-300";
}

function buildProjectOptions(
  projects: ManagementProject[],
  comments: RevisionComment[]
): RevisionProjectOption[] {
  const map = new Map<string, RevisionProjectOption>();

  const register = (project: RevisionProjectOption) => {
    if (!project.id || map.has(project.id)) {
      return;
    }

    map.set(project.id, project);
  };

  revisionSeedProjects.forEach(register);

  projects.forEach((project) => {
    register({
      id: project.id,
      name: project.project_name || "Unnamed Project",
      address: project.civic_address || "Address not set",
    });
  });

  comments.forEach((comment) => {
    register({
      id: comment.projectId,
      name: comment.projectName,
      address: comment.projectAddress,
    });
  });

  return Array.from(map.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

function createNextCommentId(comments: RevisionComment[]) {
  const year = new Date().getFullYear();
  let index = comments.length + 1;
  let candidate = "";

  do {
    candidate = `REV-${year}-${String(index).padStart(3, "0")}`;
    index += 1;
  } while (comments.some((comment) => comment.commentId === candidate));

  return candidate;
}

export default function ManagementRevisions() {
  const [comments, setComments] = useState<RevisionComment[]>(revisionSeedComments);
  const [lessons, setLessons] = useState<LessonLearned[]>(revisionSeedLessons);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState(ALL_FILTER_VALUE);
  const [departmentFilter, setDepartmentFilter] = useState(ALL_FILTER_VALUE);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTER_VALUE);
  const [severityFilter, setSeverityFilter] = useState(ALL_FILTER_VALUE);
  const [assignedToFilter, setAssignedToFilter] = useState(ALL_FILTER_VALUE);
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<RevisionComment | null>(null);
  const [checklistItems, setChecklistItems] = useState(() =>
    buildChecklistFromLessons(revisionSeedLessons)
  );
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const { data: managementProjects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const projectOptions = useMemo(
    () => buildProjectOptions(managementProjects, comments),
    [comments, managementProjects]
  );

  const assignedToOptions = useMemo(
    () =>
      Array.from(
        new Set(
          comments
            .map((comment) => comment.assignedTo.trim())
            .filter((value) => Boolean(value))
        )
      ).sort((left, right) => left.localeCompare(right)),
    [comments]
  );

  const filteredComments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return comments
      .filter((comment) => {
        if (projectFilter !== ALL_FILTER_VALUE && comment.projectId !== projectFilter) {
          return false;
        }

        if (
          departmentFilter !== ALL_FILTER_VALUE &&
          comment.authority !== departmentFilter
        ) {
          return false;
        }

        if (statusFilter !== ALL_FILTER_VALUE && comment.status !== statusFilter) {
          return false;
        }

        if (severityFilter !== ALL_FILTER_VALUE && comment.severity !== severityFilter) {
          return false;
        }

        if (
          assignedToFilter !== ALL_FILTER_VALUE &&
          comment.assignedTo !== assignedToFilter
        ) {
          return false;
        }

        if (dateFromFilter && comment.dateReceived < dateFromFilter) {
          return false;
        }

        if (dateToFilter && comment.dateReceived > dateToFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = [
          comment.projectName,
          comment.projectAddress,
          comment.commentId,
          comment.authority,
          comment.reviewerName,
          comment.discipline,
          comment.severity,
          comment.status,
          comment.assignedTo,
          comment.sourceDocument,
          comment.relatedSheet,
          comment.codeReference,
          comment.commentSummary,
          comment.resolutionSummary,
          comment.lessonsLearned,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort((left, right) => right.dateReceived.localeCompare(left.dateReceived));
  }, [
    assignedToFilter,
    comments,
    dateFromFilter,
    dateToFilter,
    departmentFilter,
    projectFilter,
    searchQuery,
    severityFilter,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    const openItems = filteredComments.filter(
      (comment) => !isResolvedStatus(comment.status)
    ).length;
    const resolvedItems = filteredComments.filter((comment) =>
      isResolvedStatus(comment.status)
    ).length;
    const criticalItems = filteredComments.filter(
      (comment) => comment.severity === "Critical"
    ).length;
    const awaitingThirdParty = filteredComments.filter(
      (comment) => comment.status === "Awaiting Third Party"
    ).length;

    return {
      awaitingThirdParty,
      criticalItems,
      openItems,
      resolvedItems,
      totalComments: filteredComments.length,
    };
  }, [filteredComments]);

  const lessonsCaptured = lessons.length;

  const openCreateDialog = () => {
    setEditingComment(null);
    setDialogOpen(true);
  };

  const openEditDialog = (comment: RevisionComment) => {
    setEditingComment(comment);
    setDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setProjectFilter(ALL_FILTER_VALUE);
    setDepartmentFilter(ALL_FILTER_VALUE);
    setStatusFilter(ALL_FILTER_VALUE);
    setSeverityFilter(ALL_FILTER_VALUE);
    setAssignedToFilter(ALL_FILTER_VALUE);
    setDateFromFilter("");
    setDateToFilter("");
  };

  const handleRevisionSave = async (payload: RevisionFormSubmission) => {
    const now = new Date().toISOString();
    const normalizedLessons = payload.lessonsLearned?.trim();

    setComments((current) => {
      if (editingComment) {
        return current.map((comment) => {
          if (comment.id !== editingComment.id) {
            return comment;
          }

          const autoResolvedDate =
            payload.dateResolved ||
            (isResolvedStatus(payload.status) ? new Date().toISOString().slice(0, 10) : undefined);

          return {
            ...comment,
            ...payload,
            dateResolved: autoResolvedDate,
            updatedAt: now,
          };
        });
      }

      const autoResolvedDate =
        payload.dateResolved ||
        (isResolvedStatus(payload.status) ? new Date().toISOString().slice(0, 10) : undefined);

      const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? `revision-${crypto.randomUUID()}`
          : `revision-${Date.now()}`;

      const next: RevisionComment = {
        id,
        commentId: createNextCommentId(current),
        createdAt: now,
        updatedAt: now,
        dateResolved: autoResolvedDate,
        ...payload,
      };

      return [next, ...current];
    });

    if (normalizedLessons) {
      setLessons((current) => {
        const alreadyCaptured = current.some(
          (lesson) =>
            lesson.projectId === payload.projectId &&
            lesson.futurePrevention.trim().toLowerCase() ===
              normalizedLessons.toLowerCase()
        );

        if (alreadyCaptured) {
          return current;
        }

        const lessonNow = new Date().toISOString();
        const nextLesson: LessonLearned = {
          id:
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? `lesson-${crypto.randomUUID()}`
              : `lesson-${Date.now()}`,
          projectId: payload.projectId,
          projectName: payload.projectName,
          issueCategory: payload.discipline,
          whatHappened: payload.commentSummary,
          impact:
            payload.severity === "Critical" || payload.severity === "High"
              ? "High impact to permit timeline and project coordination effort."
              : "Moderate impact requiring coordination follow-up.",
          resolution: payload.resolutionSummary || "Resolution details pending.",
          futurePrevention: normalizedLessons,
          appliesToFutureProjects: true,
          createdAt: lessonNow,
          updatedAt: lessonNow,
        };

        return [nextLesson, ...current];
      });
    }
  };

  const regenerateChecklist = () => {
    const generated = buildChecklistFromLessons(lessons);
    setChecklistItems(generated);
    setChecklistState((current) => {
      const next: Record<string, boolean> = {};
      generated.forEach((item) => {
        next[item.id] = current[item.id] || false;
      });
      return next;
    });
  };

  return (
    <ManagementLayout currentPageName="revisions">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
                ENCI BuildOS
              </p>
              <h1 className="mt-3 text-3xl font-bold text-foreground">Revision Tracker</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                Municipal, lender, consultant, and project comment management.
              </p>
            </div>
            <Button
              className="rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow text-white shadow-glow"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Revision
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Comments</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary.totalComments}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Open Items</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary.openItems}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Resolved Items</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary.resolvedItems}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Critical Items</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary.criticalItems}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Awaiting Third Party</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{summary.awaitingThirdParty}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Lessons Learned Captured
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{lessonsCaptured}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl text-foreground">Smart Grouping Filters</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Group by project, authority, status, severity, assignee, and date range.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                  <Filter className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search comments, reviewer, code, lessons..."
              />

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All Projects</SelectItem>
                  {projectOptions.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by authority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All Departments</SelectItem>
                  {REVISION_AUTHORITIES.map((authority) => (
                    <SelectItem key={authority} value={authority}>
                      {authority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All Statuses</SelectItem>
                  {REVISION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All Severities</SelectItem>
                  {REVISION_SEVERITIES.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by assigned to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTER_VALUE}>All Assignees</SelectItem>
                  {assignedToOptions.map((assignee) => (
                    <SelectItem key={assignee} value={assignee}>
                      {assignee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dateFromFilter}
                onChange={(event) => setDateFromFilter(event.target.value)}
                placeholder="Date from"
              />

              <Input
                type="date"
                value={dateToFilter}
                onChange={(event) => setDateToFilter(event.target.value)}
                placeholder="Date to"
              />
            </div>
          </CardHeader>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-foreground">Revision Comments</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Review table includes municipal, lender, consultant, and inspection related feedback.
              </p>
            </div>
            <Badge className="rounded-full bg-muted text-muted-foreground">
              {filteredComments.length} rows
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Project Address</TableHead>
                  <TableHead>Comment ID</TableHead>
                  <TableHead>Date Received</TableHead>
                  <TableHead>Authority / Department</TableHead>
                  <TableHead>Reviewer Name</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Source Document</TableHead>
                  <TableHead>Related Drawing / Sheet</TableHead>
                  <TableHead>Code Reference</TableHead>
                  <TableHead>Comment Summary</TableHead>
                  <TableHead>Resolution Summary</TableHead>
                  <TableHead>Date Resolved</TableHead>
                  <TableHead>Lessons Learned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length ? (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium">{comment.projectName}</TableCell>
                      <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                        {comment.projectAddress}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-left text-enc-orange"
                          onClick={() => openEditDialog(comment)}
                        >
                          {comment.commentId}
                        </Button>
                      </TableCell>
                      <TableCell>{formatDate(comment.dateReceived)}</TableCell>
                      <TableCell>{comment.authority}</TableCell>
                      <TableCell>{comment.reviewerName}</TableCell>
                      <TableCell>{comment.discipline}</TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full", getSeverityBadgeClass(comment.severity))}>
                          {comment.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full", getStatusBadgeClass(comment.status))}>
                          {comment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(comment.dueDate)}</TableCell>
                      <TableCell>{comment.assignedTo}</TableCell>
                      <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                        {comment.sourceDocument || "Not set"}
                      </TableCell>
                      <TableCell>{comment.relatedSheet || "Not set"}</TableCell>
                      <TableCell>{comment.codeReference || "Not set"}</TableCell>
                      <TableCell className="max-w-[320px] text-xs leading-5 text-muted-foreground">
                        {comment.commentSummary}
                      </TableCell>
                      <TableCell className="max-w-[320px] text-xs leading-5 text-muted-foreground">
                        {comment.resolutionSummary || "Pending"}
                      </TableCell>
                      <TableCell>{formatDate(comment.dateResolved)}</TableCell>
                      <TableCell className="max-w-[320px] text-xs leading-5 text-muted-foreground">
                        {comment.lessonsLearned || "Not captured"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={18} className="py-8 text-center text-sm text-muted-foreground">
                      No revision comments matched your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-foreground">Lessons Learned Library</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Capture recurring issues and future prevention steps across project cycles.
              </p>
            </div>
            <Badge className="rounded-full bg-muted text-muted-foreground">
              {lessons.length} lessons
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="dashboard-item p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{lesson.projectName}</p>
                  <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                    {lesson.issueCategory}
                  </Badge>
                  <Badge
                    className={cn(
                      "rounded-full",
                      lesson.appliesToFutureProjects
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-500/10 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    Applies To Future Projects: {lesson.appliesToFutureProjects ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">What Happened:</span> {lesson.whatHappened}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Impact:</span> {lesson.impact}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Resolution:</span> {lesson.resolution}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Future Prevention Checklist:</span>{" "}
                    {lesson.futurePrevention}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-panel p-2">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-2xl text-foreground">Pre-Submission Checklist Generator</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate a submission readiness checklist from baseline controls and lessons learned.
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={regenerateChecklist}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Generate from Lessons
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklistItems.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-3"
              >
                <Checkbox
                  checked={Boolean(checklistState[item.id])}
                  onCheckedChange={(checked) =>
                    setChecklistState((current) => ({
                      ...current,
                      [item.id]: checked === true,
                    }))
                  }
                />
                <span className="flex-1 text-sm leading-6 text-foreground">{item.text}</span>
                <Badge
                  className={cn(
                    "rounded-full",
                    item.source === "lesson"
                      ? "bg-enc-orange/10 text-enc-orange"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.source === "lesson" ? "Lesson" : "Baseline"}
                </Badge>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <RevisionFormDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen);
          if (!nextOpen) {
            setEditingComment(null);
          }
        }}
        revision={editingComment}
        onSave={handleRevisionSave}
        projectOptions={projectOptions}
      />
    </ManagementLayout>
  );
}
