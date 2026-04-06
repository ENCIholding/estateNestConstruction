import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  FileText,
  Loader2,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

async function fetchJson(url, options = {}) {
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

function safeString(value, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str.length ? str : fallback;
}

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("1")) return digits;
  return `1${digits}`;
}

export default function ManagementMasterDatabase() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: vendors = [],
    isLoading: loadingVendors,
    error: vendorsError,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetchJson("/api/management/vendors"),
  });

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const {
    data: invoices = [],
    isLoading: loadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["clientInvoices"],
    queryFn: () => fetchJson("/api/management/client-invoices"),
  });

  const allContacts = useMemo(() => {
    const contacts = [];

    vendors.forEach((vendor) => {
      contacts.push({
        id: `vendor-${vendor.id}`,
        name: safeString(vendor.contact_person),
        company_name: safeString(vendor.company_name),
        address: safeString(vendor.address),
        phone: safeString(vendor.phone),
        email: safeString(vendor.email),
        website: safeString(vendor.website, ""),
        type: "Vendor",
      });
    });

    const clientMap = {};

    invoices.forEach((invoice) => {
      if (!invoice.client_name) return;

      if (!clientMap[invoice.client_name]) {
        const project = projects.find((p) => p.id === invoice.project_id);

        clientMap[invoice.client_name] = {
          id: `client-${invoice.client_name}`,
          name: safeString(invoice.client_name),
          company_name: "—",
          address: safeString(project?.civic_address),
          phone: safeString(invoice.client_phone),
          email: safeString(invoice.etransfer_email),
          website: "",
          type: "Client",
        };
      }
    });

    Object.values(clientMap).forEach((client) => {
      contacts.push(client);
    });

    return contacts;
  }, [vendors, invoices, projects]);

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allContacts.filter((contact) => {
      const matchesSearch =
        !term ||
        contact.name.toLowerCase().includes(term) ||
        contact.company_name.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.phone.toLowerCase().includes(term) ||
        contact.address.toLowerCase().includes(term);

      const matchesType =
        typeFilter === "all" || contact.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [allContacts, search, typeFilter]);

  const handleExportExcel = () => {
    const wsData = [
      ["ESTATE NEST CAPITAL INC. - MASTER DATABASE"],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ["Name", "Company", "Address", "Phone", "Email", "Type"],
      ...filteredContacts.map((contact) => [
        contact.name,
        contact.company_name,
        contact.address,
        contact.phone,
        contact.email,
        contact.type,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "Master_Database.xlsx");
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("ESTATE NEST CAPITAL INC.", 105, 15, { align: "center" });

    pdf.setFontSize(12);
    pdf.text("Master Database", 105, 22, { align: "center" });

    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 28, {
      align: "center",
    });

    let y = 40;

    pdf.setFontSize(8);
    pdf.text("Name", 10, y);
    pdf.text("Company", 45, y);
    pdf.text("Phone", 90, y);
    pdf.text("Email", 125, y);
    pdf.text("Type", 180, y);

    y += 6;

    filteredContacts.forEach((contact) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;

        pdf.setFontSize(8);
        pdf.text("Name", 10, y);
        pdf.text("Company", 45, y);
        pdf.text("Phone", 90, y);
        pdf.text("Email", 125, y);
        pdf.text("Type", 180, y);
        y += 6;
      }

      pdf.text(String(contact.name).substring(0, 22), 10, y);
      pdf.text(String(contact.company_name).substring(0, 22), 45, y);
      pdf.text(String(contact.phone).substring(0, 18), 90, y);
      pdf.text(String(contact.email).substring(0, 30), 125, y);
      pdf.text(String(contact.type), 180, y);
      y += 5;
    });

    pdf.save("Master_Database.pdf");
  };

  const isLoading = loadingVendors || loadingProjects || loadingInvoices;
  const error = vendorsError || projectsError || invoicesError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load master database: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Master Database
          </h1>
          <p className="text-slate-500 mt-1">
            {allContacts.length} total contacts
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Client">Client</SelectItem>
            <SelectItem value="Vendor">Vendor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredContacts.map((contact) => {
                const whatsappPhone = normalizePhoneForWhatsApp(contact.phone);

                return (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.company_name}</TableCell>
                    <TableCell className="text-sm">{contact.address}</TableCell>
                    <TableCell>
                      {contact.phone !== "—" && whatsappPhone ? (
                        <a
                          href={`https://wa.me/${whatsappPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.email !== "—" ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          contact.type === "Client"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {contact.type}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredContacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No contacts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
