import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { label: "Home", path: "/#home" },
    { label: "Builder Profile", path: "/builder-profile" },
    { label: "Investor Relations", path: "/investor-relations" },
    { label: "About Us", path: "/#about" },
    { label: "Contact", path: "/#appointment", isContact: true },
    { label: "Management", path: "/management/login" },
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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <BrandLockup
            to="/"
            subtitle="Edmonton Construction"
            className="max-w-[270px]"
            subtitleClassName="text-white/70"
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
            {navigationItems.map((item) => {
              if (
                item.path === "/builder-profile" ||
                item.path === "/investor-relations" ||
                item.path === "/management/login"
              ) {
                return (
                  <Link to={item.path} key={item.label}>
                    <Button variant="ghost" className="text-white hover:text-enc-orange-light hover:bg-transparent text-sm font-medium tracking-wide">
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
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-enc-orange-light">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-enc-text-primary border-enc-orange/20">
                <div className="mt-6 px-1">
                  <BrandLockup
                    to="/"
                    compact
                    subtitle="Edmonton Construction"
                    subtitleClassName="text-white/70"
                  />
                </div>
                <nav className="flex flex-col gap-4 mt-8">
                  {navigationItems.map((item) => {
                    if (
                      item.path === "/builder-profile" ||
                      item.path === "/investor-relations" ||
                      item.path === "/management/login"
                    ) {
                      return (
                        <Link key={item.label} to={item.path} onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-white hover:text-enc-orange-light hover:bg-white/10 text-base font-medium">
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
      </div>
    </header>
  );
};

export default Header;
