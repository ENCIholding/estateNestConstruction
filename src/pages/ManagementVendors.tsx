import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ManagementVendorForm from "@/components/vendors/ManagementVendorForm";

export default function ManagementVendors() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vendors</h1>

      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Vendor
      </Button>

      <ManagementVendorForm
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => setOpen(false)}
      />
    </div>
  );
}
