import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Keyboard navigation",
    description:
      "Core site navigation and form interactions are designed to work without a mouse.",
  },
  {
    title: "Screen reader structure",
    description:
      "Pages use headings, landmarks, labels, and text alternatives with the goal of improving assistive technology support.",
  },
  {
    title: "Accessibility color mode",
    description:
      "A persistent accessibility button allows visitors to switch to stronger contrast, clearer focus states, and less decorative gradients.",
  },
  {
    title: "Feedback path",
    description:
      "Accessibility barriers can be reported directly through the Estate Nest Capital contact channels listed below.",
  },
];

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <div className="text-left">
                <PublicPageBackLink />
              </div>
              <h1 className="text-4xl font-bold md:text-5xl">
                <span className="gradient-text">Accessibility</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-enc-text-secondary">
                Estate Nest Capital Inc. is working to support WCAG 2.1 AA expectations across core website flows, with ongoing review as content and functionality evolve.
              </p>
            </div>

            <Card className="mb-10 card-hover border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary">
                  How to use the accessibility controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg leading-8 text-enc-text-secondary">
                <p>
                  Use the floating Accessibility button on the site to turn accessible colors on or off. The enhanced mode reduces reliance on decorative gradients and strengthens contrast and focus visibility.
                </p>
                <p>
                  Because the site continues to evolve, accessibility is treated as an active operating requirement rather than a one-time claim.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="card-hover border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-enc-text-primary">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-7 text-enc-text-secondary">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-10 card-hover border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-enc-text-primary">
                  Contact for accessibility support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-enc-text-secondary">
                <p>
                  <strong>Email:</strong> hello@estatenest.capital
                </p>
                <p>
                  <strong>Phone:</strong> 780-860-3191
                </p>
                <p>
                  <strong>Response target:</strong> within 5 business days for accessibility-related inquiries
                </p>
                <p className="pt-2 text-sm leading-7">
                  Last updated: April 16, 2026. Estate Nest Capital reviews accessibility alongside design, content, and deployment changes.
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
