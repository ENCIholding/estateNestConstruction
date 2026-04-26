import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  BuildOsMasterRecord,
  BuildOsTask,
  BuildOsTaskPhase,
  BuildOsTaskPriority,
  BuildOsTaskStatus,
} from "@/lib/buildosWorkspace";
import {
  BUILDOS_TASK_PHASES,
  BUILDOS_TASK_PRIORITIES,
  BUILDOS_TASK_STATUSES,
} from "@/lib/buildosWorkspace";
import type { ManagementProject } from "@/lib/managementData";
import {
  getVendorInsightByRecordId,
  getVendorMemoryShortlist,
} from "@/lib/vendorMemory";

export type BuildOsTaskFormState = {
  projectId: string;
  title: string;
  description: string;
  location: string;
  phase: BuildOsTaskPhase;
  status: BuildOsTaskStatus;
  priority: BuildOsTaskPriority;
  assignedRecordId: string;
  assignedLabel: string;
  startDate: string;
  dueDate: string;
  milestone: boolean;
  predecessorIds: string[];
  inspectionDate: string;
  percentComplete: string;
  mobileNote: string;
  lastUpdatedBy: string;
};

export function createTaskFormState(record?: BuildOsTask | null): BuildOsTaskFormState {
  return {
    projectId: record?.projectId || "",
    title: record?.title || "",
    description: record?.description || "",
    location: record?.location || "",
    phase: record?.phase || "Other",
    status: record?.status || "Not Started",
    priority: record?.priority || "Medium",
    assignedRecordId: record?.assignedRecordId || "",
    assignedLabel: record?.assignedLabel || "",
    startDate: record?.startDate || new Date().toISOString().slice(0, 10),
    dueDate: record?.dueDate || "",
    milestone: Boolean(record?.milestone),
    predecessorIds: record?.predecessorIds || [],
    inspectionDate: record?.inspectionDate || "",
    percentComplete:
      typeof record?.percentComplete === "number" ? String(record.percentComplete) : "0",
    mobileNote: record?.mobileNote || "",
    lastUpdatedBy: record?.lastUpdatedBy || "",
  };
}

type Props = {
  form: BuildOsTaskFormState;
  projects: ManagementProject[];
  records: BuildOsMasterRecord[];
  predecessorOptions: BuildOsTask[];
  onChange: (next: BuildOsTaskFormState) => void;
};

