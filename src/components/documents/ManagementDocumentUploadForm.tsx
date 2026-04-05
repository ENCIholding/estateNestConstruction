import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Upload } from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
};

type ManagementDocumentUploadFormProps = {
  projects: Project[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

async function uploadFile(file: File): Promise<{ file_url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/management/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

async function fetchJson(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

export default function ManagementDocumentUploadForm({
  projects,
  open,
  onClose,
  onSaved,
}: ManagementDocumentUploadFormProps) {
  const [formData, setFormData] = useState<{
    project_id: string;
    document_type: string;
    file: File | null;
  }>({
    project_id: "",
    document_type: "General",
    file: null,
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (field: "project_id" | "document_type" | "file", value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleChange("file", file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file || !formData.project_id) return;

    setUploading(true);

    try {
      const uploadResult = await uploadFile(formData.file);

      await fetchJson("/api/management/documents", {
        method: "POST",
        body: JSON.stringify({
          project_id: formData.project_id,
          file_url: uploadResult.file_url,
          document_type: formData.document_type,
          uploaded_date: new Date().toISOString().split("T")[0],
          file_name: formData.file.name,
        }),
      });

      onSaved();
      onClose();

      setFormData({
        project_id: "",
        document_type: "General",
        file: null,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => handleChange("project_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.project_name || "Unnamed Project"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => handleChange("document_type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Change Order">Change Order</SelectItem>
                <SelectItem value="Site Photo">Site Photo</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Generated Report">Generated Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>File * (Word, PowerPoint, PDF, Excel)</Label>

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />

              <input
                type="file"
                accept=".doc,.docx,.ppt,.pptx,.pdf,.xls,.xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:underline">
                  {formData.file ? formData.file.name : "Click to upload file"}
                </span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={uploading || !formData.file || !formData.project_id}
            >
              {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Upload Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
