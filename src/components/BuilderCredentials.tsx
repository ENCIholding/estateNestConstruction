import { Award, FileCheck, Shield, TrendingUp } from "lucide-react";

const credentials = [
  {
    icon: FileCheck,
    title: "Documentation readiness",
    description:
      "Estate Nest Capital is structuring builder information around permits, scopes, schedules, and project records that can be reviewed when diligence requires them.",
  },
  {
    icon: Shield,
    title: "Compliance-first posture",
    description:
      "Licensing, warranty, insurance, and regulatory items should be confirmed against the live project and business file rather than implied through generic website claims.",
  },
  {
    icon: Award,
    title: "Client and lender communication",
    description:
      "The goal is to present clearer information to clients, lenders, and collaborators before commitments are made or assumptions are formed.",
  },
  {
    icon: TrendingUp,
    title: "Operational improvement",
    description:
      "The site and dashboard are being upgraded to show real records, honest empty states, and safer release practices instead of polished placeholders.",
  },
];

export default function BuilderCredentials() {
  return (
    <section id="builder-credentials" className="bg-background py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold md:text-5xl">
            <span className="gradient-text">Builder profile</span>
            <span className="text-enc-text-primary"> priorities</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-muted-foreground">
            This section is intended to explain how Estate Nest Capital is organizing its builder profile and diligence materials, not to make blanket claims that cannot be verified from the website alone.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {credentials.map((credential) => {
              const Icon = credential.icon;

              return (
                <div
                  key={credential.title}
                  className="rounded-[1.75rem] border border-border bg-card p-8 shadow-lg transition-transform duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-hero text-white shadow-glow">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {credential.title}
                      </h3>
                      <p className="mt-3 leading-7 text-muted-foreground">
                        {credential.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
