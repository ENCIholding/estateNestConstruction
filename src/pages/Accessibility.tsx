import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-enc-text-primary text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ESTATE NEST CAPITAL</h1>
            <Button 
              variant="ghost" 
              className="text-white hover:text-enc-orange hover:bg-white/10"
              onClick={() => window.history.back()}
            >
              ← Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Accessibility</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-enc-text-primary mb-8">
              Commitment to Accessibility
            </h2>
            <div className="w-24 h-1 bg-gradient-warm mx-auto mb-8"></div>
          </div>

          {/* Accessibility Statement */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Our Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-enc-text-secondary leading-relaxed">
                Estate Nest Capital Inc. is committed to ensuring digital accessibility for people with disabilities. 
                We are continually improving the user experience for everyone and applying the relevant accessibility standards 
                in accordance with the Accessibility for Ontarians with Disabilities Act (AODA) and Web Content Accessibility Guidelines (WCAG).
              </p>
            </CardContent>
          </Card>

          {/* Website Accessibility Features */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Website Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Keyboard Navigation</h3>
                  <p className="text-enc-text-secondary">
                    Our website can be navigated using keyboard controls, allowing users to access all interactive elements without a mouse.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Screen Reader Compatibility</h3>
                  <p className="text-enc-text-secondary">
                    We've structured our website to work seamlessly with screen readers, providing alternative text for images and clear heading hierarchies.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Color Contrast</h3>
                  <p className="text-enc-text-secondary">
                    We maintain high contrast ratios between text and backgrounds to ensure readability for users with visual impairments.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Resizable Text</h3>
                  <p className="text-enc-text-secondary">
                    Text can be resized up to 200% without loss of content or functionality using browser settings.
                  </p>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Clear Navigation</h3>
                  <p className="text-enc-text-secondary">
                    Consistent navigation structure and clear labels help users understand and navigate our website easily.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Accessibility */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Physical Accessibility in Our Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-enc-text-secondary leading-relaxed">
                Estate Nest Capital Inc. incorporates accessibility features in all our construction projects, ensuring compliance 
                with Alberta Building Code accessibility requirements:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="font-semibold text-enc-text-primary mb-2">Barrier-Free Design</h3>
                  <ul className="space-y-1 text-enc-text-secondary">
                    <li>• Wide doorways and hallways</li>
                    <li>• Level thresholds</li>
                    <li>• Accessible bathroom fixtures</li>
                    <li>• Lever-style door handles</li>
                  </ul>
                </div>
                <div className="p-4 bg-background border border-border rounded-lg">
                  <h3 className="font-semibold text-enc-text-primary mb-2">Aging-in-Place Features</h3>
                  <ul className="space-y-1 text-enc-text-secondary">
                    <li>• Main floor bedroom options</li>
                    <li>• Walk-in showers with grab bars</li>
                    <li>• Accessible kitchen layouts</li>
                    <li>• Elevator-ready structures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback and Contact */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Accessibility Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-enc-text-secondary leading-relaxed">
                We welcome your feedback on the accessibility of our website and services. If you encounter any accessibility barriers 
                or have suggestions for improvement, please contact us:
              </p>
              <div className="bg-background border border-border rounded-lg p-6 space-y-2">
                <p className="text-enc-text-primary"><strong>Email:</strong> hello@estatenest.capital</p>
                <p className="text-enc-text-primary"><strong>Phone:</strong> 780-860-3191</p>
                <p className="text-enc-text-secondary text-sm mt-4">
                  We aim to respond to accessibility feedback within 5 business days.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alberta Standards */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Compliance Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-enc-text-secondary leading-relaxed">
                Estate Nest Capital Inc. strives to comply with:
              </p>
              <ul className="space-y-2 text-enc-text-secondary">
                <li>• <strong>Alberta Building Code:</strong> Accessibility requirements for barrier-free design in construction</li>
                <li>• <strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines for digital accessibility</li>
                <li>• <strong>Canadian Human Rights Act:</strong> Federal legislation prohibiting discrimination based on disability</li>
                <li>• <strong>Alberta Human Rights Act:</strong> Provincial legislation ensuring equal rights and accessibility</li>
              </ul>
              <p className="text-sm text-enc-text-secondary mt-6">
                Last updated: January 2025. We review and update our accessibility policies annually.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Accessibility;
