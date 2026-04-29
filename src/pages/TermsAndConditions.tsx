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
    title: "Purpose and Scope",
    paragraphs: [
      'This website and its associated public materials ("Site") are operated by Estate Nest Capital Inc. ("ENCI"). The Site provides general business information, project intake pathways, and communication channels relating to construction and development activities in Alberta.',
      "Use of the Site constitutes acceptance of these Terms.",
    ],
  },
  {
    number: "2.",
    title: "Informational Basis Only",
    paragraphs: ["All content on the Site is illustrative and informational. Nothing on the Site constitutes:"],
    bullets: [
      "Legal, engineering, architectural, valuation, or financial advice",
      "Municipal approval guidance",
      "A substitute for stamped drawings, consultant reports, or executed contracts",
    ],
  },
  {
    number: "3.",
    title: "Intellectual Property, AI-Generated Materials, and Use Restrictions",
    paragraphs: [
      "All text, layouts, graphics, workflows, downloadable materials, and brand assets are the exclusive property of ENCI or their respective rights holders.",
      "Certain images and visual materials on this Site were created using AI-assisted tools under the direction and creative control of Estate Nest Capital Inc. ENCI retains full copyright and usage rights in these materials. No image or visual may be copied, reproduced, or repurposed without written permission.",
      "To protect intellectual property, confidential workflows, and operational integrity, ENCI may implement technical restrictions, including but not limited to:",
    ],
    bullets: [
      "Disabled right-click, copy, print, and save functions",
      "Disabled developer tools, inspection tools, and source-viewing",
      "Disabled screenshotting, screen-recording, and snipping tools (where technically enforceable)",
      "Anti-scraping, anti-automation, and anti-extraction measures",
    ],
  },
  {
    number: "4.",
    title: "Prohibited Conduct",
    paragraphs: ["Users must not:"],
    bullets: [
      "Misrepresent identity or authority",
      "Attempt unauthorized access to restricted systems",
      "Upload harmful code",
      "Interfere with security or IP-protection mechanisms",
      "Use the Site for unlawful, defamatory, or misleading purposes",
      "Attempt to copy, extract, capture, or reproduce any content through screenshots, snipping tools, screen-recording, automated bots, or similar technologies",
    ],
  },
  {
    number: "5.",
    title: "Qualified Access and Disclosures",
    paragraphs: [
      "Detailed project information, diligence packages, lender materials, and permit documentation may be shared only with qualified parties under appropriate confidentiality or contractual arrangements. ENCI may limit disclosure where privacy, contract obligations, or project sensitivity require it.",
    ],
  },
  {
    number: "6.",
    title: "Compliance With Alberta Construction Laws",
    paragraphs: ["ENCI operates in accordance with:"],
    bullets: [
      "Alberta Building Code",
      "Municipal permitting bylaws",
      "Prompt Payment and Construction Lien Act",
      "Occupational Health and Safety Act and Code",
      "Environmental and land-use regulations",
    ],
  },
  {
    number: "7.",
    title: "No Warranty and No Reliance",
    paragraphs: [
      'The Site is provided "as is" without warranties of accuracy, completeness, availability, or suitability. ENCI does not guarantee uninterrupted access or error-free operation.',
      "No user may rely on any timelines, visuals, examples, or descriptions on this Site for project planning, budgeting, or scheduling. Only executed contracts, stamped drawings, consultant reports, and municipal approvals govern project obligations.",
    ],
  },
  {
    number: "8.",
    title: "Limitation of Liability",
    paragraphs: ["ENCI is not liable for any loss arising from:"],
    bullets: [
      "Reliance on public content",
      "System availability or interruptions",
      "Use of third-party links or tools",
      "Technical restrictions or security controls",
    ],
  },
  {
    number: "9.",
    title: "Governing Law",
    paragraphs: ["These Terms are governed by the laws of Alberta and applicable federal laws of Canada."],
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Terms and Conditions | Estate Nest Capital Inc."
        description="Terms and Conditions for Estate Nest Capital Inc. Alberta operations."
        path="/terms-and-conditions"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <PublicPageBackLink />

            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-enc-text-primary md:text-5xl">TERMS AND CONDITIONS</h1>
              <p className="mt-4 text-lg text-enc-text-secondary">Estate Nest Capital Inc. — Alberta Operations</p>
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
                  Project decisions must rely on formal agreements, approved drawings, permits, professional advice, and applicable law.
                </p>
                <p className="font-medium text-enc-text-secondary">
                  Users must not attempt to bypass, disable, or interfere with these protections.
                </p>
                <p className="font-medium text-enc-text-secondary">
                  Nothing on the Site modifies statutory rights or obligations.
                </p>
                <p className="font-medium text-enc-text-secondary">
                  Formal rights and obligations are governed solely by executed project agreements.
                </p>

                <div className="rounded-2xl border border-border bg-muted/35 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    FOOTER DISCLAIMER (Terms Page)
                  </p>
                  <p className="mt-3 text-sm leading-7 text-enc-text-secondary">
                    This page is provided for general business communication only and does not constitute legal, engineering, architectural, financial, or municipal approval advice. All rights, obligations, and deliverables are governed solely by executed contracts, stamped drawings, consultant reports, and applicable Alberta law. Unauthorized copying, screenshotting, or reproduction of any content is strictly prohibited.
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
