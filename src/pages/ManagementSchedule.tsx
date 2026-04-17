import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Search, TimerReset, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Input from "@/components/ui/input";
import { getTaskAssigneeLabel, isTaskOverdue } from "@/lib/buildosTasks";
import {
  buildProjectScheduleEntries,
  buildUndatedMilestones,
  fetchManagementProjects,
  formatDate,
} from "@/lib/managementData";
import { loadMasterDatabaseRecords, loadTasks } from "@/lib/buildosShared";

const categoryLabels = {
  actual: "Actual completion",
  review: "Annual review",
  start: "Start",
  target: "Target completion",
  warranty: "Warranty start",
} as const;

export default function ManagementSchedule() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });
  const { data: records = [] } = useQuery({
    queryKey: ["buildos-master-database"],
    queryFn: async () => loadMasterDatabaseRecords(),
  });

  const scheduleEntries = useMemo(
    () => buildProjectScheduleEntries(projects),
    [projects]
  );
  const undatedMilestones = useMemo(
    () => buildUndatedMilestones(projects),
    [projects]
  );

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return scheduleEntries.filter((entry) => {
      const matchesSearch =
        !query ||
        entry.projectName.toLowerCase().includes(query) ||
        entry.label.toLowerCase().includes(query) ||
        entry.detail.toLowerCase().includes(query);
      const matchesCategory =
        categoryFilter === "all" || entry.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, scheduleEntries, search]);

  const upcomingCount = scheduleEntries.filter((entry) => entry.isUpcoming).length;
  const overdueCount = scheduleEntries.filter((entry) => entry.isOverdue).length;
  const projectsMissingDates = projects.filter(
    (project) => !project.start_date || !project.estimated_end_date
  ).length;

  return (
    <ManagementLayout currentPageName="schedule">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Schedule Readiness
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Schedule</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              Registry checkpoints still anchor the schedule baseline, and the shared BuildOS task model now adds live execution dates, milestones, and due-date pressure.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Dated checkpoints</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{scheduleEntries.length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Upcoming in 30 days</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{upcomingCount}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Past target dates / overdue tasks</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{overdueCount + tasks.filter((task) => isTaskOverdue(task)).length}</p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Projects missing core dates</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{projectsMissingDates}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Filter timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by project, checkpoint, or note"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All checkpoint types</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading registry-backed schedule checkpoints...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              The schedule registry could not be loaded. Review the management API before relying on date controls.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="dashboard-panel p-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-foreground">Timeline checkpoints</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sorted from the current project registry. Only recorded dates are displayed.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  {filteredEntries.length} shown
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredEntries.length ? (
                  filteredEntries.map((entry) => (
                    <div key={entry.id} className="dashboard-item p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-foreground">{entry.projectName}</p>
                            <Badge className="rounded-full bg-muted text-muted-foreground">
                              {categoryLabels[entry.category]}
                            </Badge>
                            {entry.isOverdue ? (
                              <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                                Overdue
                              </Badge>
                            ) : entry.isUpcoming ? (
                              <Badge className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                Upcoming
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm font-medium text-foreground">{entry.label}</p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.detail}</p>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(entry.date)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                    No recorded checkpoints match the current filter. This page stays empty rather than inventing a task schedule.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-panel p-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <CalendarClock className="h-5 w-5 text-enc-orange" />
                    Undated next milestones
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These notes are useful for planning conversations but are not treated as hard schedule commitments until dated.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  {undatedMilestones.length} noted
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {undatedMilestones.length ? (
                  undatedMilestones.map((milestone) => (
                    <div key={`${milestone.projectId}-${milestone.detail}`} className="dashboard-item p-4">
                      <p className="text-sm font-semibold text-foreground">{milestone.projectName}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                    No undated milestones are recorded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-panel p-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <TimerReset className="h-5 w-5 text-enc-orange" />
                    Task-driven schedule pressure
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    These entries come from live BuildOS tasks and feed Gantt, project drilldowns, automation, and mobile updates.
                  </p>
                </div>
                <Badge className="rounded-full bg-muted text-muted-foreground">
                  {tasks.length} tasks
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks
                    .slice()
                    .sort((left, right) => {
                      const leftDate = new Date(left.dueDate || left.startDate || 0).getTime();
                      const rightDate = new Date(right.dueDate || right.startDate || 0).getTime();
                      return leftDate - rightDate;
                    })
                    .slice(0, 8)
                    .map((task) => (
                      <div key={task.id} className="dashboard-item p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">{task.title}</p>
                              <Badge className="rounded-full bg-muted text-muted-foreground">
                                {task.status}
                              </Badge>
                              {task.milestone ? (
                                <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">
                                  Milestone
                                </Badge>
                              ) : null}
                              {isTaskOverdue(task) ? (
                                <Badge className="rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300">
                                  Overdue
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {projects.find((project) => project.id === task.projectId)?.project_name || "Unlinked project"} · {task.phase}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Assignee: {getTaskAssigneeLabel(task, records)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(task.dueDate || task.startDate)}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="dashboard-item p-4 text-sm leading-6 text-muted-foreground">
                    No BuildOS task records exist yet. Add tasks in Project Tasks to activate live schedule sequencing.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ManagementLayout>
  );
}
