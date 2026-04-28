let preloadPromise: Promise<unknown> | null = null;

export function preloadManagementRoutes() {
  if (!preloadPromise) {
    preloadPromise = Promise.allSettled([
      import("@/pages/ManagementLogin"),
      import("@/pages/ManagementDashboard"),
      import("@/pages/ManagementProjects"),
      import("@/pages/ManagementProjectTasks"),
      import("@/pages/ManagementVendors"),
      import("@/pages/ManagementProjectDetails"),
      import("@/pages/ManagementSchedule"),
      import("@/pages/ManagementGanttChart"),
      import("@/pages/ManagementBudgetCosts"),
      import("@/pages/ManagementChangeOrders"),
      import("@/pages/ManagementClientInvoices"),
      import("@/pages/ManagementDocuments"),
      import("@/pages/ManagementPresentations"),
      import("@/pages/ManagementVideos"),
      import("@/pages/ManagementClientReports"),
      import("@/pages/ManagementCompliance"),
      import("@/pages/ManagementDailyLog"),
      import("@/pages/ManagementDeficiencyPunchList"),
      import("@/pages/ManagementLicense"),
      import("@/pages/ManagementMasterDatabase"),
      import("@/pages/ManagementReports"),
      import("@/pages/ManagementAnalytics"),
      import("@/pages/ManagementAutomation"),
      import("@/pages/ManagementVendorBills"),
      import("@/pages/ManagementWarrantyReminder"),
      import("@/pages/ManagementMobileTasks"),
      import("@/pages/ManagementModuleUnavailable"),
    ]);
  }

  return preloadPromise;
}
