import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, FileText, Handshake, Shield, Users } from "lucide-react";
import investorCollaborationImage from "@/assets/investor-collaboration.jpg";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    icon: Handshake,
    title: "Opportunity review",
    description:
      "Investment discussions should begin with a real opportunity, a defined role for capital, and a clear understanding of what has and has not been prepared.",
  },
  {
    icon: FileText,
    title: "Diligence materials",
    description:
      "Project-specific scopes, budgets, schedules, permit references, and legal structures should be reviewed per opportunity rather than implied by generic marketing claims.",
  },
  {
    icon: Users,
    title: "Communication expectations",
    description:
      "Investors and partners need timely updates, clear points of contact, and a disciplined record of changes, approvals, and next steps.",
  },
  {
    icon: Shield,
    title: "Risk awareness",
    description:
      "Construction and development carry execution risk. The goal of this page is to explain process and readiness, not to promise returns or make public investment solicitations.",
  },
];

export default function InvestorRelations() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-24">
        <section className="bg-gradient-to-br from-enc-orange/10 via-enc-yellow/10 to-background py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="text-left">
                <PublicPageBackLink />
              </div>
              <h1 className="text-5xl font-bold md:text-6xl">
                <span className="gradient-text">Investor</span>
                <span className="text-enc-text-primary"> relations</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-enc-text-secondary">
                This page is meant to set expectations for diligence and communication. It is not a public offering, and it does not replace project-specific legal, financial, or technical review.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-gradient-warm text-white hover:shadow-glow">
                  <Link to="/#appointment">Request an introduction</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/builder-profile">Review builder profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <div className="relative mb-16 overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="aspect-[21/9] w-full">
                  <img
                    src={investorCollaborationImage}
                    alt="Representative concept image of a project diligence discussion between collaborators."
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-12">
                  <h2 className="text-3xl font-bold md:text-4xl">
                    Discussions should start with real diligence
                  </h2>
                  <p className="mt-3 max-w-3xl text-lg leading-8 text-white/85">
                    Estate Nest Capital is building toward a more disciplined presentation of project controls, operating readiness, and stakeholder communication.
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <Card key={section.title} className="card-hover border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                            <Icon className="h-6 w-6" />
                          </div>
                          <CardTitle className="text-2xl text-foreground">
                            {section.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="leading-7 text-muted-foreground">
                          {section.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="mt-12 card-hover border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-enc-text-primary">
                    What still needs verified business input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-enc-text-secondary">
                  <div className="flex gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-enc-orange" />
                    <p>Named opportunities or completed projects that can be disclosed publicly</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-enc-orange" />
                    <p>Verified capital structure examples, budgets, and lender-ready case studies</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-enc-orange" />
                    <p>Any specific credentials, insurance, warranty, or regulatory statements intended for disclosure</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
