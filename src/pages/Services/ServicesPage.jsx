import { useEffect } from "react";
import PageHeader from "../PageHeader/PageHeader";
import Services, { SERVICES_PAGE_DATA } from "@/components/Services/Services";
import Button from "@/components/Button/Button";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import { Link } from "@tanstack/react-router";
import "./ServicesPage.css";

const METHODOLOGY = [
  {
    step: "01",
    title: "Discovery & Technical Scoping",
    desc: "We perform deep requirements analysis, competitive benchmarking, and system architecture planning to ensure absolute alignment before writing any code.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "UI/UX & Interactive Prototyping",
    desc: "Crafting intuitive user journeys, high-fidelity design systems, and wireframe prototypes focused on frictionless user experience and high conversion rates.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Agile Engineering & Sprints",
    desc: "Building clean, maintainable, scalable codebases with bi-weekly sprint reviews, continuous CI/CD integration, and transparent client progress reporting.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Rigorous QA & Security Audits",
    desc: "Comprehensive automated unit tests, cross-device QA validation, performance benchmarks, and vulnerability checks prior to release.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Deployment & Growth Scaling",
    desc: "Seamless cloud production launches, search indexation, conversion tracking setup, and ongoing technical support for uninterrupted scaling.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const TECH_DOMAINS = [
  {
    name: "Web Platforms",
    badge: "Web Engineering",
    techs: ["React 19", "Next.js 15", "Node.js", "TypeScript", "Tailwind CSS", "REST & GraphQL"],
  },
  {
    name: "Mobile Ecosystem",
    badge: "Mobile Solutions",
    techs: ["Flutter", "React Native", "Swift (iOS)", "Kotlin (Android)", "Firebase", "App Store CI"],
  },
  {
    name: "Search & Visibility",
    badge: "Organic Search",
    techs: ["Technical SEO", "Ahrefs", "Google Search Console", "Schema Markup", "Core Web Vitals"],
  },
  {
    name: "Digital Marketing",
    badge: "Performance Ads",
    techs: ["Google Ads (PPC)", "Meta Ads Manager", "TikTok Ads", "GA4 Analytics", "Funnel CRO"],
  },
  {
    name: "Enterprise Software",
    badge: "ERP & Custom Systems",
    techs: ["Custom ERP Modules", "Cloud POS Engines", "PostgreSQL", "Docker", "CRM Pipelines"],
  },
  {
    name: "E-Commerce & CMS",
    badge: "Storefront Engineering",
    techs: ["WordPress", "WooCommerce", "Shopify Plus", "Payment Gateways", "Headless CMS"],
  },
  {
    name: "UI/UX & Product Design",
    badge: "Design Systems",
    techs: ["Figma Design Systems", "Interactive Prototypes", "Wireframing", "User Research"],
  },
  {
    name: "Retail & CRM POS",
    badge: "Operations Software",
    techs: ["Multi-Branch Inventory", "Barcode Scanning", "Thermal Printing", "Lead Pipelines"],
  },
];

export default function ServicesPage() {
  // Smoothly scroll to the dedicated service profile when page loads or hash changes
  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;

      // Handle direct key or aliases
      let targetId = hash;
      if (hash === "mobile-development" || hash === "mobile-dev") {
        targetId = "mobile-app";
      }

      const element =
        document.getElementById(`profile-${targetId}`) ||
        document.getElementById(targetId) ||
        document.getElementById(`service-${targetId}`);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          element.classList.add("servicesPage__profile-card--highlighted");
          setTimeout(() => {
            element.classList.remove("servicesPage__profile-card--highlighted");
          }, 3000);
        }, 200);
      }
    };

    handleScrollToHash();
    window.addEventListener("hashchange", handleScrollToHash);
    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, []);

  return (
    <div className="servicesPage">
      <PageHeader
        eyebrow="Our Core Capabilities & Courses"
        title="Professional IT Services & Industry Training in Multan"
        text="Digital Skills House offers high-performance digital solutions and practical IT training in Web Development, Mobile Apps, SEO, Digital Marketing, and WordPress. Certified by PSEB and FBR."
      />

      {/* Metrics Banner */}
      <section className="servicesPage__metrics" aria-label="Key Agency Capabilities">
        <div className="container servicesPage__metrics-grid">
          <div className="servicesPage__metric-item">
            <span className="servicesPage__metric-num">9+</span>
            <span className="servicesPage__metric-label">Specialized Service Disciplines</span>
          </div>
          <div className="servicesPage__metric-item">
            <span className="servicesPage__metric-num">100%</span>
            <span className="servicesPage__metric-label">In-House Office Engineering</span>
          </div>
          <div className="servicesPage__metric-item">
            <span className="servicesPage__metric-num">99.8%</span>
            <span className="servicesPage__metric-label">On-Time Sprint Delivery Rate</span>
          </div>
          <div className="servicesPage__metric-item">
            <span className="servicesPage__metric-num">PSEB & FBR</span>
            <span className="servicesPage__metric-label">Certified Technology Partner</span>
          </div>
        </div>
      </section>

      {/* Interactive Core Services Overview */}
      <Services />

      {/* Dedicated Comprehensive Service Profiles Section */}
      <section className="servicesPage__profiles" id="service-profiles" aria-label="Detailed Service Profiles">
        <div className="container">
          <header className="servicesPage__section-header">
            <div className="servicesPage__section-tag">
              <span className="servicesPage__tag-dot" />
              <span>DEDICATED SERVICE PROFILES</span>
            </div>
            <h2 className="servicesPage__section-title">
              In-Depth Capabilities & <span className="servicesPage__title-gradient">Service Profiles</span>
            </h2>
            <p className="servicesPage__section-sub">
              Explore our complete scope of work, technical specifications, and key deliverables for each specialized capability.
            </p>
          </header>

          <div className="servicesPage__profiles-grid">
            {SERVICES_PAGE_DATA.map((service) => (
              <article
                key={service.key}
                id={service.key}
                className="servicesPage__profile-card"
              >
                <div id={`profile-${service.key}`} className="servicesPage__profile-anchor" />
                
                {/* Header */}
                <div className="servicesPage__profile-header">
                  <div className="servicesPage__profile-top">
                    <div className="servicesPage__profile-icon">
                      {service.icon}
                    </div>
                    <div className="servicesPage__profile-badges">
                      <span className="servicesPage__profile-num">SERVICE {service.id}</span>
                      <span className="servicesPage__profile-badge">{service.badge}</span>
                    </div>
                  </div>

                  <h3 className="servicesPage__profile-heading">
                    {service.title}
                  </h3>
                  <p className="servicesPage__profile-subtitle">
                    {service.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="servicesPage__profile-desc">
                  {service.fullDesc}
                </p>

                {/* Deliverables */}
                <div className="servicesPage__profile-deliverables">
                  <h4 className="servicesPage__profile-section-title">
                    Key Deliverables & Standards
                  </h4>
                  <ul className="servicesPage__profile-list">
                    {service.deliverables.map((item) => (
                      <li key={item} className="servicesPage__profile-list-item">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="servicesPage__profile-check"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools & Frameworks */}
                <div className="servicesPage__profile-tools">
                  <h4 className="servicesPage__profile-section-title">
                    Toolchain & Technologies
                  </h4>
                  <div className="servicesPage__profile-pills">
                    {service.tools.map((tool) => (
                      <span key={tool} className="servicesPage__profile-pill">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="servicesPage__profile-footer">
                  <Link
                    to="/contact"
                    className="servicesPage__profile-cta"
                  >
                    <span>Consult On {service.title} →</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Methodology */}
      <section className="servicesPage__methodology" aria-label="Our Delivery Process">
        <div className="container">
          <header className="servicesPage__section-header">
            <div className="servicesPage__section-tag">
              <span className="servicesPage__tag-dot" />
              <span>HOW WE DELIVER</span>
            </div>
            <h2 className="servicesPage__section-title">
              Our 5-Stage <span className="servicesPage__title-gradient">Engineering Lifecycle</span>
            </h2>
            <p className="servicesPage__section-sub">
              Every project follows an exacting, milestone-driven framework to guarantee on-time completion, rock-solid security, and business ROI.
            </p>
          </header>

          <div className="servicesPage__steps-grid">
            {METHODOLOGY.map((m) => (
              <div key={m.step} className="servicesPage__step-card">
                <div className="servicesPage__step-top">
                  <div className="servicesPage__step-icon">{m.icon}</div>
                  <span className="servicesPage__step-num">{m.step}</span>
                </div>
                <h3 className="servicesPage__step-title">{m.title}</h3>
                <p className="servicesPage__step-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="servicesPage__tech" aria-label="Our Core Technologies">
        <div className="container">
          <header className="servicesPage__section-header">
            <div className="servicesPage__section-tag">
              <span className="servicesPage__tag-dot" />
              <span>CORE TECHNOLOGIES</span>
            </div>
            <h2 className="servicesPage__section-title">
              Modern Toolchains & <span className="servicesPage__title-gradient">Battle-Tested Stacks</span>
            </h2>
            <p className="servicesPage__section-sub">
              We leverage modern, industry-standard languages, frameworks, and marketing tools to engineer lightning-fast digital solutions.
            </p>
          </header>

          <div className="servicesPage__tech-grid">
            {TECH_DOMAINS.map((domain) => (
              <div key={domain.name} className="servicesPage__tech-card">
                <div className="servicesPage__tech-card-header">
                  <span className="servicesPage__tech-badge">{domain.badge}</span>
                  <h3 className="servicesPage__tech-name">{domain.name}</h3>
                </div>
                <div className="servicesPage__tech-pills">
                  {domain.techs.map((t) => (
                    <span key={t} className="servicesPage__tech-pill">
                      <span className="servicesPage__pill-dot" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Sliding Bar */}
      <LogoStrip />

      {/* Final Project CTA Banner */}
      <section className="servicesPage__cta" aria-label="Start Your Project">
        <div className="container">
          <div className="servicesPage__cta-card">
            <div className="servicesPage__cta-glow" aria-hidden="true" />
            <div className="servicesPage__cta-content">
              <h2 className="servicesPage__cta-title">
                Ready to Accelerate Your Business With Our Core Services?
              </h2>
              <p className="servicesPage__cta-desc">
                Whether you need a custom web platform, high-ranking SEO campaign, cross-platform mobile app, or enterprise ERP software — our team is ready to consult on your vision.
              </p>
              <div className="servicesPage__cta-buttons">
                <Button to="/contact">Get Free Consultation</Button>
                <Link to="/team" className="servicesPage__team-link">
                  Meet Our Specialist Leads →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
