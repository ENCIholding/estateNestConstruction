import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

type PolicySection = {
  number: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const sections: PolicySection[] = [
  {
    number: "1.",
    title: "Privacy Framework",
    paragraphs: [
      "ENCI handles personal information in accordance with the Personal Information Protection Act (PIPA) of Alberta. Information is collected, used, and disclosed only for reasonable business purposes.",
    ],
  },
  {
    number: "2.",
    title: "Information Collected",
    paragraphs: ["Depending on your interaction with the Site, ENCI may collect:"],
    bullets: [
      "Contact details and inquiry information",
      "Appointment or project intake submissions",
      "Resume, portfolio, or hiring materials",
      "Communication records",
      "Operational data within management systems (project, vendor, schedule, reporting)",
    ],
  },
  {
    number: "3.",
    title: "How Information Is Used",
    paragraphs: ["Information may be used to:"],
    bullets: [
      "Respond to inquiries and assess project fit",
      "Coordinate construction and development activities",
      "Prepare diligence or lender materials",
      "Evaluate hiring interest",
      "Maintain communication records",
      "Improve business operations",
      "Support fraud prevention and system security",
    ],
  },
  {
    number: "4.",
    title: "Disclosure and Qualified Sharing",
    paragraphs: [
      "Information may be shared internally or with project participants, consultants, lenders, or service providers where necessary for operations or compliance.",
      "Detailed project materials are shared only with qualified parties under contract.",
    ],
  },
  {
    number: "5.",
    title: "Protection, Retention, and Data Residency",
    paragraphs: [
      "ENCI uses reasonable security measures including access controls, permissions, encryption where applicable, and controlled disclosure.",
      "Records are retained only as long as required for business, legal, or evidentiary purposes.",
      "Some operational data may be processed or stored in secure Canadian cloud environments consistent with Alberta PIPA requirements.",
    ],
  },
  {
    number: "6.",
    title: "Screenshot, Copying, and Extraction Restrictions",
    paragraphs: ["To protect confidential information and proprietary workflows, ENCI may implement measures to restrict:"],
    bullets: [
      "Screenshots and screen-recording",
      "Snipping tools",
      "Copying, printing, and saving",
      "Developer-tool inspection",
      "Automated extraction or scraping",
    ],
  },
  {
    number: "7.",
    title: "Access and Correction Requests",
    paragraphs: [
      "Under Alberta PIPA, individuals may request access to or correction of their personal information. Requests must be made in writing to hello@estatenest.capital.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy | Estate Nest Capital Inc."
        description="Privacy Policy for Estate Nest Capital Inc. Alberta PIPA compliance."
        path="/privacy"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <PublicPageBackLink />

            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-enc-text-primary md:text-5xl">PRIVACY POLICY</h1>
              <p className="mt-4 text-lg text-enc-text-secondary">Estate Nest Capital Inc. — Alberta PIPA Compliance</p>
              <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">Last Updated: April 2026</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="space-y-8 p-8 text-sm leading-7 text-enc-text-secondary md:p-10">
                {sections.map((section) => (
                  <section key={section.number + section.title}>
                    <h2 className="text-lg font-semibold text-enc-text-primary">
                      {section.number} {section.title}
                    </h2>
                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="mt-3">
                        {paragraph}
                      </p>
                    ))}
                    {section.bullets ? (
                      <ul className="mt-3 list-disc space-y-2 pl-6">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}

                <p className="border-t border-border pt-6 font-medium text-enc-text-secondary">
                  System-level security logs may also record IP addresses, device identifiers, and access behavior for fraud prevention and operational integrity.
                </p>
                <p className="font-medium text-enc-text-secondary">
                  If commercial electronic messages are sent, ENCI will comply with CASL requirements.
                </p>
                <p className="font-medium text-enc-text-secondary">
                  Users must not attempt to bypass these protections.
                </p>

                <div className="rounded-2xl border border-border bg-muted/35 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    FOOTER DISCLAIMER (Privacy Page)
                  </p>
                  <p className="mt-3 text-sm leading-7 text-enc-text-secondary">
                    This privacy notice supports Alberta operations and does not replace legal advice or project-specific confidentiality obligations. Unauthorized copying, screenshotting, or reproduction of any content is strictly prohibited.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
