import type { ManagementProject } from "./managementData";
import type { BuildOsMasterRecord, BuildOsTask } from "./buildosWorkspace";

export type BuildOsTaskSummary = {
  total: number;
  overdue: number;
  blocked: number;
  dueSoon: number;
  completed: number;
  milestones: number;
};

export function parseTaskDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function isTaskComplete(task: BuildOsTask) {
  return task.status === "Completed" || task.percentComplete >= 100;
}

export function isTaskBlocked(task: BuildOsTask) {
  return task.status === "Blocked";
}

export function isTaskOverdue(task: BuildOsTask, referenceDate = new Date()) {
  const dueDate = parseTaskDate(task.dueDate);
  if (!dueDate || isTaskComplete(task)) {
    return false;
  }

  return dueDate < referenceDate;
}

export function isTaskDueSoon(task: BuildOsTask, referenceDate = new Date(), days = 7) {
  const dueDate = parseTaskDate(task.dueDate);
  if (!dueDate || isTaskComplete(task)) {
    return false;
  }

  const threshold = new Date(referenceDate);
  threshold.setDate(threshold.getDate() + days);
  return dueDate >= referenceDate && dueDate <= threshold;
}

export function getTaskDurationDays(task: BuildOsTask) {
  const startDate = parseTaskDate(task.startDate);
  const dueDate = parseTaskDate(task.dueDate);
  if (!startDate || !dueDate) {
    return 1;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.round((dueDate.getTime() - startDate.getTime()) / msPerDay) + 1);
}

export function getTaskSummary(tasks: BuildOsTask[], referenceDate = new Date()): BuildOsTaskSummary {
  return {
    total: tasks.length,
    overdue: tasks.filter((task) => isTaskOverdue(task, referenceDate)).length,
    blocked: tasks.filter((task) => isTaskBlocked(task)).length,
    dueSoon: tasks.filter((task) => isTaskDueSoon(task, referenceDate)).length,
    completed: tasks.filter((task) => isTaskComplete(task)).length,
    milestones: tasks.filter((task) => task.milestone).length,
  };
}

export function getProjectTaskSummary(
  projectId: string,
  tasks: BuildOsTask[],
  referenceDate = new Date()
) {
  return getTaskSummary(tasks.filter((task) => task.projectId === projectId), referenceDate);
}

export function getTaskAssigneeLabel(
  task: BuildOsTask,
  records: BuildOsMasterRecord[] = []
) {
  if (task.assignedRecordId) {
    const linked = records.find((record) => record.id === task.assignedRecordId);
    if (linked) {
      return linked.companyName || linked.personName;
    }
  }

  return task.assignedLabel || "Unassigned";
}

export function getScheduleDrivingTaskIds(tasks: BuildOsTask[]) {
  const predecessorIds = new Set(tasks.flatMap((task) => task.predecessorIds));
  return new Set(
    tasks
      .filter((task) => task.milestone || predecessorIds.has(task.id))
      .map((task) => task.id)
  );
}

export function buildTasksCsv(
  tasks: BuildOsTask[],
  projects: ManagementProject[],
  records: BuildOsMasterRecord[] = []
) {
  const projectMap = new Map(projects.map((project) => [project.id, project.project_name]));
  const headers = [
    "Project",
    "Task",
    "Phase",
    "Status",
    "Priority",
    "Assignee",
    "Start Date",
    "Due Date",
    "Milestone",
    "Percent Complete",
    "Location",
    "Description",
  ];

  const rows = tasks.map((task) => [
    projectMap.get(task.projectId) || "Unlinked Project",
    task.title,
    task.phase,
    task.status,
    task.priority,
    getTaskAssigneeLabel(task, records),
    task.startDate || "",
    task.dueDate || "",
    task.milestone ? "Yes" : "No",
    task.percentComplete,
    task.location || "",
    task.description || "",
  ]);

  const escapeCell = (value: string | number) => {
    const normalized = String(value ?? "");
    return /[",\n]/.test(normalized)
      ? `"${normalized.replace(/"/g, '""')}"`
      : normalized;
  };

  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
}
