import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Award, TrendingUp, Users } from "lucide-react";

const Leadership = () => {
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Leadership</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-enc-text-primary mb-8">
              Visionary Leaders Driving Construction Excellence
            </h2>
            <div className="w-24 h-1 bg-gradient-warm mx-auto mb-8"></div>
          </div>

          {/* Founder & CEO */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-warm rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-enc-text-primary">Kanwar Sharma</CardTitle>
                  <p className="text-lg text-enc-orange">Founder & CEO | PMP Certified</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-3">Visionary Entrepreneur</h3>
                <p className="text-lg text-enc-text-secondary leading-relaxed">
                  Kanwar Sharma is the driving force behind Estate Nest Capital Inc., bringing over a decade of experience in construction management, 
                  real estate development, and strategic business growth. As a Project Management Professional (PMP) certified by the Project Management Institute, 
                  Kanwar combines technical expertise with entrepreneurial vision to deliver exceptional results across residential and commercial sectors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-3">Vision in Construction</h3>
                <p className="text-lg text-enc-text-secondary leading-relaxed">
                  Kanwar's vision extends beyond traditional construction practices. He believes in building spaces that not only meet current needs but 
                  anticipate future demands. His approach integrates sustainable building practices, smart home technology, and energy-efficient systems 
                  as standard features—ensuring every Estate Nest Capital project delivers long-term value and exceeds industry standards.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-3">Core Philosophy</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-background border border-border rounded-lg">
                    <Building2 className="w-8 h-8 text-enc-orange mb-3" />
                    <h4 className="font-semibold text-enc-text-primary mb-2">Quality First</h4>
                    <p className="text-enc-text-secondary">
                      Every project must meet the highest standards of construction excellence, using certified trades and premium materials.
                    </p>
                  </div>
                  <div className="p-6 bg-background border border-border rounded-lg">
                    <TrendingUp className="w-8 h-8 text-enc-orange mb-3" />
                    <h4 className="font-semibold text-enc-text-primary mb-2">Innovation Driven</h4>
                    <p className="text-enc-text-secondary">
                      Embracing cutting-edge technology and sustainable practices to create future-ready properties.
                    </p>
                  </div>
                  <div className="p-6 bg-background border border-border rounded-lg">
                    <Award className="w-8 h-8 text-enc-orange mb-3" />
                    <h4 className="font-semibold text-enc-text-primary mb-2">Client Partnership</h4>
                    <p className="text-enc-text-secondary">
                      Building lasting relationships through transparency, accountability, and exceptional service delivery.
                    </p>
                  </div>
                  <div className="p-6 bg-background border border-border rounded-lg">
                    <Users className="w-8 h-8 text-enc-orange mb-3" />
                    <h4 className="font-semibold text-enc-text-primary mb-2">Team Excellence</h4>
                    <p className="text-enc-text-secondary">
                      Assembling best-in-class professionals and fostering a culture of continuous improvement.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-3">Strategic Direction</h3>
                <p className="text-lg text-enc-text-secondary leading-relaxed">
                  Under Kanwar's leadership, Estate Nest Capital is positioned for strategic growth in Edmonton's expanding construction market. 
                  His focus on transit-oriented developments, multi-family residential projects, and specialized commercial spaces aligns with 
                  the region's urban development trajectory. By combining rigorous project management methodologies with entrepreneurial agility, 
                  Kanwar ensures Estate Nest Capital delivers consistent value to clients, investors, and the community.
                </p>
              </div>

              <div className="bg-gradient-warm p-8 rounded-lg text-white">
                <blockquote className="text-xl italic mb-4">
                  "At Estate Nest Capital, we don't just construct buildings—we create lasting value. Every project is an opportunity to 
                  demonstrate our commitment to quality, innovation, and client success. Our vision is to be Edmonton's most trusted construction 
                  and development partner, known for delivering exceptional results that stand the test of time."
                </blockquote>
                <p className="font-semibold">— Kanwar Sharma, Founder & CEO</p>
              </div>
            </CardContent>
          </Card>

          {/* Management Team Overview */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Management Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Deepti R. Chopra</h3>
                  <p className="text-enc-orange mb-3">Communications Head | PMP & Change Management SME</p>
                  <p className="text-enc-text-secondary">
                    Leading all client communications and stakeholder engagement strategies with expertise in change management and project delivery.
                  </p>
                </div>
                <div className="p-6 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Anmol Khokhar</h3>
                  <p className="text-enc-orange mb-3">Plumbing Coordinator</p>
                  <p className="text-enc-text-secondary">
                    Coordinates all plumbing systems ensuring code compliance and optimal functionality across residential and commercial projects.
                  </p>
                </div>
                <div className="p-6 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Sukhman</h3>
                  <p className="text-enc-orange mb-3">Electrical Coordinator</p>
                  <p className="text-enc-text-secondary">
                    Oversees electrical installations, smart home integration, and energy-efficient systems implementation.
                  </p>
                </div>
                <div className="p-6 bg-background border border-border rounded-lg">
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Ajit Sahoo</h3>
                  <p className="text-enc-orange mb-3">Mechanical Engineer</p>
                  <p className="text-enc-text-secondary">
                    Manages HVAC systems, mechanical installations, and climate control solutions for all projects.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="text-center card-hover">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-enc-text-primary mb-6">Connect With Our Leadership Team</h3>
              <p className="text-lg text-enc-text-secondary mb-8 max-w-2xl mx-auto">
                Interested in learning more about our vision or discussing partnership opportunities? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-warm text-white hover:shadow-glow"
                  onClick={() => window.location.href = "/#appointment"}
                >
                  Schedule Meeting
                </Button>
                <Button 
                  variant="outline" 
                  className="border-enc-orange text-enc-orange hover:bg-enc-orange hover:text-white"
                  onClick={() => window.location.href = "mailto:hello@estatenest.capital"}
                >
                  Email Leadership
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leadership;
