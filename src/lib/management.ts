export type ManagementModule = {
  name: string;
  page: string;
  enabled: boolean;
};

export const managementModules: ManagementModule[] = [
  { name: "Dashboard", page: "dashboard", enabled: true },
  { name: "Projects", page: "projects", enabled: true },
  { name: "Project Tasks", page: "tasks", enabled: false },
  { name: "Schedule", page: "schedule", enabled: true },
  { name: "Gantt Chart", page: "gantt-chart", enabled: false },
  { name: "Budget & Costs", page: "budget-costs", enabled: true },
  { name: "Vendors", page: "vendors", enabled: true },
  { name: "Client Invoices", page: "client-invoices", enabled: false },
  { name: "Vendor Bills", page: "vendor-bills", enabled: false },
  { name: "Documents", page: "documents", enabled: true },
  { name: "Compliance", page: "compliance", enabled: true },
  { name: "Change Orders", page: "change-orders", enabled: false },
  { name: "Reports", page: "reports", enabled: true },
  { name: "Estimator", page: "estimator", enabled: false },
  { name: "Client Selections", page: "client-selections", enabled: false },
  { name: "Warranty Reminder", page: "warranty-reminder", enabled: true },
  { name: "Automation", page: "automation", enabled: false },
  { name: "Analytics", page: "analytics", enabled: true },
  { name: "Daily Log", page: "daily-log", enabled: false },
  { name: "Deficiency Punch List", page: "deficiency-punch-list", enabled: false },
  { name: "Master Database", page: "master-database", enabled: false },
  { name: "Mobile Tasks", page: "mobile-tasks", enabled: false },
  { name: "License", page: "license", enabled: false },
];

export function isEnabledManagementPage(page: string): boolean {
  return managementModules.some((module) => module.page === page && module.enabled);
}
