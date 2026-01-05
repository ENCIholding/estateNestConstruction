import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { format } from "date-fns";

interface Project {
  id: string;
  project_name: string | null;
  project_address: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  realtor_name: string | null;
  realtor_email: string | null;
  closed_price: number | null;
  project_start_date: string | null;
  project_finish_date: string | null;
  warranty_start_date: string | null;
  warranty_end_date: string | null;
  wcb_policy: string | null;
  insurance_policy: string | null;
  status: string | null;
}


const Transactions = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

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
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/management-login");
      }
    };

    checkAuth();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      archived: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.archived;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions / Current Projects</h1>
          <p className="text-muted-foreground">
            View all project transactions and details
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading transactions...</div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No transactions found
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{project.project_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.project_address}
                      </p>
                    </div>
                 <Badge className={getStatusColor(project.status ?? "archived")}>
  {project.status ?? "archived"}
</Badge>

                  </div>
                </CardHeader>
                <CardContent>
                  {/* content unchanged */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
