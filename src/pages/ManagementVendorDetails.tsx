import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  Pencil,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import ManagementVendorForm, {
  type ManagementVendor,
} from "@/components/vendors/ManagementVendorForm";

type Vendor = ManagementVendor & {
  id: string;
};

type Task = {
  id: string;
  vendor_id?: string;
  project_id?: string;
};

type Project = {
  id: string;
  project_name?: string;
  start_date?: string;
};

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let message = "API error";
    try {
      const errorData = await res.json();
      message = errorData?.error || message;
    } catch {
      message = `${res.status} ${res.statusText}`;
    }
    throw new Error(message);
  }

  return res.json();
}

function normalizeWhatsAppPhone(phone?: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("1") ? digits : `1${digits}`;
}

export default function ManagementVendorDetails() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const vendorId = searchParams.get("id");

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => fetchJson(`/api/management/vendors/${vendorId}`),
    enabled: !!vendorId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson("/api/management/tasks"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const vendorTasks = useMemo(
    () => tasks.filter((t: Task) => t.vendor_id === vendorId),
    [tasks, vendorId]
  );

  const vendorProjects = useMemo(() => {
    const ids = [
      ...new Set(vendorTasks.map((t: Task) => t.project_id).filter(Boolean)),
    ] as string[];
    return projects
      .filter((p: Project) => ids.includes(p.id))
      .map((p: Project) => ({
        ...p,
        year: p.start_date ? new Date(p.start_date).getFullYear() : null,
      }));
  }, [vendorTasks, projects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!vendorId || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Vendor not found</p>
        <Link to="/management/vendors">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
        </Link>
      </div>
    );
  }

  const whatsappPhone = normalizeWhatsAppPhone(vendor.phone);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <Link to="/management/vendors" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {vendor.company_name || "Unnamed Vendor"}
            </h1>
            <p className="text-slate-600">{vendor.trade_type || "—"}</p>
          </div>

          <Button onClick={() => setShowForm(true)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Contact Person</p>
              <p className="font-medium">{vendor.contact_person || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600">Phone</p>
              {vendor.phone && whatsappPhone ? (
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {vendor.phone}
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-600">Email</p>
              {vendor.email ? (
                <a
                  href={`mailto:${vendor.email}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {vendor.email}
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>

            <div>
              <p className="text-sm text-slate-600">Website</p>
              {vendor.website ? (
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {vendor.website}
                </a>
              ) : (
                <p className="font-medium">—</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">WCB</p>
              <p className="font-medium">{vendor.wcb_account_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">GST</p>
              <p className="font-medium">{vendor.gst_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Insurance Expiry</p>
              <p className="font-medium">
                {vendor.insurance_expiry_date
                  ? format(new Date(vendor.insurance_expiry_date), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Rating</p>
              <p className="font-medium">{vendor.vendor_rating ? vendor.vendor_rating : "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Would Work Again</p>
              <p className="font-medium">
                {vendor.work_again ? (
                  <CheckCircle2 className="inline h-4 w-4 text-emerald-600 mr-1" />
                ) : (
                  <XCircle className="inline h-4 w-4 text-rose-600 mr-1" />
                )}{" "}
                {vendor.work_again ? "Yes" : "No"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {vendorProjects.length > 0 ? (
              <div className="space-y-2">
                {vendorProjects.map((p: Project & { year: number | null }) => (
                  <div key={p.id} className="text-sm">
                    <p className="font-medium">{p.project_name || "Unnamed"}</p>
                    <p className="text-slate-600">{p.year || "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No project history found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {vendor.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{vendor.notes}</p>
          </CardContent>
        </Card>
      )}

      {vendor.internal_notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700">{vendor.internal_notes}</p>
          </CardContent>
        </Card>
      )}

      <ManagementVendorForm
        open={showForm}
        vendor={vendor}
        onClose={() => setShowForm(false)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
          queryClient.invalidateQueries({ queryKey: ["vendors"] });
          setShowForm(false);
        }}
      />
    </div>
  );
}
