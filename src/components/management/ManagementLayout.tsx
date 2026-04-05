import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Menu,
  X,
  LogOut,
  Building2,
  HardHat,
  Search,
  Mail,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ManagementLayoutProps = {
  children: React.ReactNode;
  currentPageName?: string;
};

type NavItem = {
  name: string;
  page: string;
  icon: React.ComponentType<{ className?: string }>;
};

const allNavItems: NavItem[] = [
  { name: "Dashboard", page: "dashboard", icon: LayoutDashboard },
  { name: "Projects", page: "projects", icon: FolderKanban },
  { name: "Schedule", page: "schedule", icon: CalendarDays },
  { name: "Gantt Chart", page: "gantt-chart", icon: CalendarDays },
  { name: "Budget & Costs", page: "budget-costs", icon: DollarSign },
  { name: "Vendors", page: "vendors", icon: Users },
  { name: "Client Invoices", page: "client-invoices", icon: FileText },
  { name: "Vendor Bills", page: "vendor-bills", icon: FileText },
  { name: "Documents", page: "documents", icon: FileText },
  { name: "Compliance", page: "compliance", icon: ClipboardCheck },
  { name: "Change Orders", page: "change-orders", icon: FileText },
  { name: "Reports", page: "reports", icon: FileText },
  { name: "Estimator", page: "estimator", icon: DollarSign },
  { name: "Master Database", page: "master-database", icon: Database },
  { name: "Mobile Tasks", page: "mobile-tasks", icon: HardHat },
];

export default function ManagementLayout({
  children,
  currentPageName = "dashboard",
}: ManagementLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allNavItems;

    return allNavItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.page.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleLogout = () => {
    navigate("/management-login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-slate-900" />
            <span className="font-semibold text-slate-900">
              Estate Nest Build Pro
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.open("https://mail.google.com/mail/?view=cm&fs=1", "_blank")
          }
        >
          <Mail className="h-4 w-4 mr-2" />
          Quick Email
        </Button>
      </div>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="p-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">
                  Estate Nest Build Pro
                </h1>
                <p className="text-xs text-slate-500">Construction Management</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1 pb-6">
              {filteredNavItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.page}
                    to={`/management/${item.page}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium shrink-0">
                E
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  Estate Nest Admin
                </p>
                <p className="text-xs text-slate-500 truncate">Admin</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
