import { Award, Building2, FileCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    icon: Building2,
    title: "Real operating capability",
    description:
      "Estate Nest Capital Inc. is organized around real project planning, execution coordination, communication control, and delivery follow-through rather than brochure-only messaging.",
  },
  {
    icon: FileCheck,
    title: "Scope and permit readiness",
    description:
      "Scope summaries, permit pathways, schedules, cost baselines, and supporting records are expected to be orderly enough for internal, client, and lender review.",
  },
  {
    icon: Shield,
    title: "Cost and record discipline",
    description:
      "Projects are approached with cost discipline, communication records, and plain-English visibility into what is ready, what is pending, and what still needs a decision.",
  },
  {
    icon: Award,
    title: "Edmonton execution focus",
    description:
      "The business is rooted in Edmonton construction and development coordination, with a practical emphasis on infill, multi-unit, commercial leasehold, and lender-ready documentation work.",
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
            Estate Nest Capital Inc. organizes construction and development work
            around scope clarity, permit readiness, cost discipline,
            communication records, and lender or client review.
          </p>
        </div>

        <Card className="card-hover border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary">
              What this platform is meant to communicate
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <p className="text-lg leading-8 text-enc-text-secondary">
              Estate Nest Capital Inc. is building a practical operating layer
              for Edmonton construction and development coordination. The public
              site is meant to show what the business does well: planning,
              permit readiness, cost awareness, communication structure, and
              reviewable project documentation.
            </p>
            <p className="text-lg leading-8 text-enc-text-secondary">
              The management dashboard is being built as an internal operating
              system so project information can move with greater consistency
              from intake through delivery, reporting, and qualified diligence
              review.
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
