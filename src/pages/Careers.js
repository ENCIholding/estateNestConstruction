import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("header", { className: "bg-enc-text-primary text-white py-6", children: _jsx("div", { className: "container mx-auto px-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: "ESTATE NEST CAPITAL" }), _jsx(Button, { variant: "ghost", className: "text-white hover:text-enc-orange hover:bg-white/10", onClick: () => window.history.back(), children: "\u2190 Back" })] }) }) }), _jsx("main", { className: "container mx-auto px-6 py-20", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "relative rounded-3xl overflow-hidden mb-16 shadow-2xl", children: [_jsxs("div", { className: "aspect-[21/9] w-full", children: [_jsx("img", { src: careersTeamImage, alt: "Estate Nest Capital diverse professional team - modern construction careers in Edmonton Alberta", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" })] }), _jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: _jsx("span", { className: "gradient-text", children: "Join Our Team" }) }), _jsx("p", { className: "text-xl md:text-2xl font-light max-w-3xl", children: "Build Your Career with Estate Nest Capital" })] })] }), _jsxs("div", { className: "text-center mb-16", children: [_jsx("div", { className: "w-24 h-1 bg-gradient-warm mx-auto mb-8" }), _jsx("p", { className: "text-xl text-enc-text-secondary max-w-3xl mx-auto", children: "We're looking for talented professionals who share our passion for construction excellence, innovation, and delivering exceptional results. Join Edmonton's premier construction and development company." })] }), _jsxs(Card, { className: "mb-12 card-hover", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-2xl text-enc-text-primary", children: "Why Work With Us?" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center p-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center", children: _jsx(Building2, { className: "w-8 h-8 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-enc-text-primary mb-2", children: "Growth Opportunities" }), _jsx("p", { className: "text-enc-text-secondary", children: "Continuous learning, professional development, and career advancement in a rapidly growing company." })] }), _jsxs("div", { className: "text-center p-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center", children: _jsx(DollarSign, { className: "w-8 h-8 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-enc-text-primary mb-2", children: "Competitive Compensation" }), _jsx("p", { className: "text-enc-text-secondary", children: "Industry-leading salaries, performance bonuses, and comprehensive benefits package." })] }), _jsxs("div", { className: "text-center p-6", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-warm rounded-full mx-auto mb-4 flex items-center justify-center", children: _jsx(Clock, { className: "w-8 h-8 text-white" }) }), _jsx("h3", { className: "text-lg font-semibold text-enc-text-primary mb-2", children: "Work-Life Balance" }), _jsx("p", { className: "text-enc-text-secondary", children: "Flexible scheduling, paid time off, and a supportive team environment." })] })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-enc-text-primary mb-8", children: "Current Openings" }), careerOpenings.map((job, index) => (_jsxs(Card, { className: "card-hover", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-2xl text-enc-text-primary mb-2", children: job.title }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Badge, { variant: "outline", className: "border-enc-orange text-enc-orange", children: job.department }), _jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3 h-3" }), job.location] }), _jsx(Badge, { variant: "outline", children: job.type }), _jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(DollarSign, { className: "w-3 h-3" }), job.salary] })] })] }), _jsx(Button, { className: "bg-gradient-warm text-white hover:shadow-glow whitespace-nowrap", children: "Apply Now" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { children: _jsx("p", { className: "text-enc-text-secondary leading-relaxed", children: job.description }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-enc-text-primary mb-2", children: "Requirements:" }), _jsx("ul", { className: "space-y-1 text-enc-text-secondary", children: job.requirements.map((req, idx) => (_jsxs("li", { children: ["\u2022 ", req] }, idx))) })] })] })] }, index)))] }), _jsx(Card, { className: "mt-12 card-hover", children: _jsxs(CardContent, { className: "py-12 text-center", children: [_jsx("h3", { className: "text-2xl font-bold text-enc-text-primary mb-4", children: "How to Apply" }), _jsx("p", { className: "text-lg text-enc-text-secondary mb-6 max-w-2xl mx-auto", children: "To apply for any position, please send your resume and cover letter to our HR department. We review all applications and will contact qualified candidates for interviews." }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { className: "bg-gradient-warm text-white hover:shadow-glow", onClick: () => window.location.href = "mailto:hello@estatenest.capital?subject=Career Application", children: "Email Your Application" }), _jsx(Button, { variant: "outline", className: "border-enc-orange text-enc-orange hover:bg-enc-orange hover:text-white", onClick: () => window.location.href = "/#appointment", children: "Schedule Interview" })] }), _jsx("p", { className: "text-sm text-enc-text-secondary mt-6", children: "Estate Nest Capital Inc. is an equal opportunity employer committed to diversity and inclusion." })] }) })] }) })] }));
};
export default Careers;
