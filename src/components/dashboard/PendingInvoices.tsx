type BudgetItem = {
  id?: string;
  vendor_name?: string;
  invoice_status?: string;
  actual_cost?: number;
  project_id?: string;
};

type Project = {
  id?: string;
  project_name?: string;
};

type Vendor = {
  id?: string;
  company_name?: string;
};

type PendingInvoicesProps = {
  budgetItems: BudgetItem[];
  projects: Project[];
  vendors: Vendor[];
};

export default function PendingInvoices({
  budgetItems,
  projects,
  vendors,
}: PendingInvoicesProps) {
  const pendingItems = budgetItems
    .filter((item) => item.invoice_status === "Pending")
    .slice(0, 5);

  const getProjectName = (item: BudgetItem) => {
    const match = projects.find((p) => p.id === item.project_id);
    return match?.project_name || "Unknown Project";
  };

  const getVendorName = (item: BudgetItem) => {
    if (item.vendor_name) return item.vendor_name;
    const vendor = vendors.find((v) => v.id === item.id);
    return vendor?.company_name || "Unknown Vendor";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Pending Invoices</h2>
        <button className="text-sm text-slate-500 hover:text-slate-900">
          View All →
        </button>
      </div>

      {pendingItems.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center">
          No pending invoices
        </div>
      ) : (
        <div className="space-y-3">
          {pendingItems.map((item, index) => (
            <div
              key={item.id || index}
              className="border border-slate-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {getVendorName(item)}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {getProjectName(item)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    ${Number(item.actual_cost || 0).toLocaleString()}
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 inline-block mt-2">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
