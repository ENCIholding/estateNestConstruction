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
      "Edmonton zoning, permitting, trades, and delivery conditions shape how practical construction decisions are made.",
  },
  {
    title: "Documentation discipline",
    description:
      "Budgets, permits, schedules, and communication trails should be clear enough for clients, lenders, and internal teams to review confidently.",
  },
  {
    title: "No inflated claims",
    description:
      "Concept imagery and capability examples stay labeled honestly so visitors are not asked to mistake them for completed project proof.",
  },
];

const capabilities: CapabilityCard[] = [
  {
    title: "Single-family infill concepts",
    description:
      "Representative design references for urban infill projects, used to discuss scope, layout, and construction approach before final drawings and pricing are issued.",
    image: specHomeImage,
    cta: "Request scope checklist",
    altText:
      "Representative concept image for a single-family infill home in Edmonton.",
  },
  {
    title: "Multi-unit housing concepts",
    description:
      "Illustrative concept visuals for row housing or multi-unit residential work. Final unit counts, budgets, and entitlement paths depend on site-specific review.",
    image: rowHousesImage,
    cta: "Request concept package",
    altText:
      "Representative concept image for multi-unit housing in Edmonton.",
  },
  {
    title: "Custom home planning",
    description:
      "Pre-construction planning support for clients who need help aligning design intent, approvals, and project expectations before a build moves forward.",
    image: customHouseImage,
    cta: "Request pre-construction review",
    altText:
      "Representative concept image for custom home planning and design review.",
  },
  {
    title: "Renovation and repositioning",
    description:
      "Renovation strategy can include layout upgrades, finish planning, and scope definition for projects that need clearer direction before work begins.",
    image: renovationImage,
    cta: "Request renovation brief",
    altText:
      "Representative concept image for renovation and repositioning work.",
  },
  {
    title: "Commercial and mixed-use planning",
    description:
      "Commercial planning discussions can cover tenant layout needs, municipal approvals, operational constraints, and documentation required before construction starts.",
    image: commercialPlazaImage,
    cta: "Request commercial intake",
    altText:
      "Representative concept image for commercial and mixed-use planning in Edmonton.",
  },
  {
    title: "Builder profile and diligence overview",
    description:
      "A focused profile for clients, lenders, and collaborators who need to understand Estate Nest Capital’s operating approach, controls, and documentation standards.",
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

      <section id="projects" className="bg-background py-24">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold md:text-5xl">
              <span className="gradient-text">Capabilities</span>
              <span className="text-enc-text-primary"> & concept references</span>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
              These visuals are representative references used to discuss fit, scope, and delivery approach. They are not presented as completed proof-of-work unless separately identified in diligence materials.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <Card
                key={capability.title}
                className="card-hover overflow-hidden border-border bg-background"
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
