import ManagementLayout from "@/components/management/ManagementLayout";

export default function ManagementVendors() {
  const vendors = [
    {
      id: 1,
      company_name: "ABC Plumbing Ltd.",
      trade_type: "Plumbing",
      contact: "John Smith",
      phone: "780-123-4567",
      email: "john@abcplumbing.ca",
      status: "Active",
    },
    {
      id: 2,
      company_name: "Elite Electrical",
      trade_type: "Electrical",
      contact: "Mike Brown",
      phone: "780-555-2222",
      email: "info@eliteelectrical.ca",
      status: "Active",
    },
  ];

  return (
    <ManagementLayout currentPageName="vendors">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Vendors
        </h1>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4">Company</th>
                <th className="text-left p-4">Trade</th>
                <th className="text-left p-4">Contact</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Email</th>
              </tr>
            </thead>

            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-4 font-medium">{v.company_name}</td>
                  <td className="p-4">{v.trade_type}</td>
                  <td className="p-4">{v.contact}</td>
                  <td className="p-4">{v.phone}</td>
                  <td className="p-4">{v.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagementLayout>
  );
}
