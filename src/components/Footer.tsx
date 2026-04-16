import { Link } from "react-router-dom";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";

type FooterLink = {
  label: string;
  path: string;
};

type FooterSection = {
  links: FooterLink[];
  title: string;
};

const footerSections: FooterSection[] = [
  {
    title: "Explore",
    links: [
      { label: "Builder Profile", path: "/builder-profile" },
      { label: "Investor Relations", path: "/investor-relations" },
      { label: "Careers", path: "/careers" },
    ],
  },
  {
    title: "Capabilities",
    links: [
      { label: "About Estate Nest", path: "/#about" },
      { label: "Capabilities & Concept References", path: "/#projects" },
      { label: "Book a Consultation", path: "/#appointment" },
    ],
  },
  {
    title: "Accessibility",
    links: [
      { label: "Accessibility Statement", path: "/accessibility" },
      { label: "Color Accessibility Mode", path: "/accessibility" },
      { label: "Feedback & Assistance", path: "/accessibility" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <Link
      to={link.path}
      className="text-sm text-white/75 transition-colors hover:text-enc-orange-light"
    >
      {link.label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-enc-text-primary text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))_minmax(0,1fr)]">
          <div className="space-y-5">
            <BrandLockup
              to="/"
              subtitle="Construction & Capital"
              className="max-w-[250px]"
              subtitleClassName="text-white/70"
            />
            <p className="max-w-md text-sm leading-7 text-white/78">
              Estate Nest Capital Inc. focuses on construction planning, development execution, and project documentation that can stand up to client, lender, and internal review.
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">
              Edmonton, Alberta
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
              Connect
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/75">
                <MapPin className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <span>Edmonton, Alberta, Canada</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/75">
                <Mail className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="mailto:hello@estatenest.capital"
                  className="transition-colors hover:text-enc-orange-light"
                >
                  hello@estatenest.capital
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/75">
                <Phone className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="tel:780-860-3191"
                  className="transition-colors hover:text-enc-orange-light"
                >
                  780-860-3191
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/75">
                <Globe className="mt-0.5 h-4 w-4 text-enc-orange-light" />
                <a
                  href="https://www.estatenest.capital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-enc-orange-light"
                >
                  www.estatenest.capital
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-sm text-white/60">
          <p>Estate Nest Capital Inc. develops this website as an informational business platform, with accessibility review and operational hardening continuing over time.</p>
          <p className="mt-2">Copyright 2026 Estate Nest Capital Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
