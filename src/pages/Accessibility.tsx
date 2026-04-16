import { ArrowLeft } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-enc-text-primary py-6 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <BrandLockup
              to="/"
              compact
              subtitle="Accessibility"
              subtitleClassName="text-white/70"
            />
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-enc-orange"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              <span className="gradient-text">Accessibility</span>
            </h1>
            <h2 className="mb-8 text-2xl font-semibold text-enc-text-primary md:text-3xl">
              Commitment to Accessibility
            </h2>
            <div className="mx-auto mb-8 h-1 w-24 bg-gradient-warm" />
          </div>

          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">
                Our Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed text-enc-text-secondary">
                Estate Nest Capital Inc. is committed to ensuring digital
                accessibility for people with disabilities. We are continually
                improving the user experience for everyone and applying relevant
                accessibility standards in line with WCAG 2.1 Level AA.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">
                Website Accessibility Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-lg font-semibold text-enc-text-primary">
                    Keyboard Navigation
                  </h3>
                  <p className="text-enc-text-secondary">
                    Our website can be navigated using keyboard controls,
                    allowing users to access interactive elements without a
                    mouse.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-lg font-semibold text-enc-text-primary">
                    Screen Reader Compatibility
                  </h3>
                  <p className="text-enc-text-secondary">
                    We structure content to work with screen readers, provide
                    descriptive alternative text, and maintain clear heading
                    hierarchy.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-lg font-semibold text-enc-text-primary">
                    Color Contrast
                  </h3>
                  <p className="text-enc-text-secondary">
                    We aim to maintain high contrast ratios between text and
                    backgrounds to improve readability.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-lg font-semibold text-enc-text-primary">
                    Resizable Text
                  </h3>
                  <p className="text-enc-text-secondary">
                    Text can be resized through browser settings without losing
                    content or core functionality.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 text-lg font-semibold text-enc-text-primary">
                    Clear Navigation
                  </h3>
                  <p className="text-enc-text-secondary">
                    Consistent navigation structure and plain labels help users
                    move through the site more easily.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">
                Physical Accessibility in Our Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed text-enc-text-secondary">
                Estate Nest Capital Inc. incorporates accessibility features in
                its construction projects in line with Alberta building
                accessibility requirements.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 font-semibold text-enc-text-primary">
                    Barrier-Free Design
                  </h3>
                  <ul className="space-y-1 text-enc-text-secondary">
                    <li>Wide doorways and hallways</li>
                    <li>Level thresholds</li>
                    <li>Accessible bathroom fixtures</li>
                    <li>Lever-style door handles</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <h3 className="mb-2 font-semibold text-enc-text-primary">
                    Aging-in-Place Features
                  </h3>
                  <ul className="space-y-1 text-enc-text-secondary">
                    <li>Main floor bedroom options</li>
                    <li>Walk-in showers with grab bars</li>
                    <li>Accessible kitchen layouts</li>
                    <li>Elevator-ready structures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">
                Accessibility Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed text-enc-text-secondary">
                We welcome feedback on the accessibility of our website and
                services. If you encounter barriers or need assistance, please
                contact us.
              </p>
              <div className="space-y-2 rounded-lg border border-border bg-background p-6">
                <p className="text-enc-text-primary">
                  <strong>Email:</strong> hello@estatenest.capital
                </p>
                <p className="text-enc-text-primary">
                  <strong>Phone:</strong> 780-860-3191
                </p>
                <p className="mt-4 text-sm text-enc-text-secondary">
                  We aim to respond to accessibility feedback within 5 business
                  days.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">
                Compliance Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed text-enc-text-secondary">
                Estate Nest Capital Inc. strives to comply with:
              </p>
              <ul className="space-y-2 text-enc-text-secondary">
                <li>
                  <strong>Alberta Building Code:</strong> Accessibility
                  requirements for barrier-free design in construction
                </li>
                <li>
                  <strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility
                  Guidelines for digital accessibility
                </li>
                <li>
                  <strong>Canadian Human Rights Act:</strong> Federal
                  legislation prohibiting discrimination based on disability
                </li>
                <li>
                  <strong>Alberta Human Rights Act:</strong> Provincial
                  legislation supporting equal rights and accessibility
                </li>
              </ul>
              <p className="mt-6 text-sm text-enc-text-secondary">
                Last updated: April 16, 2026. We review and update our
                accessibility policies regularly.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Accessibility;
