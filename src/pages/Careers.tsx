import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { Building2, MapPin, Clock, DollarSign } from "lucide-react";
import careersTeamImage from "@/assets/careers-team.jpg";

const Careers = () => {
  const careerOpenings = [
    {
      title: "Office Receptionist",
      department: "Administration",
      location: "Edmonton, AB",
      type: "Full-Time",
      salary: "$40,000 - $50,000",
      description: "Manage front desk operations, handle client communications, schedule appointments, and provide administrative support to the construction team.",
      requirements: [
        "2+ years experience in office administration",
        "Excellent communication and organizational skills",
        "Proficiency in Microsoft Office Suite",
        "Professional demeanor and customer service focus"
      ]
    },
    {
      title: "Project Manager",
      department: "Construction Management",
      location: "Edmonton, AB",
      type: "Full-Time",
      salary: "$75,000 - $95,000",
      description: "Oversee residential and commercial construction projects from planning through completion. Coordinate trades, manage budgets, and ensure on-time delivery.",
      requirements: [
        "PMP certification or equivalent project management credential",
        "5+ years construction project management experience",
        "Strong knowledge of Alberta Building Code",
        "Experience with Procore or similar project management software",
        "Excellent leadership and problem-solving skills"
      ]
    },
    {
      title: "Accounting Specialist",
      department: "Finance",
      location: "Edmonton, AB",
      type: "Full-Time",
      salary: "$55,000 - $70,000",
      description: "Handle accounts payable/receivable, project cost tracking, vendor payments, and financial reporting for construction projects.",
      requirements: [
        "CPA designation or working towards certification",
        "3+ years accounting experience, preferably in construction",
        "Knowledge of construction accounting and job costing",
        "Proficiency in QuickBooks or similar accounting software",
        "Strong attention to detail and analytical skills"
      ]
    },
    {
      title: "Site Supervisor",
      department: "Construction Operations",
      location: "Edmonton, AB",
      type: "Full-Time",
      salary: "$65,000 - $80,000",
      description: "Supervise daily on-site construction activities, coordinate trades, ensure safety compliance, and maintain quality standards.",
      requirements: [
        "5+ years site supervision experience in residential/commercial construction",
        "Strong knowledge of construction methods and safety protocols",
        "Valid driver's license and reliable transportation",
        "OHS certification and safety training",
        "Excellent communication and team leadership skills"
      ]
    },
    {
      title: "Estimator",
      department: "Pre-Construction",
      location: "Edmonton, AB",
      type: "Full-Time",
      salary: "$60,000 - $80,000",
      description: "Prepare detailed cost estimates for construction projects, analyze drawings and specifications, and coordinate with vendors and subcontractors.",
      requirements: [
        "3+ years experience in construction estimating",
        "Proficiency in estimating software and Excel",
        "Strong understanding of construction methods and materials",
        "Ability to read and interpret architectural drawings",
        "Excellent analytical and mathematical skills"
      ]
    },
    {
      title: "Marketing Coordinator",
      department: "Business Development",
      location: "Edmonton, AB (Hybrid)",
      type: "Full-Time",
      salary: "$45,000 - $60,000",
      description: "Develop and execute marketing strategies, manage social media presence, create content for projects, and support business development initiatives.",
      requirements: [
        "2+ years marketing experience, preferably in real estate or construction",
        "Strong social media and digital marketing skills",
        "Content creation and graphic design abilities",
        "Excellent written and verbal communication",
        "Knowledge of real estate market trends"
      ]
    }
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
          {/* Hero Image Section */}
          <div className="relative rounded-3xl overflow-hidden mb-16 shadow-2xl">
            <div className="aspect-[21/9] w-full">
              <img 
                src={careersTeamImage} 
                alt="Estate Nest Capital diverse professional team - modern construction careers in Edmonton Alberta" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Join Our Team</span>
              </h1>
              <p className="text-xl md:text-2xl font-light max-w-3xl">
                Build Your Career with Estate Nest Capital
              </p>
            </div>
          </div>

          <div className="text-center mb-16">
            <div className="w-24 h-1 bg-gradient-warm mx-auto mb-8"></div>
            <p className="text-xl text-enc-text-secondary max-w-3xl mx-auto">
              We're looking for talented professionals who share our passion for construction excellence, innovation, 
              and delivering exceptional results. Join Edmonton's premier construction and development company.
            </p>
          </div>

          {/* Company Culture */}
          <Card className="mb-12 card-hover">
            <CardHeader>
              <CardTitle className="text-2xl text-enc-text-primary">Why Work With Us?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Growth Opportunities</h3>
                  <p className="text-enc-text-secondary">
                    Continuous learning, professional development, and career advancement in a rapidly growing company.
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Competitive Compensation</h3>
                  <p className="text-enc-text-secondary">
                    Industry-leading salaries, performance bonuses, and comprehensive benefits package.
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-enc-text-primary mb-2">Work-Life Balance</h3>
                  <p className="text-enc-text-secondary">
                    Flexible scheduling, paid time off, and a supportive team environment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Openings */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-enc-text-primary mb-8">Current Openings</h2>
            
            {careerOpenings.map((job, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl text-enc-text-primary mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-enc-orange text-enc-orange">
                          {job.department}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </Badge>
                      </div>
                    </div>
                    <Button className="bg-gradient-warm text-white hover:shadow-glow whitespace-nowrap">
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-enc-text-secondary leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-enc-text-primary mb-2">Requirements:</h4>
                    <ul className="space-y-1 text-enc-text-secondary">
                      {job.requirements.map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Application Info */}
          <Card className="mt-12 card-hover">
            <CardContent className="py-12 text-center">
              <h3 className="text-2xl font-bold text-enc-text-primary mb-4">How to Apply</h3>
              <p className="text-lg text-enc-text-secondary mb-6 max-w-2xl mx-auto">
                To apply for any position, please send your resume and cover letter to our HR department. 
                We review all applications and will contact qualified candidates for interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-warm text-white hover:shadow-glow"
                  onClick={() => window.location.href = "mailto:hello@estatenest.capital?subject=Career Application"}
                >
                  Email Your Application
                </Button>
                <Button 
                  variant="outline" 
                  className="border-enc-orange text-enc-orange hover:bg-enc-orange hover:text-white"
                  onClick={() => window.location.href = "/#appointment"}
                >
                  Schedule Interview
                </Button>
              </div>
              <p className="text-sm text-enc-text-secondary mt-6">
                Estate Nest Capital Inc. is an equal opportunity employer committed to diversity and inclusion.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Careers;
