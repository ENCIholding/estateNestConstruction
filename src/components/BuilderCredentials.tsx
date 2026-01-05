import { Shield, FileCheck, Award, TrendingUp } from "lucide-react";

const BuilderCredentials = () => {
  const credentials = [
    {
      icon: FileCheck,
      title: "Licensed & Compliant",
      description: "Fully licensed with Alberta Municipal Affairs, ensuring regulatory compliance on every project"
    },
    {
      icon: Shield,
      title: "Comprehensive Coverage",
      description: "Liability insurance maintained throughout all projects with no gaps in coverage"
    },
    {
      icon: Award,
      title: "Warranty Protection",
      description: "Registered with Progressive Home Warranty Program, providing client security and lender confidence"
    },
    {
      icon: TrendingUp,
      title: "Clean Record",
      description: "Zero liens, zero claims, no premium increases – demonstrating exceptional risk management"
    }
  ];

  return (
    <section 
      id="builder-credentials" 
      className="py-24 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="gradient-text">Builder Profile:</span>
            <span className="text-enc-text-primary"> Insurance, Licensing & Warranty</span>
          </h2>
          <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Estate Nest Capital Inc. maintains the highest standards of professional compliance and financial protection. Our comprehensive coverage reassures lenders that ENCI projects are executed with financial discipline and legal integrity.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {credentials.map((credential, index) => {
              const Icon = credential.icon;
              return (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-3xl p-8 group hover:scale-105 transition-all duration-500 hover:shadow-glow hover:bg-gradient-warm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-enc-orange to-enc-yellow p-3 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-white transition-all">
                        {credential.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed group-hover:text-white/90 transition-colors">
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
};

export default BuilderCredentials;

