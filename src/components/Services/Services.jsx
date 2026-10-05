import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import "./Services.css";

// Exact services data matching the Colabify Services Page with Brand Icons
export const SERVICES_PAGE_DATA = [
  {
    id: "01",
    key: "web-dev",
    title: "Web Development",
    subtitle: "Full-Stack Web Engineering & Cloud Platforms",
    shortDesc:
      "We build responsive, ultra-fast websites and full-stack web applications using modern frameworks like React, Next.js, and Node.js tailored for seamless user experiences and high conversions.",
    fullDesc:
      "We build responsive, ultra-fast websites and full-stack web applications using modern frameworks like React, Next.js, and Node.js tailored for seamless user experiences, rock-solid security, and high conversions.",
    badge: "Web Engineering",
    deliverables: [
      "Custom React 19 & Next.js 15 Web Platforms",
      "High-Throughput REST & GraphQL APIs",
      "Headless CMS & Cloud Integrations",
      "Automated CI/CD Deployment Pipelines",
      "Sub-Second Page Load Optimization & Core Web Vitals",
    ],
    tools: ["React 19", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    tags: ["Full-Stack", "React & Next.js", "Custom Web Apps"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "02",
    key: "seo-opt",
    title: "SEO Optimization",
    subtitle: "Organic Traffic Growth & SERP Authority",
    shortDesc:
      "Data-backed search engine optimization strategies that drive high-intent organic traffic, top Google SERP rankings, in-depth technical site audits, and keyword domination.",
    fullDesc:
      "Data-backed search engine optimization strategies that drive high-intent organic traffic, top Google SERP rankings, in-depth technical site audits, keyword domination, and high-impact local search visibility.",
    badge: "Search Authority",
    deliverables: [
      "Comprehensive Technical SEO Audits & Bug Fixes",
      "Competitor Benchmarking & Keyword Domination",
      "Structured Schema Markup & On-Page Architecture",
      "Speed, Mobile-First & Core Web Vitals Optimization",
      "Continuous SERP Rank Tracking & GA4 Reporting",
    ],
    tools: ["Google Search Console", "Ahrefs", "SEMrush", "Schema.org", "GA4"],
    tags: ["Technical SEO", "Organic Rankings", "Keyword Strategy"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <polyline points="11 8 13.5 10.5 11 13" />
      </svg>
    ),
  },
  {
    id: "03",
    key: "mobile-app",
    title: "Mobile App Development",
    subtitle: "Native & Cross-Platform iOS / Android Apps",
    shortDesc:
      "High-performance native and cross-platform iOS & Android mobile applications engineered with Flutter and React Native, featuring intuitive UI/UX design and scalable cloud sync.",
    fullDesc:
      "High-performance native and cross-platform iOS & Android mobile applications engineered with Flutter and React Native, featuring intuitive UI/UX design, real-time sync, and scalable cloud architectures.",
    badge: "Mobile Solutions",
    deliverables: [
      "iOS & Android Mobile Applications (Flutter / React Native)",
      "Native Device Feature Integration (Camera, GPS, Biometrics)",
      "Real-Time Cloud Synchronization & Offline Caching",
      "App Store & Google Play Store Submission Management",
      "Ongoing Maintenance & Version Upgrades",
    ],
    tools: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase", "App Store CI"],
    tags: ["iOS & Android", "Flutter & React Native", "Mobile UI/UX"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="3" ry="3" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "04",
    key: "digital-marketing",
    title: "Digital Marketing",
    subtitle: "Performance Marketing & Conversion Funnels",
    shortDesc:
      "Multi-channel performance marketing, data-driven PPC campaigns, social media management, and conversion rate optimization (CRO) built to maximize your return on ad spend.",
    fullDesc:
      "Multi-channel performance marketing, data-driven PPC campaigns, social media management, and conversion rate optimization (CRO) built to maximize your return on ad spend and grow measurable brand equity.",
    badge: "Growth & ROI",
    deliverables: [
      "PPC Advertising Campaigns (Google Ads, Meta, TikTok)",
      "Full-Funnel Conversion Rate Optimization (CRO)",
      "High-Engagement Social Media Content Strategy",
      "Audience Retargeting & Custom Lookalike Models",
      "Comprehensive ROI Analytics & Attribution Tracking",
    ],
    tools: ["Google Ads", "Meta Ads Manager", "TikTok Ads", "GA4 Analytics", "HubSpot"],
    tags: ["Performance Ads", "Social Media", "Conversion Funnels"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
  {
    id: "05",
    key: "custom-software",
    title: "Custom Software & ERP Systems",
    subtitle: "Enterprise Workflow Automation & Cloud ERP",
    shortDesc:
      "Bespoke enterprise software, cloud-connected Point of Sale (POS) platforms, and custom ERP management systems designed to automate company workflows and scale business operations.",
    fullDesc:
      "Bespoke enterprise software, cloud-connected Point of Sale (POS) platforms, and custom ERP management systems designed to automate company workflows, eliminate operational friction, and scale business operations.",
    badge: "Enterprise Systems",
    deliverables: [
      "Custom ERP Business Workflow Modules",
      "Multi-Department Operational Dashboards",
      "Database Architecture & High-Concurrency APIs",
      "Role-Based Access Control & Audit Logs",
      "Cloud POS Integration & Automated Invoicing",
    ],
    tools: ["Custom ERP Engines", "PostgreSQL", "Docker", "Node.js", "Redis"],
    tags: ["ERP & CRM", "POS Systems", "Workflow Automation"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: "06",
    key: "wordpress-ecommerce",
    title: "WordPress & E-Commerce",
    subtitle: "WooCommerce & Shopify Storefronts",
    shortDesc:
      "Turnkey WordPress theme engineering, high-converting WooCommerce storefronts, and custom Shopify platforms built with bespoke checkout workflows and payment gateway integrations.",
    fullDesc:
      "Turnkey WordPress theme engineering, high-converting WooCommerce storefronts, and custom Shopify platforms built with bespoke checkout workflows, payment gateway integrations, and speed-optimized architectures.",
    badge: "E-Commerce Solutions",
    deliverables: [
      "Custom WordPress Theme & Gutenberg Block Engineering",
      "High-Converting WooCommerce & Shopify Plus Stores",
      "Secure Payment Gateway & Shipping Carrier Integrations",
      "One-Click Checkout & Abandoned Cart Recovery",
      "Storefront Speed Optimization & CDN Caching",
    ],
    tools: ["WordPress", "WooCommerce", "Shopify Plus", "Stripe API", "PHP 8"],
    tags: ["WordPress & WooCommerce", "Shopify Stores", "Payment Gateways"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "07",
    key: "uiux-design",
    title: "UI/UX & Product Design",
    subtitle: "User Experience, Wireframing & Design Systems",
    shortDesc:
      "User-centered digital product design, interactive wireframing, high-fidelity Figma prototypes, and complete enterprise design systems that turn complex user journeys into effortless experiences.",
    fullDesc:
      "User-centered digital product design, interactive wireframing, high-fidelity Figma prototypes, and complete enterprise design systems that turn complex user journeys into effortless, intuitive experiences.",
    badge: "Product & UI/UX",
    deliverables: [
      "User Journey Mapping & Information Architecture",
      "Low & High-Fidelity Interactive Wireframes",
      "Clickable Prototypes & Usability Testing",
      "Comprehensive Figma Design Systems & Tokens",
      "Micro-Interactions & Motion Design Specifications",
    ],
    tools: ["Figma", "FigJam", "Framer", "Design Tokens", "Usability Hub"],
    tags: ["Figma Design Systems", "UI/UX Research", "Interactive Prototypes"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: "08",
    key: "crm-solutions",
    title: "CRM Solutions & Sales Pipelines",
    subtitle: "Client Pipeline Automation & Sales Workflows",
    shortDesc:
      "Intelligent Customer Relationship Management (CRM) tools, client pipeline automation, and integrated marketing workflows engineered to close deals faster and nurture prospects.",
    fullDesc:
      "Intelligent Customer Relationship Management (CRM) tools, client pipeline automation, and integrated marketing workflows engineered to close deals faster, nurture prospects, and maximize customer lifetime value.",
    badge: "Sales Automation",
    deliverables: [
      "CRM Architecture & Custom Pipeline Design",
      "Automated Lead Scoring & Follow-Up Triggers",
      "Email Campaign & Multi-Channel Integrations",
      "Client Lifetime Value & Churn Prediction Reports",
      "Team Performance & Deal Stage Analytics",
    ],
    tools: ["CRM Architecture", "Lead Automation", "Zapier", "REST APIs"],
    tags: ["CRM Architecture", "Lead Automation", "Client Retention"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "09",
    key: "cloud-pos",
    title: "Cloud POS & Retail Systems",
    subtitle: "Multi-Branch Retail, Barcode & Billing",
    shortDesc:
      "Cloud-connected Point of Sale (POS) software, real-time multi-branch inventory tracking, barcode billing, thermal receipt printing, and comprehensive analytics tailored for retail businesses.",
    fullDesc:
      "Cloud-connected Point of Sale (POS) software, real-time multi-branch inventory tracking, barcode billing, thermal receipt printing, and comprehensive analytics tailored for retail, wholesale, and multi-location businesses.",
    badge: "Retail Systems",
    deliverables: [
      "Cloud-Connected Multi-Register POS Terminal",
      "Real-Time Multi-Branch Inventory Tracking",
      "Barcode Scanning & Thermal Receipt Printing",
      "Cash Drawer, Card Terminal & Offline Mode Support",
      "End-of-Day Reconciliation & Inventory Forecasting",
    ],
    tools: ["Cloud POS Engines", "Thermal Printing SDK", "Barcode Scanners", "WebSockets"],
    tags: ["Cloud POS", "Inventory Management", "Barcode & Billing"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M6 15h2" />
        <path d="M12 15h6" />
      </svg>
    ),
  },
];

// Backwards compatibility export
export const SERVICES = SERVICES_PAGE_DATA;

export default function Services({ limit }) {
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // If limit is provided (e.g. on Home page), strictly limit to 5 services
  const isLimited = Boolean(limit);
  const displayedServices = isLimited
    ? SERVICES_PAGE_DATA.slice(0, limit)
    : SERVICES_PAGE_DATA;

  // Handle service click
  const handleServiceClick = (service) => {
    if (isLimited) {
      // On Home page: Navigate directly to /services with hash to scroll to this service profile
      navigate({ to: "/services", hash: service.key });
    } else {
      // On dedicated Services page: Scroll smoothly to the dedicated profile card
      const targetElement =
        document.getElementById(service.key) ||
        document.getElementById(`profile-${service.key}`) ||
        document.getElementById(`service-${service.key}`);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        targetElement.classList.add("servicesPage__card--highlighted");
        setTimeout(() => {
          targetElement.classList.remove("servicesPage__card--highlighted");
        }, 2500);
      } else {
        setSelectedService(service);
      }
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedService(null);
    };
    if (selectedService) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedService]);

  return (
    <section
      className="dribbble-services dribbble-services--diagonal"
      id="services"
      aria-label="Our Services"
    >
      {/* Warm Ambient Glows */}
      <div className="dribbble-services__glow-left" aria-hidden="true" />
      <div className="dribbble-services__glow-right" aria-hidden="true" />

      {/* Expanded Full-Width Container */}
      <div className="dribbble-services__container">
        {/* Section Header with Colabify Brand Styling */}
        <header className="dribbble-services__header">
          <div className="dribbble-services__header-left">
            <div className="dribbble-services__tag">
              <span className="dribbble-services__tag-dot" />
              <span>DIGITAL SERVICES &amp; IT TRAINING</span>
            </div>
            <h2 className="dribbble-services__heading">
              Professional <span className="dribbble-services__brand-orange">Services</span>
              <br />
              &amp; Hands-On Courses
            </h2>
          </div>

          <div className="dribbble-services__header-right">
            <p className="dribbble-services__subtext">
              Digital Skills House provides premier software development, custom web engineering, SEO strategies, and industry-standard training designed to elevate careers and help businesses scale online with measurable impact.
            </p>
          </div>
        </header>

        {/* Full-Width Isometric Services Rows Area */}
        <div className="dribbble-services__rows-wrapper">
          <div className="dribbble-services__isometric-stage">
            <nav
              className="dribbble-services__isometric-deck"
              aria-label="Services Navigation List"
            >
              {displayedServices.map((service) => {
                const isHovered = hoveredKey === service.key;

                return isLimited ? (
                  <Link
                    key={service.key}
                    to="/services"
                    hash={service.key}
                    className={`dribbble-services__iso-card ${
                      isHovered ? "dribbble-services__iso-card--active" : ""
                    }`}
                    onMouseEnter={() => setHoveredKey(service.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    aria-label={`View ${service.title} details on services page`}
                  >
                    <div className="dribbble-services__iso-left">
                      <div className="dribbble-services__iso-icon">
                        {service.icon}
                      </div>
                      <span className="dribbble-services__iso-title">
                        {service.title}
                      </span>
                    </div>

                    <div
                      className={`dribbble-services__iso-arrow ${
                        isHovered ? "dribbble-services__iso-arrow--active" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={service.key}
                    id={`service-nav-${service.key}`}
                    className={`dribbble-services__iso-card ${
                      isHovered ? "dribbble-services__iso-card--active" : ""
                    }`}
                    onMouseEnter={() => setHoveredKey(service.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => handleServiceClick(service)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleServiceClick(service);
                      }
                    }}
                    aria-label={`View ${service.title} details`}
                  >
                    <div className="dribbble-services__iso-left">
                      <div className="dribbble-services__iso-icon">
                        {service.icon}
                      </div>
                      <span className="dribbble-services__iso-title">
                        {service.title}
                      </span>
                    </div>

                    <div
                      className={`dribbble-services__iso-arrow ${
                        isHovered ? "dribbble-services__iso-arrow--active" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Single left-aligned link to Services Page on Home page */}
          {isLimited && (
            <div className="dribbble-services__expand-bar">
              <Link to="/services" className="dribbble-services__expand-btn">
                <span>View All Services & Capabilities →</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div
          className="dribbble-modal-backdrop"
          onClick={() => setSelectedService(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
        >
          <div
            className="dribbble-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Ambient Glow */}
            <div className="dribbble-modal-glow" aria-hidden="true" />

            {/* Header */}
            <div className="dribbble-modal-header">
              <div className="dribbble-modal-meta">
                <div className="dribbble-modal-icon-bubble" aria-hidden="true">
                  {selectedService.icon}
                </div>
                <span className="dribbble-modal-id">
                  SERVICE {selectedService.id}
                </span>
                <span className="dribbble-modal-badge">
                  {selectedService.badge}
                </span>
              </div>
              <button
                type="button"
                className="dribbble-modal-close"
                onClick={() => setSelectedService(null)}
                aria-label="Close Service Details"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="dribbble-modal-body">
              <h3 id="modal-service-title" className="dribbble-modal-title">
                {selectedService.title}
                <span className="dribbble-services__brand-orange">.</span>
              </h3>
              <p className="dribbble-modal-subtitle">
                {selectedService.subtitle}
              </p>
              <p className="dribbble-modal-desc">
                {selectedService.fullDesc}
              </p>

              {/* Key Deliverables */}
              <div className="dribbble-modal-deliverables">
                <h4 className="dribbble-modal-section-title">
                  Key Deliverables & Standards
                </h4>
                <ul className="dribbble-modal-list">
                  {selectedService.deliverables.map((item) => (
                    <li key={item} className="dribbble-modal-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="dribbble-modal-check"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech & Tools */}
              <div className="dribbble-modal-tools">
                <h4 className="dribbble-modal-section-title">
                  Toolchain & Frameworks
                </h4>
                <div className="dribbble-modal-tool-pills">
                  {selectedService.tools.map((tool) => (
                    <span key={tool} className="dribbble-modal-tool-pill">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="dribbble-modal-footer">
              <Link
                to="/contact"
                className="dribbble-modal-cta"
                onClick={() => setSelectedService(null)}
              >
                Book This Service →
              </Link>
              <Link
                to="/services"
                className="dribbble-modal-link"
                onClick={() => setSelectedService(null)}
              >
                Explore Full Capabilities Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
