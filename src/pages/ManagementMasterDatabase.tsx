import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Plus } from "lucide-react";

type DatabaseItem = {
  id: string;
  type: "Client" | "Vendor";
  name: string;
  email?: string;
  phone?: string;
};

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

export default function ManagementMasterDatabase() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => fetchJson("/api/management/clients"),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const allItems = useMemo(() => {
    const items: DatabaseItem[] = [
      ...clients.map((c: any) => ({ ...c, type: "Client" as const })),
      ...vendors.map((v: any) => ({ ...v, type: "Vendor" as const })),
    ];
    return items;
  }, [clients, vendors]);

  const filteredItems = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim();

    return allItems.filter((item) => {
      const matchesSearch =
        lowerSearch === ""
          ? true
          : item.name?.toLowerCase().includes(lowerSearch) ||
            item.email?.toLowerCase().includes(lowerSearch) ||
            item.phone?.toLowerCase().includes(lowerSearch);

      const matchesType = typeFilter === "all" || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [allItems, search, typeFilter]);

  if (loadingClients) {
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
          <h1 className="text-3xl font-bold mb-2">Master Database</h1>
          <p className="text-slate-600">
            {allItems.length} total contacts
          </p>
        </div>

        <Button className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <span className="text-sm font-medium text-slate-600 py-2">
                Type:
              </span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="Client">Client</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredItems.map((item: DatabaseItem) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.name}</p>
                  <p className="text-sm text-slate-600 mb-2">
                    {item.type === "Client" ? "Client" : "Vendor"}
                  </p>
                  <div className="space-y-1 text-sm">
                    {item.email && <p>Email: {item.email}</p>}
                    {item.phone && <p>Phone: {item.phone}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No contacts found</p>
        </div>
      )}
    </div>
  );
}
