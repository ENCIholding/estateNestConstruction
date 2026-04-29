import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import codesImage from "@/assets/regulatory-safety-codes.png";
import ohsImage from "@/assets/regulatory-ohs-enci.png";
import siteSafetyImage from "@/assets/regulatory-site-safety-enci.png";

const commitmentItems = [
  "Full adherence to federal, provincial, and municipal building codes",
  "Strict compliance with Alberta OHS safety requirements",
  "Transparent communication of governing authorities and regulatory bodies",
  "Clear safety expectations for workers, consultants, and site visitors",
  "Consistent application of code-based construction practices",
  "Proactive risk management and site-safety culture",
];

const imageSections = [
  {
    title: "Section: Codes & Standards We Follow",
    alt: "Estate Nest Capital Inc. Codes and Standards Compliance Poster - Alberta Construction Regulations",
    src: codesImage,
  },
  {
    title: "Section: Occupational Health & Safety (OHS) Requirements",
    alt: "Alberta OHS Emergency Numbers and Safety Protocol Poster - Estate Nest Capital Inc.",
    src: ohsImage,
  },
  {
    title: "Section: Site Safety & Clean Site Policy",
    alt: "Estate Nest Capital Inc. Construction Site Safety Awareness Poster",
    src: siteSafetyImage,
  },
];

export default function RegulatorySafetyStandards() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Regulatory Safety Standards | Estate Nest Capital Inc."
        description="Regulatory Safety Standards for Estate Nest Capital Inc. Alberta operations."
        path="/regulatory-safety-standards"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <PublicPageBackLink />

            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-enc-text-primary md:text-5xl">REGULATORY SAFETY STANDARDS</h1>
              <p className="mt-4 text-lg text-enc-text-secondary">Estate Nest Capital Inc. — Regulatory Compliance</p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">Last Updated: April 2026</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="space-y-6 p-8 text-sm leading-7 text-enc-text-secondary md:p-10">
                <p>
                  Estate Nest Capital Inc. operates under a strict compliance framework aligned with Alberta&apos;s construction, safety, and development regulations. The following sections summarize our commitment to:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  {commitmentItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  Below are three visual compliance summaries that outline the codes we follow, emergency safety protocols, and our site-safety expectations.
                </p>
              </CardContent>
            </Card>

            <section className="mt-10 space-y-8">
              {imageSections.map((section) => (
                <Card key={section.title} className="overflow-hidden border-0 shadow-xl">
                  <CardContent className="p-0">
                    <div className="border-b border-border/60 bg-muted/35 px-6 py-4">
                      <h2 className="text-lg font-semibold text-enc-text-primary">{section.title}</h2>
                    </div>
                    <div className="bg-white p-4 md:p-6">
                      <img src={section.src} alt={section.alt} className="w-full rounded-xl border border-border/60 shadow-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
