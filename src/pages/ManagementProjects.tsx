import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ManagementLayout from "@/components/management/ManagementLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${statusColors[p.status] || ""}`}
                        variant="outline"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${p.budget.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/management/project-details?id=${p.id}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
