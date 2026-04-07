import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Plus, Phone, Mail, ExternalLink } from "lucide-react";

type Vendor = {
  id: string;
  company_name?: string;
  trade_type?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
};

const TRADE_TYPES = [
  "Architect",
  "Engineer",
  "Excavation",
  "Foundation",
  "Framing",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Insulation",
  "Drywall",
  "Painting",
  "Flooring",
  "Cabinets",
  "Countertops",
  "Finishing",
  "Roofing",
  "Siding",
  "Windows & Doors",
  "Landscaping",
  "Concrete",
  "Masonry",
  "General Labour",
  "Other",
];

async function fetchJson(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

export default function ManagementVendorList() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const filteredVendors = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return vendors.filter((vendor: Vendor) => {
      const matchesSearch =
        lowerSearch === ""
          ? true
          : vendor.company_name?.toLowerCase().includes(lowerSearch) ||
            vendor.contact_person?.toLowerCase().includes(lowerSearch) ||
            vendor.trade_type?.toLowerCase().includes(lowerSearch);

      const matchesTrade =
        tradeFilter === "all" || vendor.trade_type === tradeFilter;

      return matchesSearch && matchesTrade;
    });
  }, [vendors, search, tradeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Directory</h1>
          <p className="text-slate-600">{vendors.length} vendors</p>
        </div>

        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Trade:
              </span>
              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Trades</option>
                {TRADE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredVendors.map((vendor: Vendor) => (
          <Card key={vendor.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {vendor.company_name || "Unnamed Vendor"}
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    {vendor.trade_type || "—"}
                  </p>

                  {vendor.contact_person && (
                    <p className="text-sm mb-2">{vendor.contact_person}</p>
                  )}

                  <div className="space-y-1">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        {vendor.phone}
                      </a>
                    )}

                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {vendor.email}
                      </a>
                    )}

                    {vendor.website && (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No vendors found</p>
        </div>
      )}
    </div>
  );
}
