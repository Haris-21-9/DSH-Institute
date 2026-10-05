import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Sparkles,
} from "lucide-react";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import Logo from "../Logo/Logo";
import showcaseImg from "@/assets/cloud-platform-preview.jpg";
import "./Footer.css";

const CORE_PAGES = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services & Capabilities", to: "/services" },
  { label: "Projects Portfolio", to: "/projects" },
  { label: "Project Details", to: "/project-details" },
  { label: "Our Leadership Team", to: "/team" },
  { label: "Contact Us", to: "/contact" },
];

const SPECIALTIES_PAGES = [
  { label: "Full-Stack Web Apps", to: "/services" },
  { label: "Mobile Applications", to: "/services" },
  { label: "Custom ERP & Cloud POS", to: "/services" },
  { label: "SEO & Digital Marketing", to: "/services" },
  { label: "Consultant Spotlight", to: "/team-details/1" },
  { label: "Agency Blog & Insights", to: "/blog" },
  { label: "Featured Blog Article", to: "/blog-details" },
  { label: "Licenses & Legal", to: "/license" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer">
      {/* Luminous Top Gradient Glow Line */}
      <div className="footer__glow-line" aria-hidden="true" />

      <div className="container footer__wrapper">
        <ScrollReveal>
          <div className="footer__grid">
            {/* Column 1: Brand & "Give us a welcome!" */}
            <div className="footer__col footer__col--brand">
              <Link to="/" className="footer__brand">
                <Logo variant="light" className="footer__logo" />
                <span className="footer__brand-name">Digital Skills House</span>
              </Link>
              <p className="footer__tagline">
                Premier IT training institute and digital software agency in Multan, Pakistan. Professional training in Full-Stack Web Development, SEO, Mobile Apps, and Digital Marketing.
              </p>

              {/* Dedicated "Give us a welcome!" Box */}
              <div className="footer__welcome-box">
                <div className="footer__welcome-top">
                  <span className="footer__welcome-badge">
                    <Sparkles size={12} />
                    <span>GET IN TOUCH</span>
                  </span>
                  <h4 className="footer__welcome-heading">Give us a welcome! 👋</h4>
                </div>

                <div className="footer__welcome-contacts">
                  <a
                    href="mailto:info@digitalskillshouse.pk"
                    className="footer__welcome-item"
                    title="Send an email to info@digitalskillshouse.pk"
                  >
                    <div className="footer__welcome-icon">
                      <Mail size={16} />
                    </div>
                    <div className="footer__welcome-text">
                      <span className="footer__welcome-lbl">Email Address</span>
                      <strong className="footer__welcome-val">info@digitalskillshouse.pk</strong>
                    </div>
                  </a>

                  <a
                    href="tel:+923166763282"
                    className="footer__welcome-item"
                    title="Call our office at 03166763282"
                  >
                    <div className="footer__welcome-icon">
                      <Phone size={16} />
                    </div>
                    <div className="footer__welcome-text">
                      <span className="footer__welcome-lbl">Phone &amp; WhatsApp</span>
                      <strong className="footer__welcome-val">03166763282</strong>
                    </div>
                  </a>

                  <div className="footer__welcome-item footer__welcome-item--loc">
                    <div className="footer__welcome-icon">
                      <MapPin size={16} />
                    </div>
                    <div className="footer__welcome-text">
                      <span className="footer__welcome-lbl">Location</span>
                      <span className="footer__welcome-val">Multan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Core Navigation Pages */}
            <div className="footer__col">
              <h4 className="footer__heading">Navigation</h4>
              <ul className="footer__links-list">
                {CORE_PAGES.map((page) => (
                  <li key={page.label}>
                    <Link to={page.to} className="footer__link">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Capabilities & Specialities */}
            <div className="footer__col">
              <h4 className="footer__heading">Specialties & Insights</h4>
              <ul className="footer__links-list">
                {SPECIALTIES_PAGES.map((page) => (
                  <li key={page.label}>
                    <Link to={page.to} className="footer__link">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Featured Showcase & Newsletter */}
            <div className="footer__col footer__col--showcase">
              <h4 className="footer__heading">Client Spotlight</h4>

              <Link to="/project-details" className="footer__showcase-card">
                <div className="footer__showcase-media">
                  <img
                    src={showcaseImg}
                    alt="NexusFlow Cloud Analytics Platform"
                    className="footer__showcase-img"
                    loading="lazy"
                  />
                  <span className="footer__showcase-badge">Cloud Architecture</span>
                </div>
                <div className="footer__showcase-content">
                  <h5 className="footer__showcase-title">NexusFlow Analytics</h5>
                  <p className="footer__showcase-desc">Real-time enterprise metrics & high-throughput cloud infrastructure.</p>
                  <span className="footer__showcase-action">
                    <span>View Case Study</span>
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>

              {/* Newsletter subscription */}
              <div className="footer__newsletter">
                <h5 className="footer__news-title">Stay ahead of the curve</h5>
                <p className="footer__news-sub">
                  Curated digital transformation insights & engineering teardowns.
                </p>

                {subscribed ? (
                  <div className="footer__news-success">
                    <CheckCircle2 size={16} />
                    <span>Thanks! You’re on the exclusive list.</span>
                  </div>
                ) : (
                  <form className="footer__news-form" onSubmit={handleSubscribe}>
                    <input
                      type="email"
                      required
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="footer__news-input"
                      aria-label="Email address"
                    />
                    <button type="submit" className="footer__news-btn" aria-label="Subscribe">
                      →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Footer Bottom Bar */}
        <ScrollReveal delay={150}>
          <div className="footer__bottom">
            <div className="footer__bottom-info">
              <span>© {new Date().getFullYear()} Digital Skills House. All rights reserved.</span>
              <span className="footer__bottom-divider">•</span>
              <span>Empowering Pakistan&apos;s Digital Future • FBR &amp; PSEB Registered.</span>
            </div>

            {/* Social Icons */}
            <div className="footer__socials">
              <a
                href="https://github.com/DigitalSkillsHouse"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="footer__social-btn"
              >
                <Github size={17} />
              </a>
              <a
                href="https://www.linkedin.com/in/digital-skills-house-4b4595288"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="footer__social-btn"
              >
                <Linkedin size={17} />
              </a>
              <a
                href="https://www.instagram.com/digitalskillshouse/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="footer__social-btn"
              >
                <Instagram size={17} />
              </a>
              <a
                href="https://www.youtube.com/@digitalskillshouse"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="footer__social-btn"
              >
                <Youtube size={17} />
              </a>
              <a
                href="https://www.facebook.com/digitalskillshouse"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="footer__social-btn"
              >
                <Facebook size={17} />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
