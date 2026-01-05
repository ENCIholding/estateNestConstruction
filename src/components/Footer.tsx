import { Link } from "react-router-dom";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

/* =======================
   Types
======================= */
type FooterLink = {
  label: string;
  path: string;
  isContact?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const Footer = () => {
  const footerSections: FooterSection[] = [
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

  return (
    <footer className="bg-enc-text-primary text-white">
      <div className="container mx-auto px-6 py-20">
        {/* Tagline */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">
            Let's Build Something Amazing
          </h2>
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo and Description */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-wide">
              ESTATE NEST
              <br />
              CAPITAL
            </h3>
            <p className="text-white/80 leading-relaxed text-sm">
              Strategic real estate investments and capital solutions. We bring
              quality craftsmanship and professional excellence to every
              project.
            </p>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.isContact ? (
                      <a
                        href={link.path}
                        className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          document
                            .getElementById("appointment")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {link.label}
                      </a>
                    ) : link.path.startsWith("/#") ? (
                      <a
                        href={link.path}
                        className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-enc-orange-light" />
                <span className="text-white/70 text-sm">
                  Edmonton, Alberta, Canada
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 text-enc-orange-light" />
                <a
                  href="mailto:hello@estatenest.capital"
                  className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                >
                  hello@estatenest.capital
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-enc-orange-light" />
                <a
                  href="tel:780-860-3191"
                  className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                >
                  780-860-3191
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 mt-0.5 text-enc-orange-light" />
                <a
                  href="https://www.estatenest.capital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-enc-orange-light transition-colors text-sm"
                >
                  www.estatenest.capital
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 mt-16 pt-8 text-center text-sm text-white/60">
          <p className="mb-1">Building Dreams</p>
          <p>© 2025 Estate Nest Capital Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
