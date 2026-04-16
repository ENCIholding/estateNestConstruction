import { afterEach, describe, expect, it, vi } from "vitest";

const originalProjectsEnv = process.env.MANAGEMENT_PROJECTS_JSON;

afterEach(() => {
  if (originalProjectsEnv === undefined) {
    delete process.env.MANAGEMENT_PROJECTS_JSON;
  } else {
    process.env.MANAGEMENT_PROJECTS_JSON = originalProjectsEnv;
  }

  vi.resetModules();
});

describe("project registry helpers", () => {
  it("defaults to an honest empty registry when no env data is configured", async () => {
    delete process.env.MANAGEMENT_PROJECTS_JSON;

    const projects = await import("./projects");

    await expect(projects.getAllProjects()).resolves.toEqual([]);
    expect(projects.getProjectRegistryState()).toEqual({
      editable: false,
      projectCount: 0,
      source: "unconfigured",
    });
  });

  it("reads reviewed project data from MANAGEMENT_PROJECTS_JSON", async () => {
    process.env.MANAGEMENT_PROJECTS_JSON = JSON.stringify([
      {
        id: "project-1",
        project_name: "Verified Project",
        civic_address: "123 Example Street, Edmonton",
        status: "Active",
        estimated_budget: 1800000,
        project_manager: "Kanwar Sharma",
      },
    ]);

    const projects = await import("./projects");

    await expect(projects.getAllProjects()).resolves.toEqual([
      expect.objectContaining({
        id: "project-1",
        project_name: "Verified Project",
        project_manager: "Kanwar Sharma",
      }),
    ]);

    expect(projects.getProjectRegistryState()).toEqual({
      editable: false,
      projectCount: 1,
      source: "environment",
    });
  });
});
