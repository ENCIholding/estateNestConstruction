type Project = {
  id?: string;
  project_name?: string;
  civic_address?: string;
  status?: string;
  estimated_budget?: number;
};

type ProjectsOverviewProps = {
  projects: Project[];
  showFinancials?: boolean;
};

export default function ProjectsOverview({
  projects,
  showFinancials = false,
}: ProjectsOverviewProps) {
  const activeProjects = projects.filter(
    (p) => p.status === "Active" || p.status === "Pre-Construction"
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
        <button className="text-sm text-slate-500 hover:text-slate-900">
          View All →
        </button>
      </div>

      {activeProjects.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center">
          No active projects
        </div>
      ) : (
        <div className="space-y-3">
          {activeProjects.slice(0, 5).map((project, index) => (
            <div
              key={project.id || index}
              className="border border-slate-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {project.project_name || "Untitled Project"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {project.civic_address || "No address available"}
                  </p>
                </div>

                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                  {project.status || "Unknown"}
                </span>
              </div>

              {showFinancials && (
                <p className="text-sm text-slate-500 mt-3">
                  Budget: $
                  {Number(project.estimated_budget || 0).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
