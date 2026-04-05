import { useMemo, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";

type InvoiceItem = {
  id: string;
  client_name: string;
  project_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  gst_number?: string;
};

export default function ManagementClientInvoices() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const invoices = useMemo<InvoiceItem[]>(
    () => [
      {
        id: "ci1",
        client_name: "Parkallen Development Group",
        project_name: "Parkallen Fourplex",
        invoice_date: "2026-04-01",
        due_date: "2026-04-15",
        total_amount: 125000,
        status: "Sent",
        gst_number: "123456789RT0001",
      },
      {
        id: "ci2",
        client_name: "Corner Kids Daycare Ltd.",
        project_name: "Corner Daycare Concept",
        invoice_date: "2026-04-03",
        due_date: "2026-04-20",
        total_amount: 48000,
        status: "Draft",
      },
      {
        id: "ci3",
        client_name: "Parkallen Development Group",
        project_name: "Parkallen Fourplex",
        invoice_date: "2026-03-20",
        due_date: "2026-04-05",
        total_amount: 78000,
        status: "Paid",
      },
      {
        id: "ci4",
        client_name: "Corner Kids Daycare Ltd.",
        project_name: "Corner Daycare Concept",
        invoice_date: "2026-03-18",
        due_date: "2026-03-30",
        total_amount: 22500,
        status: "Overdue",
      },
    ],
    []
  );

  const projectOptions = Array.from(new Set(invoices.map((i) => i.project_name)));

  const filteredInvoices = invoices.filter((invoice) => {
    const q = search.toLowerCase();
    const matchesSearch = invoice.client_name.toLowerCase().includes(q);
    const matchesProject =
      projectFilter === "all" || invoice.project_name === projectFilter;
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  return (
    <ManagementLayout currentPageName="client-invoices">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Client Invoices
            </h1>
            <p className="text-slate-500 mt-1">
              {invoices.length} invoices issued
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add Record
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            placeholder="Search invoices..."
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
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Project</th>
                <th className="p-4">Invoice Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="p-4">
                    <p className="font-medium text-slate-900">
                      {invoice.client_name}
                    </p>
                    {invoice.gst_number ? (
                      <p className="text-xs text-slate-500 mt-1">
                        GST: {invoice.gst_number}
                      </p>
                    ) : null}
                  </td>

                  <td className="p-4 text-slate-600">
                    {invoice.project_name}
                  </td>

                  <td className="p-4 text-slate-600">
                    {invoice.invoice_date}
                  </td>

                  <td className="p-4 text-slate-600">
                    {invoice.due_date}
                  </td>

                  <td className="p-4 text-right font-semibold text-slate-900">
                    ${invoice.total_amount.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No invoices found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
