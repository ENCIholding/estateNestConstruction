import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import RequestFormDialog from "@/components/RequestFormDialog";
import specHomeImage from "@/assets/spec-home.jpg";
import rowHousesImage from "@/assets/row-houses.jpg";
import customHouseImage from "@/assets/custom-house-model.jpg";
import renovationImage from "@/assets/modern-renovation.jpg";
import commercialPlazaImage from "@/assets/commercial-plaza.jpg";
import builderLegacyImage from "@/assets/builder-legacy.jpg";
const ContentSection = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [requestType, setRequestType] = useState("");
    const openRequestDialog = (type) => {
        setRequestType(type);
        setDialogOpen(true);
    };
    const services = [
        {
            title: "SPEC HOME",
            description: "Modern spec home design with contemporary architecture, high-quality finishes, and market-ready layouts perfect for investors and homebuyers.",
            image: specHomeImage,
            cta: "Request Floor Plan",
            altText: "Modern spec home design - contemporary architecture high-quality finishes market-ready residential construction Edmonton"
        },
        {
            title: "ROW Houses",
            description: "Modern black and white board and batten style row housing with contemporary design, connected units, and urban-friendly layouts.",
            image: rowHousesImage,
            cta: "Request Design",
            altText: "Modern row houses design - board and batten style urban multi-family housing construction Edmonton Alberta"
        },
        {
            title: "Custom House",
            description: "Luxury custom home design with 3D rendering and detailed architectural drawings tailored to your specific requirements.",
            image: customHouseImage,
            cta: "Request Rendering",
            altText: "Luxury custom home design - 3D architectural rendering detailed drawings personalized residential construction"
        },
        {
            title: "Renovation Transforming Spaces",
            description: "Modern Gen Z style renovation with minimalist aesthetics, natural materials, and contemporary finishes that transform any space.",
            image: renovationImage,
            cta: "Request Plans",
            altText: "Modern renovation transformation - contemporary minimalist design natural materials space renovation Edmonton"
        },
        {
            title: "Commercial Construction",
            description: "Modern commercial plaza design featuring daycare, restaurant, pharmacy, and medical clinic spaces with contemporary architecture.",
            image: commercialPlazaImage,
            cta: "Request Space Design",
            altText: "Commercial construction plaza - daycare restaurant pharmacy medical clinic modern commercial development Edmonton"
        },
        {
            title: "Builder Profile",
            description: "Comprehensive company profile for lenders and clients showcasing Estate Nest Capital's capabilities and track record.",
            image: builderLegacyImage,
            cta: "View Builder Profile",
            isBuilderProfile: true,
            altText: "Estate Nest Capital builder profile - construction company portfolio credentials track record Edmonton Alberta"
        }
    ];
    const principles = [
        {
            title: "Local Legacy",
            description: "Rooted in Edmonton, guided by decades of community trust and unmatched local market expertise."
        },
        {
            title: "Enduring Value",
            description: "Delivering resilient, future-focused real estate ventures that stand strong across generations."
        },
        {
            title: "Excellence First",
            description: "Driven by uncompromising standards to deliver developments and investments that redefine quality in our industry."
        }
    ];
    return (_jsxs("div", { className: "bg-background", children: [_jsx("section", { id: "principles", className: "py-20", children: _jsx("div", { className: "container mx-auto px-6", children: _jsx("div", { className: "grid md:grid-cols-3 gap-12", children: principles.map((principle, index) => (_jsxs("div", { className: "text-center space-y-4 group hover:scale-105 transition-all duration-500 p-8 rounded-3xl hover:bg-gradient-warm hover:shadow-glow", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-enc-text-primary group-hover:text-white transition-colors", children: principle.title }), _jsx("p", { className: "text-lg text-enc-text-secondary group-hover:text-white/90 leading-relaxed transition-colors", children: principle.description })] }, index))) }) }) }), _jsx("section", { id: "projects", className: "py-24 bg-background", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: [_jsx("span", { className: "gradient-text", children: "Our Plans" }), _jsx("span", { className: "text-enc-text-primary", children: " & Templates" })] }), _jsx("p", { className: "text-xl text-enc-text-secondary max-w-3xl mx-auto", children: "Explore our comprehensive range of housing plans, renovation models, and commercial designs tailored to your needs." })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: services.map((service, index) => (_jsxs(Card, { className: "group card-hover bg-background border-border overflow-hidden", children: [_jsx("div", { className: "aspect-video overflow-hidden", children: _jsx("img", { src: service.image, alt: service.altText, className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" }) }), _jsxs(CardContent, { className: "p-6 space-y-4", children: [_jsx("h3", { className: "text-xl font-bold text-enc-text-primary group-hover:gradient-text-alt transition-all duration-300", children: service.title }), _jsx("p", { className: "text-enc-text-secondary leading-relaxed group-hover:text-enc-text-primary transition-colors", children: service.description }), service.isBuilderProfile ? (_jsx(Button, { variant: "ghost", className: "mt-4 p-0 h-auto text-enc-orange hover:text-enc-orange/80 hover:bg-transparent font-semibold group-hover:animate-pulse", asChild: true, children: _jsxs(Link, { to: "/builder-profile", children: [service.cta, " \u2192"] }) })) : (_jsxs(Button, { variant: "ghost", className: "mt-4 p-0 h-auto text-enc-orange hover:text-enc-orange/80 hover:bg-transparent font-semibold group-hover:animate-pulse", onClick: () => openRequestDialog(service.cta), children: [service.cta, " \u2192"] }))] })] }, index))) })] }) }), _jsx(RequestFormDialog, { open: dialogOpen, onOpenChange: setDialogOpen, requestType: requestType })] }));
};
export default ContentSection;
