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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Budget Overview</h2>
      </div>

      {topProjects.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center">
          No budget data available
        </div>
      ) : (
        <div className="space-y-5">
          {topProjects.map((project) => (
            <div key={project.id || project.name}>
              <div className="flex items-center justify-between mb-2 gap-4">
                <div>
                  <p className="font-medium text-slate-900">{project.name}</p>
                  <p className="text-sm text-slate-500">
                    ${project.spent.toLocaleString()} spent of $
                    {project.budget.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700">
                  {project.percent.toFixed(0)}%
                </p>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all"
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
