import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchManagementProjects } from "@/lib/managementData";
import { getScheduleDrivingTaskIds, getTaskDurationDays, parseTaskDate } from "@/lib/buildosTasks";
import { loadTasks } from "@/lib/buildosShared";

const phaseColors: Record<string, string> = {
  "Pre-Construction": "#c43c2f",
  Permits: "#d97706",
  Foundation: "#ca8a04",
  Framing: "#2f6f94",
  "Rough-Ins": "#0f766e",
  Finishes: "#5b7c2b",
  Closeout: "#6b7280",
  Warranty: "#7c3aed",
  Other: "#334155",
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function ManagementGanttChart() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [zoom, setZoom] = useState(32);
  const [windowStart, setWindowStart] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return start;
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["buildos-tasks"],
    queryFn: async () => loadTasks(),
  });

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );
  const filteredTasks = useMemo(
    () => tasks.filter((task) => projectFilter === "all" || task.projectId === projectFilter),
    [projectFilter, tasks]
  );
  const drivingTaskIds = useMemo(() => getScheduleDrivingTaskIds(filteredTasks), [filteredTasks]);

  const days = useMemo(
    () => Array.from({ length: 42 }, (_, index) => addDays(windowStart, index)),
    [windowStart]
  );

  const getBarStyle = (startDateValue?: string, dueDateValue?: string) => {
    const startDate = parseTaskDate(startDateValue) || windowStart;
    const dueDate = parseTaskDate(dueDateValue) || startDate;
    const clampedStart =
      startDate < windowStart ? windowStart : startDate > days[days.length - 1] ? days[days.length - 1] : startDate;
    const clampedEnd =
      dueDate > days[days.length - 1] ? days[days.length - 1] : dueDate < windowStart ? windowStart : dueDate;
    const offset = Math.max(
      0,
      Math.round((clampedStart.getTime() - windowStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.max(
      1,
      Math.round((clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    return {
      left: offset * zoom,
      width: duration * zoom,
    };
  };

  return (
    <ManagementLayout currentPageName="gantt-chart">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Beta Schedule View
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Gantt Chart</h1>
            <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
              This beta Gantt reads the same live task records used in Project Tasks and Mobile Tasks. It highlights milestones, predecessor-driven work, and date drift without pretending to be a full CPM engine.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWindowStart((current) => addDays(current, -14))}
              className="rounded-md border border-input bg-background p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[180px] text-center text-sm font-medium text-foreground">
              {isoDate(days[0])} to {isoDate(days[days.length - 1])}
            </span>
            <button
              onClick={() => setWindowStart((current) => addDays(current, 14))}
              className="rounded-md border border-input bg-background p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setZoom((current) => Math.max(24, current - 8))}
              className="rounded-md border border-input bg-background p-2"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom((current) => Math.min(56, current + 8))}
              className="rounded-md border border-input bg-background p-2"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{phase}</span>
            </div>
          ))}
          <Badge className="rounded-full bg-enc-orange/10 text-enc-orange">Milestone</Badge>
          <Badge className="rounded-full bg-slate-900 text-white">Schedule-driving</Badge>
        </div>

        <Card className="dashboard-panel p-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Execution timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length ? (
              <div className="overflow-x-auto">
                <div style={{ minWidth: 320 + days.length * zoom }}>
                  <div className="flex border-b border-border/70">
                    <div className="w-80 shrink-0 px-4 py-3 text-sm font-medium text-foreground">Task</div>
                    <div className="flex">
                      {days.map((day) => (
                        <div
                          key={day.toISOString()}
                          className="border-l border-border/70 px-1 py-3 text-center text-xs text-muted-foreground"
                          style={{ width: zoom }}
                        >
                          {day.getDate()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {filteredTasks.map((task) => {
                    const barStyle = getBarStyle(task.startDate, task.dueDate);
                    const project = projectMap.get(task.projectId);
                    const overdue =
                      task.status !== "Completed" &&
                      parseTaskDate(task.dueDate) &&
                      parseTaskDate(task.dueDate)! < new Date();

                    return (
                      <div key={task.id} className="flex border-b border-border/50">
                        <div className="w-80 shrink-0 space-y-2 px-4 py-4">
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
                            {drivingTaskIds.has(task.id) ? (
                              <Badge className="rounded-full bg-slate-900 text-white">
                                Schedule-driving
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {project?.project_name || "Unlinked project"} · {task.phase}
                          </p>
                          {task.predecessorIds.length ? (
                            <p className="text-xs text-muted-foreground">
                              Depends on {task.predecessorIds.length} predecessor task(s)
                            </p>
                          ) : null}
                        </div>
                        <div className="relative" style={{ minWidth: days.length * zoom }}>
                          {days.map((day, index) => (
                            <div
                              key={day.toISOString()}
                              className="absolute top-0 bottom-0 border-l border-border/40"
                              style={{ left: index * zoom, width: zoom }}
                            />
                          ))}
                          <div
                            className="absolute top-4 flex h-10 items-center rounded-xl px-3 text-xs font-semibold text-white"
                            style={{
                              ...barStyle,
                              backgroundColor: overdue ? "#c43c2f" : phaseColors[task.phase] || phaseColors.Other,
                              opacity: task.status === "Completed" ? 0.7 : 1,
                            }}
                            title={`${task.title} · ${task.startDate || "Start TBD"} to ${task.dueDate || "Due TBD"}`}
                          >
                            {zoom >= 32 ? task.title : ""}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">
                No task records are available for the current filter. Add real tasks first, then this beta Gantt will render actual project sequencing.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
