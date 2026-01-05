import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
const Footer = () => {
    const footerSections = [
        {
            title: "Services",
            links: [
                { label: "Investment Excellence", path: "/investor-relations" },
                { label: "Capital Solutions", path: "/investor-relations" }
            ]
        },
        {
            title: "Company",
            links: [
                { label: "About Us", path: "/#about" },
                { label: "Careers", path: "/careers" },
                { label: "Contact", path: "/#appointment", isContact: true }
            ]
        }
    ];
    return (_jsx("footer", { className: "bg-enc-text-primary text-white", children: _jsxs("div", { className: "container mx-auto px-6 py-20", children: [_jsx("div", { className: "text-center mb-12", children: _jsx("h2", { className: "text-3xl md:text-4xl font-bold gradient-text", children: "Let's Build Something Amazing" }) }), _jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-2xl font-bold tracking-wide", children: ["ESTATE NEST", _jsx("br", {}), "CAPITAL"] }), _jsx("p", { className: "text-white/80 leading-relaxed text-sm", children: "Strategic real estate investments and capital solutions. We bring quality craftsmanship and professional excellence to every project." })] }), footerSections.map((section, index) => (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: section.title }), _jsx("ul", { className: "space-y-3", children: section.links.map((link, linkIndex) => (_jsx("li", { children: link.isContact ? (_jsx("a", { href: link.path, className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", onClick: (e) => {
                                                e.preventDefault();
                                                document
                                                    .getElementById("appointment")
                                                    ?.scrollIntoView({ behavior: "smooth" });
                                            }, children: link.label })) : link.path.startsWith("/#") ? (_jsx("a", { href: link.path, className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", children: link.label })) : (_jsx(Link, { to: link.path, className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", children: link.label })) }, linkIndex))) })] }, index))), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Connect" }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 mt-0.5 text-enc-orange-light" }), _jsx("span", { className: "text-white/70 text-sm", children: "Edmonton, Alberta, Canada" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Mail, { className: "w-4 h-4 mt-0.5 text-enc-orange-light" }), _jsx("a", { href: "mailto:hello@estatenest.capital", className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", children: "hello@estatenest.capital" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Phone, { className: "w-4 h-4 mt-0.5 text-enc-orange-light" }), _jsx("a", { href: "tel:780-860-3191", className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", children: "780-860-3191" })] }), _jsxs("li", { className: "flex items-start gap-2", children: [_jsx(Globe, { className: "w-4 h-4 mt-0.5 text-enc-orange-light" }), _jsx("a", { href: "https://www.estatenest.capital", target: "_blank", rel: "noopener noreferrer", className: "text-white/70 hover:text-enc-orange-light transition-colors text-sm", children: "www.estatenest.capital" })] })] })] })] }), _jsxs("div", { className: "border-t border-white/20 mt-16 pt-8 text-center text-sm text-white/60", children: [_jsx("p", { className: "mb-1", children: "Building Dreams" }), _jsx("p", { children: "\u00A9 2025 Estate Nest Capital Inc. All rights reserved." })] })] }) }));
};
export default Footer;
