import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Import all your page components
import Index from "./pages/Index";
import BuilderProfile from "./pages/BuilderProfile";
import InvestorRelations from "./pages/InvestorRelations";
import Careers from "./pages/Careers";
import Accessibility from "./pages/Accessibility";
import ManagementLogin from "./pages/ManagementLogin";
import ManagementDashboard from "./pages/ManagementDashboard";
import ManagementProjects from "./pages/ManagementProjects";
import ManagementVendors from "./pages/ManagementVendors";
import ManagementDocuments from "./pages/ManagementDocuments";
import ManagementReports from "./pages/ManagementReports";
import ManagementSchedule from "./pages/ManagementSchedule";
import ManagementGanttChart from "./pages/ManagementGanttChart";
import ManagementBudgetCosts from "./pages/ManagementBudgetCosts";
import ManagementChangeOrders from "./pages/ManagementChangeOrders";
import ManagementClientInvoices from "./pages/ManagementClientInvoices";
import ManagementClientSelections from "./pages/ManagementClientSelections";
import ManagementCompliance from "./pages/ManagementCompliance";
import ManagementEstimator from "./pages/ManagementEstimator";
import ManagementMasterDatabase from "./pages/ManagementMasterDatabase";
import ManagementMobileTasks from "./pages/ManagementMobileTasks";
import ManagementProjectDetails from "./pages/ManagementProjectDetails";
import ManagementVendorDetails from "./pages/ManagementVendorDetails";
import ManagementVendorBills from "./pages/ManagementVendorBills";
import ManagementModuleUnavailable from "./pages/ManagementModuleUnavailable";
import NotFound from "./pages/NotFound";
import RequireManagementAuth from "./components/management/RequireManagementAuth";

// Forcing a redeploy to pick up latest changes (this comment helps trigger a new commit)
export default function App() {
  return (
    <BrowserRouter>
      {/* SpeedInsights for Vercel performance monitoring */}
      <SpeedInsights />
      <Routes>
        {/* Public/Marketing Pages */}
        <Route path="/" element={<Index />} />
        <Route path="/builder-profile" element={<BuilderProfile />} />
        <Route path="/investor-relations" element={<InvestorRelations />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/management" element={<Navigate to="/management/login" replace />} />

        {/* Management/Admin Pages */}
        <Route path="/management/login" element={<ManagementLogin />} />
        <Route
          path="/management/dashboard"
          element={
            <RequireManagementAuth>
              <ManagementDashboard />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/projects"
          element={
            <RequireManagementAuth>
              <ManagementProjects />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/project-details"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable
                currentPageName="projects"
                title="Project Details"
              />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/vendors"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable
                currentPageName="vendors"
                title="Vendor Information"
              />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/vendor-details"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable
                currentPageName="vendors"
                title="Vendor Details"
              />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/documents"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="documents" title="Documents" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/reports"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="reports" title="Reports" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/schedule"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="schedule" title="Schedule" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/gantt-chart"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="gantt-chart" title="Gantt Chart" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/budget-costs"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="budget-costs" title="Budget & Costs" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/change-orders"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="change-orders" title="Change Orders" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/client-invoices"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="client-invoices" title="Client Invoices" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/client-selections"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="client-selections" title="Client Selection" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/compliance"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="compliance" title="Compliance" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/estimator"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="estimator" title="Estimation" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/master-database"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="master-database" title="Master Database" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/mobile-tasks"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="mobile-tasks" title="Mobile Tasks" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/vendor-bills"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="vendor-bills" title="Vendor Bills" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/tasks"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="tasks" title="Project Tasks" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/warranty-reminder"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable
                currentPageName="warranty-reminder"
                title="Warranty Reminder"
              />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/automation"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="automation" title="Automation" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/analytics"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="analytics" title="Analytics" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/daily-log"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="daily-log" title="Daily Log" />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/deficiency-punch-list"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable
                currentPageName="deficiency-punch-list"
                title="Deficiency Punch List"
              />
            </RequireManagementAuth>
          }
        />
        <Route
          path="/management/license"
          element={
            <RequireManagementAuth>
              <ManagementModuleUnavailable currentPageName="license" title="License" />
            </RequireManagementAuth>
          }
        />

        {/* Catch-all for 404 - important to be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
