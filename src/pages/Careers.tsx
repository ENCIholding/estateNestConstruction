import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Clock,
  DollarSign,
  FileUp,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import careersTeamImage from "@/assets/careers-team.jpg";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PublicPageBackLink from "@/components/PublicPageBackLink";
import Seo from "@/components/Seo";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const talentAreas = [
  {
    title: "Project management",
    department: "Construction Management",
    location: "Edmonton, AB",
    type: "Talent Network",
    note: "Let us know your build type, software, and delivery experience.",
  },
  {
    title: "Site supervision",
    department: "Construction Operations",
    location: "Edmonton, AB",
    type: "Talent Network",
    note: "Share field leadership, safety, and trade coordination experience.",
  },
  {
    title: "Estimating and pre-construction",
    department: "Pre-Construction",
    location: "Edmonton, AB",
    type: "Talent Network",
    note: "Tell us what project sizes, sectors, and estimating workflows you have handled.",
  },
  {
    title: "Administration and accounting support",
    department: "Operations",
    location: "Edmonton, AB",
    type: "Talent Network",
    note: "Highlight document control, scheduling, AP/AR, or job-costing experience.",
  },
];

const supportedFileTypes =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function Careers() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("General interest");
  const [humanCheck, setHumanCheck] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formAlert, setFormAlert] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (humanCheck.trim().toLowerCase() !== "yes") {
      setFormAlert('Type "YES" in the verification field before submitting.');
      toast({
        title: "Human verification required",
        description: 'Type "YES" in the verification field before submitting.',
        variant: "destructive",
      });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setFormAlert("");

    try {
      const response = await fetch("https://formspree.io/f/xojpnvbz", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit application.");
      }

      form.reset();
      setSelectedRole("General interest");
      setHumanCheck("");
      setFormAlert("Application submitted successfully.");
      navigate("/thank-you");
    } catch {
      setFormAlert(
        "Something went wrong while submitting your application. Please try again or call the team directly."
      );
      toast({
        title: "Application not sent",
        description:
          "Something went wrong while submitting your application. Please try again or call the team directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Careers | Estate Nest Capital Inc."
        description="Careers and talent network intake for Estate Nest Capital Inc. in Edmonton, Alberta."
        path="/careers"
      />
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <PublicPageBackLink />

            <div className="relative mb-16 overflow-hidden rounded-[2rem] shadow-2xl">
              <div className="aspect-[21/9] w-full">
                <img
                  src={careersTeamImage}
                  alt="Estate Nest Capital careers and talent network image"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/92">
                  Careers
                </p>
                <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                  Join the <span className="gradient-text-alt">Estate Nest</span>{" "}
                  <span className="gradient-text-alt">talent network</span>
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
                  Use this page to register interest, share your background, and
                  submit resume or portfolio files for the kinds of roles Estate
                  Nest Capital expects to need as operations grow.
                </p>
              </div>
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-enc-text-primary">
                    Growth-focused
                  </h2>
                  <p className="mt-3 leading-7 text-enc-text-secondary">
                    Submit your background so Estate Nest can reach out when
                    project needs match your experience.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-enc-text-primary">
                    Role-fit discussions
                  </h2>
                  <p className="mt-3 leading-7 text-enc-text-secondary">
                    Compensation, scheduling, and scope should be discussed
                    against real responsibilities and project needs.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-enc-text-primary">
                    Direct intake path
                  </h2>
                  <p className="mt-3 leading-7 text-enc-text-secondary">
                    Applications can be reviewed against evolving operating
                    demand rather than a static public job board.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-enc-text-primary">
                Talent areas we expect to need
              </h2>

              {talentAreas.map((role) => (
                <Card key={role.title} className="card-hover border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-2xl text-enc-text-primary">
                          {role.title}
                        </CardTitle>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="border-enc-orange text-enc-orange">
                            {role.department}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {role.location}
                          </Badge>
                          <Badge variant="outline">{role.type}</Badge>
                        </div>
                      </div>

                      <Button
                        className="bg-gradient-warm text-white hover:shadow-glow"
                        onClick={() => {
                          setSelectedRole(role.title);
                          document.getElementById("apply")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        Express interest
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-7 text-enc-text-secondary">{role.note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <section id="apply" className="mt-20 scroll-mt-32 md:scroll-mt-36">
              <Card className="card-hover border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-enc-text-primary">
                    Apply directly
                  </CardTitle>
                  <p className="mx-auto max-w-2xl text-enc-text-secondary">
                    Use this form to register interest, upload your resume, and
                    share the kind of role you want to be considered for.
                  </p>
                </CardHeader>

                <CardContent>
                  <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="mx-auto max-w-3xl space-y-6"
                  >
                    <div
                      aria-live="assertive"
                      role="alert"
                      className={
                        formAlert
                          ? "rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-enc-text-secondary"
                          : "sr-only"
                      }
                    >
                      {formAlert || "Application status messages appear here."}
                    </div>
                    <input
                      type="hidden"
                      name="_subject"
                      value="New Career Interest Submission - Estate Nest Capital"
                    />
                    <input type="hidden" name="form-type" value="careers" />
                    <input
                      type="text"
                      name="_gotcha"
                      tabIndex={-1}
                      autoComplete="off"
                      className="sr-only"
                      aria-hidden="true"
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="career-name" className="text-sm font-semibold text-enc-text-primary">
                          Full Name *
                        </label>
                        <input
                          id="career-name"
                          name="name"
                          type="text"
                          placeholder="Full Name"
                          required
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="career-email" className="text-sm font-semibold text-enc-text-primary">
                          Email Address *
                        </label>
                        <input
                          id="career-email"
                          name="email"
                          type="email"
                          placeholder="Email Address"
                          required
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="career-phone" className="text-sm font-semibold text-enc-text-primary">
                          Phone Number *
                        </label>
                        <input
                          id="career-phone"
                          name="phone"
                          type="tel"
                          placeholder="Phone Number"
                          required
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="career-role-interest" className="text-sm font-semibold text-enc-text-primary">
                          Role Interest
                        </label>
                        <select
                          id="career-role-interest"
                          name="role-interest"
                          value={selectedRole}
                          onChange={(event) => setSelectedRole(event.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                        >
                          <option value="General interest">General interest</option>
                          {talentAreas.map((role) => (
                            <option key={role.title} value={role.title}>
                              {role.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="career-message" className="text-sm font-semibold text-enc-text-primary">
                        Message
                      </label>
                      <textarea
                        id="career-message"
                        name="message"
                        placeholder="Tell us about your background, project experience, software tools, certifications, and the kind of work you are looking for..."
                        rows={5}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-border bg-muted/40 p-5">
                        <label
                          htmlFor="career-resume-file"
                          className="text-sm font-semibold text-enc-text-primary"
                        >
                          Resume Upload
                        </label>
                        <input
                          id="career-resume-file"
                          name="resume_file"
                          type="file"
                          accept={supportedFileTypes}
                          className="mt-3 block w-full text-sm text-enc-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-gradient-warm file:px-4 file:py-2 file:font-semibold file:text-white hover:file:shadow-glow"
                        />
                        <p className="mt-3 text-xs leading-6 text-enc-text-secondary">
                          Upload PDF or Word format if you want your resume included with the application.
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-border bg-muted/40 p-5">
                        <label
                          htmlFor="career-portfolio-file"
                          className="text-sm font-semibold text-enc-text-primary"
                        >
                          Portfolio / Work Sample
                        </label>
                        <input
                          id="career-portfolio-file"
                          name="portfolio_file"
                          type="file"
                          accept={supportedFileTypes}
                          className="mt-3 block w-full text-sm text-enc-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-gradient-warm file:px-4 file:py-2 file:font-semibold file:text-white hover:file:shadow-glow"
                        />
                        <p className="mt-3 text-xs leading-6 text-enc-text-secondary">
                          Optional for roles where project examples, estimates, or writing samples help give context.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-border bg-muted/40 p-5">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-enc-orange" />
                        <label htmlFor="career-human-check" className="text-sm font-semibold text-enc-text-primary">
                          Human Verification
                        </label>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-enc-text-secondary">
                        Type <strong>YES</strong> below to help reduce spam submissions.
                      </p>
                      <input
                        id="career-human-check"
                        name="human-check"
                        type="text"
                        value={humanCheck}
                        onChange={(event) => setHumanCheck(event.target.value)}
                        placeholder='Type "YES"'
                        required
                        className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                      />
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-7 text-enc-text-secondary">
                      <div className="flex items-center gap-3">
                        <FileUp className="h-4 w-4 text-enc-orange" />
                        <p className="font-medium text-enc-text-primary">
                          Direct application path enabled
                        </p>
                      </div>
                      <p className="mt-3">
                        You can now submit resume or portfolio files directly
                        through this page instead of sending them separately by
                        email.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-warm py-6 text-base font-semibold text-white hover:shadow-glow disabled:opacity-70"
                    >
                      {isSubmitting ? "Submitting application..." : "Submit application"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>

            <section className="mt-12 grid gap-6 lg:grid-cols-2">
              <Card className="card-hover border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-enc-text-primary">
                    Need help before applying?
                  </CardTitle>
                  <p className="mx-auto max-w-2xl text-enc-text-secondary">
                    If you have questions about a role or prefer another way to
                    connect before applying, use any of these options.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button asChild className="bg-gradient-warm text-white hover:shadow-glow">
                      <a href="mailto:hello@estatenest.capital?subject=Careers Inquiry">
                        Email careers team
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/#appointment">Schedule consultation</Link>
                    </Button>
                  </div>
                  <div className="rounded-[1.5rem] border border-border bg-muted/40 p-5 text-left">
                    <div className="flex items-start gap-3">
                      <Phone className="mt-1 h-5 w-5 text-enc-orange" />
                      <div>
                        <p className="font-semibold text-enc-text-primary">Call the team</p>
                        <a
                          href="tel:780-860-3191"
                          className="mt-2 inline-block text-enc-text-secondary hover:text-enc-orange"
                        >
                          780-860-3191
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-enc-text-primary">
                    Equal opportunity
                  </CardTitle>
                  <p className="mx-auto max-w-2xl text-enc-text-secondary">
                    Estate Nest Capital Inc. is committed to fair consideration
                    and inclusive hiring as the team grows.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-enc-text-secondary">
                  <p>
                    We welcome applicants from diverse backgrounds and aim to
                    review submissions based on relevant experience, role fit,
                    and operational need.
                  </p>
                  <p>
                    If you need an accommodation or an alternate application
                    path, contact the team by phone, email, or the consultation
                    form and note that you need application support.
                  </p>
                  <p className="font-medium text-enc-text-primary">
                    Accessibility and application support requests will be
                    handled as part of the hiring process.
                  </p>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
