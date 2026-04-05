import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";

type ClientSelection = {
  id: string;
  item_name: string;
  project_name: string;
  client_choice_description: string;
  budgeted_cost: number;
  actual_cost: number;
  variance: number;
  status: "Pending" | "Approved" | "Ordered" | "Installed";
};

export default function ManagementClientSelections() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const selections = useMemo<ClientSelection[]>(
    () => [
      {
        id: "cs1",
        item_name: "Kitchen Cabinets",
        project_name: "Parkallen Fourplex",
        client_choice_description: "Upgraded matte white shaker cabinets",
        budgeted_cost: 12000,
        actual_cost: 15500,
        variance: 3500,
        status: "Approved",
      },
      {
        id: "cs2",
        item_name: "Flooring",
        project_name: "Parkallen Fourplex",
        client_choice_description: "Luxury vinyl plank throughout main floor",
        budgeted_cost: 8500,
        actual_cost: 7600,
        variance: -900,
        status: "Ordered",
      },
      {
        id: "cs3",
        item_name: "Lighting Package",
        project_name: "Corner Daycare Concept",
        client_choice_description: "Commercial-grade LED fixtures",
        budgeted_cost: 6000,
        actual_cost: 7200,
        variance: 1200,
        status: "Pending",
      },
      {
        id: "cs4",
        item_name: "Washroom Fixtures",
        project_name: "Corner Daycare Concept",
        client_choice_description: "Touchless faucet and soap dispenser package",
        budgeted_cost: 2800,
        actual_cost: 2800,
        variance: 0,
        status: "Installed",
      },
    ],
    []
  );

  const projectOptions = Array.from(
    new Set(selections.map((s) => s.project_name))
  );

  const filteredSelections = selections.filter((sel) => {
    const q = search.toLowerCase();
    const matchesSearch = sel.item_name.toLowerCase().includes(q);
    const matchesProject =
      projectFilter === "all" || sel.project_name === projectFilter;
    const matchesStatus =
      statusFilter === "all" || sel.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const totalUpgrades = filteredSelections.reduce(
    (sum, sel) => sum + sel.variance,
    0
  );

  return (
    <ManagementLayout currentPageName="client-selections">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Client Selections
            </h1>
            <p className="text-slate-500 mt-1">
              {selections.length} selections tracked
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add Record
          </button>
        </div>

        <div className="bg-white rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Upgrades / Downgrades
            </p>
            <p
              className={`text-2xl font-bold ${
                totalUpgrades > 0
                  ? "text-rose-600"
                  : totalUpgrades < 0
                  ? "text-emerald-600"
                  : "text-slate-900"
              }`}
            >
              {totalUpgrades > 0 && "+"}
              {totalUpgrades === 0 ? "$0" : `$${totalUpgrades.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            placeholder="Search selections..."
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
            <option value="Ordered">Ordered</option>
            <option value="Installed">Installed</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Project</th>
                <th className="p-4">Client Choice</th>
                <th className="p-4 text-right">Budgeted</th>
                <th className="p-4 text-right">Actual</th>
                <th className="p-4 text-right">Variance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredSelections.map((sel) => (
                <tr key={sel.id} className="border-t">
                  <td className="p-4 font-medium text-slate-900">
                    {sel.item_name}
                  </td>

                  <td className="p-4 text-slate-600">{sel.project_name}</td>

                  <td className="p-4 text-slate-600 max-w-xs truncate">
                    {sel.client_choice_description}
                  </td>

                  <td className="p-4 text-right">
                    ${sel.budgeted_cost.toLocaleString()}
                  </td>

                  <td className="p-4 text-right">
                    ${sel.actual_cost.toLocaleString()}
                  </td>

                  <td
                    className={`p-4 text-right font-semibold ${
                      sel.variance > 0
                        ? "text-rose-600"
                        : sel.variance < 0
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      {sel.variance > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : sel.variance < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : null}
                      {sel.variance > 0 && "+"}$
                      {Math.abs(sel.variance).toLocaleString()}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                      {sel.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSelections.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No selections found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
