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
    <div className="dashboard-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pending Invoices</h2>
        <button className="text-sm text-muted-foreground transition-colors hover:text-enc-orange">
          View All →
        </button>
      </div>

      {pendingItems.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground/80">
          No pending invoices
        </div>
      ) : (
        <div className="space-y-3">
          {pendingItems.map((item, index) => (
            <div
              key={item.id || index}
              className="dashboard-item p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">
                    {getVendorName(item)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getProjectName(item)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${Number(item.actual_cost || 0).toLocaleString()}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-enc-yellow/10 px-3 py-1 text-xs text-amber-700 dark:text-enc-yellow-light">
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
