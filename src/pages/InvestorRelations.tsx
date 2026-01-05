import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Shield, FileText, TrendingUp, Users, CheckCircle } from "lucide-react";
import investorCollaborationImage from "@/assets/investor-collaboration.jpg";

const InvestorRelations = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-enc-orange/10 via-enc-yellow/10 to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Investor</span>
                <span className="text-enc-text-primary"> Relations</span>
              </h1>
              <p className="text-xl text-enc-text-secondary leading-relaxed mb-8">
                Partner with Estate Nest Capital Inc. through joint ventures and strategic capital partnerships. 
                We believe in helping the common person achieve their real estate dreams through collaborative, 
                legally protected investment opportunities.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white hover:shadow-glow"
                onClick={() => window.location.href = "mailto:hello@estatenest.capital"}
              >
                Schedule a Consultation
              </Button>
            </div>
          </div>
        </section>

        {/* Investment Approach */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* Image Section */}
              <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl">
                <div className="aspect-[21/9] w-full">
                  <img 
                    src={investorCollaborationImage} 
                    alt="Estate Nest Capital strategic investment partnership - professional collaboration for real estate development in Edmonton" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    Strategic Partnerships Built on Trust
                  </h2>
                  <p className="text-lg md:text-xl font-light max-w-3xl">
                    Collaborative investment opportunities with professional oversight and legal protection
                  </p>
                </div>
              </div>

              <h2 className="text-4xl font-bold text-center mb-4">
                <span className="gradient-text">Our</span>
                <span className="text-enc-text-primary"> Investment Philosophy</span>
              </h2>
              <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                We understand that capital support is essential in project development. We're willing to lend a hand 
                to help turn dreams into reality through structured, compliant partnerships.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg">
                        <Handshake className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:gradient-text-alt transition-all">Joint Venture Opportunities</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      We collaborate with investors on residential and commercial projects through structured joint ventures. 
                      Each partnership is tailored to align interests, share risks appropriately, and maximize returns for all parties.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:gradient-text-alt transition-all">Capital Growth Strategy</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      Our projects are designed to deliver sustainable capital growth. We focus on strategic locations, 
                      proven development models, and professional project management to ensure predictable, attractive returns.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:gradient-text-alt transition-all">Team-Based Approach</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      We believe in working as a team with our investors. Regular communication, transparent reporting, 
                      and collaborative decision-making ensure everyone stays informed and aligned throughout the project lifecycle.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl group-hover:gradient-text-alt transition-all">Accessible Investment</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      We're committed to making real estate investment accessible. Our structured approach allows 
                      everyday investors to participate in quality development projects with professional oversight and risk management.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Due Diligence & Compliance */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4">
                <span className="gradient-text">Due Diligence,</span>
                <span className="text-enc-text-primary"> Ethics & Compliance</span>
              </h2>
              <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                Every investment partnership follows strict guidelines to protect all parties and ensure legal, 
                financial, and ethical compliance.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg w-fit mx-auto">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-center group-hover:gradient-text-alt transition-all">Legal Contracts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      All partnerships are governed by comprehensive legal contracts drafted by experienced real estate attorneys. 
                      Clear terms, defined responsibilities, and exit strategies protect all parties.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg w-fit mx-auto">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-center group-hover:gradient-text-alt transition-all">Insurance Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      Comprehensive Errors & Omissions (E&O) insurance, liability coverage, and life insurance policies 
                      are maintained to cover risks and protect investments against unforeseen events.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group hover:scale-[1.02] transition-all duration-500 hover:shadow-glow hover:bg-gradient-to-br hover:from-enc-orange/5 hover:to-enc-yellow/5">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg w-fit mx-auto">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-center group-hover:gradient-text-alt transition-all">Ethical Standards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      We adhere to the highest ethical standards in all dealings. Transparent reporting, honest communication, 
                      and fair treatment of all stakeholders are foundational to our business model.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 p-8 bg-card border border-border rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-enc-text-primary">Comprehensive Risk Management</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">• Financial Due Diligence</h4>
                    <p className="text-muted-foreground text-sm">
                      Rigorous financial analysis, market studies, and feasibility assessments before committing to any project.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">• Legal Compliance</h4>
                    <p className="text-muted-foreground text-sm">
                      Full compliance with Alberta securities regulations, real estate laws, and partnership structures.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">• Indemnity Protection</h4>
                    <p className="text-muted-foreground text-sm">
                      Indemnity clauses and liability protections built into every partnership agreement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">• Life Insurance Coverage</h4>
                    <p className="text-muted-foreground text-sm">
                      Key person life insurance ensures project continuity and investor protection in unforeseen circumstances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Ready to</span>
                <span className="text-enc-text-primary"> Partner With Us?</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Whether you're an individual investor looking to enter real estate or an experienced capital partner 
                seeking strategic opportunities, we'd love to discuss how we can work together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-enc-orange to-enc-yellow text-white hover:shadow-glow"
                  onClick={() => window.location.href = "mailto:hello@estatenest.capital"}
                >
                  Contact Investor Relations
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = "/#appointment"}
                >
                  Schedule a Meeting
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default InvestorRelations;
