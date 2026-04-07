import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ManagementProjects() {
  const navigate = useNavigate();

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

  const statusColors: Record<string, string> = {
    Planning: "bg-blue-100 text-blue-800",
    "Pre-Construction": "bg-amber-100 text-amber-800",
    Active: "bg-emerald-100 text-emerald-800",
    Warranty: "bg-purple-100 text-purple-800",
    Completed: "bg-slate-100 text-slate-800",
  };

  return (
    <ManagementLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-slate-600">
            Manage and track all construction projects.
          </p>
        </div>

        <div className="grid gap-4">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{p.address}</p>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${statusColors[p.status] || ""}`}
                        variant="outline"
                      >
                        {p.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        ${p.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      navigate(`/management/project-details?id=${p.id}`)
                    }
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ManagementLayout>
  );
}
