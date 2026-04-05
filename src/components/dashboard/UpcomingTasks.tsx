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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h2>
        <button className="text-sm text-slate-500 hover:text-slate-900">
          View All →
        </button>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="text-sm text-slate-400 py-10 text-center">
          No upcoming tasks
        </div>
      ) : (
        <div className="space-y-3">
          {pendingTasks.map((task, index) => (
            <div
              key={task.id || index}
              className="border border-slate-100 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">
                    {task.task_name || task.title || "Untitled Task"}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {getProjectName(task)}
                  </p>
                  {task.due_date ? (
                    <p className="text-xs text-red-500 mt-2">Due: {task.due_date}</p>
                  ) : null}
                </div>

                <div className="text-right">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 block">
                    {task.status || "Not Started"}
                  </span>
                  {task.category ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 inline-block mt-2">
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
