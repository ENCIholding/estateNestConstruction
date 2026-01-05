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

  const scrollToSection = (hash: string) => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-enc-text-primary">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-1 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/65d67880-f4ae-4ca0-841d-1a60dd73a2d5.png" 
                  alt="Estate Nest Capital Logo" 
                  className="h-10 w-10"
                />
              </div>
              <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-enc-orange to-enc-yellow bg-clip-text text-transparent">
                ESTATE NEST
                <br />
                CAPITAL
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              if (item.path === "/builder-profile" || item.path === "/management-login") {
                return (
                  <Link key={item.label} to={item.path}>
                    <Button
                      variant="ghost"
                      className="text-white hover:text-enc-orange-light hover:bg-transparent text-sm font-medium tracking-wide"
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              } else if (item.path.startsWith("/#")) {
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => {
                      if (location.pathname !== "/") {
                        window.location.href = item.path;
                      } else {
                        scrollToSection(item.path.substring(1));
                      }
                    }}
                    className="text-white hover:text-enc-orange-light hover:bg-transparent text-sm font-medium tracking-wide"
                  >
                    {item.label}
                  </Button>
                );
              }
              return null;
            })}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:text-enc-orange-light">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-enc-text-primary border-enc-orange/20">
              <nav className="flex flex-col gap-4 mt-8">
                {navigationItems.map((item) => {
                  if (item.path === "/builder-profile" || item.path === "/management-login") {
                    return (
                      <Link 
                        key={item.label} 
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:text-enc-orange-light hover:bg-white/10 text-base font-medium"
                        >
                          {item.label}
                        </Button>
                      </Link>
                    );
                  } else if (item.path.startsWith("/#")) {
                    return (
                      <Button
                        key={item.label}
                        variant="ghost"
                        onClick={() => {
                          setIsOpen(false);
                          if (location.pathname !== "/") {
                            window.location.href = item.path;
                          } else {
                            scrollToSection(item.path.substring(1));
                          }
                        }}
                        className="w-full justify-start text-white hover:text-enc-orange-light hover:bg-white/10 text-base font-medium"
                      >
                        {item.label}
                      </Button>
                    );
                  }
                  return null;
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;