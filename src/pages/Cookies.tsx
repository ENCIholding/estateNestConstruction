import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "How cookies and similar tools may be used",
    body: [
      "Estate Nest Capital Inc. may use cookies or similar browser storage technologies to support website functionality, analytics, accessibility preferences, and management-session behavior.",
      "Examples can include remembering accessibility settings, supporting authenticated dashboard sessions, and understanding how visitors interact with the site at a general level.",
    ],
  },
  {
    title: "What is currently expected on this site",
    body: [
      "The public site may store functional preferences such as accessibility choices in the browser. The management environment may also rely on session cookies for authenticated access control.",
      "Third-party services may set their own cookies or storage entries where they are used for analytics, email workflows, hosted assets, or security-related functions.",
    ],
  },
  {
    title: "Managing cookies",
    body: [
      "Most browsers allow you to review, block, or clear cookies and site data. Doing so may affect how some parts of the site or management dashboard behave.",
      "If you disable cookies entirely, some authentication and preference-based features may no longer function as intended.",
    ],
  },
];

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Cookies | Estate Nest Capital Inc."
        description="Cookie and browser-storage notice for Estate Nest Capital Inc.'s website and ENCI BuildOS-related functionality."
        path="/cookies"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <PublicPageBackLink />
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold md:text-5xl">
                <span className="gradient-text">Cookies</span>
                <span className="text-enc-text-primary">
                  {" "}
                  and browser storage
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-enc-text-secondary">
                This page explains, in plain language, how browser-side storage
                may be used to support accessibility, analytics, and secure
                management access.
              </p>
            </div>

            <Card className="card-hover border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary">
                  Cookie and storage notice
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
                  This cookie notice is intended for public website clarity. If
                  analytics, advertising, or third-party tooling changes
                  materially, this page should be reviewed and updated before
                  public rollout.
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
