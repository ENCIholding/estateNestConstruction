import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Receipt,
  Building2,
  DollarSign,
  FolderKanban,
  FileText,
  Calculator,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) {
      toast.error("Authentication service not available");
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Supabase logout error:", error);
        toast.error("Failed to log out");
        return;
      }

      toast.success("Logged out successfully");
      navigate("/management-login", { replace: true });
    } catch (err) {
      console.error("Unexpected logout error:", err);
      toast.error("Something went wrong during logout");
    }
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/contracts", label: "Contracts", icon: FileText },
    { path: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    { path: "/dashboard/projects", label: "Current Projects", icon: Building2 },
    { path: "/dashboard/costs", label: "Construction Costs", icon: DollarSign },
    { path: "/dashboard/pipeline", label: "Pipeline", icon: FolderKanban },
    { path: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { path: "/dashboard/tax", label: "Tax", icon: Calculator },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <Link to="/dashboard" className="block">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-1 flex items-center justify-center">
                <img
                  src="/lovable-uploads/65d67880-f4ae-4ca0-841d-1a60dd73a2d5.png"
                  alt="Estate Nest Capital Logo"
                  className="h-10 w-10"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-enc-orange to-enc-yellow bg-clip-text text-transparent">
                  ENCI
                </h2>
                <p className="text-xs text-muted-foreground">
                  Estate Nest Capital
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
