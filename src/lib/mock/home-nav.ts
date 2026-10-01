export interface HomeNavItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

export interface HomeAnnouncement {
  badgeText: string;
  message: string;
  linkText: string;
  linkHref: string;
}

export interface FooterLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface HomeFooterData {
  tagline: string;
  copyright: string;
  language: string;
  sections: FooterSection[];
  legalLinks: FooterLink[];
}

export const HOME_ANNOUNCEMENT: HomeAnnouncement = {
  badgeText: "Spring Festival",
  message: "Spring Learning Festival: Enroll in any certified course and receive lifetime updates & 1-on-1 instructor Q&A.",
  linkText: "Explore Courses →",
  linkHref: "#catalog",
};

export const HOME_NAV_ITEMS: HomeNavItem[] = [
  { id: "courses", label: "Available Courses", href: "#catalog" },
  { id: "features", label: "Platform Features", href: "#features" },
  { id: "why-us", label: "Why Choose Us", href: "#features" },
  { id: "pricing", label: "Enterprise & Pricing", href: "#pricing" },
];

export const HOME_FOOTER_DATA: HomeFooterData = {
  tagline: "Delivering high-retention education for teams and independent learners globally.",
  copyright: `© ${new Date().getFullYear()} ESSCI Skilling India in Electronics. All rights reserved.`,
  language: "English (US)",
  sections: [
    {
      title: "Course Catalog",
      links: [
        { label: "Technical Skills", href: "#catalog" },
        { label: "Executive Leadership", href: "#catalog" },
        { label: "Compliance & Ethics", href: "#catalog" },
        { label: "Sales Enablement", href: "#catalog" },
        { label: "Cloud Architecture", href: "#catalog" },
      ],
    },
    {
      title: "Authentication & Access",
      links: [
        { label: "Log In", href: "/auth/login" },
        { label: "Sign Up & Buy Course", href: "/auth/signup" },
        { label: "Forgot / Reset Password", href: "/auth/forgot-password" },
      ],
    },
    {
      title: "Enterprise Solutions",
      links: [
        { label: "Bulk Seat Licensing", href: "#pricing" },
        { label: "Single Sign-On (SAML)", href: "/auth/login" },
        { label: "SOC-2 & GDPR Compliance", href: "#features" },
        { label: "Custom LMS Tenant", href: "#pricing" },
      ],
    },
    {
      title: "Platform & Support",
      links: [
        { label: "Interactive Video Player", href: "#features" },
        { label: "Digital Certificates", href: "#features" },
        { label: "Discussion Forums", href: "#features" },
        { label: "Help & Knowledge Base", href: "#features" },
      ],
    },
  ],
  legalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security Safeguards", href: "#" },
  ],
};
