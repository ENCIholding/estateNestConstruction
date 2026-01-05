import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import  Input  from "@/components/ui/input";
import Label  from "@/components/ui/label";
import Dialog ,{
  
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Select, {
  
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Table,{
  
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";

/* =======================
   Types
======================= */
interface CostItem {
  id: string;
  cost_item: string;
  vendor_name: string;
  vendor_contact: string;
  vendor_email: string;
  vendor_phone: string;
  cost_amount: number;
  year: number;
  comments: string;
  project_id: string;
}

const ConstructionCosts = () => {
  const navigate = useNavigate();

  const [costs, setCosts] = useState<CostItem[]>([]);
  const [filteredCosts, setFilteredCosts] = useState<CostItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newCost, setNewCost] = useState({
    cost_item: "",
    vendor_name: "",
    vendor_contact: "",
    vendor_email: "",
    vendor_phone: "",
    cost_amount: "",
    year: new Date().getFullYear().toString(),
    comments: "",
  });

  /* =======================
     Fetch Costs
  ======================= */
  const fetchCosts = async () => {
    if (!supabase) {
  console.warn("Supabase not configured");
  return;
}

const { data, error } = await supabase
  .from("construction_costs")
  .select("*")
  .order("year", { ascending: false })
  .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch construction costs");
      return;
    }

    if (!data) return;

    const typedData = data as CostItem[];

    setCosts(typedData);
    setFilteredCosts(typedData);

    const uniqueYears = Array.from(
      new Set(typedData.map((c) => c.year))
    ).sort((a, b) => b - a);

    setYears(uniqueYears);
  };

  /* =======================
     Auth Check
  ======================= */
 useEffect(() => {
  const checkAuth = async () => {
    try {
      // If Supabase is not configured, force login
      if (!supabase) {
        navigate("/management-login");
        return;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!session) {
        navigate("/management-login");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/management-login");
    }
  };

  checkAuth();
}, [navigate]);

  /* =======================
     Filters
  ======================= */
  const filterByYear = (year: string) => {
    setSelectedYear(year);

    if (year === "all") {
      setFilteredCosts(costs);
    } else {
      const parsedYear = parseInt(year, 10);
      setFilteredCosts(costs.filter((c) => c.year === parsedYear));
    }
  };

  /* =======================
     Add Cost
  ======================= */
  const handleAddCost = async () => {
    if (!newCost.cost_item || !newCost.vendor_name || !newCost.cost_amount) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
  if (!supabase) return;

const row = {
  cost_item: newCost.cost_item,
  vendor_name: newCost.vendor_name,        // ✅ REQUIRED (string)
  vendor_contact: newCost.vendor_contact || "",
  vendor_email: newCost.vendor_email || "",
  vendor_phone: newCost.vendor_phone || "",
  cost_amount: Number(newCost.cost_amount),
  year: Number(newCost.year),
  comments: newCost.comments || "",
};

const { error } = await supabase
  .from("construction_costs")
  .insert([row]);

if (error) {
  throw error;
}


  // success handling here (toast, reset form, refetch, etc.)
} catch (err) {
  console.error("Failed to insert construction cost:", err);
}


    toast.success("Cost item added successfully");
    setIsAddDialogOpen(false);
    setNewCost({
      cost_item: "",
      vendor_name: "",
      vendor_contact: "",
      vendor_email: "",
      vendor_phone: "",
      cost_amount: "",
      year: new Date().getFullYear().toString(),
      comments: "",
    });

    fetchCosts();
  };

  /* =======================
     CSV Download
  ======================= */
  const downloadCSV = () => {
    const headers = [
      "Cost Item",
      "Vendor Name",
      "Contact",
      "Email",
      "Phone",
      "Cost (CAD)",
      "Year",
      "Comments",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredCosts.map((c) =>
        [
          c.cost_item,
          c.vendor_name,
          c.vendor_contact,
          c.vendor_email,
          c.vendor_phone,
          c.cost_amount,
          c.year,
          c.comments,
        ]
          .map((v) => `"${v ?? ""}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `construction-costs-${selectedYear}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const totalCost = filteredCosts.reduce(
    (sum, c) => sum + c.cost_amount,
    0
  );

  /* =======================
     Render
  ======================= */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              Construction Cost Tracking
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage construction expenses
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Line
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Cost Item</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Item *</Label>
                  <Input
                    value={newCost.cost_item}
                    onChange={(e) =>
                      setNewCost({ ...newCost, cost_item: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Vendor Name *</Label>
                  <Input
                    value={newCost.vendor_name}
                    onChange={(e) =>
                      setNewCost({ ...newCost, vendor_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Vendor Contact</Label>
                  <Input
                    value={newCost.vendor_contact}
                    onChange={(e) =>
                      setNewCost({
                        ...newCost,
                        vendor_contact: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Vendor Email</Label>
                  <Input
                    type="email"
                    value={newCost.vendor_email}
                    onChange={(e) =>
                      setNewCost({
                        ...newCost,
                        vendor_email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Vendor Phone</Label>
                  <Input
                    value={newCost.vendor_phone}
                    onChange={(e) =>
                      setNewCost({
                        ...newCost,
                        vendor_phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Cost (CAD) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newCost.cost_amount}
                    onChange={(e) =>
                      setNewCost({
                        ...newCost,
                        cost_amount: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    value={newCost.year}
                    onChange={(e) =>
                      setNewCost({ ...newCost, year: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label>Comments</Label>
                  <Input
                    value={newCost.comments}
                    onChange={(e) =>
                      setNewCost({ ...newCost, comments: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleAddCost} className="w-full mt-4">
                Add Cost Item
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <Select value={selectedYear} onValueChange={filterByYear}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>
                Cost Summary –{" "}
                {selectedYear === "all" ? "All Years" : selectedYear}
              </span>
              <span className="text-primary">
                Total: CA${totalCost.toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cost Item</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">
                    Cost (CAD)
                  </TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCosts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No cost items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCosts.map((cost) => (
                    <TableRow key={cost.id}>
                      <TableCell>{cost.cost_item}</TableCell>
                      <TableCell>{cost.vendor_name}</TableCell>
                      <TableCell>{cost.vendor_contact}</TableCell>
                      <TableCell>{cost.vendor_email}</TableCell>
                      <TableCell>{cost.vendor_phone}</TableCell>
                      <TableCell className="text-right font-semibold">
                        CA${cost.cost_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{cost.year}</TableCell>
                      <TableCell>{cost.comments}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ConstructionCosts;
