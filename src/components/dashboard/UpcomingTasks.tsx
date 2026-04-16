type Task = {
  id?: string;
  task_name?: string;
  title?: string;
  status?: string;
  due_date?: string;
  project_id?: string;
  project_name?: string;
  category?: string;
};

type Project = {
  id?: string;
  project_name?: string;
};

type UpcomingTasksProps = {
  tasks: Task[];
  projects: Project[];
};

export default function UpcomingTasks({
  tasks,
  projects,
}: UpcomingTasksProps) {
  const pendingTasks = tasks
    .filter((task) => task.status !== "Completed")
    .slice(0, 5);

  const getProjectName = (task: Task) => {
    if (task.project_name) return task.project_name;
    const match = projects.find((p) => p.id === task.project_id);
    return match?.project_name || "Unknown Project";
  };

  return (
    <div className="dashboard-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
        <button className="text-sm text-muted-foreground transition-colors hover:text-enc-orange">
          View All →
        </button>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground/80">
          No upcoming tasks
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map((task, index) => (
            <div
              key={task.id || index}
              className="dashboard-item p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">
                    {task.task_name || task.title || "Untitled Task"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getProjectName(task)}
                  </p>
                  {task.due_date ? (
                    <p className="mt-2 text-xs text-enc-red">
                      Due: {task.due_date}
                    </p>
                  ) : null}
                </div>

                <div className="text-right">
                  <span className="block rounded-full bg-gradient-to-r from-enc-orange/10 to-enc-yellow/10 px-3 py-1 text-xs text-enc-text-primary dark:text-white">
                    {task.status || "Not Started"}
                  </span>
                  {task.category ? (
                    <span className="mt-2 inline-block rounded-full bg-enc-yellow/10 px-3 py-1 text-xs text-amber-700 dark:text-enc-yellow-light">
                      {task.category}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
