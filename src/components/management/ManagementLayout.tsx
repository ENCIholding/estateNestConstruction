import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
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
  MonitorCog,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Popover, { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { managementModules } from "@/lib/management";
import BrandLockup from "@/components/BrandLockup";
import { useAccessibilityMode } from "@/components/accessibility/AccessibilityProvider";
import {
  loadBuildOsFeatureFlags,
  loadBuildOsPreferences,
  type BuildOsPreferences,
} from "@/lib/buildosWorkspace";
import {
  getDashboardShellClasses,
  resolveDashboardTheme,
} from "@/lib/dashboardPreferences";
import { preloadManagementRoutes } from "@/lib/preloadManagementRoutes";

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

type WorkspaceSettingsContentProps = {
  featureFlags: ReturnType<typeof loadBuildOsFeatureFlags>;
  preferences: BuildOsPreferences;
  updatePreferences: (next: Partial<BuildOsPreferences>) => void;
};

function WorkspaceSettingsContent({
  featureFlags,
  preferences,
  updatePreferences,
}: WorkspaceSettingsContentProps) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-enc-orange">
        Workspace Preferences
      </p>
      <div className="mt-4 space-y-4 text-sm">
        <div className="space-y-2">
          <p className="font-medium text-foreground">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["light", "Light"],
              ["dark", "Dark"],
              ["system", "System"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={preferences.themeMode === value ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  updatePreferences({
                    themeMode: value as BuildOsPreferences["themeMode"],
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Font size</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["default", "Default"],
              ["large", "Large"],
              ["xlarge", "XL"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={preferences.fontScale === value ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  updatePreferences({
                    fontScale: value as BuildOsPreferences["fontScale"],
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-foreground">Density</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["comfortable", "Comfortable"],
              ["compact", "Compact"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={preferences.density === value ? "default" : "outline"}
                className="rounded-full"
                onClick={() =>
                  updatePreferences({
                    density: value as BuildOsPreferences["density"],
                  })
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <label className="flex items-center justify-between rounded-2xl border border-border/70 px-3 py-2">
            <span>Reduced motion</span>
            <input
              type="checkbox"
              checked={preferences.reducedMotion}
              onChange={(event) =>
                updatePreferences({ reducedMotion: event.target.checked })
              }
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-border/70 px-3 py-2">
            <span>High contrast</span>
            <input
              type="checkbox"
              checked={preferences.highContrast}
              onChange={(event) =>
                updatePreferences({ highContrast: event.target.checked })
              }
            />
          </label>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-3 text-xs leading-5 text-muted-foreground">
          Enabled live modules: {managementModules.filter((module) => module.enabled).length}. Beta flags:{" "}
          {featureFlags.ganttBeta || featureFlags.automationBeta || featureFlags.mobileTasksBeta
            ? "active"
            : "none"}
          .
        </div>
      </div>
    </>
  );
}

export default function ManagementLayout({
  children,
  currentPageName = "dashboard",
}: ManagementLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const accessibility = useAccessibilityMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);
  const [preferences, setPreferences] = useState<BuildOsPreferences>(() =>
    loadBuildOsPreferences()
  );
  const [featureFlags] = useState(() => loadBuildOsFeatureFlags());

  useEffect(() => {
    if (preferences.highContrast) {
      accessibility.enableEnhancedMode();
    } else {
      accessibility.disableEnhancedMode();
    }
  }, [accessibility, preferences.highContrast]);

  const resolvedTheme = resolveDashboardTheme(preferences.themeMode);
  const pageTitle =
    allNavItems.find((item) => item.page === currentPageName)?.name || "Dashboard";
  const shellClasses = getDashboardShellClasses(preferences);

  useEffect(() => {
    document.title = `${pageTitle} | ENCI BuildOS`;
  }, [pageTitle]);

  useEffect(() => {
    void preloadManagementRoutes();
  }, []);

  useEffect(() => {
    sidebarScrollRef.current?.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [location.pathname, preferences.reducedMotion]);

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

  const updatePreferences = (next: Partial<BuildOsPreferences>) => {
    const merged = { ...preferences, ...next };
    setPreferences(merged);
    window.localStorage.setItem("enci-buildos-preferences", JSON.stringify(merged));
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
    <div className={resolvedTheme === "dark" ? "dark" : ""}>
      <div
        className={`dashboard-shell min-h-screen bg-background text-foreground ${shellClasses.fontClass} ${shellClasses.densityClass} ${shellClasses.reducedMotionClass}`.trim()}
      >
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open ENCI BuildOS settings">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 rounded-3xl border-border/80 bg-background/95 p-4">
                <WorkspaceSettingsContent
                  featureFlags={featureFlags}
                  preferences={preferences}
                  updatePreferences={updatePreferences}
                />
              </PopoverContent>
            </Popover>
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
                subtitle="ENCI BuildOS"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl border-enc-orange/20 bg-card/80 hover:border-enc-orange/40 hover:bg-enc-orange/5"
                    >
                      {resolvedTheme === "dark" ? (
                        <MoonStar className="h-4 w-4" />
                      ) : (
                        <SunMedium className="h-4 w-4" />
                      )}
                      Settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-80 rounded-3xl border-border/80 bg-background/95 p-4">
                    <WorkspaceSettingsContent
                      featureFlags={featureFlags}
                      preferences={preferences}
                      updatePreferences={updatePreferences}
                    />
                  </PopoverContent>
                </Popover>
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

            <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto">
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
                  B
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    ENCI BuildOS Admin
                  </p>
                  <p className="truncate text-xs text-muted-foreground">Estate Nest Capital</p>
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
          <div className="sticky top-0 z-30 hidden border-b border-border/70 bg-background/95 px-6 py-4 backdrop-blur-xl lg:block">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-enc-orange">
                  ENCI BuildOS
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-foreground">{pageTitle}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative hidden xl:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search modules"
                    className="h-10 w-72 rounded-full border border-border/80 bg-card/80 py-2 pl-10 pr-4 text-sm text-foreground"
                  />
                </div>
                <Button variant="outline" className="rounded-full" onClick={openEmailComposer}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/management/dashboard">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Alerts
                  </Link>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <MonitorCog className="mr-2 h-4 w-4" />
                      Theme & Access
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-96 rounded-3xl border-border/80 bg-background/95 p-4">
                    <p className="mt-0 text-sm leading-6 text-muted-foreground">
                      Keep ENCI BuildOS lean and readable with theme, font, density, motion, and contrast controls.
                    </p>
                    <WorkspaceSettingsContent
                      featureFlags={featureFlags}
                      preferences={preferences}
                      updatePreferences={updatePreferences}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <div className={`p-4 lg:p-8 ${preferences.density === "compact" ? "space-y-4" : "space-y-6"}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
