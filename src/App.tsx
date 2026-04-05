import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Index } from "./pages/Index";
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
import ManagementEstimator from "@/pages/ManagementEstimator";
import ManagementMasterDatabase from "@/pages/ManagementMasterDatabase";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/builder-profile" element={<BuilderProfile />} />
        <Route path="/investor-relations" element={<InvestorRelations />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/management-login" element={<ManagementLogin />} />
        <Route path="/management-dashboard" element={<ManagementDashboard />} />
        <Route path="/management/projects" element={<ManagementProjects />} />
        <Route path="/management/vendors" element={<ManagementVendors />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
