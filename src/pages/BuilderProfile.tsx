import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FileText,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import builderExcellenceImage from "@/assets/builder-excellence.jpg";
import BuilderCredentials from "@/components/BuilderCredentials";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const readinessItems = [
  {
    icon: ClipboardList,
    title: "Pre-construction planning",
    description:
      "Scope definition, site context, permit pathway assumptions, and delivery expectations should be clarified before a project is presented as ready to move.",
  },
  {
    icon: CalendarClock,
    title: "Schedule and milestone control",
    description:
      "Target dates, milestone dependencies, and follow-up responsibilities need to be current enough to support client and lender review.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance and diligence references",
    description:
      "Permit links, legal land details, warranty information, and similar records should be attached to the live file instead of implied by default marketing language.",
  },
  {
    icon: Users,
    title: "Stakeholder communication",
    description:
      "Clients, lenders, and internal teams need a clear point of contact, documented next steps, and an honest view of what is ready versus what is still being assembled.",
  },
];

const materialGroups = [
  {
    title: "What this profile can support",
    items: [
      "A clearer explanation of Estate Nest Capital's operating approach",
      "An overview of the materials that may support qualified diligence review",
      "A grounded discussion of planning, documentation, delivery controls, and accountability",
    ],
  },
  {
    title: "Private diligence and disclosure basis",
    items: [
      "Detailed project references, permit records, and lender-facing materials are available only to qualified parties under an appropriate context",
      "Verified licensing, insurance, warranty, and certification details should be matched to the relevant project or business file",
      "Disclosure can be staged according to confidentiality, deal sensitivity, and review need",
    ],
  },
];

export default function BuilderProfile() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Builder Profile | Estate Nest Capital Inc."
        description="Builder profile for Estate Nest Capital Inc., covering operating capability, project readiness, documentation discipline, and qualified diligence pathways."
        path="/builder-profile"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <section className="pb-12 pt-8">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <PublicPageBackLink />

              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="aspect-[3/4] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
                  <img
                    src={builderExcellenceImage}
                    alt="Estate Nest Capital builder profile and construction coordination image"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 md:p-12">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/92 sm:text-sm sm:tracking-[0.26em]">
                    Builder profile
                  </p>
                  <h1 className="mt-2 text-[1.72rem] font-bold leading-tight sm:mt-3 sm:text-4xl md:text-5xl">
                    Real <span className="gradient-text-alt">construction coordination</span>, cleaner{" "}
                    <span className="gradient-text-alt">diligence</span>, and reviewable{" "}
                    <span className="gradient-text-alt">project controls</span>
                  </h1>
                  <p className="mt-3 max-w-3xl text-[0.95rem] leading-7 text-white/90 sm:mt-4 sm:text-lg sm:leading-8 sm:text-white/85">
                    Estate Nest Capital presents builder information around real
                    operating capability, real project execution discipline,
                    Edmonton construction experience, and lender-facing
                    documentation readiness.
                  </p>
                </div>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                <Card className="card-hover border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-enc-text-primary">
                      Operating focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-lg leading-8 text-enc-text-secondary">
                    <p>
                      Estate Nest Capital organizes construction work around
                      planning discipline, permit readiness, cost visibility,
                      communication records, and lender or client review that
                      can stand up to real project pressure.
                    </p>
                    <p>
                      This profile is meant to show how projects are approached
                      operationally, what kinds of diligence materials can be
                      prepared, and where private disclosure remains the more
                      appropriate channel.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-hover border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-enc-text-primary">
                      Qualified review path
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-7 text-enc-text-secondary">
                    <p>
                      Detailed project references, permit records, and
                      diligence materials are shared selectively with qualified
                      clients, lenders, and partners where disclosure is
                      appropriate.
                    </p>
                    <Button asChild className="w-full bg-gradient-warm text-white hover:shadow-glow">
                      <Link to="/#appointment">
                        Request a consultation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <section className="mt-16">
                <h2 className="text-center text-3xl font-bold md:text-4xl">
                  <span className="gradient-text">Project readiness</span>
                  <span className="text-enc-text-primary"> priorities</span>
                </h2>
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                  {readinessItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Card key={item.title} className="card-hover border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-enc-text-primary">
                                {item.title}
                              </h3>
                              <p className="mt-3 leading-7 text-enc-text-secondary">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section className="mt-16 grid gap-6 md:grid-cols-2">
                {materialGroups.map((group) => (
                  <Card key={group.title} className="card-hover border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl text-enc-text-primary">
                        {group.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-enc-text-secondary">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-3 leading-7">
                            <FileText className="mt-1 h-4 w-4 shrink-0 text-enc-orange" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <BuilderCredentials />

              <section className="mt-16">
                <Card className="card-hover overflow-hidden border-0 shadow-2xl">
                  <CardContent className="p-8 md:p-12">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold md:text-4xl">
                        <span className="gradient-text">Ready to Build</span>
                        <span className="text-enc-text-primary">
                          {" "}
                          Edmonton&apos;s Future
                        </span>
                      </h2>
                      <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-enc-text-secondary">
                        If you want to review Estate Nest Capital&apos;s builder
                        approach, discuss diligence expectations, or start a
                        project conversation, use the contact paths below.
                      </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                      <div className="card-hover rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-lg">
                        <Mail className="mx-auto h-6 w-6 text-enc-orange" />
                        <p className="mt-4 text-base font-semibold text-enc-text-primary">
                          hello@estatenest.capital
                        </p>
                      </div>
                      <div className="card-hover rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-lg">
                        <Phone className="mx-auto h-6 w-6 text-enc-orange" />
                        <p className="mt-4 text-base font-semibold text-enc-text-primary">
                          (780) 860-3191
                        </p>
                      </div>
                      <div className="card-hover rounded-[1.5rem] border border-border bg-card p-6 text-center shadow-lg">
                        <Globe className="mx-auto h-6 w-6 text-enc-orange" />
                        <p className="mt-4 text-base font-semibold text-enc-text-primary">
                          www.estatenest.capital
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                      <Button asChild size="lg" className="bg-gradient-warm text-white hover:shadow-glow">
                        <Link to="/#appointment">
                          Schedule consultation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link to="/#projects">Review capabilities</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
