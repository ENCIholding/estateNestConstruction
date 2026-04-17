export type ManagementModule = {
  name: string;
  page: string;
  enabled: boolean;
};

export const managementModules: ManagementModule[] = [
  { name: "Dashboard", page: "dashboard", enabled: true },
  { name: "Projects", page: "projects", enabled: true },
  { name: "Project Tasks", page: "tasks", enabled: true },
  { name: "Schedule", page: "schedule", enabled: true },
  { name: "Gantt Chart", page: "gantt-chart", enabled: true },
  { name: "Budget & Costs", page: "budget-costs", enabled: true },
  { name: "Vendors (Trades)", page: "vendors", enabled: true },
  { name: "Client Invoices", page: "client-invoices", enabled: true },
  { name: "Vendor Bills", page: "vendor-bills", enabled: true },
  { name: "Documents", page: "documents", enabled: true },
  { name: "Compliance", page: "compliance", enabled: true },
  { name: "Change Orders", page: "change-orders", enabled: true },
  { name: "Reports", page: "reports", enabled: true },
  { name: "Estimator", page: "estimator", enabled: false },
  { name: "Client Selections", page: "client-selections", enabled: false },
  { name: "Warranty Reminder", page: "warranty-reminder", enabled: true },
  { name: "Automation", page: "automation", enabled: true },
  { name: "Analytics", page: "analytics", enabled: true },
  { name: "Daily Log", page: "daily-log", enabled: true },
  { name: "Deficiency Punch List", page: "deficiency-punch-list", enabled: true },
  { name: "Master Database", page: "master-database", enabled: true },
  { name: "Mobile Tasks", page: "mobile-tasks", enabled: true },
  { name: "License", page: "license", enabled: true },
];

export function isEnabledManagementPage(page: string): boolean {
  return managementModules.some((module) => module.page === page && module.enabled);
}
