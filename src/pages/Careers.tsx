import { useState } from "react";
import { Building2, Clock, DollarSign, MapPin } from "lucide-react";
import careersTeamImage from "@/assets/careers-team.jpg";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState("General interest");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-28">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="relative mb-16 overflow-hidden rounded-[2rem] shadow-2xl">
              <div className="aspect-[21/9] w-full">
                <img
                  src={careersTeamImage}
                  alt="Representative concept image of a professional team discussing construction work."
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-8 text-white md:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                  Careers
                </p>
                <h1 className="mt-3 text-4xl font-bold md:text-5xl">
                  Join the Estate Nest talent network
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-white/85">
                  This page no longer presents unverified "current openings." Instead, it offers a cleaner way to register interest in the roles Estate Nest Capital expects to need as operations grow.
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
                    Submit your background so Estate Nest can reach out when project needs match your experience.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
                    <DollarSign className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-enc-text-primary">
                    No invented salary bands
                  </h2>
                  <p className="mt-3 leading-7 text-enc-text-secondary">
                    Compensation, scheduling, and benefits should be discussed against real responsibilities, not placeholder estimates on a website.
                  </p>
                </CardContent>
              </Card>
              <Card className="card-hover border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-white shadow-glow">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-enc-text-primary">
                    Honest hiring posture
                  </h2>
                  <p className="mt-3 leading-7 text-enc-text-secondary">
                    Hiring demand can change with project load, so the page is framed as an intake path rather than a misleading job board.
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

            <section id="apply" className="mt-20">
              <Card className="card-hover border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl text-enc-text-primary">
                    Introduce yourself
                  </CardTitle>
                  <p className="mx-auto max-w-2xl text-enc-text-secondary">
                    Use this form to register interest. Estate Nest Capital reviews submissions and reaches out when there is a genuine fit.
                  </p>
                </CardHeader>

                <CardContent>
                  <form
                    action="https://formspree.io/f/xojpnvbz"
                    method="POST"
                    encType="multipart/form-data"
                    className="mx-auto max-w-3xl space-y-6"
                  >
                    <input
                      type="hidden"
                      name="_subject"
                      value="New Career Interest Submission - Estate Nest Capital"
                    />
                    <input
                      type="hidden"
                      name="_next"
                      value="https://www.estatenest.capital/thank-you"
                    />
                    <input type="hidden" name="form-type" value="careers" />

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                      />

                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        required
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                      />

                      <select
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

                    <textarea
                      name="message"
                      placeholder="Tell us about your background, project experience, and the kind of work you are looking for..."
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-enc-orange"
                    />

                    <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-7 text-enc-text-secondary">
                      If you want to include a resume or portfolio, please email it separately to{" "}
                      <a
                        href="mailto:hello@estatenest.capital?subject=Career Interest Submission"
                        className="font-medium text-enc-orange"
                      >
                        hello@estatenest.capital
                      </a>
                      .
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-warm py-6 text-base font-semibold text-white hover:shadow-glow"
                    >
                      Submit career interest
                    </Button>
                  </form>
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