export default function BuildOsTaskForm({
  form,
  projects,
  records,
  predecessorOptions,
  onChange,
}: Props) {
  const assigneeOptions = records.filter((record) =>
    ["Internal Team", "Vendor (Trade)", "Consultant", "Inspector", "Other"].includes(record.type)
  );
  const selectedVendorInsight = getVendorInsightByRecordId(records, form.assignedRecordId);
  const vendorShortlist = getVendorMemoryShortlist(records, form.projectId || undefined);

  const update = <K extends keyof BuildOsTaskFormState>(key: K, value: BuildOsTaskFormState[K]) =>
    onChange({
      ...form,
      [key]: value,
    });

  const togglePredecessor = (taskId: string) => {
    update(
      "predecessorIds",
      form.predecessorIds.includes(taskId)
        ? form.predecessorIds.filter((item) => item !== taskId)
        : [...form.predecessorIds, taskId]
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Project</Label>
        <select
          value={form.projectId}
          onChange={(event) => update("projectId", event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <select
          value={form.status}
          onChange={(event) => update("status", event.target.value as BuildOsTaskStatus)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {BUILDOS_TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Task title</Label>
        <Input value={form.title} onChange={(event) => update("title", event.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea
          rows={3}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Phase</Label>
        <select
          value={form.phase}
          onChange={(event) => update("phase", event.target.value as BuildOsTaskPhase)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {BUILDOS_TASK_PHASES.map((phase) => (
            <option key={phase} value={phase}>
              {phase}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <select
          value={form.priority}
          onChange={(event) => update("priority", event.target.value as BuildOsTaskPriority)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {BUILDOS_TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Assignee</Label>
        <select
          value={form.assignedRecordId}
          onChange={(event) => update("assignedRecordId", event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select assignee</option>
          {assigneeOptions.map((record) => (
            <option key={record.id} value={record.id}>
              {record.companyName || record.personName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Fallback assignee label</Label>
        <Input
          value={form.assignedLabel}
          onChange={(event) => update("assignedLabel", event.target.value)}
          placeholder="Use only if the assignee is not in Master Database"
        />
      </div>
      {selectedVendorInsight || vendorShortlist.topVendors.length || vendorShortlist.cautionVendors.length || vendorShortlist.blockedVendors.length ? (
        <div className="space-y-3 rounded-3xl border border-border/70 bg-background/70 p-4 md:col-span-2">
          <div>
            <Label>Vendor memory</Label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Bring trade memory directly into the task assignment step so field work reflects real vendor history, not just the latest name on a list.
            </p>
          </div>

          {selectedVendorInsight ? (
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{selectedVendorInsight.label}</p>
              <p className="mt-2">
                {selectedVendorInsight.riskStatus} · {selectedVendorInsight.tradeCategory}
              </p>
              <p className="mt-2">
                {selectedVendorInsight.averageScore
                  ? `${selectedVendorInsight.averageScore.toFixed(1)}/5 average score`
                  : "No score recorded yet"}{" "}
                · {selectedVendorInsight.deficiencyCount} repeat issue{selectedVendorInsight.deficiencyCount === 1 ? "" : "s"} · Work again: {selectedVendorInsight.workAgain}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">Top vendors</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendorShortlist.topVendors.length ? vendorShortlist.topVendors.map((vendor) => (
                  <span key={vendor.id} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-300">
                    {vendor.label}
                  </span>
                )) : <span className="text-xs text-muted-foreground">No preferred vendors linked yet.</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">Use with caution</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendorShortlist.cautionVendors.length ? vendorShortlist.cautionVendors.map((vendor) => (
                  <span key={vendor.id} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">
                    {vendor.label}
                  </span>
                )) : <span className="text-xs text-muted-foreground">No caution vendors in view.</span>}
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-medium text-foreground">Do not use</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {vendorShortlist.blockedVendors.length ? vendorShortlist.blockedVendors.map((vendor) => (
                  <span key={vendor.id} className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-700 dark:text-rose-300">
                    {vendor.label}
                  </span>
                )) : <span className="text-xs text-muted-foreground">No blocked vendors in this shortlist.</span>}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label>Start date</Label>
        <Input
          type="date"
          value={form.startDate}
          onChange={(event) => update("startDate", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Due date</Label>
        <Input
          type="date"
          value={form.dueDate}
          onChange={(event) => update("dueDate", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Inspection / review date</Label>
        <Input
          type="date"
          value={form.inspectionDate}
          onChange={(event) => update("inspectionDate", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Percent complete</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={form.percentComplete}
          onChange={(event) => update("percentComplete", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Location / area</Label>
        <Input
          value={form.location}
          onChange={(event) => update("location", event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Updated by</Label>
        <Input
          value={form.lastUpdatedBy}
          onChange={(event) => update("lastUpdatedBy", event.target.value)}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Field note / mobile note</Label>
        <Textarea
          rows={2}
          value={form.mobileNote}
          onChange={(event) => update("mobileNote", event.target.value)}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.milestone}
            onChange={(event) => update("milestone", event.target.checked)}
          />
          Treat this as a milestone / schedule-driving checkpoint
        </label>
      </div>
      <div className="space-y-3 md:col-span-2">
        <div>
          <Label>Predecessor tasks</Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Select any task that must finish before this one can move. This powers the Gantt and automation warnings.
          </p>
        </div>
        {predecessorOptions.length ? (
          <div className="grid gap-2 rounded-2xl border border-border/70 bg-background/80 p-4 md:grid-cols-2">
            {predecessorOptions.map((task) => (
              <label key={task.id} className="inline-flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.predecessorIds.includes(task.id)}
                  onChange={() => togglePredecessor(task.id)}
                />
                <span>
                  <span className="font-medium">{task.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {task.phase} · {task.status}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            No predecessor options exist yet for this project.
          </div>
        )}
      </div>
    </div>
  );
}
