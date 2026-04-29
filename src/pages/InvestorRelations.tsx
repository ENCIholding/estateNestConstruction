import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  FileCheck,
  FileText,
  Handshake,
  Landmark,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Target,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import investorCollaborationImage from "@/assets/investor-collaboration.jpg";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const investorCards = [
  {
    icon: Handshake,
    title: "Opportunity review",
    description:
      "Investment discussions should begin with a real project opportunity, a clear development purpose, defined capital requirements, and a practical understanding of what has already been reviewed.",
  },
  {
    icon: FileText,
    title: "Diligence materials",
    description:
      "Each opportunity should be supported by project-specific diligence materials such as scope summaries, budget assumptions, permit status, schedule milestones, site context, project risks, and available supporting records.",
  },
  {
    icon: Users,
    title: "Communication expectations",
    description:
      "Investors, lenders, and project partners need clear points of contact, timely updates, documented decisions, and a practical record of changes, approvals, risks, and next steps.",
  },
  {
    icon: Shield,
    title: "Risk awareness",
    description:
      "Construction and development involve execution, cost, schedule, market, permitting, and financing risk. Estate Nest Capital's approach is to identify risks clearly, review assumptions carefully, and avoid unsupported public claims.",
  },
];

type IconCardItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const investorWorkflowCards = [
  {
    icon: Handshake,
    title: "Initial introduction",
    description:
      "Investor or partnership conversations begin with a basic introduction, including the type of project, expected role of capital, timeline, location, and the level of information currently available.",
  },
  {
    icon: Search,
    title: "Opportunity screening",
    description:
      "Before detailed discussions continue, Estate Nest Capital reviews whether the opportunity fits its construction, development, risk, timing, and execution profile.",
  },
  {
    icon: ClipboardCheck,
    title: "Project diligence review",
    description:
      "Where appropriate, project-specific information may be reviewed, including site details, scope, budget assumptions, permit status, schedule milestones, construction approach, and known risks.",
  },
  {
    icon: Landmark,
    title: "Capital role and structure",
    description:
      "The role of capital must be clearly defined. This may include acquisition support, construction financing support, equity participation, project-specific partnership discussions, or other private arrangements reviewed on a case-by-case basis.",
  },
  {
    icon: ShieldCheck,
    title: "Risk and responsibility alignment",
    description:
      "Each party should understand the project risks, decision rights, reporting expectations, approval requirements, and professional review needed before moving forward.",
  },
  {
    icon: FileText,
    title: "Documentation and next steps",
    description:
      "If the opportunity progresses, the next stage may include formal documentation, professional review, lender coordination, legal review, and agreed communication expectations.",
  },
] satisfies IconCardItem[];

const investorExpectationCards = [
  {
    icon: Building2,
    title: "Project overview",
    description:
      "A clear summary of the project type, location, scope, development intent, and current stage.",
  },
  {
    icon: Calculator,
    title: "Budget and cost assumptions",
    description:
      "A practical view of expected costs, known allowances, contingencies, and areas requiring further review.",
  },
  {
    icon: FileCheck,
    title: "Permit and approval status",
    description:
      "Available information on zoning, permits, drawings, municipal review, and project readiness.",
  },
  {
    icon: CalendarDays,
    title: "Schedule and milestones",
    description:
      "A working view of expected timelines, dependencies, and key decision points.",
  },
  {
    icon: TriangleAlert,
    title: "Risk notes",
    description:
      "Plain-English review of known risks, assumptions, open questions, and items requiring professional confirmation.",
  },
  {
    icon: MessageSquare,
    title: "Communication discipline",
    description:
      "A clear approach to updates, review points, approvals, and project communication.",
  },
] satisfies IconCardItem[];

const whatEstateNestLooksFor = [
  {
    icon: Target,
    title: "Project fit",
    description:
      "The opportunity should align with Estate Nest Capital's construction and development focus, including infill, multi-unit housing, commercial leasehold, renovation, or project coordination work.",
  },
  {
    icon: Calculator,
    title: "Realistic assumptions",
    description:
      "Budgets, timelines, permits, and construction assumptions must be reviewed honestly. Unsupported numbers or vague timelines create unnecessary project risk.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Professional review",
    description:
      "Legal, accounting, lending, engineering, architectural, and municipal matters should be reviewed by the appropriate professionals before final commitments are made.",
  },
  {
    icon: Users,
    title: "Communication alignment",
    description:
      "Investors, lenders, clients, and project partners should expect clear communication, documented decisions, and practical review points throughout the project lifecycle.",
  },
] satisfies IconCardItem[];

const privateDiligenceItems = [
  "Project summaries and scope assumptions",
  "Budget, cost, and contingency summaries",
  "Permit, zoning, and municipal status notes",
  "Schedule milestones and construction-stage review",
  "Risk notes and open decision items",
  "Lender, client, or partner review summaries",
  "Supporting documents where disclosure is appropriate",
];

type InvestorIconCardProps = {
  item: IconCardItem;
  titleClassName?: string;
};

