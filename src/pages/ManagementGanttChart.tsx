import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";

type TaskItem = {
  id: string;
  task_name: string;
  project_name: string;
  phase: string;
  status: string;
  start_day: number;
  duration_days: number;
};

const phaseColors: Record<string, string> = {
  "1. Pre-Construction": "#8b5cf6",
  "2. Foundation": "#3b82f6",
  "3. Framing": "#06b6d4",
  "4. Rough-Ins": "#14b8a6",
  "5. Drywall": "#22c55e",
  "6. Finishing": "#eab308",
  "7. Exterior": "#f97316",
  "8. Close-Out": "#ef4444",
};

const statusOpacity: Record<string, string> = {
  "Not Started": "0.4",
  "In Progress": "1",
  "Completed": "0.7",
  "On Hold": "0.5",
};

export default function ManagementGanttChart() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [monthLabel, setMonthLabel] = useState("April 2026");
  const [cellWidth, setCellWidth] = useState(40);

  const tasks = useMemo<TaskItem[]>(
    () => [
      {
        id: "g1",
        task_name: "Permit Review",
        project_name: "Corner Daycare Concept",
        phase: "1. Pre-Construction",
        status: "In Progress",
        start_day: 2,
        duration_days: 6,
      },
      {
        id: "g2",
        task_name: "Foundation Pour",
        project_name: "Parkallen Fourplex",
        phase: "2. Foundation",
        status: "Not Started",
        start_day: 8,
        duration_days: 4,
      },
      {
        id: "g3",
        task_name: "Main Floor Framing",
        project_name: "Parkallen Fourplex",
        phase: "3. Framing",
        status: "In Progress",
        start_day: 13,
        duration_days: 8,
      },
      {
        id: "g4",
        task_name: "Electrical Rough-In",
        project_name: "Parkallen Fourplex",
        phase: "4. Rough-Ins",
        status: "On Hold",
        start_day: 20,
        duration_days: 5,
      },
      {
        id: "g5",
        task_name: "Exterior Finishing",
        project_name: "Corner Daycare Concept",
        phase: "7. Exterior",
        status: "Completed",
        start_day: 10,
        duration_days: 7,
      },
    ],
    []
  );

  const projectOptions = Array.from(new Set(tasks.map((t) => t.project_name)));

  const filteredTasks = tasks.filter(
    (task) => projectFilter === "all" || task.project_name === projectFilter
  );

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const getTaskStyle = (task: TaskItem) => ({
    backgroundColor: phaseColors[task.phase] || "#94a3b8",
    opacity: statusOpacity[task.status] || "1",
    left: (task.start_day - 1) * cellWidth,
    width: Math.max(cellWidth, task.duration_days * cellWidth),
  });

  const handlePrevMonth = () => {
    setMonthLabel("March 2026");
  };

  const handleNextMonth = () => {
    setMonthLabel("May 2026");
  };

  return (
    <ManagementLayout currentPageName="gantt-chart">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Gantt Chart
          </h1>
          <p className="text-slate-500 mt-1">
            Visual timeline of project tasks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="border border-slate-200 rounded-lg p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="border border-slate-200 rounded-lg p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCellWidth(Math.max(20, cellWidth - 10))}
              className="border border-slate-200 rounded-lg p-2"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCellWidth(Math.min(60, cellWidth + 10))}
              className="border border-slate-200 rounded-lg p-2"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {Object.entries(phaseColors).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-600">{phase.split(". ")[1]}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              <div className="flex border-b border-slate-200">
                <div className="w-64 flex-shrink-0 p-3 bg-slate-50 font-medium text-sm">
                  Task
                </div>

                <div className="flex">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs border-l border-slate-100"
                      style={{ width: cellWidth }}
                    >
                      <div className="py-2">{day}</div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No tasks found for this filter
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <div className="w-64 flex-shrink-0 p-3">
                      <p className="font-medium text-sm truncate">
                        {task.task_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {task.project_name}
                      </p>
                    </div>

                    <div
                      className="relative flex-1"
                      style={{ minWidth: days.length * cellWidth }}
                    >
                      {days.map((day) => (
                        <div
                          key={day}
                          className="absolute top-0 bottom-0 border-l border-slate-100"
                          style={{
                            left: (day - 1) * cellWidth,
                            width: cellWidth,
                          }}
                        />
                      ))}

                      <div
                        className="absolute top-2 bottom-2 rounded-md flex items-center px-2 text-white text-xs font-medium truncate"
                        style={getTaskStyle(task)}
                        title={`${task.task_name} - ${task.duration_days} days`}
                      >
                        {task.duration_days * cellWidth > 60 && task.task_name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Status opacity:</span>
          <span className="opacity-40">● Not Started</span>
          <span className="opacity-100">● In Progress</span>
          <span className="opacity-70">● Completed</span>
          <span className="opacity-50">● On Hold</span>
        </div>
      </div>
    </ManagementLayout>
  );
}
