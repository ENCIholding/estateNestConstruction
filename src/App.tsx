import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import {Index} from "./pages/Index";
import BuilderProfile from "./pages/BuilderProfile";
import InvestorRelations from "./pages/InvestorRelations";
import Leadership from "./pages/Leadership";
import Careers from "./pages/Careers";
import Accessibility from "./pages/Accessibility";
import NotFound from "./pages/NotFound";
import ManagementLogin from "./pages/ManagementLogin";
import Dashboard from "./pages/Dashboard";

import Contracts from "./pages/Contracts";
import Transactions from "./pages/Transactions";
import ConstructionCosts from "./pages/ConstructionCosts";
import Pipeline from "./pages/Pipeline";
import Invoices from "./pages/Invoices";
import TaxRecords from "./pages/TaxRecords";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/builder-profile" element={<BuilderProfile />} />
            <Route path="/investor-relations" element={<InvestorRelations />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/accessibility" element={<Accessibility />} />

            <Route path="/management-login" element={<ManagementLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/contracts" element={<Contracts />} />
            <Route path="/dashboard/transactions" element={<Transactions />} />
            <Route path="/dashboard/projects" element={<Transactions />} />
            <Route path="/dashboard/costs" element={<ConstructionCosts />} />
            <Route path="/dashboard/pipeline" element={<Pipeline />} />
            <Route path="/dashboard/invoices" element={<Invoices />} />
            <Route path="/dashboard/tax" element={<TaxRecords />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
