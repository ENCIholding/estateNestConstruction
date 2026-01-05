import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { Index } from "./pages/Index";
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
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsx(Sonner, {}), _jsxs(BrowserRouter, { children: [_jsx(ScrollToTop, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Index, {}) }), _jsx(Route, { path: "/builder-profile", element: _jsx(BuilderProfile, {}) }), _jsx(Route, { path: "/investor-relations", element: _jsx(InvestorRelations, {}) }), _jsx(Route, { path: "/leadership", element: _jsx(Leadership, {}) }), _jsx(Route, { path: "/careers", element: _jsx(Careers, {}) }), _jsx(Route, { path: "/accessibility", element: _jsx(Accessibility, {}) }), _jsx(Route, { path: "/management-login", element: _jsx(ManagementLogin, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/dashboard/contracts", element: _jsx(Contracts, {}) }), _jsx(Route, { path: "/dashboard/transactions", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "/dashboard/projects", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "/dashboard/costs", element: _jsx(ConstructionCosts, {}) }), _jsx(Route, { path: "/dashboard/pipeline", element: _jsx(Pipeline, {}) }), _jsx(Route, { path: "/dashboard/invoices", element: _jsx(Invoices, {}) }), _jsx(Route, { path: "/dashboard/tax", element: _jsx(TaxRecords, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] })] })] }) }));
}
