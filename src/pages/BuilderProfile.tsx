import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Award, TrendingUp, Users, Building2, FileCheck, MessageSquare, Home } from "lucide-react";
import BuilderCredentials from "@/components/BuilderCredentials";
import builderExcellenceImage from "@/assets/builder-excellence.jpg";

const BuilderProfile = () => {
  const processSteps = [
    { title: "Consultation", description: "We start with listening. Our first meeting is about building trust, understanding goals, and presenting the most cost-effective, compliant, and forward-looking options." },
    { title: "Location Scouting", description: "Whether finding the perfect lot or optimizing an existing property, we guide clients through zoning, grading, and municipal considerations to maximize both space and investment potential." },
    { title: "Drawings & Blueprints", description: "Using AutoCAD and Revit, our architects and engineers translate vision into technical plans. Clients review and approve detailed blueprints before contracts are finalized." },
    { title: "Design & Visualization", description: "Through Lumion and SketchUp renderings, clients see their project come alive before construction begins, ensuring no surprises." },
    { title: "Permits & Approvals", description: "Our experience with municipal offices, zoning regulations, and provincial codes means projects move smoothly through the approval process." },
    { title: "Construction", description: "Trades are mobilized under strict sequencing, tracked through MS Project and Procore with milestone reporting and Gantt chart monitoring." },
    { title: "Handover", description: "Clients receive more than keys – they receive orientation, warranty documentation, and the assurance of a partner who stands by their build." }
  ];

  const safetyProtocols = [
    { icon: Shield, title: "Mandatory PPE", description: "Hard hats, CSA-approved safety footwear, high-visibility clothing, eye and ear protection as required." },
    { icon: FileCheck, title: "Site Access Control", description: "Unauthorized entry is strictly prohibited, with visitor and contractor check-ins documented." },
    { icon: Award, title: "Emergency Preparedness", description: "Clearly posted numbers for fire, ambulance, poison control, utilities, and supervisors." },
    { icon: CheckCircle, title: "Clean Site Standard", description: "Safe sites are clean sites – strict housekeeping protocols enforced daily." }
  ];

  const tradePhases = [
    { phase: "01", title: "Foundation Phase", description: "Insurance, permits, demolition, EPCOR connections, excavation, weeping tiles, concrete pours" },
    { phase: "02", title: "Structural Phase", description: "Lumber, trusses, framing (averaging $10/sq. ft. for major builds), structural inspections" },
    { phase: "03", title: "Systems Integration", description: "Mechanical, electrical, plumbing, heating, wiring, fixtures with certified trades coordination" },
    { phase: "04", title: "Interior Completion", description: "Cabinets, flooring, quartz countertops, windows, drywall, paint, doors, tiles, finishing" },
    { phase: "05", title: "Final Delivery", description: "Exterior siding, roofing, smart technology, landscaping, occupancy checks, warranty activation" }
  ];

  const homeModels = [
    { name: "Jasper Model", description: "A sophisticated single-family infill home designed for contemporary urban living with optimal space utilization." },
    { name: "Kiaan Model", description: "Four-plex multi-dwelling unit optimized for CMHC financing and strong rental returns for investors." },
    { name: "Kenysha Model", description: "Premium single-family residence featuring upscale finishes paired with sustainable building practices." }
  ];

  const advantages = [
    { icon: Building2, title: "Dual-Sector Expertise", description: "Unique mastery of both residential and commercial construction, allowing cross-sector efficiency and commercial-grade systems in residential projects." },
    { icon: CheckCircle, title: "Full-Service Capability", description: "Complete lifecycle management from land acquisition and permitting to construction and post-handover support – one trusted partner." },
    { icon: Award, title: "PMP-Certified Governance", description: "Structured project management with Gantt charts, cost controls, and milestone reviews ensuring predictable delivery and stakeholder confidence." },
    { icon: TrendingUp, title: "Technology Integration", description: "Advanced tools including AutoCAD, Revit, Lumion, and Procore for transparent progress tracking and risk-controlled execution." }
  ];

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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Builder Profile</span>
            </h1>
            <p className="text-xl text-enc-text-secondary max-w-3xl mx-auto">
              Estate Nest Capital Inc. - Edmonton's trusted partner for residential and commercial construction excellence
            </p>
            <div className="w-24 h-1 bg-gradient-warm mx-auto mt-8"></div>
          </div>

          {/* Hero Image Section */}
          <section className="mb-20">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[21/9] w-full">
                <img 
                  src={builderExcellenceImage} 
                  alt="Estate Nest Capital construction excellence - diverse team of professionals collaborating on modern innovative building project" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Excellence in Every Build
                </h2>
                <p className="text-xl md:text-2xl font-light max-w-4xl">
                  Discover our expertise, certifications, and commitment to delivering outstanding construction projects
                </p>
              </div>
            </div>
          </section>

          {/* Our Process */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              <span className="gradient-text">Our</span>
              <span className="text-enc-text-primary"> Process</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {processSteps.map((step, index) => (
                <Card key={index} className="card-hover group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-warm rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-xl group-hover:gradient-text-alt transition-all">{step.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-enc-text-secondary leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Safety Protocols */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              <span className="gradient-text">Safety</span>
              <span className="text-enc-text-primary"> Protocols</span>
            </h2>
            <Card className="mb-8 card-hover">
              <CardContent className="p-8">
                <p className="text-lg text-enc-text-secondary leading-relaxed mb-8">
                  We enforce a zero-compromise safety policy in full alignment with Alberta Occupational Health & Safety (OHS) regulations. Our sites display mandatory signage and safety instructions, and our safety standards include:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {safetyProtocols.map((protocol, index) => {
                    const Icon = protocol.icon;
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5 transition-all">
                        <div className="bg-gradient-warm p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-enc-text-primary mb-1">{protocol.title}</h3>
                          <p className="text-sm text-enc-text-secondary">{protocol.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
                  <h3 className="font-bold text-enc-text-primary mb-3">Compliance Oversight</h3>
                  <p className="text-enc-text-secondary">Field Level Hazard Assessments (FLHAs) completed, with safety officer oversight where required. Our approach ensures a culture where safe sites mean efficient sites – reducing accidents, improving productivity, and building lender trust.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Trade Workflow */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="gradient-text">Trade Workflow</span>
              <span className="text-enc-text-primary"> & Transparency</span>
            </h2>
            <p className="text-center text-lg text-enc-text-secondary mb-12 max-w-3xl mx-auto">
              Our structured approach to construction sequencing provides lenders and clients with complete visibility into project execution.
            </p>
            <div className="space-y-4">
              {tradePhases.map((phase, index) => (
                <Card key={index} className="card-hover group hover:scale-[1.01] transition-all duration-500 hover:shadow-glow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-warm">
                        {phase.phase}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-enc-text-primary mb-2 group-hover:gradient-text-alt transition-all">
                          {phase.title}
                        </h3>
                        <p className="text-enc-text-secondary leading-relaxed">{phase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Home Models */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="gradient-text">ENCI</span>
              <span className="text-enc-text-primary"> Home Models</span>
            </h2>
            <p className="text-center text-lg text-enc-text-secondary mb-12 max-w-3xl mx-auto">
              Our signature home designs combine modern living with smart technology and energy efficiency, creating future-ready properties.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {homeModels.map((model, index) => (
                <Card key={index} className="card-hover group hover:scale-105 transition-all duration-500 hover:shadow-glow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-enc-text-primary mb-3 group-hover:gradient-text-alt transition-all">
                      {model.name}
                    </h3>
                    <p className="text-enc-text-secondary leading-relaxed">{model.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center p-6 bg-muted/50 rounded-lg border border-border">
              <p className="text-enc-text-secondary">
                Each model includes smart-home technology, energy-efficient systems, and adaptable layouts as standard features – ensuring ENCI homes remain competitive and valuable long-term.
              </p>
            </div>
          </section>

          {/* Competitive Advantages */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              <span className="gradient-text">Competitive</span>
              <span className="text-enc-text-primary"> Advantages</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <Card key={index} className="card-hover group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-warm p-3 rounded-lg flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-enc-text-primary mb-2 group-hover:gradient-text-alt transition-all">
                            {advantage.title}
                          </h3>
                          <p className="text-enc-text-secondary leading-relaxed">{advantage.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Financial Metrics */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              <span className="gradient-text">Financial Stability</span>
              <span className="text-enc-text-primary"> & Metrics</span>
            </h2>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="card-hover text-center p-6 group hover:scale-105 transition-all duration-500 hover:shadow-glow">
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-warm mb-2">95%</div>
                  <div className="text-sm font-semibold text-enc-text-primary">On-Time Completion</div>
                  <div className="text-xs text-enc-text-secondary mt-1">Consistent delivery reliability</div>
                </CardContent>
              </Card>
              <Card className="card-hover text-center p-6 group hover:scale-105 transition-all duration-500 hover:shadow-glow">
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-warm mb-2">3%</div>
                  <div className="text-sm font-semibold text-enc-text-primary">Budget Variance</div>
                  <div className="text-xs text-enc-text-secondary mt-1">Average project cost control</div>
                </CardContent>
              </Card>
              <Card className="card-hover text-center p-6 group hover:scale-105 transition-all duration-500 hover:shadow-glow">
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-warm mb-2">60%</div>
                  <div className="text-sm font-semibold text-enc-text-primary">Residential Focus</div>
                  <div className="text-xs text-enc-text-secondary mt-1">Balanced portfolio mix</div>
                </CardContent>
              </Card>
              <Card className="card-hover text-center p-6 group hover:scale-105 transition-all duration-500 hover:shadow-glow">
                <CardContent className="p-0">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-warm mb-2">$1M-5M</div>
                  <div className="text-sm font-semibold text-enc-text-primary">Project Scale</div>
                  <div className="text-xs text-enc-text-secondary mt-1">Typical build range</div>
                </CardContent>
              </Card>
            </div>
            <Card className="card-hover">
              <CardContent className="p-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-enc-text-primary mb-3">Financial Controls</h3>
                    <ul className="space-y-2 text-enc-text-secondary text-sm">
                      <li>• 60-70% loan-to-cost ratios with CMHC MLI-readiness</li>
                      <li>• Procore documentation with photo logs</li>
                      <li>• 10% PPCLA holdbacks standard with lien waiver compliance</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-enc-text-primary mb-3">Insurance & Claims</h3>
                    <ul className="space-y-2 text-enc-text-secondary text-sm">
                      <li>• Active Builder's Risk, GL, Auto insurance</li>
                      <li>• WCB in good standing</li>
                      <li>• Zero liens, zero claims, no premium increases</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Builder Credentials Section */}
          <BuilderCredentials />

          {/* Contact CTA */}
          <Card className="text-center card-hover">
            <CardContent className="py-16 px-8">
              <h3 className="text-3xl font-bold mb-4">
                <span className="gradient-text">Ready to Build</span>
                <span className="text-enc-text-primary"> Edmonton's Future</span>
              </h3>
              <p className="text-lg text-enc-text-secondary mb-8 max-w-2xl mx-auto">
                With Edmonton's strong growth momentum and transit expansion, ENCI combines local expertise with innovative approaches to deliver exceptional value.
              </p>
              <div className="space-y-3 mb-8">
                <p className="text-enc-text-primary">📧 hello@estatenest.capital</p>
                <p className="text-enc-text-primary">📞 (780) 860-3191</p>
                <p className="text-enc-text-primary">🌐 www.estatenest.capital</p>
              </div>
              <Button className="bg-gradient-warm text-white hover:shadow-glow px-8 py-6 text-lg">
                Schedule Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BuilderProfile;
