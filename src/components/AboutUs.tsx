import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Award, TrendingUp, Shield } from "lucide-react";

const AboutUs = () => {
  return (
    <section 
      id="about" 
      className="py-20 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">About</span>
            <span className="text-enc-text-primary"> Estate Nest Capital</span>
          </h2>
          <p className="text-xl text-enc-text-secondary max-w-3xl mx-auto">
            More than construction - we are your development partner for lasting value and trusted relationships.
          </p>
        </div>

        {/* Company Overview */}
        <Card className="mb-12 group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary group-hover:gradient-text-alt transition-all">Development Partner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-enc-text-secondary leading-relaxed">
              Estate Nest Capital Inc. is more than a construction company – we are a development partner. By uniting innovative design, 
              proven project management practices, and an unwavering commitment to quality, we create projects that balance functionality, 
              financial prudence, and community impact.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-4">Diverse Portfolio</h3>
                <p className="text-enc-text-secondary leading-relaxed">
                  From basement developments to multi-family dwellings, and from restaurant fit-outs to wellness spas and childcare centers, 
                  we have demonstrated our ability to deliver across diverse sectors.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-4">Clear Objective</h3>
                <p className="text-enc-text-secondary leading-relaxed">
                  Every project is executed with a clear objective: lasting value and trusted relationships. We deliver exceptional 
                  construction services and craft spaces our clients will cherish for years to come.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <Card className="mb-12 group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary group-hover:gradient-text-alt transition-all">Core Values & Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Innovation</h3>
                <p className="text-enc-text-secondary text-sm">
                  Adopting new technologies, materials, and design trends to stay at the forefront of construction in Edmonton.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Excellence</h3>
                <p className="text-enc-text-secondary text-sm">
                  Using only the most reliable materials and certified trades to deliver projects that exceed expectations.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Growth</h3>
                <p className="text-enc-text-secondary text-sm">
                  Constantly looking ahead to set new standards in construction quality and client satisfaction.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Integrity</h3>
                <p className="text-enc-text-secondary text-sm">
                  Delivering projects with rigorous planning, transparent financial controls, and proactive risk management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expertise Areas */}
        <Card className="mb-12 group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary group-hover:gradient-text-alt transition-all">Areas of Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-4">Residential Construction</h3>
                <p className="text-enc-text-secondary mb-3">
                  Proven success across residential formats with versatile and investment-minded work:
                </p>
                <ul className="space-y-2 text-enc-text-secondary">
                  <li>• Custom single-family infills</li>
                  <li>• Multi-unit rowhouses under CMHC programs</li>
                  <li>• Basement developments with rental value</li>
                  <li>• Age-friendly and aging-in-place designs</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-enc-text-primary mb-4">Commercial Construction</h3>
                <p className="text-enc-text-secondary mb-3">
                  Specialized commercial projects that meet operational requirements while elevating brand identity:
                </p>
                <ul className="space-y-2 text-enc-text-secondary">
                  <li>• Restaurant leasehold improvements</li>
                  <li>• Licensed daycare facilities</li>
                  <li>• Wellness facilities and spas</li>
                  <li>• Professional office spaces</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Management */}
        <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-enc-text-primary group-hover:gradient-text-alt transition-all">Professional Project Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-enc-text-secondary leading-relaxed">
              Led by Kanwar Sharma, PMP (Project Management Professional certified by PMI), Estate Nest Capital manages projects 
              under rigorous frameworks ensuring delivery on time, within budget, and without compromising safety or code compliance.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="p-6 bg-background border border-border rounded-lg">
                <h3 className="font-semibold text-enc-text-primary mb-2">Transparent Controls</h3>
                <p className="text-enc-text-secondary text-sm">
                  MS Project, Gantt charts, and Procore tracking for complete visibility.
                </p>
              </div>
              <div className="p-6 bg-background border border-border rounded-lg">
                <h3 className="font-semibold text-enc-text-primary mb-2">Risk Management</h3>
                <p className="text-enc-text-secondary text-sm">
                  Proactive identification and mitigation of project risks.
                </p>
              </div>
              <div className="p-6 bg-background border border-border rounded-lg">
                <h3 className="font-semibold text-enc-text-primary mb-2">Quality Assurance</h3>
                <p className="text-enc-text-secondary text-sm">
                  Comprehensive inspections and documentation at every phase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AboutUs;
