import { describe, expect, it } from "vitest";
import {
  buildTasksCsv,
  getProjectTaskSummary,
  getScheduleDrivingTaskIds,
  isTaskOverdue,
} from "./buildosTasks";
import type { ManagementProject } from "./managementData";
import type { BuildOsTask } from "./buildosWorkspace";

const projects: ManagementProject[] = [
  {
    id: "parkallen",
    project_name: "Parkallen Fourplex",
    civic_address: "109 Street NW, Edmonton",
    status: "Active",
  },
];

const tasks: BuildOsTask[] = [
  {
    id: "task-1",
    projectId: "parkallen",
    title: "Permit follow-up",
    phase: "Permits",
    status: "In Progress",
    priority: "High",
    milestone: true,
    predecessorIds: [],
    percentComplete: 45,
    startDate: "2026-04-01",
    dueDate: "2026-04-05",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "task-2",
    projectId: "parkallen",
    title: "Foundation mobilization",
    phase: "Foundation",
    status: "Blocked",
    priority: "Critical",
    milestone: false,
    predecessorIds: ["task-1"],
    percentComplete: 10,
    startDate: "2026-04-06",
    dueDate: "2026-04-12",
    createdAt: "2026-04-03T00:00:00.000Z",
    updatedAt: "2026-04-03T00:00:00.000Z",
  },
];

describe("buildos task helpers", () => {
  it("summarizes overdue, blocked, and milestone task pressure", () => {
    const summary = getProjectTaskSummary("parkallen", tasks, new Date("2026-04-10"));

    expect(summary).toEqual(
      expect.objectContaining({
        total: 2,
        overdue: 1,
        blocked: 1,
        milestones: 1,
      })
    );
  });

  it("identifies schedule-driving tasks from milestones and dependencies", () => {
    const drivingIds = getScheduleDrivingTaskIds(tasks);

    expect(drivingIds.has("task-1")).toBe(true);
    expect(drivingIds.has("task-2")).toBe(false);
  });

  it("exports a practical task csv without inventing extra fields", () => {
    const csv = buildTasksCsv(tasks, projects);

    expect(csv).toContain("Project,Task,Phase,Status");
    expect(csv).toContain("Parkallen Fourplex");
    expect(csv).toContain("Foundation mobilization");
  });

  it("treats completed tasks as not overdue", () => {
    expect(
      isTaskOverdue(
        {
          ...tasks[0],
          status: "Completed",
          percentComplete: 100,
        },
        new Date("2026-04-10")
      )
    ).toBe(false);
  });
});
