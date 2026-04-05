import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";

type BudgetItem = {
  id: string;
  category_name: string;
  project_name: string;
  vendor_name: string;
  estimated_cost: number;
  actual_cost: number;
  invoice_status: "Pending" | "Paid" | "Holdback";
  payment_due_date: string;
};

export default function ManagementBudgetCosts() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const budgetItems = useMemo<BudgetItem[]>(
    () => [
      {
        id: "bc1",
        category_name: "Concrete",
        project_name: "Parkallen Fourplex",
        vendor_name: "ABC Concrete Ltd.",
        estimated_cost: 50000,
        actual_cost: 45000,
        invoice_status: "Pending",
        payment_due_date: "2026-04-12",
      },
      {
        id: "bc2",
        category_name: "Framing",
        project_name: "Parkallen Fourplex",
        vendor_name: "Northside Framing",
        estimated_cost: 90000,
        actual_cost: 85000,
        invoice_status: "Paid",
        payment_due_date: "2026-04-05",
      },
      {
        id: "bc3",
        category_name: "Permits",
        project_name: "Corner Daycare Concept",
        vendor_name: "City Filing Services",
        estimated_cost: 10000,
        actual_cost: 6500,
        invoice_status: "Holdback",
        payment_due_date: "2026-04-20",
      },
      {
        id: "bc4",
        category_name: "Electrical",
        project_name: "Parkallen Fourplex",
        vendor_name: "Elite Electrical",
        estimated_cost: 30000,
        actual_cost: 34500,
        invoice_status: "Pending",
        payment_due_date: "2026-04-18",
      },
    ],
    []
  );

  const projectOptions = Array.from(new Set(budgetItems.map((i) => i.project_name)));

  const filteredItems = budgetItems.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.category_name.toLowerCase().includes(q) ||
      item.vendor_name.toLowerCase().includes(q);

    const matchesProject =
      projectFilter === "all" || item.project_name === projectFilter;

    const matchesStatus =
      statusFilter === "all" || item.invoice_status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const totalEstimated = filteredItems.reduce(
    (sum, item) => sum + item.estimated_cost,
    0
  );
  const totalActual = filteredItems.reduce(
    (sum, item) => sum + item.actual_cost,
    0
  );
  const totalVariance = totalActual - totalEstimated;
  const pendingAmount = filteredItems
    .filter((i) => i.invoice_status === "Pending")
    .reduce((sum, item) => sum + item.actual_cost, 0);

  return (
    <ManagementLayout currentPageName="budget-costs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Budget & Costs
            </h1>
            <p className="text-slate-500 mt-1">
              {budgetItems.length} cost items tracked
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add Record
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Total Estimated</p>
            <p className="text-2xl font-bold text-slate-900">
              ${totalEstimated.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Total Actual</p>
            <p className="text-2xl font-bold text-slate-900">
              ${totalActual.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Variance</p>
            <p
              className={`text-2xl font-bold flex items-center gap-1 ${
                totalVariance > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {totalVariance > 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              ${Math.abs(totalVariance).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4">
            <p className="text-sm text-slate-500">Pending Payment</p>
            <p className="text-2xl font-bold text-amber-600">
              ${pendingAmount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            placeholder="Search costs..."
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
            <option value="Paid">Paid</option>
            <option value="Holdback">Holdback</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Project</th>
                <th className="p-4">Vendor</th>
                <th className="p-4 text-right">Estimated</th>
                <th className="p-4 text-right">Actual</th>
                <th className="p-4 text-right">Variance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => {
                const variance = item.actual_cost - item.estimated_cost;

                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-4 font-medium text-slate-900">
                      {item.category_name}
                    </td>
                    <td className="p-4 text-slate-600">{item.project_name}</td>
                    <td className="p-4 text-slate-600">{item.vendor_name}</td>
                    <td className="p-4 text-right">
                      ${item.estimated_cost.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      ${item.actual_cost.toLocaleString()}
                    </td>
                    <td
                      className={`p-4 text-right font-medium ${
                        variance > 0
                          ? "text-rose-600"
                          : variance < 0
                          ? "text-emerald-600"
                          : "text-slate-900"
                      }`}
                    >
                      {variance > 0 ? "+" : ""}${variance.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                        {item.invoice_status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{item.payment_due_date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No cost items found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
