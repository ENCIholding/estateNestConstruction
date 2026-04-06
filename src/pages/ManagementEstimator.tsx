import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Download, Mail, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const CATEGORIES = [
  "Site Work",
  "Foundation",
  "Framing",
  "Exterior",
  "Mechanical",
  "Finishing",
];

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

export default function ManagementEstimator() {
  const [selectedProject, setSelectedProject] = useState("");
  const [items, setItems] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: sessionData,
    isLoading: loadingSession,
  } = useQuery({
    queryKey: ["management-session"],
    queryFn: () => fetchJson("/api/management/session"),
    retry: false,
  });

  const user = sessionData?.user || null;
  const userRole = user?.app_role || "Admin";
  const showFinancials = userRole === "Admin" || userRole === "Accountant";

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const {
    data: estimatorItems = [],
    isLoading: loadingEstimatorItems,
    error: estimatorError,
  } = useQuery({
    queryKey: ["estimatorItems", selectedProject],
    queryFn: () =>
      fetchJson(`/api/management/estimator-items?project_id=${encodeURIComponent(selectedProject)}`),
    enabled: !!selectedProject,
  });

  const selectedProjectData = useMemo(() => {
    return projects.find((p) => p.id === selectedProject) || null;
  }, [projects, selectedProject]);

  useEffect(() => {
    setItems([]);
  }, [selectedProject]);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        category: "Site Work",
        description: "",
        quantity: 1,
        unit: "each",
        unit_cost: 0,
        line_total: 0,
        margin_percent: 15,
        profit: 0,
        isNew: true,
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };

      const quantity = Number(row.quantity) || 0;
      const unitCost = Number(row.unit_cost) || 0;
      const marginPercent = Number(row.margin_percent) || 0;

      row.line_total = quantity * unitCost;
      row.profit = row.line_total * (marginPercent / 100);

      updated[index] = row;
      return updated;
    });
  };

  const handleRemoveUnsavedRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedProject || items.length === 0) return;

    const newItems = items.filter((item) => item.isNew);
    if (newItems.length === 0) return;

    setSaveLoading(true);

    try {
      await Promise.all(
        newItems.map((item) => {
          const { isNew, ...payload } = item;

          return fetchJson("/api/management/estimator-items", {
            method: "POST",
            body: JSON.stringify({
              ...payload,
              project_id: selectedProject,
            }),
          });
        })
      );

      await queryClient.invalidateQueries({
        queryKey: ["estimatorItems", selectedProject],
      });

      setItems([]);
    } catch (error) {
      console.error("Failed to save estimator items:", error);
      alert(error.message || "Failed to save estimator items.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem?.id) return;

    setDeleteLoading(true);

    try {
      await fetchJson(`/api/management/estimator-items/${deleteItem.id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({
        queryKey: ["estimatorItems", selectedProject],
      });

      setDeleteItem(null);
    } catch (error) {
      console.error("Failed to delete estimator item:", error);
      alert(error.message || "Failed to delete estimator item.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const allItems = useMemo(() => {
    return [...estimatorItems, ...items];
  }, [estimatorItems, items]);

  const grandTotal = useMemo(() => {
    return allItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  }, [allItems]);

  const totalProfit = useMemo(() => {
    return allItems.reduce((sum, item) => sum + (Number(item.profit) || 0), 0);
  }, [allItems]);

  const handleExportExcel = () => {
    const wsData = [
      ["ESTATE NEST CAPITAL INC."],
      ["5619 KOOTOOK PLACE SW"],
      ["EDMONTON, AB T6W 4V9, CANADA"],
      ["HELLO@ESTATENEST.CAPITAL"],
      ["www.estatenest.capital"],
      [],
      [`Cost Estimate - ${selectedProjectData?.project_name || "Project"}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      ["Category", "Description", "Quantity", "Unit", "Unit Cost", "Line Total", "Margin %", "Profit"],
      ...allItems.map((item) => [
        item.category || "",
        item.description || "",
        Number(item.quantity) || 0,
        item.unit || "",
        `$${(Number(item.unit_cost) || 0).toFixed(2)}`,
        `$${(Number(item.line_total) || 0).toFixed(2)}`,
        `${Number(item.margin_percent) || 0}%`,
        `$${(Number(item.profit) || 0).toFixed(2)}`,
      ]),
      [],
      ["", "", "", "", "", `Grand Total: $${grandTotal.toFixed(2)}`, "", `Total Profit: $${totalProfit.toFixed(2)}`],
      [],
      [],
      [
        "DISCLAIMER: This estimate is provided for budgetary purposes only. Pricing is subject to change based on final design selections and site conditions.",
      ],
      [
        "Estate Nest Capital Inc. is not liable for discrepancies in this preliminary estimate. Contact hello@estatenest.capital for final confirmation.",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estimate");
    XLSX.writeFile(
      workbook,
      `Estimate_${selectedProjectData?.project_name || "Project"}.xlsx`
    );
  };

  const handleOpenEmail = () => {
    const subject = `Cost Estimate for ${selectedProjectData?.project_name || "Project"}`;
    const body = `Hello,

Please find the attached estimate for ${selectedProjectData?.project_name || "the selected project"}.

Please review the disclaimer included in the document.

Best regards,
Estate Nest Capital Inc.`;

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  if (loadingSession || loadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Failed to load projects: {projectsError.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
          You are not logged in. Please log in to access the estimator.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Cost Estimator
          </h1>
          <p className="text-slate-500 mt-1">
            Create detailed project estimates
          </p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project to estimate" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && (
            <>
              <Button onClick={handleAddRow} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>

              {items.length > 0 && (
                <Button onClick={handleSave} className="bg-slate-900" disabled={saveLoading}>
                  {saveLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save New Items"
                  )}
                </Button>
              )}

              <Button onClick={handleExportExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>

              <Button onClick={handleOpenEmail} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Open Email
              </Button>
            </>
          )}
        </div>
      </Card>

      {selectedProject && (
        <Card className="border-0 shadow-sm overflow-hidden">
          {loadingEstimatorItems ? (
            <div className="flex items-center justify-center min-h-[240px]">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : estimatorError ? (
            <div className="p-6">
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
                Failed to load estimator items: {estimatorError.message}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Line Total</TableHead>
                      <TableHead>Margin %</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {estimatorItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>${(Number(item.unit_cost) || 0).toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">
                          ${(Number(item.line_total) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{Number(item.margin_percent) || 0}%</TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          ${(Number(item.profit) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteItem(item)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {items.map((item, idx) => (
                      <TableRow key={`new-${idx}`} className="bg-blue-50">
                        <TableCell>
                          <Select
                            value={item.category}
                            onValueChange={(value) => handleChange(idx, "category", value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleChange(idx, "description", e.target.value)
                            }
                            className="h-8"
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleChange(
                                idx,
                                "quantity",
                                e.target.value === "" ? 0 : parseFloat(e.target.value)
                              )
                            }
                            className="h-8 w-20"
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            value={item.unit}
                            onChange={(e) => handleChange(idx, "unit", e.target.value)}
                            className="h-8 w-24"
                          />
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={item.unit_cost}
                            onChange={(e) =>
                              handleChange(
                                idx,
                                "unit_cost",
                                e.target.value === "" ? 0 : parseFloat(e.target.value)
                              )
                            }
                            className="h-8 w-28"
                          />
                        </TableCell>

                        <TableCell className="font-semibold">
                          ${(Number(item.line_total) || 0).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={item.margin_percent}
                            onChange={(e) =>
                              handleChange(
                                idx,
                                "margin_percent",
                                e.target.value === "" ? 0 : parseFloat(e.target.value)
                              )
                            }
                            className="h-8 w-20"
                          />
                        </TableCell>

                        <TableCell className="font-semibold text-emerald-600">
                          ${(Number(item.profit) || 0).toFixed(2)}
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUnsavedRow(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {estimatorItems.length === 0 && items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-slate-500">
                          No estimate items yet. Click "Add Line" to start.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">
                    Grand Total: $
                    {grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {showFinancials && (
                    <p className="text-sm text-emerald-600">
                      Total Profit: $
                      {totalProfit.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {!selectedProject && (
        <div className="text-center py-16 text-slate-500">
          <p>Select a project above to start creating an estimate</p>
        </div>
      )}

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this estimate item? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
