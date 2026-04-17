import { afterEach, describe, expect, it } from "vitest";
import {
  authenticateManagementUser,
  canAccessBuildOsModule,
  getManagementUsers,
  getPermissionsForRole,
} from "./managementUsers.ts";

const originalEnv = {
  MANAGEMENT_PASSWORD: process.env.MANAGEMENT_PASSWORD,
  MANAGEMENT_USERNAME: process.env.MANAGEMENT_USERNAME,
  MANAGEMENT_USERS_JSON: process.env.MANAGEMENT_USERS_JSON,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("management user configuration", () => {
  it("falls back to the single admin env user when a JSON user list is absent", () => {
    process.env.MANAGEMENT_USERNAME = "enci-admin";
    process.env.MANAGEMENT_PASSWORD = "secret";
    delete process.env.MANAGEMENT_USERS_JSON;

    expect(getManagementUsers()).toEqual([
      expect.objectContaining({
        role: "Admin",
        username: "enci-admin",
      }),
    ]);
  });

  it("parses role-aware users from MANAGEMENT_USERS_JSON", () => {
    process.env.MANAGEMENT_USERS_JSON = JSON.stringify([
      {
        password: "pm-pass",
        role: "Project Manager",
        username: "pm-user",
      },
      {
        displayName: "Accounting Team",
        password: "acct-pass",
        role: "Accounting",
        username: "acct-user",
      },
    ]);

    const users = getManagementUsers();

    expect(users).toHaveLength(2);
    expect(users[0]).toEqual(
      expect.objectContaining({
        role: "Project Manager",
        username: "pm-user",
      })
    );
    expect(users[1]).toEqual(
      expect.objectContaining({
        displayName: "Accounting Team",
        role: "Accounting",
        username: "acct-user",
      })
    );
  });
});

describe("management permissions", () => {
  it("builds write access by role", () => {
    const staffPermissions = getPermissionsForRole("Staff");

    expect(canAccessBuildOsModule({ permissions: staffPermissions }, "tasks", "write")).toBe(true);
    expect(
      canAccessBuildOsModule({ permissions: staffPermissions }, "vendor-bills", "write")
    ).toBe(false);
  });

  it("authenticates a configured role-aware user", () => {
    process.env.MANAGEMENT_USERS_JSON = JSON.stringify([
      {
        password: "readonly-pass",
        role: "Read Only",
        username: "viewer",
      },
    ]);

    const user = authenticateManagementUser("viewer", "readonly-pass");

    expect(user).toEqual(
      expect.objectContaining({
        role: "Read Only",
        username: "viewer",
      })
    );
    expect(canAccessBuildOsModule(user, "tasks", "read")).toBe(true);
    expect(canAccessBuildOsModule(user, "tasks", "write")).toBe(false);
  });
});
