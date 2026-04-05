import { useMemo, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";

type Project = {
  id: string;
  project_name: string;
  status: string;
  civic_address: string;
  estimated_budget: number;
  selling_price: number;
};

type Task = {
  id: string;
  project_id: string;
  task_name: string;
  status: string;
};

type BudgetItem = {
  id: string;
  project_id: string;
  estimated_cost: number;
  actual_cost: number;
};

type ChangeOrder = {
  id: string;
  project_id: string;
  title: string;
  cost_impact: number;
  client_approval_status: string;
};

export default function ManagementReports() {
  const [selectedProject, setSelectedProject] = useState<string>("");

  const projects = useMemo<Project[]>(
    () => [
      {
        id: "p1",
        project_name: "Parkallen Fourplex",
        status: "Active",
        civic_address: "109 Street NW, Edmonton",
        estimated_budget: 2300000,
        selling_price: 2750000,
      },
      {
        id: "p2",
        project_name: "Corner Daycare Concept",
        status: "Pre-Construction",
        civic_address: "80 Ave NW, Edmonton",
        estimated_budget: 1200000,
        selling_price: 1600000,
      },
    ],
    []
  );

  const tasks = useMemo<Task[]>(
    () => [
      { id: "t1", project_id: "p1", task_name: "Foundation Pour", status: "Completed" },
      { id: "t2", project_id: "p1", task_name: "Main Floor Framing", status: "In Progress" },
      { id: "t3", project_id: "p1", task_name: "Electrical Rough-In", status: "Not Started" },
      { id: "t4", project_id: "p2", task_name: "Permit Review", status: "In Progress" },
    ],
    []
  );

  const budgetItems = useMemo<BudgetItem[]>(
    () => [
      { id: "b1", project_id: "p1", estimated_cost: 50000, actual_cost: 45000 },
      { id: "b2", project_id: "p1", estimated_cost: 90000, actual_cost: 85000 },
      { id: "b3", project_id: "p2", estimated_cost: 10000, actual_cost: 6500 },
    ],
    []
  );

  const changeOrders = useMemo<ChangeOrder[]>(
    () => [
      {
        id: "c1",
        project_id: "p1",
        title: "Extra window upgrade",
        cost_impact: 8500,
        client_approval_status: "Approved",
      },
      {
        id: "c2",
        project_id: "p2",
        title: "Revised entrance layout",
        cost_impact: 12000,
        client_approval_status: "Pending",
      },
    ],
    []
  );

  const project = projects.find((p) => p.id === selectedProject);
  const projectTasks = tasks.filter((t) => t.project_id === selectedProject);
  const projectBudget = budgetItems.filter((b) => b.project_id === selectedProject);
  const projectChangeOrders = changeOrders.filter((c) => c.project_id === selectedProject);

  const totalEstimated = projectBudget.reduce((sum, item) => sum + item.estimated_cost, 0);
  const totalActual = projectBudget.reduce((sum, item) => sum + item.actual_cost, 0);
  const variance = totalActual - totalEstimated;
  const grossProfit = project ? project.selling_price - totalActual : 0;
  const profitMargin =
    project && project.selling_price > 0
      ? ((grossProfit / project.selling_price) * 100).toFixed(1)
      : "0.0";

  const completedTasks = projectTasks.filter((t) => t.status === "Completed").length;
  const taskProgress =
    projectTasks.length > 0
      ? ((completedTasks / projectTasks.length) * 100).toFixed(0)
      : "0";

  const approvedChangeOrderImpact = projectChangeOrders
    .filter((co) => co.client_approval_status === "Approved")
    .reduce((sum, co) => sum + co.cost_impact, 0);

  return (
    <ManagementLayout currentPageName="reports">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Project Reports
          </h1>
          <p className="text-slate-500 mt-1">
            Generate internal project summary reports
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <label className="block text-sm font-medium mb-2">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="">Choose a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        {!selectedProject && (
          <div className="bg-white rounded-xl shadow border p-8 text-slate-500 text-center">
            Select a project to view its report summary.
          </div>
        )}

        {project && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {project.project_name}
              </h2>
              <p className="text-slate-500 mt-1">{project.civic_address}</p>
              <div className="mt-4 inline-block px-3 py-1 rounded-full bg-slate-100 text-sm">
                {project.status}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow border p-5">
                <p className="text-sm text-slate-500">Task Progress</p>
                <p className="text-2xl font-bold mt-2">{taskProgress}%</p>
              </div>

              <div className="bg-white rounded-xl shadow border p-5">
                <p className="text-sm text-slate-500">Estimated Cost</p>
                <p className="text-2xl font-bold mt-2">
                  ${totalEstimated.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow border p-5">
                <p className="text-sm text-slate-500">Actual Cost</p>
                <p className="text-2xl font-bold mt-2">
                  ${totalActual.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow border p-5">
                <p className="text-sm text-slate-500">Profit Margin</p>
                <p className="text-2xl font-bold mt-2">{profitMargin}%</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Estimated</span>
                    <span>${totalEstimated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual</span>
                    <span>${totalActual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variance</span>
                    <span>${variance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved Change Orders</span>
                    <span>${approvedChangeOrderImpact.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t">
                    <span>Gross Profit</span>
                    <span>${grossProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-lg font-semibold mb-4">Task Summary</h3>
                <div className="space-y-3">
                  {projectTasks.length === 0 ? (
                    <p className="text-slate-500 text-sm">No tasks found</p>
                  ) : (
                    projectTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <span className="text-sm text-slate-700">
                          {task.task_name}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100">
                          {task.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow border p-6">
              <h3 className="text-lg font-semibold mb-4">Change Orders</h3>
              {projectChangeOrders.length === 0 ? (
                <p className="text-slate-500 text-sm">No change orders found</p>
              ) : (
                <div className="space-y-3">
                  {projectChangeOrders.map((co) => (
                    <div
                      key={co.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{co.title}</p>
                        <p className="text-sm text-slate-500">
                          {co.client_approval_status}
                        </p>
                      </div>
                      <div className="text-slate-900 font-medium">
                        ${co.cost_impact.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
