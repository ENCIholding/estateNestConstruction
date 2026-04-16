import { Link } from "react-router-dom";
import { Mail, Phone, Globe, MapPin } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";

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
        { label: "Capital Solutions", path: "/investor-relations" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/#about" },
        { label: "Careers", path: "/careers" },
        { label: "Contact", path: "/#appointment", isContact: true },
      ],
    },
    {
      title: "Accessibility",
      links: [
        { label: "Accessibility Statement", path: "/accessibility" },
        { label: "Digital Access Support", path: "/accessibility" },
        { label: "Feedback & Assistance", path: "/accessibility" },
      ],
    },
  ];

  return (
    <footer className="bg-enc-text-primary text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="gradient-text text-3xl font-bold md:text-4xl">
            Let&apos;s Build Something Amazing
          </h2>
        </div>

        <div className="mb-16 grid gap-12 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-4">
            <BrandLockup
              to="/"
              subtitle="Construction & Capital"
              className="max-w-[240px]"
              subtitleClassName="text-white/70"
            />
            <p className="text-sm leading-relaxed text-white/80">
              Strategic real estate investments and capital solutions. We bring
              quality craftsmanship and professional excellence to every
              project.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isContact ? (
                      <a
                        href={link.path}
                        className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
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
                        className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <span className="text-sm text-white/70">
                  Edmonton, Alberta, Canada
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="mailto:hello@estatenest.capital"
                  className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
                >
                  hello@estatenest.capital
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="tel:780-860-3191"
                  className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
                >
                  780-860-3191
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="https://www.estatenest.capital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-enc-orange-light"
                >
                  www.estatenest.capital
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/20 pt-8 text-center text-sm text-white/60">
          <p className="mb-1">Building Dreams</p>
          <p>Copyright 2025 Estate Nest Capital Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
