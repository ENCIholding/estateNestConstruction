import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Privacy framework",
    body: [
      "Estate Nest Capital Inc. handles personal information in the course of business communications, project intake, hiring intake, and client or lender coordination.",
      "For Alberta private-sector organizations, the Personal Information Protection Act (PIPA) is the core provincial privacy law. Estate Nest Capital Inc. aims to collect, use, and disclose personal information only for reasonable business purposes and only to the extent needed for those purposes.",
    ],
  },
  {
    title: "What information may be collected",
    body: [
      "Depending on how you interact with the site, Estate Nest Capital Inc. may collect contact details, appointment requests, project inquiry information, resume or portfolio files, and correspondence records.",
      "Management dashboard records may also contain project, document, stakeholder, vendor, schedule, and reporting information used for internal operations.",
    ],
  },
  {
    title: "How information may be used",
    body: [
      "Information may be used to respond to inquiries, assess project fit, coordinate construction and development work, prepare diligence materials, evaluate hiring interest, maintain communication records, and improve business operations.",
      "If commercial electronic messages are sent for marketing or promotional purposes, Estate Nest Capital Inc. should do so in a manner consistent with Canada's Anti-Spam Legislation (CASL), including identification and unsubscribe requirements where applicable.",
    ],
  },
  {
    title: "Disclosure and qualified sharing",
    body: [
      "Information may be shared internally or with project participants, consultants, lenders, or service providers where reasonably necessary to support project review, operations, or compliance.",
      "Detailed project references, permit records, and lender-facing materials are available only to qualified parties under an appropriate context.",
    ],
  },
  {
    title: "Protection and retention",
    body: [
      "Estate Nest Capital Inc. is expected to take reasonable measures to protect the personal information it holds, including access controls, system permissions, and controlled disclosure practices.",
      "Records are retained for business, operational, legal, or evidentiary purposes only as long as reasonably required for the underlying purpose or applicable obligations.",
    ],
  },
  {
    title: "Access and correction requests",
    body: [
      "Under Alberta PIPA, individuals may request access to their personal information held by an organization and may request correction of an error or omission. Such requests should be made in writing.",
      "Questions or concerns about privacy handling may be directed to Estate Nest Capital Inc. through hello@estatenest.capital.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Privacy | Estate Nest Capital Inc."
        description="Privacy notice for Estate Nest Capital Inc., including public forms, communication records, and ENCI BuildOS-related business data handling."
        path="/privacy"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <PublicPageBackLink />
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold md:text-5xl">
                <span className="gradient-text">Privacy</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-enc-text-secondary">
                This page explains, at a business level, how Estate Nest Capital
                Inc. may handle personal information collected through its public
                website and related operating systems.
              </p>
            </div>

            <Card className="card-hover border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary">
                  Information handling overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-sm leading-7 text-enc-text-secondary">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h2 className="text-lg font-semibold text-enc-text-primary">
                      {section.title}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {section.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="border-t border-border pt-6 text-xs leading-6 text-muted-foreground">
                  This privacy page is intended as a practical website notice for
                  Alberta and Canadian operations. It does not replace
                  project-specific confidentiality obligations, professional
                  privilege, or formal legal advice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
