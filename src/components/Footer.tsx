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
    title: "Compliance",
    links: [
      { label: "Terms and Conditions", path: "/terms-and-conditions", newTab: true },
      { label: "Privacy", path: "/privacy", newTab: true },
      { label: "Cookies", path: "/cookies", newTab: true },
      { label: "Regulatory Safety Standards", path: "/regulatory-safety-standards", newTab: true },
    ],
  },
  {
    title: "Governance",
    links: [
      { label: "Accessibility Statement", path: "/accessibility" },
      { label: "ENCI Build OS (Internal)", path: "/management/login" },
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
        <div className="grid gap-12 border-b border-white/10 pb-12 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.76fr))_minmax(0,1fr)]">
          <div className="space-y-5">
            <BrandLockup
              to="/"
              subtitle="Construction & Development"
              className="max-w-[250px]"
              subtitleClassName="text-white/70"
            />
            <p className="max-w-md text-sm leading-7 text-white/78">
              Estate Nest Capital Inc. is an Edmonton-based construction and
              development company focused on practical planning, permit
              readiness, construction coordination, and clear communication for
              residential, infill, multi-unit, renovation, and commercial
              projects.
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
            Estate Nest Capital Inc. continues to refine its public information,
            accessibility practices, and project communication standards as the
            business grows. If you require information in another format or
            experience difficulty using this website, contact us at
            hello@estatenest.capital.
          </p>
          <p>© 2026 Estate Nest Capital Inc. All rights reserved.</p>

          <div className="space-y-2">
            <h3 className="font-semibold text-white/80 transition-colors duration-300 ease-in-out hover:text-enc-yellow-light">
              Intellectual Property &amp; Ownership:
            </h3>
            <p>
              All content, designs, materials, templates, reports, written copy,
              visual assets, and proprietary business materials on this website
              and within ENCI BuildOS are the exclusive intellectual property of
              Estate Nest Capital Inc. This includes all AI-assisted images
              created under the direction, vision, and instruction of Estate
              Nest Capital Inc. These images are considered original creative
              works and are protected accordingly.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white/80 transition-colors duration-300 ease-in-out hover:text-enc-yellow-light">
              Prohibited Use &amp; Unauthorized Access:
            </h3>
            <p>
              Unauthorized copying, reproduction, modification, redistribution,
              resale, reverse engineering, data scraping, automated extraction,
              or derivative commercial use of any materials is strictly
              prohibited. This includes attempts to capture content through
              screenshots, screen recording, snipping tools, browser developer
              tools, or similar methods.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white/80 transition-colors duration-300 ease-in-out hover:text-enc-yellow-light">
              Client Report Disclaimer:
            </h3>
            <p className="text-xs leading-6 text-white/50">
              Reports generated via the ENCI Build OS are for project
              communication and review only. Estate Nest Capital and its
              directors assume no liability for the accuracy of these materials
              or for technical issues arising from electronic transmission.
              These materials do not constitute professional advice; final
              decisions should be verified against official contracts and
              permits. All electronic communications from the estatenest.capital
              domain are conducted in compliance with Canada's Anti-Spam
              Legislation (CASL) and the Electronic Commerce Act, 2000
              (Ontario). By engaging with our services, you acknowledge
              acceptance of these terms and consent to receive electronic
              correspondence in accordance with applicable laws.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
