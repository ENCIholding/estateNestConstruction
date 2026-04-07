import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Import all your page components
import Index from "./pages/Index";
import BuilderProfile from "./pages/BuilderProfile";
import InvestorRelations from "./pages/InvestorRelations";
import Careers from "./pages/Careers";
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
import NotFound from "./pages/NotFound";

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

        {/* Management/Admin Pages */}
        <Route path="/management/login" element={<ManagementLogin />} />
        <Route path="/management/dashboard" element={<ManagementDashboard />} />
        <Route path="/management/projects" element={<ManagementProjects />} />
        <Route path="/management/project-details" element={<ManagementProjectDetails />} /> {/* Expects /management/project-details?id=... */}
        <Route path="/management/vendors" element={<ManagementVendors />} />
        <Route path="/management/vendor-details" element={<ManagementVendorDetails />} /> {/* Expects /management/vendor-details?id=... */}
        <Route path="/management/documents" element={<ManagementDocuments />} />
        <Route path="/management/reports" element={<ManagementReports />} />
        <Route path="/management/schedule" element={<ManagementSchedule />} />
        <Route path="/management/gantt-chart" element={<ManagementGanttChart />} />
        <Route path="/management/budget-costs" element={<ManagementBudgetCosts />} />
        <Route path="/management/change-orders" element={<ManagementChangeOrders />} />
        <Route path="/management/client-invoices" element={<ManagementClientInvoices />} />
        <Route path="/management/client-selections" element={<ManagementClientSelections />} />
        <Route path="/management/compliance" element={<ManagementCompliance />} />
        <Route path="/management/estimator" element={<ManagementEstimator />} />
        <Route path="/management/master-database" element={<ManagementMasterDatabase />} />
        <Route path="/management/mobile-tasks" element={<ManagementMobileTasks />} />
        <Route path="/management/vendor-bills" element={<ManagementVendorBills />} />

        {/* Catch-all for 404 - important to be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
