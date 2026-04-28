import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Website use",
    body: [
      "This website is provided by Estate Nest Capital Inc. as a business information, intake, and communication platform for construction and development coordination in Alberta.",
      "Use of this website is subject to lawful use, reasonable business conduct, and these terms as they may be updated from time to time.",
    ],
  },
  {
    title: "Informational basis",
    body: [
      "Public pages describe operating focus, representative capabilities, and communication pathways. They do not replace project-specific contracts, scopes, permits, drawings, professional advice, or lender documentation.",
      "Representative visuals and concept references are used to discuss fit, scope, and delivery approach unless separately identified as verified project materials.",
    ],
  },
  {
    title: "Qualified diligence and disclosures",
    body: [
      "Detailed project references, permit records, lender-facing packages, and diligence materials may be shared selectively with qualified clients, lenders, consultants, and partners where disclosure is appropriate.",
      "Estate Nest Capital Inc. may withhold or limit disclosure where confidentiality, privacy, contract restrictions, or project sensitivity require it.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Website text, interface elements, workflows, report structures, graphics, and brand materials remain the property of Estate Nest Capital Inc. or their respective rights holders unless otherwise stated.",
      "No part of the site or ENCI BuildOS may be copied, reproduced, redistributed, reverse engineered, or repurposed for commercial use without written permission.",
    ],
  },
  {
    title: "No legal or professional advice",
    body: [
      "Website content and generated materials are provided for business communication and review purposes only. They are not legal, financial, engineering, accounting, surveying, appraisal, or municipal approval advice.",
      "Project decisions should be verified against executed agreements, permits, drawings, consultant advice, and applicable law.",
    ],
  },
  {
    title: "Privacy, submissions, and Alberta use",
    body: [
      "Information submitted through contact, appointment, careers, or management forms is handled in accordance with Estate Nest Capital Inc.'s privacy practices and the applicable Alberta and Canadian privacy framework.",
      "If you submit information on behalf of another person or organization, you are responsible for ensuring you have authority to do so.",
    ],
  },
  {
    title: "Limitation and governing law",
    body: [
      "This website and related materials are provided on an as-available basis without any guarantee of uninterrupted availability, complete accuracy, or suitability for every use case.",
      "These terms are governed by the laws of Alberta and the applicable federal laws of Canada. Formal project rights and obligations remain governed by the specific agreements applicable to each engagement.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Terms and Conditions | Estate Nest Capital Inc."
        description="Terms and conditions for Estate Nest Capital Inc.'s public website and ENCI BuildOS-related materials."
        path="/terms-and-conditions"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <PublicPageBackLink />
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold md:text-5xl">
                <span className="gradient-text">Terms</span>
                <span className="text-enc-text-primary"> and Conditions</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-enc-text-secondary">
                These terms set the public-use framework for Estate Nest Capital
                Inc.&apos;s website, intake forms, and related ENCI BuildOS
                communication materials.
              </p>
            </div>

            <Card className="card-hover border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary">
                  Estate Nest Capital Inc.
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
                  This page is a business-facing website terms draft built for
                  Alberta operations and public communications. It should be
                  reviewed alongside project contracts and formal legal advice
                  before being treated as a final legal instrument for any
                  specific transaction.
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
