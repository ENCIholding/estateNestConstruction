import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

type Project = {
  id: string;
  project_name?: string;
  estimated_budget?: number;
};

type EstimateItem = {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
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

export default function ManagementEstimator() {
  const [selectedProject, setSelectedProject] = useState("");
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson("/api/management/projects"),
  });

  const selectedProjectData = useMemo(
    () => projects.find((p: Project) => p.id === selectedProject),
    [projects, selectedProject]
  );

  const totalEstimate = useMemo(
    () => estimates.reduce((sum, item) => sum + item.estimatedCost, 0),
    [estimates]
  );

  const addEstimateItem = () => {
    setEstimates([
      ...estimates,
      {
        id: Math.random().toString(),
        category: "",
        description: "",
        estimatedCost: 0,
      },
    ]);
  };

  const removeEstimateItem = (id: string) => {
    setEstimates(estimates.filter((item) => item.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Estimator</h1>
        <p className="text-slate-600">
          Create detailed cost estimates for projects
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="">-- Choose a project --</option>
            {projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.project_name || "Unnamed Project"}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedProject && selectedProjectData && (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{selectedProjectData.project_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Current Budget:</span> $
                  {selectedProjectData.estimated_budget?.toLocaleString() || 0}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Your Estimate:</span> $
                  {totalEstimate.toLocaleString()}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    totalEstimate > (selectedProjectData.estimated_budget || 0)
                      ? "text-rose-600"
                      : "text-green-600"
                  }`}
                >
                  <span>Difference:</span> $
                  {Math.abs(
                    totalEstimate -
                      (selectedProjectData.estimated_budget || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mb-8">
            {estimates.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...estimates];
                        updated[index].category = e.target.value;
                        setEstimates(updated);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...estimates];
                        updated[index].description = e.target.value;
                        setEstimates(updated);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Estimated Cost"
                      value={item.estimatedCost}
                      onChange={(e) => {
                        const updated = [...estimates];
                        updated[index].estimatedCost = parseFloat(e.target.value) || 0;
                        setEstimates(updated);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-md"
                    />
                    <Button
                      variant="outline"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => removeEstimateItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={addEstimateItem} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Estimate Item
          </Button>
        </>
      )}

      {!selectedProject && (
        <div className="text-center py-12">
          <p className="text-slate-600">
            Select a project above to start creating an estimate
          </p>
        </div>
      )}
    </div>
  );
}
