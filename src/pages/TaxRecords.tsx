import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Dialog, {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";

/* ================= TYPES ================= */

interface TaxRecord {
  id: string;
  fiscal_year: number | null;
  accountant_name: string | null;
  accountant_phone: string | null;
  accountant_email: string | null;
  cra_tax_paid: number | null;
  cra_tax_year: number | null;
  gst_paid: number | null;
  gst_year: number | null;
  year_end_date: string | null;
  filing_deadline: string | null;
  notes: string | null;
}

/* ================= COMPONENT ================= */

const TaxRecords = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newRecord, setNewRecord] = useState({
    fiscal_year: new Date().getFullYear(),
    accountant_name: "",
    accountant_phone: "",
    accountant_email: "",
    cra_tax_paid: "",
    cra_tax_year: new Date().getFullYear(),
    gst_paid: "",
    gst_year: new Date().getFullYear(),
    year_end_date: "",
    filing_deadline: "",
    notes: "",
  });

  /* ================= DATA ================= */

  const fetchRecords = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("tax_records")
        .select("*")
        .order("fiscal_year", { ascending: false });

      if (error) throw error;
      if (data) setRecords(data);
    } catch (err) {
      console.error("Failed to fetch tax records:", err);
    }
  };

  /* ================= AUTH ================= */

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!supabase) {
          navigate("/management-login");
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          navigate("/management-login");
        } else {
          fetchRecords();
        }
      } catch {
        navigate("/management-login");
      }
    };

    checkAuth();
  }, [navigate]);

  /* ================= ACTIONS ================= */

  const handleAddRecord = async () => {
    if (!supabase) {
      toast.error("Backend not configured");
      return;
    }

    if (!newRecord.accountant_name || !newRecord.fiscal_year) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const row = {
        fiscal_year: Number(newRecord.fiscal_year),
        accountant_name: newRecord.accountant_name,
        accountant_phone: newRecord.accountant_phone || "",
        accountant_email: newRecord.accountant_email || "",
        cra_tax_paid: newRecord.cra_tax_paid
          ? Number(newRecord.cra_tax_paid)
          : null,
        cra_tax_year: Number(newRecord.cra_tax_year),
        gst_paid: newRecord.gst_paid ? Number(newRecord.gst_paid) : null,
        gst_year: Number(newRecord.gst_year),
        year_end_date: newRecord.year_end_date || null,
        filing_deadline: newRecord.filing_deadline || null,
        notes: newRecord.notes || "",
      };

      const { error } = await supabase
        .from("tax_records")
        .insert([row]); // ✅ MUST be array

      if (error) throw error;

      toast.success("Tax record added successfully");
      setIsAddDialogOpen(false);
      setNewRecord({
        fiscal_year: new Date().getFullYear(),
        accountant_name: "",
        accountant_phone: "",
        accountant_email: "",
        cra_tax_paid: "",
        cra_tax_year: new Date().getFullYear(),
        gst_paid: "",
        gst_year: new Date().getFullYear(),
        year_end_date: "",
        filing_deadline: "",
        notes: "",
      });

      fetchRecords();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add tax record");
    }
  };

  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Tax Records</h1>
            <p className="text-muted-foreground">
              Manage tax filings and accountant information
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Tax Record
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Tax Record</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fiscal Year *</Label>
                  <Input
                    type="number"
                    value={newRecord.fiscal_year}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        fiscal_year: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accountant Name *</Label>
                  <Input
                    value={newRecord.accountant_name}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        accountant_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accountant Phone</Label>
                  <Input
                    value={newRecord.accountant_phone}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        accountant_phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accountant Email</Label>
                  <Input
                    type="email"
                    value={newRecord.accountant_email}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        accountant_email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>CRA Tax Paid (CAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecord.cra_tax_paid}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        cra_tax_paid: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>CRA Tax Year</Label>
                  <Input
                    type="number"
                    value={newRecord.cra_tax_year}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        cra_tax_year: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>GST Paid (CAD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRecord.gst_paid}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        gst_paid: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>GST Year</Label>
                  <Input
                    type="number"
                    value={newRecord.gst_year}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        gst_year: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Year-End Date</Label>
                  <Input
                    type="date"
                    value={newRecord.year_end_date}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        year_end_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Filing Deadline</Label>
                  <Input
                    type="date"
                    value={newRecord.filing_deadline}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        filing_deadline: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    rows={3}
                    value={newRecord.notes}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                Add Tax Record
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No tax records found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>
                      Fiscal Year {record.fiscal_year ?? "N/A"}
                    </CardTitle>
                    {record.filing_deadline && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Filing:{" "}
                        {new Date(record.filing_deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Accountant Information
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="text-muted-foreground inline">
                            Name:
                          </dt>
                          <dd className="inline ml-2">
                            {record.accountant_name}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            Phone:
                          </dt>
                          <dd className="inline ml-2">
                            {record.accountant_phone || "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            Email:
                          </dt>
                          <dd className="inline ml-2">
                            {record.accountant_email || "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Tax Payments
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="text-muted-foreground inline">
                            CRA Tax:
                          </dt>
                          <dd className="inline ml-2 font-semibold">
                            {record.cra_tax_paid !== null
                              ? `CA$${record.cra_tax_paid.toLocaleString()}`
                              : "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            Tax Year:
                          </dt>
                          <dd className="inline ml-2">
                            {record.cra_tax_year ?? "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            GST Paid:
                          </dt>
                          <dd className="inline ml-2 font-semibold">
                            {record.gst_paid !== null
                              ? `CA$${record.gst_paid.toLocaleString()}`
                              : "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            GST Year:
                          </dt>
                          <dd className="inline ml-2">
                            {record.gst_year ?? "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Key Dates
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="text-muted-foreground inline">
                            Year-End:
                          </dt>
                          <dd className="inline ml-2">
                            {record.year_end_date
                              ? new Date(
                                  record.year_end_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">
                            Deadline:
                          </dt>
                          <dd className="inline ml-2">
                            {record.filing_deadline
                              ? new Date(
                                  record.filing_deadline
                                ).toLocaleDateString()
                              : "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {record.notes && (
                      <div className="col-span-full">
                        <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          Notes
                        </h3>
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TaxRecords;
