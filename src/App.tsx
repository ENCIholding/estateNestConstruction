import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AccessibilityProvider } from "./components/accessibility/AccessibilityProvider";
import RequireManagementAuth from "./components/management/RequireManagementAuth";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "./components/ui/sonner";

const Index = lazy(() => import("./pages/Index"));
const BuilderProfile = lazy(() => import("./pages/BuilderProfile"));
const InvestorRelations = lazy(() => import("./pages/InvestorRelations"));
const Careers = lazy(() => import("./pages/Careers"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const ManagementLogin = lazy(() => import("./pages/ManagementLogin"));
const ManagementDashboard = lazy(() => import("./pages/ManagementDashboard"));
const ManagementProjects = lazy(() => import("./pages/ManagementProjects"));
const ManagementProjectTasks = lazy(() => import("./pages/ManagementProjectTasks"));
const ManagementVendors = lazy(() => import("./pages/ManagementVendors"));
const ManagementProjectDetails = lazy(() => import("./pages/ManagementProjectDetails"));
const ManagementSchedule = lazy(() => import("./pages/ManagementSchedule"));
const ManagementGanttChart = lazy(() => import("./pages/ManagementGanttChart"));
const ManagementBudgetCosts = lazy(() => import("./pages/ManagementBudgetCosts"));
const ManagementChangeOrders = lazy(() => import("./pages/ManagementChangeOrders"));
const ManagementClientInvoices = lazy(() => import("./pages/ManagementClientInvoices"));
const ManagementDocuments = lazy(() => import("./pages/ManagementDocuments"));
const ManagementCompliance = lazy(() => import("./pages/ManagementCompliance"));
const ManagementDailyLog = lazy(() => import("./pages/ManagementDailyLog"));
const ManagementDeficiencyPunchList = lazy(
  () => import("./pages/ManagementDeficiencyPunchList")
);
const ManagementLicense = lazy(() => import("./pages/ManagementLicense"));
const ManagementMasterDatabase = lazy(() => import("./pages/ManagementMasterDatabase"));
const ManagementReports = lazy(() => import("./pages/ManagementReports"));
const ManagementAnalytics = lazy(() => import("./pages/ManagementAnalytics"));
const ManagementAutomation = lazy(() => import("./pages/ManagementAutomation"));
const ManagementVendorBills = lazy(() => import("./pages/ManagementVendorBills"));
const ManagementWarrantyReminder = lazy(
  () => import("./pages/ManagementWarrantyReminder")
);
const ManagementMobileTasks = lazy(() => import("./pages/ManagementMobileTasks"));
const ManagementModuleUnavailable = lazy(
  () => import("./pages/ManagementModuleUnavailable")
);
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <SpeedInsights />
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/builder-profile" element={<BuilderProfile />} />
            <Route path="/investor-relations" element={<InvestorRelations />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/management" element={<Navigate to="/management/login" replace />} />

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
                  <ManagementProjectDetails />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/schedule"
              element={
                <RequireManagementAuth>
                  <ManagementSchedule />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/budget-costs"
              element={
                <RequireManagementAuth>
                  <ManagementBudgetCosts />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/documents"
              element={
                <RequireManagementAuth>
                  <ManagementDocuments />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/compliance"
              element={
                <RequireManagementAuth>
                  <ManagementCompliance />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/reports"
              element={
                <RequireManagementAuth>
                  <ManagementReports />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/analytics"
              element={
                <RequireManagementAuth>
                  <ManagementAnalytics />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/warranty-reminder"
              element={
                <RequireManagementAuth>
                  <ManagementWarrantyReminder />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/vendors"
              element={
                <RequireManagementAuth>
                  <ManagementVendors />
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
              path="/management/gantt-chart"
              element={
                <RequireManagementAuth>
                  <ManagementGanttChart />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/change-orders"
              element={
                <RequireManagementAuth>
                  <ManagementChangeOrders />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/client-invoices"
              element={
                <RequireManagementAuth>
                  <ManagementClientInvoices />
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
                  <ManagementMasterDatabase />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/mobile-tasks"
              element={
                <RequireManagementAuth>
                  <ManagementMobileTasks />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/vendor-bills"
              element={
                <RequireManagementAuth>
                  <ManagementVendorBills />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/tasks"
              element={
                <RequireManagementAuth>
                  <ManagementProjectTasks />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/automation"
              element={
                <RequireManagementAuth>
                  <ManagementAutomation />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/daily-log"
              element={
                <RequireManagementAuth>
                  <ManagementDailyLog />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/deficiency-punch-list"
              element={
                <RequireManagementAuth>
                  <ManagementDeficiencyPunchList />
                </RequireManagementAuth>
              }
            />
            <Route
              path="/management/license"
              element={
                <RequireManagementAuth>
                  <ManagementLicense />
                </RequireManagementAuth>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
        <SonnerToaster richColors />
      </AccessibilityProvider>
    </BrowserRouter>
  );
}
