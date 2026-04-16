type Project = {
  id?: string;
  project_name?: string;
  estimated_budget?: number;
};

type BudgetItem = {
  id?: string;
  project_id?: string;
  actual_cost?: number;
};

type BudgetChartProps = {
  projects: Project[];
  budgetItems: BudgetItem[];
};

export default function BudgetChart({
  projects,
  budgetItems,
}: BudgetChartProps) {
  const topProjects = projects.slice(0, 5).map((project) => {
    const spent = budgetItems
      .filter((item) => item.project_id === project.id)
      .reduce((sum, item) => sum + Number(item.actual_cost || 0), 0);

    const budget = Number(project.estimated_budget || 0);
    const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

    return {
      id: project.id,
      name: project.project_name || "Untitled Project",
      budget,
      spent,
      percent,
    };
  });

  return (
    <div className="dashboard-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Budget Overview</h2>
      </div>

      {topProjects.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground/80">
          No budget data available
        </div>
      ) : (
        <div className="space-y-5">
          {topProjects.map((project) => (
            <div key={project.id || project.name}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ${project.spent.toLocaleString()} spent of $
                    {project.budget.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {project.percent.toFixed(0)}%
                </p>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-enc-red via-enc-orange to-enc-yellow transition-all"
                  style={{ width: `${project.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
