import { useMemo } from "react";
import {
  FolderKanban,
  DollarSign,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import PendingInvoices from "@/components/dashboard/PendingInvoices";
import BudgetChart from "@/components/dashboard/BudgetChart";

export default function ManagementDashboard() {
  const projects = useMemo(
    () => [
      {
        id: "p1",
        project_name: "Parkallen Fourplex",
        civic_address: "109 Street NW, Edmonton",
        status: "Active",
        estimated_budget: 2300000,
      },
      {
        id: "p2",
        project_name: "Corner Daycare Concept",
        civic_address: "80 Ave NW, Edmonton",
        status: "Pre-Construction",
        estimated_budget: 1200000,
      },
    ],
    []
  );

  const tasks = useMemo(
    () => [
      {
        id: "t1",
        task_name: "Foundation Pour",
        status: "Not Started",
        due_date: "2026-04-10",
        project_id: "p1",
        category: "Foundation",
      },
      {
        id: "t2",
        task_name: "Main Floor Framing",
        status: "In Progress",
        due_date: "2026-04-18",
        project_id: "p1",
        category: "Framing",
      },
      {
        id: "t3",
        task_name: "Permit Review Follow-up",
        status: "Pending",
        due_date: "2026-04-12",
        project_id: "p2",
        category: "Permits",
      },
    ],
    []
  );

  const budgetItems = useMemo(
    () => [
      {
        id: "b1",
        vendor_name: "ABC Concrete Ltd.",
        invoice_status: "Pending",
        actual_cost: 45000,
        project_id: "p1",
      },
      {
        id: "b2",
        vendor_name: "Northside Framing",
        invoice_status: "Approved",
        actual_cost: 85000,
        project_id: "p1",
      },
      {
        id: "b3",
        vendor_name: "City Filing Services",
        invoice_status: "Pending",
        actual_cost: 6500,
        project_id: "p2",
      },
    ],
    []
  );

  const vendors = useMemo(
    () => [
      { id: "v1", company_name: "ABC Concrete Ltd." },
      { id: "v2", company_name: "Northside Framing" },
      { id: "v3", company_name: "City Filing Services" },
    ],
    []
  );

  const activeProjects = projects.filter(
    (p) => p.status === "Active" || p.status === "Pre-Construction"
  ).length;

  const totalBudget = projects.reduce(
    (sum, p) => sum + Number(p.estimated_budget || 0),
    0
  );

  const totalActual = budgetItems.reduce(
    (sum, item) => sum + Number(item.actual_cost || 0),
    0
  );

  const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;
  const pendingInvoices = budgetItems.filter(
    (item) => item.invoice_status === "Pending"
  ).length;

  const showFinancials = true;

  return (
    <ManagementLayout currentPageName="dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back. Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`${projects.length} total`}
            icon={FolderKanban}
          />

          {showFinancials && (
            <StatsCard
              title="Total Budget"
              value={`$${(totalBudget / 1000000).toFixed(1)}M`}
              subtitle={`$${(totalActual / 1000000).toFixed(1)}M spent`}
              icon={DollarSign}
            />
          )}

          <StatsCard
            title="Pending Tasks"
            value={pendingTasks}
            subtitle={`${
              tasks.filter((t) => t.status === "Completed").length
            } completed`}
            icon={CheckSquare}
          />

          {showFinancials && (
            <StatsCard
              title="Pending Invoices"
              value={pendingInvoices}
              subtitle="Awaiting action"
              icon={AlertTriangle}
            />
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <ProjectsOverview
            projects={projects}
            showFinancials={showFinancials}
          />
          <UpcomingTasks tasks={tasks} projects={projects} />
        </div>

        {showFinancials && (
          <div className="grid lg:grid-cols-2 gap-6">
            <BudgetChart projects={projects} budgetItems={budgetItems} />
            <PendingInvoices
              budgetItems={budgetItems}
              projects={projects}
              vendors={vendors}
            />
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
