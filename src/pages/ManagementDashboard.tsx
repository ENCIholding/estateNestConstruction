import ManagementLayout from "@/components/management/ManagementLayout";

export default function ManagementDashboard() {
  return (
    <ManagementLayout currentPageName="dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-sm text-slate-500">Projects</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-sm text-slate-500">Vendors</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow border">
            <h2 className="text-sm text-slate-500">Invoices</h2>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome to ENCI Management Dashboard
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            This is your new internal system. Data integration will be added next.
          </p>
        </div>
      </div>
    </ManagementLayout>
  );
}
