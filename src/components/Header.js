import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import Sheet, { SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
const Header = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const navigationItems = [
        { label: "Home", path: "/#home" },
        { label: "Builder Profile", path: "/builder-profile" },
        { label: "About Us", path: "/#about" },
        { label: "Projects", path: "/#projects" },
        { label: "Contact", path: "/#appointment", isContact: true },
        { label: "Management", path: "/management-login" }
    ];
    const scrollToSection = (hash) => {
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 z-50 bg-enc-text-primary", children: _jsx("div", { className: "container mx-auto px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4", children: _jsxs(Link, { to: "/", className: "flex items-center space-x-4", children: [_jsx("div", { className: "bg-white rounded-full p-1 flex items-center justify-center", children: _jsx("img", { src: "/lovable-uploads/65d67880-f4ae-4ca0-841d-1a60dd73a2d5.png", alt: "Estate Nest Capital Logo", className: "h-10 w-10" }) }), _jsxs("h1", { className: "text-xl font-bold tracking-wide bg-gradient-to-r from-enc-orange to-enc-yellow bg-clip-text text-transparent", children: ["ESTATE NEST", _jsx("br", {}), "CAPITAL"] })] }) }), _jsx("nav", { className: "hidden md:flex items-center space-x-8", children: navigationItems.map((item) => {
                            if (item.path === "/builder-profile" || item.path === "/management-login") {
                                return (_jsx(Link, { to: item.path, children: _jsx(Button, { variant: "ghost", className: "text-white hover:text-enc-orange-light hover:bg-transparent text-sm font-medium tracking-wide", children: item.label }) }, item.label));
                            }
                            else if (item.path.startsWith("/#")) {
                                return (_jsx(Button, { variant: "ghost", onClick: () => {
                                        if (location.pathname !== "/") {
                                            window.location.href = item.path;
                                        }
                                        else {
                                            scrollToSection(item.path.substring(1));
                                        }
                                    }, className: "text-white hover:text-enc-orange-light hover:bg-transparent text-sm font-medium tracking-wide", children: item.label }, item.label));
                            }
                            return null;
                        }) }), _jsxs(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(SheetTrigger, { asChild: true, className: "md:hidden", children: _jsx(Button, { variant: "ghost", size: "icon", className: "text-white hover:text-enc-orange-light", children: _jsx(Menu, { className: "h-6 w-6" }) }) }), _jsx(SheetContent, { side: "right", className: "w-[280px] bg-enc-text-primary border-enc-orange/20", children: _jsx("nav", { className: "flex flex-col gap-4 mt-8", children: navigationItems.map((item) => {
                                        if (item.path === "/builder-profile" || item.path === "/management-login") {
                                            return (_jsx(Link, { to: item.path, onClick: () => setIsOpen(false), children: _jsx(Button, { variant: "ghost", className: "w-full justify-start text-white hover:text-enc-orange-light hover:bg-white/10 text-base font-medium", children: item.label }) }, item.label));
                                        }
                                        else if (item.path.startsWith("/#")) {
                                            return (_jsx(Button, { variant: "ghost", onClick: () => {
                                                    setIsOpen(false);
                                                    if (location.pathname !== "/") {
                                                        window.location.href = item.path;
                                                    }
                                                    else {
                                                        scrollToSection(item.path.substring(1));
                                                    }
                                                }, className: "w-full justify-start text-white hover:text-enc-orange-light hover:bg-white/10 text-base font-medium", children: item.label }, item.label));
                                        }
                                        return null;
                                    }) }) })] })] }) }) }));
};
export default Header;
