import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import BuilderProfile from "./pages/BuilderProfile";
import InvestorRelations from "./pages/InvestorRelations";
import Careers from "./pages/Careers";
import ManagementLogin from "./pages/ManagementLogin.tsx";
import ManagementDashboard from "./pages/ManagementDashboard";
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
