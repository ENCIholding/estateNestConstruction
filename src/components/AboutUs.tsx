import { Award, Building2, FileCheck, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    icon: Building2,
    title: "Practical development focus",
    description:
      "Estate Nest Capital is focused on real project planning, execution coordination, and stakeholder communication rather than generic brochure language.",
  },
  {
    icon: FileCheck,
    title: "Documentation first",
    description:
      "Scopes, budgets, permits, schedules, and lender/client materials need to be organized before a project can earn trust.",
  },
  {
    icon: Shield,
    title: "Operational honesty",
    description:
      "If a workflow is not ready for live use, we would rather keep it offline than pretend it is already part of a finished platform.",
  },
  {
    icon: Award,
    title: "Long-term improvement",
    description:
      "The website and dashboard are being hardened around reliability, accessibility, and diligence-readiness so they can support real work over time.",
  },
];

export default function AboutUs() {
  return (
    <section id="about" className="bg-background py-20">
      <div className="container mx-auto px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold md:text-5xl">
            <span className="gradient-text">About</span>
            <span className="text-enc-text-primary"> Estate Nest Capital</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
            Estate Nest Capital Inc. is shaping a more disciplined way to present and manage construction work, with a stronger emphasis on planning, documentation, and operational clarity.
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
              The public site is intended to explain Estate Nest Capital&apos;s capabilities and how projects are approached. It is not meant to overstate project history, fabricate operating metrics, or present concept visuals as completed work.
            </p>
            <p className="text-lg leading-8 text-enc-text-secondary">
              The management dashboard is being built as an internal operations tool. Visible modules stay limited to the areas that can be supported honestly with working backend paths and authenticated access.
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
