import { Award, Building2, FileCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    icon: Building2,
    title: "Real operating capability",
    description:
      "Estate Nest Capital brings practical construction and development coordination to real project conditions, including planning, budgeting, scheduling, documentation, trade coordination, and delivery follow-through.",
  },
  {
    icon: FileCheck,
    title: "Scope and permit readiness",
    description:
      "Strong projects start with clear scope, realistic permit pathways, organized schedules, and cost assumptions that can be reviewed before major decisions are made.",
  },
  {
    icon: Shield,
    title: "Cost and record discipline",
    description:
      "We approach each project with cost discipline, structured communication, and clear records so clients and stakeholders can understand what is confirmed, what is pending, and what requires a decision.",
  },
  {
    icon: Award,
    title: "Edmonton execution focus",
    description:
      "Estate Nest Capital is rooted in Edmonton and surrounding communities, with a practical focus on infill development, multi-unit housing, commercial leasehold improvements, renovations, and project coordination.",
  },
];

export default function AboutUs() {
  return (
    <section id="about" className="scroll-mt-32 bg-background py-20 md:scroll-mt-36">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            <span className="gradient-text">About</span>
            <span className="text-enc-text-primary"> Estate Nest Capital</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
            Estate Nest Capital Inc. is an Edmonton-based construction and
            development company focused on practical project planning,
            disciplined execution, and clear communication from early concept
            through delivery.
          </p>
        </div>

        <Card className="card-hover border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary">
              How Estate Nest Capital Works
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <p className="text-lg leading-8 text-enc-text-secondary">
              We work across residential, infill, multi-unit, commercial
              leasehold, and development coordination needs, with an emphasis
              on scope clarity, permit readiness, cost awareness, and organized
              project records.
            </p>
            <p className="text-lg leading-8 text-enc-text-secondary">
              Our approach is simple: projects should be planned clearly,
              documented properly, reviewed honestly, and executed with
              accountability.
            </p>
          </CardContent>
        </Card>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <Card key={pillar.title} className="card-hover border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-enc-text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-enc-text-secondary">
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
