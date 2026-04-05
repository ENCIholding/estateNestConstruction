import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";

type ComplianceItem = {
  id: string;
  project_name: string;
  civic_address: string;
  alberta_one_call_status: string;
  development_permit_issued: boolean;
  building_permit_issued: boolean;
  new_home_warranty_enrolled: boolean;
  final_grade_certificate_issued: boolean;
  occupancy_permit_issued: boolean;
};

export default function ManagementCompliance() {
  const [search, setSearch] = useState("");

  const compliance = useMemo<ComplianceItem[]>(
    () => [
      {
        id: "cmp1",
        project_name: "Parkallen Fourplex",
        civic_address: "109 Street NW",
        alberta_one_call_status: "Cleared",
        development_permit_issued: true,
        building_permit_issued: true,
        new_home_warranty_enrolled: true,
        final_grade_certificate_issued: false,
        occupancy_permit_issued: false,
      },
      {
        id: "cmp2",
        project_name: "Corner Daycare Concept",
        civic_address: "80 Ave NW",
        alberta_one_call_status: "Pending",
        development_permit_issued: true,
        building_permit_issued: false,
        new_home_warranty_enrolled: false,
        final_grade_certificate_issued: false,
        occupancy_permit_issued: false,
      },
    ],
    []
  );

  const filtered = compliance.filter((item) =>
    item.project_name.toLowerCase().includes(search.toLowerCase())
  );

  const getScore = (item: ComplianceItem) => {
    let total = 5;
    let done = 0;

    if (item.alberta_one_call_status === "Cleared") done++;
    if (item.development_permit_issued) done++;
    if (item.building_permit_issued) done++;
    if (item.new_home_warranty_enrolled) done++;
    if (item.final_grade_certificate_issued) done++;

    return Math.round((done / total) * 100);
  };

  return (
    <ManagementLayout currentPageName="compliance">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Compliance & Safety
          </h1>
          <p className="text-slate-500">
            Track permits and regulatory requirements
          </p>
        </div>

        <input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 w-full"
        />

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const score = getScore(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow border p-5 space-y-3"
              >
                <div>
                  <h2 className="font-semibold text-lg">
                    {item.project_name}
                  </h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.civic_address}
                  </p>
                </div>

                <div className="text-sm">
                  Completion:{" "}
                  <span
                    className={`font-semibold ${
                      score === 100
                        ? "text-emerald-600"
                        : score >= 60
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <StatusRow
                    label="Alberta One-Call"
                    done={item.alberta_one_call_status === "Cleared"}
                  />
                  <StatusRow
                    label="Development Permit"
                    done={item.development_permit_issued}
                  />
                  <StatusRow
                    label="Building Permit"
                    done={item.building_permit_issued}
                  />
                  <StatusRow
                    label="Warranty"
                    done={item.new_home_warranty_enrolled}
                  />
                  <StatusRow
                    label="Final Grade"
                    done={item.final_grade_certificate_issued}
                  />
                  <StatusRow
                    label="Occupancy"
                    done={item.occupancy_permit_issued}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            No compliance records found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      ) : (
        <Clock className="h-5 w-5 text-amber-500" />
      )}
    </div>
  );
}
