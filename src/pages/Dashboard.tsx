import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, DollarSign, Receipt, FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalCosts: 0,
    pendingInvoices: 0,
    pipelineProjects: 0,
  });

const fetchStats = async () => {
    const [projects, costs, invoices, pipeline] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact" }).eq("status", "active"),
      supabase.from("construction_costs").select("cost_amount"),
      supabase.from("invoices").select("*", { count: "exact" }).eq("status", "pending"),
      supabase.from("pipeline_projects").select("*", { count: "exact" }),
    ]);

    const totalCosts = costs.data?.reduce((sum, item) => sum + Number(item.cost_amount), 0) || 0;

    setStats({
      activeProjects: projects.count || 0,
      totalCosts,
      pendingInvoices: invoices.count || 0,
      pipelineProjects: pipeline.count || 0,
    });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/management-login");
      } else {
        fetchStats();
      }
    };

    checkAuth();
  }, [navigate]);

  

  const statCards = [
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Construction Costs",
      value: `CA$${stats.totalCosts.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pipeline Projects",
      value: stats.pipelineProjects,
      icon: FolderKanban,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to Estate Nest Capital Inc. Management</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/dashboard/transactions?action=add")} className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
            <Button onClick={() => navigate("/dashboard/projects?action=add")} className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
            <Button onClick={() => navigate("/dashboard/invoices")} className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/dashboard/projects")}>
              <CardContent className="pt-6">
                <Building2 className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">View Projects</h3>
                <p className="text-sm text-muted-foreground">Manage current projects</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/dashboard/costs")}>
              <CardContent className="pt-6">
                <DollarSign className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">Track Costs</h3>
                <p className="text-sm text-muted-foreground">Monitor construction expenses</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/dashboard/invoices")}>
              <CardContent className="pt-6">
                <Receipt className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">Create Invoice</h3>
                <p className="text-sm text-muted-foreground">Generate new invoices</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
