import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RequestFormDialog from "@/components/RequestFormDialog";
import builderLegacyImage from "@/assets/builder-legacy.jpg";
import commercialPlazaImage from "@/assets/commercial-plaza.jpg";
import customHouseImage from "@/assets/custom-house-model.jpg";
import renovationImage from "@/assets/modern-renovation.jpg";
import rowHousesImage from "@/assets/row-houses.jpg";
import specHomeImage from "@/assets/spec-home.jpg";

type CapabilityCard = {
  altText: string;
  cta: string;
  description: string;
  image: string;
  isBuilderProfile?: boolean;
  title: string;
};

const principles = [
  {
    title: "Local context",
    description:
      "Edmonton zoning, permitting requirements, weather, trade availability, municipal review, and site conditions all shape how construction decisions should be planned and executed.",
  },
  {
    title: "Documentation discipline",
    description:
      "Budgets, permits, schedules, drawings, approvals, and communication records should be organized clearly enough for clients, consultants, lenders, and project partners to review with confidence.",
  },
  {
    title: "Execution visibility",
    description:
      "Every serious project conversation should connect design intent, scope, budget, schedule, approvals, and execution realities before commitments are made.",
  },
];

const capabilities: CapabilityCard[] = [
  {
    title: "Single-family infill concepts",
    description:
      "Planning support for Edmonton infill homes, including early scope discussion, layout review, construction approach, site constraints, and budget expectations before drawings and pricing are finalized.",
    image: specHomeImage,
    cta: "Request scope checklist",
    altText:
      "Representative concept image for a single-family infill home in Edmonton.",
  },
  {
    title: "Multi-unit housing concepts",
    description:
      "Development coordination for multi-unit residential concepts, including site review, unit planning, entitlement considerations, budgeting assumptions, permit pathways, and construction coordination.",
    image: rowHousesImage,
    cta: "Request concept package",
    altText:
      "Representative concept image for multi-unit housing in Edmonton.",
  },
  {
    title: "Custom home planning",
    description:
      "Pre-construction support for clients who want to align design intent, budget expectations, approvals, scope, materials, and delivery requirements before construction begins.",
    image: customHouseImage,
    cta: "Request pre-construction review",
    altText:
      "Representative concept image for custom home planning and design review.",
  },
  {
    title: "Renovation and repositioning",
    description:
      "Renovation and repositioning support for projects requiring layout changes, finish planning, scope definition, trade coordination, permit review, and clearer execution planning.",
    image: renovationImage,
    cta: "Request renovation brief",
    altText:
      "Representative concept image for renovation and repositioning work.",
  },
  {
    title: "Commercial and mixed-use planning",
    description:
      "Planning and coordination support for commercial leasehold and mixed-use spaces, including tenant needs, municipal requirements, operational constraints, trade coordination, and construction readiness.",
    image: commercialPlazaImage,
    cta: "Request commercial intake",
    altText:
      "Representative concept image for commercial and mixed-use planning in Edmonton.",
  },
  {
    title: "Builder profile and diligence overview",
    description:
      "A focused overview for clients, lenders, consultants, and project partners who want to understand Estate Nest Capital's construction approach, planning discipline, documentation standards, and project delivery mindset.",
    image: builderLegacyImage,
    cta: "View builder profile",
    isBuilderProfile: true,
    altText:
      "Representative builder profile and diligence overview image for Estate Nest Capital.",
  },
];

export default function ContentSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState("");

  const openRequestDialog = (type: string) => {
    setRequestType(type);
    setDialogOpen(true);
  };

  return (
    <div className="bg-background">
      <section id="principles" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-lg"
              >
                <h2 className="text-3xl font-bold text-enc-text-primary">
                  {principle.title}
                </h2>
                <p className="mt-4 text-lg leading-8 text-enc-text-secondary">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-32 bg-background py-24 md:scroll-mt-36">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="gradient-text">Capabilities</span>
              <span className="text-enc-text-primary"> & Concept References</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
              Estate Nest Capital supports construction and development work
              through early planning, scope review, permitting coordination,
              estimating support, trade coordination, stakeholder communication,
              and project delivery oversight.
            </p>
            <p className="mx-auto mt-4 max-w-4xl text-lg leading-8 text-enc-text-secondary">
              The visuals below are representative concept references used to
              support conversations about fit, scope, design direction, and
              delivery approach. Final project details depend on site-specific
              review, drawings, permits, budget, and client requirements.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <Card
                key={capability.title}
                className="group card-hover overflow-hidden border-border bg-background"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={capability.image}
                    alt={capability.altText}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-enc-orange">
                    Representative concept
                  </p>
                  <h3 className="text-xl font-bold text-enc-text-primary">
                    {capability.title}
                  </h3>
                  <p className="leading-7 text-enc-text-secondary">
                    {capability.description}
                  </p>
                  {capability.isBuilderProfile ? (
                    <Button
                      variant="ghost"
                      className="mt-2 h-auto p-0 font-semibold text-enc-orange hover:bg-transparent hover:text-enc-orange/80"
                      asChild
                    >
                      <Link to="/builder-profile">{capability.cta} -&gt;</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="mt-2 h-auto p-0 font-semibold text-enc-orange hover:bg-transparent hover:text-enc-orange/80"
                      onClick={() => openRequestDialog(capability.cta)}
                    >
                      {capability.cta} -&gt;
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-5xl rounded-[1.75rem] border border-border bg-card p-8 text-center shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-enc-orange">
              Experience basis
            </p>
            <p className="mt-4 text-lg leading-8 text-enc-text-secondary">
              Planning, permitting coordination, estimating support,
              construction coordination, vendor communication, project
              documentation, and stakeholder review.
            </p>
          </div>
        </div>
      </section>

      <RequestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        requestType={requestType}
      />
    </div>
  );
}
