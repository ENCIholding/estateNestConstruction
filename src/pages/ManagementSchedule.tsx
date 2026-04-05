import { useMemo, useState } from "react";
import ManagementLayout from "@/components/management/ManagementLayout";

type TaskItem = {
  id: string;
  task_name: string;
  project_name: string;
  phase: string;
  status: string;
  start_date: string;
  duration_days: number;
};

export default function ManagementSchedule() {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const tasks = useMemo<TaskItem[]>(
    () => [
      {
        id: "t1",
        task_name: "Permit Review",
        project_name: "Corner Daycare Concept",
        phase: "1. Pre-Construction",
        status: "In Progress",
        start_date: "2026-04-05",
        duration_days: 7,
      },
      {
        id: "t2",
        task_name: "Foundation Pour",
        project_name: "Parkallen Fourplex",
        phase: "2. Foundation",
        status: "Not Started",
        start_date: "2026-04-10",
        duration_days: 3,
      },
      {
        id: "t3",
        task_name: "Main Floor Framing",
        project_name: "Parkallen Fourplex",
        phase: "3. Framing",
        status: "In Progress",
        start_date: "2026-04-15",
        duration_days: 10,
      },
      {
        id: "t4",
        task_name: "Electrical Rough-In",
        project_name: "Parkallen Fourplex",
        phase: "4. Rough-Ins",
        status: "On Hold",
        start_date: "2026-04-28",
        duration_days: 5,
      },
      {
        id: "t5",
        task_name: "Drywall Installation",
        project_name: "Parkallen Fourplex",
        phase: "5. Drywall",
        status: "Not Started",
        start_date: "2026-05-08",
        duration_days: 6,
      },
    ],
    []
  );

  const projectOptions = Array.from(new Set(tasks.map((t) => t.project_name)));
  const phaseOptions = Array.from(new Set(tasks.map((t) => t.phase)));
  const statusOptions = Array.from(new Set(tasks.map((t) => t.status)));

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.task_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesProject =
      projectFilter === "all" || task.project_name === projectFilter;
    const matchesPhase = phaseFilter === "all" || task.phase === phaseFilter;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesProject && matchesPhase && matchesStatus;
  });

  const groupedTasks = filteredTasks.reduce<Record<string, TaskItem[]>>(
    (acc, task) => {
      if (!acc[task.phase]) acc[task.phase] = [];
      acc[task.phase].push(task);
      return acc;
    },
    {}
  );

  return (
    <ManagementLayout currentPageName="schedule">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Schedule & Tasks
            </h1>
            <p className="text-slate-500 mt-1">
              {tasks.length} tasks across all projects
            </p>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add Task
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          />

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Projects</option>
            {projectOptions.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Phases</option>
            {phaseOptions.map((phase) => (
              <option key={phase} value={phase}>
                {phase}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedTasks)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([phase, phaseTasks]) => (
              <div
                key={phase}
                className="bg-white rounded-xl shadow border overflow-hidden"
              >
                <div className="px-6 py-4 border-b bg-slate-50">
                  <h2 className="font-semibold text-slate-900">{phase}</h2>
                </div>

                <div className="divide-y">
                  {phaseTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {task.task_name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {task.project_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Start: {task.start_date} • Duration: {task.duration_days} days
                        </p>
                      </div>

                      <div>
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No tasks found
          </div>
        )}
      </div>
    </ManagementLayout>
  );
}
