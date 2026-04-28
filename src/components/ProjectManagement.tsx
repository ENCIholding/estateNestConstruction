import { Building2, FileCheck, MessageSquare, Users } from "lucide-react";

const controls = [
  {
    icon: Users,
    title: "Scope clarity and field coordination",
    description:
      "Scope, sequencing, site communication, and trade responsibilities need to stay clear so the project can move cleanly from one milestone to the next.",
  },
  {
    icon: Building2,
    title: "Vendor and cost discipline",
    description:
      "Vendor coordination, procurement follow-up, and cost assumptions must be reviewed against real project conditions, availability, site requirements, and approved scope.",
  },
  {
    icon: FileCheck,
    title: "Permit and document readiness",
    description:
      "Permit references, legal descriptions, inspection records, drawings, and compliance notes should be organized and reviewed before they are treated as complete.",
  },
  {
    icon: MessageSquare,
    title: "Client and lender review",
    description:
      "The goal is to keep updates, questions, approvals, budget changes, and next steps connected to the actual project so clients, lenders, and project partners can review current information with confidence.",
  },
];

export default function ProjectManagement() {
  return (
    <section id="project-management" className="bg-muted/30 py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="gradient-text">Project Management</span>
              <span className="text-enc-text-primary"> & Governance</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Estate Nest Capital organizes construction and development work
              around clear scope, practical scheduling, cost awareness, permit
              readiness, communication discipline, and accountable
              follow-through.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {controls.map((control) => {
              const Icon = control.icon;

              return (
                <div
                  key={control.title}
                  className="rounded-[1.75rem] border border-border bg-card p-8 shadow-lg transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {control.title}
                      </h3>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        {control.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
