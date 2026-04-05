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
import VendorForm from "@/components/vendors/VendorForm";

type Vendor = {
  id: string;
  company_name?: string;
  trade_type?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  wcb_account_number?: string;
  gst_number?: string;
  insurance_expiry_date?: string;
  notes?: string;
  vendor_rating?: string;
  work_again?: boolean;
  internal_notes?: string;
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

  if (!res.ok) throw new Error("API error");
  return res.json();
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
    const ids = [...new Set(vendorTasks.map((t) => t.project_id))];
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

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Vendor not found</p>
        <Link to="/management/vendors" className="text-blue-600 hover:underline">
          Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link to="/management/vendors">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold">{vendor.company_name}</h1>
            <Badge variant="outline" className="mt-2">
              {vendor.trade_type}
            </Badge>
          </div>
        </div>

        <Button onClick={() => setShowForm(true)} variant="outline">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* CONTACT */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {vendor.contact_person && <p>{vendor.contact_person}</p>}

              {vendor.phone && (
                <a
                  href={`https://wa.me/1${vendor.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex items-center gap-1 text-emerald-600"
                >
                  <Phone className="h-4 w-4" />
                  {vendor.phone}
                </a>
              )}

              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="flex items-center gap-1 text-blue-600"
                >
                  <Mail className="h-4 w-4" />
                  {vendor.email}
                </a>
              )}

              {vendor.website && (
                <a href={vendor.website} target="_blank">
                  <ExternalLink />
                </a>
              )}
            </CardContent>
          </Card>

          {/* COMPLIANCE */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p>WCB: {vendor.wcb_account_number}</p>
              <p>GST: {vendor.gst_number}</p>
              <p>
                Insurance:{" "}
                {vendor.insurance_expiry_date
                  ? format(new Date(vendor.insurance_expiry_date), "MMM d yyyy")
                  : "—"}
              </p>
            </CardContent>
          </Card>

          {/* NOTES */}
          {vendor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>{vendor.notes}</CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* PERFORMANCE */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.vendor_rating && (
                <Badge>
                  <Star className="h-3 w-3 mr-1" />
                  {vendor.vendor_rating}
                </Badge>
              )}

              <div className="mt-2 flex gap-2 items-center">
                {vendor.work_again ? (
                  <>
                    <CheckCircle2 className="text-green-500" />
                    Yes
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500" />
                    No
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PROJECT HISTORY */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {vendorProjects.map((p) => (
                <Link key={p.id} to={`/management/project-details?id=${p.id}`}>
                  <div className="p-2 border mb-2">
                    <p>{p.project_name}</p>
                    <p className="text-sm text-slate-500">{p.year}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <VendorForm
          vendor={vendor}
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["vendor", vendorId] });
            queryClient.invalidateQueries({ queryKey: ["vendors"] });
          }}
        />
      )}
    </div>
  );
}
