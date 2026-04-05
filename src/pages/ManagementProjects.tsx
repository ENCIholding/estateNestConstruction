import { useMemo } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";

export default function ManagementProjects() {
  const projects = useMemo(
    () => [
      {
        id: "p1",
        name: "Parkallen Fourplex",
        address: "109 Street NW",
        status: "Active",
        budget: 2300000,
      },
      {
        id: "p2",
        name: "Corner Daycare Concept",
        address: "80 Ave NW",
        status: "Pre-Construction",
        budget: 1200000,
      },
    ],
    []
  );

  return (
    <ManagementLayout currentPageName="projects">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Projects
          </h1>
          <p className="text-slate-500 mt-1">
            Manage and track all construction projects.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Budget</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="p-4 text-slate-600">{p.address}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-900">
                    ${p.budget.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagementLayout>
  );
}
