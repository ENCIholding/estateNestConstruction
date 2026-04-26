import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import BrandLockup from "@/components/BrandLockup";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sharedNavClasses =
    "rounded-full border border-white/15 bg-white/6 px-5 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-all hover:border-enc-yellow-light/45 hover:bg-white/14 hover:text-enc-yellow-light";

  const navigationItems = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/#about" },
    { label: "Builder Profile", path: "/builder-profile" },
    { label: "Projects", path: "/#projects" },
    { label: "Investor Relations", path: "/investor-relations" },
    { label: "Contact", path: "/#appointment", isContact: true },
    { label: "Management", path: "/management/login" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,rgba(14,36,18,0.96),rgba(27,58,24,0.96),rgba(55,86,23,0.94))] shadow-[0_20px_48px_rgba(0,0,0,0.22)] backdrop-blur-md">
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
          <nav className="hidden md:flex items-center gap-3" aria-label="Primary">
            {navigationItems.map((item) => {
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  asChild
                  className={`${sharedNavClasses} ${item.isContact ? "shadow-[0_12px_30px_rgba(63,140,39,0.18)]" : ""}`}
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              );
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
                    return (
                      <Button
                        key={item.label}
                        variant="ghost"
                        asChild
                        className="w-full justify-start rounded-full border border-white/15 bg-white/5 px-5 text-base font-medium text-white hover:bg-white/10 hover:text-enc-orange-light"
                      >
                        <Link to={item.path} onClick={() => setIsOpen(false)}>
                          {item.label}
                        </Link>
                      </Button>
                    );
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
