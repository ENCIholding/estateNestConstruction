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
    <div className="dashboard-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
        <button className="text-sm text-muted-foreground transition-colors hover:text-enc-orange">
          View All →
        </button>
      </div>

      {activeProjects.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground/80">
          No active projects
        </div>
      ) : (
        <div className="space-y-3">
          {activeProjects.slice(0, 5).map((project, index) => (
            <div
              key={project.id || index}
              className="dashboard-item p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">
                    {project.project_name || "Untitled Project"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.civic_address || "No address available"}
                  </p>
                </div>

                <span className="rounded-full bg-gradient-to-r from-enc-orange/10 to-enc-yellow/10 px-3 py-1 text-xs text-enc-text-primary dark:text-white">
                  {project.status || "Unknown"}
                </span>
              </div>

              {showFinancials ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Budget: $
                  {Number(project.estimated_budget || 0).toLocaleString()}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
