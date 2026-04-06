import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink,
  Loader2,
  Pencil,
  Star,
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

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
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
    queryFn: () => fetchJson<Vendor>(`/api/management/vendors/${vendorId}`),
    enabled: !!vendorId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchJson<Task[]>("/api/management/tasks"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<Project[]>("/api/management/projects"),
  });

  const vendorTasks = useMemo(
    () => tasks.filter((t) => t.vendor_id === vendorId),
    [tasks, vendorId]
  );

  const vendorProjects = useMemo(() => {
    const ids = [...new Set(vendorTasks.map((t) => t.project_id).filter(Boolean))] as string[];
    return projects
      .filter((p) => ids.includes(p.id))
      .map((p) => ({
        ...p,
        year: p.start_date ? new Date(p.start_date).getFullYear() : null,
      }));
  }, [vendorTasks, projects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendorId || !vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Vendor not found</p>
        <Link to="/management/vendors" className="text-blue-600 hover:underline">
          Back to Vendors
        </Link>
      </div>
    );
  }

  const whatsappPhone = normalizeWhatsAppPhone(vendor.phone);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-4 items-center">
          <Link to="/management/vendors">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold">{vendor.company_name || "Unnamed Vendor"}</h1>
            <Badge variant="outline" className="mt-2">
              {vendor.trade_type || "—"}
            </Badge>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)} variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Contact Person</p>
                <p>{vendor.contact_person || "—"}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Phone</p>
                {vendor.phone && whatsappPhone ? (
                  <a
                    href={`https://wa.me/${whatsappPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {vendor.phone}
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Email</p>
                {vendor.email ? (
                  <a
                    href={`mailto:${vendor.email}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {vendor.email}
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500">Website</p>
                {vendor.website ? (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {vendor.website}
                  </a>
                ) : (
                  <p>—</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>WCB: {vendor.wcb_account_number || "—"}</p>
              <p>GST: {vendor.gst_number || "—"}</p>
              <p>
                Insurance:{" "}
                {vendor.insurance_expiry_date
                  ? format(new Date(vendor.insurance_expiry_date), "MMM d, yyyy")
                  : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{vendor.notes || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{vendor.internal_notes || "—"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-slate-500 mb-1">Rating</p>
                {vendor.vendor_rating ? (
                  <Badge>
                    <Star className="h-3 w-3 mr-1" />
                    {vendor.vendor_rating}
                  </Badge>
                ) : (
                  <p>—</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Would work again</p>
                <div className="flex gap-2 items-center">
                  {vendor.work_again ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Yes</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>No</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorProjects.length > 0 ? (
                vendorProjects.map((p) => (
                  <Link key={p.id} to={`/management/project-details?id=${p.id}`}>
                    <div className="p-3 border rounded-md mb-2 hover:bg-slate-50">
                      <p className="font-medium">{p.project_name || "Unnamed Project"}</p>
                      <p className="text-sm text-slate-500">{p.year || "—"}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500">No project history found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ManagementVendorForm
        vendor={vendor}
        open={showForm}
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
