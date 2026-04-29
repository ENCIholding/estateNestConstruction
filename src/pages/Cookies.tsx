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
    title: "Purpose of Cookies and Browser Storage",
    paragraphs: ["ENCI may use cookies, local storage, or similar browser-side technologies to support:"],
    bullets: [
      "Functional website behavior",
      "Accessibility preferences",
      "Secure session management",
      "Basic analytics to understand general usage patterns",
      "Security controls and fraud prevention",
    ],
  },
  {
    number: "2.",
    title: "Security and IP-Protection Measures",
    paragraphs: ["To protect proprietary materials and confidential workflows, the Site may implement:"],
    bullets: [
      "Restrictions on right-click, copy, print, and save",
      "Restrictions on screenshots, screen-recording, and snipping tools",
      "Disabled developer tools and inspection functions",
      "Anti-scraping and anti-automation measures",
      "Session-based access controls",
    ],
  },
  {
    number: "3.",
    title: "Third-Party Tools",
    paragraphs: [
      "Analytics, email workflows, hosted assets, or security services may set their own cookies or storage entries. Their use is limited to operational and security purposes.",
    ],
  },
  {
    number: "4.",
    title: "Managing Cookies",
    paragraphs: [
      "Most browsers allow users to review, block, or delete cookies. Disabling cookies may affect site functionality, including authentication and preference-based features.",
    ],
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Cookies | Estate Nest Capital Inc."
        description="Cookies and Browser Storage Notice for Estate Nest Capital Inc."
        path="/cookies"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <PublicPageBackLink />

            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-enc-text-primary md:text-5xl">COOKIES &amp; BROWSER STORAGE NOTICE</h1>
              <p className="mt-4 text-lg text-enc-text-secondary">Estate Nest Capital Inc.</p>
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
                  Certain security features may rely on browser storage to detect or block screenshotting, screen-recording, or developer-tool access attempts.
                </p>

                <div className="rounded-2xl border border-border bg-muted/35 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    FOOTER DISCLAIMER (Cookies Page)
                  </p>
                  <p className="mt-3 text-sm leading-7 text-enc-text-secondary">
                    This notice is intended for public clarity and may be updated if analytics, security, or third-party tooling changes. Unauthorized copying, screenshotting, or reproduction of any content is strictly prohibited.
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
