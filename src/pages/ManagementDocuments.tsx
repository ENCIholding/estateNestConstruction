import { useMemo, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";

type DocumentItem = {
  id: string;
  file_name: string;
  project_name: string;
  document_type: string;
  uploaded_date: string;
  file_url?: string;
};

export default function ManagementDocuments() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const documents = useMemo<DocumentItem[]>(
    () => [
      {
        id: "d1",
        file_name: "Development Permit Package.pdf",
        project_name: "Parkallen Fourplex",
        document_type: "Contract",
        uploaded_date: "2026-04-01",
        file_url: "#",
      },
      {
        id: "d2",
        file_name: "Foundation Invoice - ABC Concrete.pdf",
        project_name: "Parkallen Fourplex",
        document_type: "Invoice",
        uploaded_date: "2026-04-03",
        file_url: "#",
      },
      {
        id: "d3",
        file_name: "Site Progress Photo - April 5.jpg",
        project_name: "Corner Daycare Concept",
        document_type: "Site Photo",
        uploaded_date: "2026-04-05",
        file_url: "#",
      },
      {
        id: "d4",
        file_name: "Change Order 001.pdf",
        project_name: "Parkallen Fourplex",
        document_type: "Change Order",
        uploaded_date: "2026-04-06",
        file_url: "#",
      },
    ],
    []
  );

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.file_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || doc.document_type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <ManagementLayout currentPageName="documents">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Project Documents
            </h1>
            <p className="text-slate-500 mt-1">
              {documents.length} documents uploaded
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add Record
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Types</option>
            <option value="Contract">Contract</option>
            <option value="Invoice">Invoice</option>
            <option value="Change Order">Change Order</option>
            <option value="Site Photo">Site Photo</option>
            <option value="General">General</option>
            <option value="Generated Report">Generated Report</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-4">File Name</th>
                <th className="p-4">Project</th>
                <th className="p-4">Type</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-4 font-medium text-slate-900">
                    {doc.file_name}
                  </td>
                  <td className="p-4 text-slate-600">{doc.project_name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                      {doc.document_type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{doc.uploaded_date}</td>
                  <td className="p-4">
                    <a
                      href={doc.file_url || "#"}
                      className="text-slate-900 underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No documents found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
