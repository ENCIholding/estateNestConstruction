import { Link, useLocation } from "react-router-dom";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { scrollToHashTarget } from "@/lib/scroll";

type FooterLink = {
  newTab?: boolean;
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
    title: "Governance",
    links: [
      { label: "Accessibility Statement", path: "/accessibility" },
      { label: "Terms and Conditions", path: "/terms-and-conditions", newTab: true },
      { label: "Privacy", path: "/privacy", newTab: true },
      { label: "Cookies", path: "/cookies", newTab: true },
      { label: "Management Login (Internal)", path: "/management/login" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const location = useLocation();

  return (
    <Link
      to={link.path}
      className="text-sm text-white/75 transition-colors hover:text-enc-orange-light"
      target={link.newTab ? "_blank" : undefined}
      rel={link.newTab ? "noopener noreferrer" : undefined}
      onClick={(event) => {
        if (link.newTab) {
          return;
        }

        const [targetPath, targetHash] = link.path.split("#");

        if (targetHash && location.pathname === "/") {
          event.preventDefault();
          scrollToHashTarget(targetHash, "smooth");
          return;
        }

        if (!targetHash && targetPath === location.pathname) {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "auto" });
          return;
        }

        if (!targetHash) {
          window.requestAnimationFrame(() => {
            window.setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "auto" });
            }, 0);
          });
        }
      }}
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
              subtitle="Construction & Development"
              className="max-w-[250px]"
              subtitleClassName="text-white/70"
            />
            <p className="max-w-md text-sm leading-7 text-white/78">
              Estate Nest Capital Inc. focuses on Edmonton-based construction and development coordination with practical project controls, permit readiness, and lender-review discipline.
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

        <div className="space-y-3 pt-8 text-sm text-white/60">
          <p>
            Estate Nest Capital Inc. is working toward a clearer, more reviewable
            public presentation of construction and development coordination, with
            accessibility review and operational hardening continuing over time.
          </p>
          <p>© 2026 Estate Nest Capital Inc. All rights reserved.</p>
          <p>
            ENCI BuildOS, including its interface design, report templates,
            workflow logic, database structure, documentation, and related
            materials, is proprietary to Estate Nest Capital Inc. Unauthorized
            copying, reproduction, modification, redistribution, resale, reverse
            engineering, or derivative commercial use is prohibited except under
            written license from Estate Nest Capital Inc.
          </p>
          <p className="text-xs leading-6 text-white/50">
            Client Reports: Generated by ENCI BuildOS™ for project communication
            and review purposes only. These materials are based on information
            available in the project record as of the report date and are not
            legal, financial, engineering, accounting, or municipal approval
            advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
