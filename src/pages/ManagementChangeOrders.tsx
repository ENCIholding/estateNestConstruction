import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";

type ChangeOrder = {
  id: string;
  description: string;
  project_name: string;
  cost_impact: number;
  client_approval_status: "Pending" | "Approved" | "Rejected";
  requested_by: string;
  created_date: string;
  notes?: string;
};

export default function ManagementChangeOrders() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const changeOrders = useMemo<ChangeOrder[]>(
    () => [
      {
        id: "co1",
        description: "Upgrade front elevation materials",
        project_name: "Parkallen Fourplex",
        cost_impact: 12500,
        client_approval_status: "Pending",
        requested_by: "Client",
        created_date: "2026-04-08",
        notes: "Requested better exterior finish package",
      },
      {
        id: "co2",
        description: "Revise daycare entrance layout",
        project_name: "Corner Daycare Concept",
        cost_impact: 18000,
        client_approval_status: "Approved",
        requested_by: "Architect",
        created_date: "2026-04-02",
      },
      {
        id: "co3",
        description: "Remove decorative ceiling feature",
        project_name: "Parkallen Fourplex",
        cost_impact: -3500,
        client_approval_status: "Rejected",
        requested_by: "Owner",
        created_date: "2026-03-29",
      },
      {
        id: "co4",
        description: "Adjust mechanical room configuration",
        project_name: "Corner Daycare Concept",
        cost_impact: 0,
        client_approval_status: "Approved",
        requested_by: "Consultant",
        created_date: "2026-04-05",
      },
    ],
    []
  );

  const projectOptions = Array.from(
    new Set(changeOrders.map((o) => o.project_name))
  );

  const filteredOrders = changeOrders.filter((order) => {
    const q = search.toLowerCase();
    const matchesSearch =
      order.description.toLowerCase().includes(q) ||
      order.project_name.toLowerCase().includes(q);

    const matchesProject =
      projectFilter === "all" || order.project_name === projectFilter;

    const matchesStatus =
      statusFilter === "all" ||
      order.client_approval_status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const totalImpact = filteredOrders.reduce(
    (sum, order) => sum + order.cost_impact,
    0
  );

  const approvedImpact = filteredOrders
    .filter((o) => o.client_approval_status === "Approved")
    .reduce((sum, order) => sum + order.cost_impact, 0);

  const pendingCount = filteredOrders.filter(
    (o) => o.client_approval_status === "Pending"
  ).length;

  return (
    <ManagementLayout currentPageName="change-orders">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Change Orders
            </h1>
            <p className="text-slate-500 mt-1">
              {changeOrders.length} change orders recorded
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            New Change Order
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900">
              {filteredOrders.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Total Impact</p>
            <p
              className={`text-2xl font-bold flex items-center gap-1 ${
                totalImpact > 0
                  ? "text-rose-600"
                  : totalImpact < 0
                  ? "text-emerald-600"
                  : "text-slate-900"
              }`}
            >
              {totalImpact > 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : totalImpact < 0 ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              {totalImpact > 0 && "+"}${totalImpact.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Approved Impact</p>
            <p
              className={`text-2xl font-bold ${
                approvedImpact > 0
                  ? "text-rose-600"
                  : approvedImpact < 0
                  ? "text-emerald-600"
                  : "text-slate-900"
              }`}
            >
              {approvedImpact > 0 && "+"}${approvedImpact.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            placeholder="Search change orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          />

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Projects</option>
            {projectOptions.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Description</th>
                <th className="p-4">Project</th>
                <th className="p-4 text-right">Cost Impact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Requested By</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">
                      {order.description}
                    </p>
                    {order.notes ? (
                      <p className="text-xs text-slate-500 mt-1">
                        {order.notes}
                      </p>
                    ) : null}
                  </td>

                  <td className="p-4 text-slate-600">
                    {order.project_name}
                  </td>

                  <td
                    className={`p-4 text-right font-semibold ${
                      order.cost_impact > 0
                        ? "text-rose-600"
                        : order.cost_impact < 0
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {order.cost_impact > 0 && "+"}$
                    {order.cost_impact.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                      {order.client_approval_status}
                    </span>
                  </td>

                  <td className="p-4 text-slate-600">
                    {order.requested_by}
                  </td>

                  <td className="p-4 text-slate-600">
                    {order.created_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No change orders found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
