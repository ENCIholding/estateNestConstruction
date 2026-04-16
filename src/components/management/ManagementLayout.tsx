import React, { useEffect, useMemo, useState } from "react";
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
  HardHat,
  Search,
  Mail,
  Database,
  ShieldAlert,
  ClipboardList,
  FileWarning,
  Bot,
  LineChart,
  ShieldCheck,
  MoonStar,
  SunMedium,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { managementModules } from "@/lib/management";
import BrandLockup from "@/components/BrandLockup";

type ManagementLayoutProps = {
  children: React.ReactNode;
  currentPageName?: string;
};

type NavItem = {
  name: string;
  page: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
};

const allNavItems: NavItem[] = [
  ...managementModules.map((module) => ({
    ...module,
    icon:
      {
        dashboard: LayoutDashboard,
        projects: FolderKanban,
        tasks: ClipboardList,
        schedule: CalendarDays,
        "gantt-chart": CalendarDays,
        "budget-costs": DollarSign,
        vendors: Users,
        "client-invoices": FileText,
        "vendor-bills": FileText,
        documents: FileText,
        compliance: ClipboardCheck,
        "change-orders": FileWarning,
        reports: FileText,
        estimator: DollarSign,
        "client-selections": Users,
        "warranty-reminder": ShieldCheck,
        automation: Bot,
        analytics: LineChart,
        "daily-log": ClipboardList,
        "deficiency-punch-list": ShieldAlert,
        "master-database": Database,
        "mobile-tasks": HardHat,
        license: FileText,
      }[module.page] || FileText,
  })),
];

export default function ManagementLayout({
  children,
  currentPageName = "dashboard",
}: ManagementLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardTheme, setDashboardTheme] = useState<"light" | "dark">(
    "light"
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("enci-dashboard-theme");

    if (storedTheme === "dark" || storedTheme === "light") {
      setDashboardTheme(storedTheme);
    }
  }, []);

  const filteredNavItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allNavItems;

    return allNavItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.page.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await fetch("/api/management/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // A failed logout request should not trap the user in the admin area.
    }

    navigate("/management/login", { replace: true });
  };

  const toggleTheme = () => {
    const nextTheme = dashboardTheme === "dark" ? "light" : "dark";
    setDashboardTheme(nextTheme);
    window.localStorage.setItem("enci-dashboard-theme", nextTheme);
  };

  const openEmailComposer = () => {
    setSidebarOpen(false);

    const scrollToComposer = () => {
      document
        .getElementById("dashboard-email-composer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (currentPageName === "dashboard") {
      scrollToComposer();
      return;
    }

    navigate("/management/dashboard");
    window.setTimeout(scrollToComposer, 250);
  };

  return (
    <div className={dashboardTheme === "dark" ? "dark" : ""}>
      <div className="dashboard-shell min-h-screen bg-background text-foreground">
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <BrandLockup compact subtitle="Dashboard" className="max-w-[220px]" />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dashboard theme"
            >
              {dashboardTheme === "dark" ? (
                <SunMedium className="h-4 w-4" />
              ) : (
                <MoonStar className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openEmailComposer}
            >
              <Mail className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-40 h-full w-72 border-r border-border/70 bg-background/95 backdrop-blur-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/70 p-6 shrink-0">
              <BrandLockup
                to="/management/dashboard"
                subtitle="Management Dashboard"
                className="max-w-[220px]"
              />
            </div>

            <div className="space-y-3 border-b border-border/70 p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  aria-label="Search management menu"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-card/80 py-2 pl-10 pr-3 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-enc-orange/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl border-enc-orange/20 bg-card/80 hover:border-enc-orange/40 hover:bg-enc-orange/5"
                  onClick={toggleTheme}
                >
                  {dashboardTheme === "dark" ? (
                    <SunMedium className="h-4 w-4" />
                  ) : (
                    <MoonStar className="h-4 w-4" />
                  )}
                  {dashboardTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-enc-orange/20 bg-card/80 hover:border-enc-orange/40 hover:bg-enc-orange/5"
                  onClick={openEmailComposer}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-1 p-4 pb-6">
                {filteredNavItems.map((item) => {
                  const isActive = currentPageName === item.page;
                  const Icon = item.icon;

                  return item.enabled ? (
                    <Link
                      key={item.page}
                      to={`/management/${item.page}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-enc-red/90 via-enc-orange/90 to-enc-yellow/90 text-white shadow-glow"
                          : "text-muted-foreground hover:bg-gradient-to-r hover:from-enc-orange/10 hover:to-enc-yellow/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <div
                      key={item.page}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/70"
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                        Offline
                      </span>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-border/70 bg-background/90 p-4 shrink-0">
              <div className="flex items-center gap-3 rounded-2xl bg-card/80 px-3 py-3 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-enc-red via-enc-orange to-enc-yellow text-sm font-medium text-white shadow-glow">
                  E
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    Estate Nest Admin
                  </p>
                  <p className="truncate text-xs text-muted-foreground">Admin</p>
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

        <main id="main-content" className="min-h-screen pt-16 lg:ml-72 lg:pt-0">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
