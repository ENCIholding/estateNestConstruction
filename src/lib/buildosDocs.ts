export type BuildOsDocVisibility = "all" | "admin";

export type BuildOsDocSection = {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  visibility: BuildOsDocVisibility;
  summary: string;
  sections: {
    heading: string;
    body: string[];
  }[];
};

export const BUILDOS_LEGAL_DISCLAIMER =
  "Internal working draft only. Not legal advice. Must be reviewed by qualified legal counsel before commercial deployment.";

export const buildOsDocs: BuildOsDocSection[] = [
  {
    id: "terms-of-use",
    title: "Terms of Use",
    version: "v0.3",
    lastUpdated: "2026-04-16",
    visibility: "all",
    summary:
      "Operational terms for authorized use of ENCI BuildOS by internal and approved business users.",
    sections: [
      {
        heading: "Acceptance of terms",
        body: [
          "By accessing or using ENCI BuildOS, you agree to be bound by these Terms of Use.",
          "Use of the system constitutes acceptance of these terms whether or not a separate written agreement exists.",
        ],
      },
      {
        heading: "Authorized use",
        body: [
          "This system is provided for internal business use and authorized users only.",
          "Users agree to use the system solely for lawful business purposes.",
        ],
      },
      {
        heading: "Account responsibility",
        body: [
          "Users are responsible for maintaining the confidentiality of their credentials and for activity conducted under their access.",
        ],
      },
      {
        heading: "Prohibited misuse",
        body: [
          "Users may not misuse the system, attempt unauthorized access, reverse engineer it, redistribute it, or use it for unlawful purposes.",
        ],
      },
      {
        heading: "Service changes and termination",
        body: [
          "Estate Nest Capital Inc. may modify, suspend, or discontinue parts of the system without prior notice.",
          "Access may be restricted or terminated for misuse, breach, or operational reasons.",
        ],
      },
      {
        heading: "Disclaimer and governing law",
        body: [
          "The system is provided for operational support and no guarantee is made regarding uninterrupted availability or error-free performance.",
          "Governing law placeholder: Alberta and applicable federal laws of Canada, subject to legal counsel review.",
        ],
      },
    ],
  },
  {
    id: "license-agreement",
    title: "License Agreement",
    version: "v0.3",
    lastUpdated: "2026-04-16",
    visibility: "admin",
    summary:
      "Internal draft of the limited software license terms for ENCI BuildOS.",
    sections: [
      {
        heading: "License grant",
        body: [
          "ENCI BuildOS is licensed, not sold.",
          "Estate Nest Capital Inc. grants a non-exclusive, revocable, limited license to use the system for authorized purposes only.",
        ],
      },
      {
        heading: "Restrictions",
        body: [
          "No resale, sublicensing, reverse engineering, unauthorized duplication, redistribution, or use outside the approved scope is permitted.",
          "Tenant and account holders remain responsible for access control and authorized use.",
        ],
      },
      {
        heading: "Ownership and termination",
        body: [
          "All software and intellectual property rights remain with the licensor.",
          "Access may be modified or revoked at any time and use must cease immediately on termination.",
        ],
      },
      {
        heading: "Post-termination access",
        body: [
          "Following termination, access may be limited or removed and ongoing use is not permitted unless expressly authorized in writing.",
          "Legal review placeholder: final enforcement language requires counsel review before commercial use.",
        ],
      },
    ],
  },
  {
    id: "saas-subscription-terms",
    title: "SaaS Subscription Terms",
    version: "v0.2",
    lastUpdated: "2026-04-16",
    visibility: "admin",
    summary:
      "Forward-looking subscription structure for future controlled rollout beyond internal use.",
    sections: [
      {
        heading: "Service model and plans",
        body: [
          "ENCI BuildOS may be offered on a subscription basis in the future.",
          "Subscription plans, billing cycles, seat limits, and feature access by plan remain placeholders until commercial rollout is defined.",
        ],
      },
      {
        heading: "Trials, renewals, and cancellation",
        body: [
          "Trial conversion, renewal, cancellation, and non-payment suspension terms will be defined in applicable customer agreements.",
          "No uptime guarantee is stated at this stage unless expressly defined in a later service agreement.",
        ],
      },
      {
        heading: "Access control",
        body: [
          "Organizations may be provisioned by tenant, plan tier, seat count, and approved feature access.",
          "Suspension may occur for misuse, non-payment, or security concerns.",
        ],
      },
    ],
  },
  {
    id: "data-liability-clauses",
    title: "Data Liability Clauses",
    version: "v0.2",
    lastUpdated: "2026-04-16",
    visibility: "admin",
    summary:
      "Draft allocation of data responsibility, privacy posture, and limitation language for platform use.",
    sections: [
      {
        heading: "Customer data responsibility",
        body: [
          "Customers and users remain responsible for data accuracy, lawful use, and appropriate retention practices.",
          "Critical business records should be backed up independently where appropriate.",
        ],
      },
      {
        heading: "Platform basis and limitation",
        body: [
          "The platform is provided on a commercially reasonable basis and does not guarantee protection against every interruption, data loss, or unauthorized access scenario.",
          "Limitation of liability language remains a placeholder pending legal review.",
        ],
      },
      {
        heading: "Privacy, security, and incident handling",
        body: [
          "Privacy and security practices summary placeholder: operational safeguards, access controls, and incident response procedures.",
          "Incident reporting process placeholder: internal escalation and external notification obligations to be defined with counsel.",
        ],
      },
    ],
  },
  {
    id: "internal-use-confidentiality-security",
    title: "Internal Use, Confidentiality & Security Policy",
    version: "v0.3",
    lastUpdated: "2026-04-16",
    visibility: "all",
    summary:
      "Internal confidentiality and misuse guardrails for staff, contractors, consultants, and authorized users.",
    sections: [
      {
        heading: "Confidential system",
        body: [
          "ENCI BuildOS is a proprietary internal operating system of Estate Nest Capital Inc. and is strictly confidential.",
          "All data, workflows, structures, processes, and methodologies inside the system are confidential business information.",
        ],
      },
      {
        heading: "Authorized use only",
        body: [
          "Users shall not access data outside their role, use the system for personal purposes, or attempt to extract, replicate, or misuse system data or logic.",
        ],
      },
      {
        heading: "Restrictions and enforcement",
        body: [
          "Copying, exporting, screenshotting, recording, disclosing, or reverse-engineering system content without authorization is prohibited.",
          "System usage may be monitored, logged, and audited. Breaches may result in access suspension, disciplinary action, civil claims, or legal proceedings.",
        ],
      },
    ],
  },
  {
    id: "electronic-communication-consent",
    title: "Electronic Communication Consent",
    version: "v0.2",
    lastUpdated: "2026-04-16",
    visibility: "all",
    summary:
      "Working draft covering electronic acknowledgements, email correspondence, and records handling.",
    sections: [
      {
        heading: "Electronic agreement and email",
        body: [
          "Use of this system and related communications may constitute electronic agreement under applicable law, including the Alberta Electronic Transactions Act.",
          "Communications sent through authorized company email addresses, including hello@estatenest.capital, are treated as valid business communications.",
        ],
      },
      {
        heading: "Acknowledgement and records",
        body: [
          "Reply-based acknowledgement may be treated as confirmation of receipt and intent where context supports that interpretation.",
          "Electronic records may be retained for operational and evidentiary purposes, but email acknowledgement alone does not replace formal agreements where the law requires more.",
        ],
      },
    ],
  },
];