function InvestorIconCard({ item, titleClassName = "text-xl text-enc-text-primary" }: InvestorIconCardProps) {
  const Icon = item.icon;

  return (
    <Card className="card-hover border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className={titleClassName}>{item.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-7 text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  );
}

export default function InvestorRelations() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Investor Relations | Estate Nest Capital Inc."
        description="Investor relations overview for Estate Nest Capital Inc., including due diligence posture, project review approach, and communication standards."
        path="/investor-relations"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <section className="pb-20 pt-8">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <PublicPageBackLink />

              <div className="relative mb-16 overflow-hidden rounded-[2rem] shadow-2xl">
                <div className="aspect-[21/9] w-full">
                  <img
                    src={investorCollaborationImage}
                    alt="Representative concept image of a project diligence discussion between collaborators."
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/32 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-12">
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/92">
                    Investor Relations
                  </p>
                  <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                    <span className="gradient-text-alt">Discussions</span> should start with{" "}
                    <span className="gradient-text-alt">disciplined review</span>
                  </h1>
                  <p className="mt-3 max-w-3xl text-lg leading-8 text-white/85">
                    Estate Nest Capital evaluates development and construction
                    opportunities through disciplined due diligence, project-specific
                    review, and clear communication before any partnership or capital
                    discussion moves forward.
                  </p>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
                    This page explains how investor, lender, and partnership
                    conversations are approached. It is not a public offering,
                    investment solicitation, or promise of return.
                  </p>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-white/82">
                    Investor and partnership conversations are strongest when
                    scope, risk, assumptions, documentation, and responsibilities
                    are clear before commitments are made.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Button asChild size="lg" className="bg-gradient-warm text-white hover:shadow-glow">
                      <Link to="/#appointment">Request an Introduction</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link to="/builder-profile">Review Builder Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {investorCards.map((section) => {
                  return (
                    <InvestorIconCard
                      key={section.title}
                      item={section}
                      titleClassName="text-2xl text-foreground"
                    />
                  );
                })}
              </div>

              <section className="mt-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-enc-text-primary md:text-4xl">
                    How Investor Relations Work
                  </h2>
                  <p className="mt-4 max-w-4xl text-lg leading-8 text-enc-text-secondary">
                    Estate Nest Capital handles investor and partnership
                    discussions through a controlled, step-by-step process. The
                    goal is to ensure that every conversation begins with
                    clarity, not assumptions.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {investorWorkflowCards.map((item) => (
                    <InvestorIconCard key={item.title} item={item} />
                  ))}
                </div>
              </section>

              <section className="mt-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-enc-text-primary md:text-4xl">
                    What Investors Can Expect
                  </h2>
                  <p className="mt-4 max-w-4xl text-lg leading-8 text-enc-text-secondary">
                    Investor and partnership discussions should be supported by
                    clear, organized, and project-specific information. Estate
                    Nest Capital does not rely on generic claims where
                    project-level review is required.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {investorExpectationCards.map((item) => (
                    <InvestorIconCard key={item.title} item={item} />
                  ))}
                </div>
              </section>

              <Card className="mt-16 card-hover border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-enc-text-primary">
                    Private Diligence Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-enc-text-secondary">
                  <p className="leading-7">
                    Estate Nest Capital may prepare project-specific diligence
                    materials for qualified discussions. These materials may
                    include scope summaries, cost assumptions, schedule
                    milestones, permit status, risk notes, lender-facing
                    summaries, and project communication records.
                  </p>
                  <p className="leading-7">
                    Detailed project materials are shared only where appropriate
                    and may depend on project stage, confidentiality,
                    professional review, and the nature of the proposed
                    discussion.
                  </p>
                  {privateDiligenceItems.map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-enc-orange" />
                      <p>{item}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <section className="mt-16">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-enc-text-primary md:text-4xl">
                    What Estate Nest Looks For
                  </h2>
                  <p className="mt-4 max-w-4xl text-lg leading-8 text-enc-text-secondary">
                    Estate Nest Capital is selective about project and capital
                    discussions. The right opportunity must align with practical
                    execution, responsible documentation, realistic assumptions,
                    and a clear understanding of risk.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {whatEstateNestLooksFor.map((item) => (
                    <InvestorIconCard key={item.title} item={item} />
                  ))}
                </div>
              </section>

              <Card className="mt-16 border border-enc-orange/20 bg-enc-orange/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-enc-text-primary">
                    Important Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-enc-text-secondary">
                    Information on this page is provided for general business
                    and project discussion purposes only. It is not a public
                    offering, securities offering, investment recommendation,
                    financial advice, legal advice, engineering advice,
                    accounting advice, tax advice, or municipal approval
                    advice.
                  </p>
                  <p className="mt-4 leading-7 text-enc-text-secondary">
                    Any project, capital, lending, or partnership discussion
                    should be reviewed with the appropriate legal, financial,
                    tax, engineering, architectural, and municipal professionals
                    before decisions are made.
                  </p>
                </CardContent>
              </Card>

              <section className="mt-16 rounded-[2rem] border border-border bg-card p-10 text-center shadow-xl">
                <h2 className="text-3xl font-bold text-enc-text-primary md:text-4xl">
                  Start a Private Project Discussion
                </h2>
                <p className="mx-auto mt-4 max-w-4xl text-lg leading-8 text-enc-text-secondary">
                  If you are a lender, investor, project partner, landowner,
                  realtor, or professional advisor interested in discussing a
                  construction or development opportunity, Estate Nest Capital
                  can begin with a private introduction and project-specific
                  review.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Button asChild size="lg" className="bg-gradient-warm text-white hover:shadow-glow">
                    <Link to="/#appointment">Request an Introduction</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/builder-profile">Review Builder Profile</Link>
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
