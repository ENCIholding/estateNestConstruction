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
import Select, {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Badge from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Calendar } from "lucide-react";

/* ================= TYPES ================= */

interface PipelineProject {
  id: string;
  project_name: string | null;
  project_address: string | null;
  primary_contact_name: string | null;
  primary_contact_phone: string | null;
  comments: string | null;
  target_month: number | null;
  target_year: number | null;
  status: string | null;
}

/* ================= COMPONENT ================= */

const Pipeline = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    project_name: "",
    project_address: "",
    primary_contact_name: "",
    primary_contact_phone: "",
    comments: "",
    target_month: new Date().getMonth() + 1,
    target_year: new Date().getFullYear(),
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  /* ================= DATA ================= */

  const fetchProjects = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("pipeline_projects")
        .select("*")
        .order("target_year", { ascending: false })
        .order("target_month", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error("Failed to fetch pipeline projects:", err);
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
          fetchProjects();
        }
      } catch {
        navigate("/management-login");
      }
    };

    checkAuth();
  }, [navigate]);

  /* ================= ACTIONS ================= */

  const handleAddProject = async () => {
    if (!supabase) {
      toast.error("Backend not configured");
      return;
    }

    if (!newProject.project_name || !newProject.project_address) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const row = {
        project_name: newProject.project_name,
        project_address: newProject.project_address,
        primary_contact_name: newProject.primary_contact_name || "",
        primary_contact_phone: newProject.primary_contact_phone || "",
        comments: newProject.comments || "",
        target_month: Number(newProject.target_month),
        target_year: Number(newProject.target_year),
      };

      const { error } = await supabase
        .from("pipeline_projects")
        .insert([row]); // ✅ MUST be array

      if (error) throw error;

      toast.success("Pipeline project added successfully");
      setIsAddDialogOpen(false);
      setNewProject({
        project_name: "",
        project_address: "",
        primary_contact_name: "",
        primary_contact_phone: "",
        comments: "",
        target_month: new Date().getMonth() + 1,
        target_year: new Date().getFullYear(),
      });

      fetchProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add pipeline project");
    }
  };

  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Pipeline - Future Projects</h1>
            <p className="text-muted-foreground">
              Track upcoming project opportunities
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Pipeline Project</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Project Name *</Label>
                  <Input
                    value={newProject.project_name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, project_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Project Address *</Label>
                  <Input
                    value={newProject.project_address}
                    onChange={(e) =>
                      setNewProject({ ...newProject, project_address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Name</Label>
                  <Input
                    value={newProject.primary_contact_name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, primary_contact_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Contact Phone</Label>
                  <Input
                    value={newProject.primary_contact_phone}
                    onChange={(e) =>
                      setNewProject({ ...newProject, primary_contact_phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Month</Label>
                  <Select
                    value={newProject.target_month.toString()}
                    onValueChange={(v) =>
                      setNewProject({ ...newProject, target_month: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, idx) => (
                        <SelectItem key={idx} value={(idx + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Year</Label>
                  <Input
                    type="number"
                    value={newProject.target_year}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        target_year: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Comments / Status Updates</Label>
                  <Textarea
                    rows={3}
                    value={newProject.comments}
                    onChange={(e) =>
                      setNewProject({ ...newProject, comments: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleAddProject} className="w-full">
                Add Pipeline Project
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No pipeline projects found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{project.project_name ?? "Untitled Project"}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.project_address ?? "N/A"}
                      </p>
                    </div>

                    {project.target_month && project.target_year && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {months[project.target_month - 1]} {project.target_year}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Primary Contact
                      </h3>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="text-muted-foreground inline">Name:</dt>
                          <dd className="inline ml-2">
                            {project.primary_contact_name || "N/A"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground inline">Phone:</dt>
                          <dd className="inline ml-2">
                            {project.primary_contact_phone || "N/A"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {project.comments && (
                      <div>
                        <h3 className="font-semibold text-sm mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          Comments / Status
                        </h3>
                        <p className="text-sm">{project.comments}</p>
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

export default Pipeline;
