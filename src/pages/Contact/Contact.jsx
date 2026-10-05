import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import PageHeader from "../PageHeader/PageHeader";
import Button from "@/components/Button/Button";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import harrisonImg from "@/assets/team/harrison.jpg";
import sarahImg from "@/assets/team/sarah.jpg";
import marcoImg from "@/assets/team/marco.jpg";
import aminaImg from "@/assets/team/amina.jpg";
import "./Contact.css";

const SERVICES_OPTIONS = [
  { id: "web", label: "Web Application & Full-Stack", icon: "🌐" },
  { id: "mobile", label: "Mobile Apps (iOS & Android)", icon: "📱" },
  { id: "seo", label: "Technical SEO & Search Growth", icon: "🚀" },
  { id: "erp", label: "Enterprise ERP & CRM Systems", icon: "⚙️" },
  { id: "marketing", label: "Digital Marketing & Performance Ads", icon: "📈" },
  { id: "devops", label: "Cloud, AWS & DevOps Infrastructure", icon: "☁️" },
];

const BUDGET_TIERS = [
  "$5k - $15k",
  "$15k - $40k",
  "$40k - $100k",
  "$100k+ Enterprise",
];

const TIMELINE_OPTIONS = [
  "Immediate (< 2 weeks)",
  "1 - 2 Months",
  "3 - 6 Months",
  "Ongoing Retainer",
];

const FAQS = [
  {
    q: "What happens immediately after I submit this inquiry?",
    a: "Within 2 business hours, one of our Principal Solution Architects (not a salesperson) reviews your requirements and sends a tailored project estimation, calendar link for a 20-minute video briefing, and next steps.",
  },
  {
    q: "Do you provide and sign Mutual Non-Disclosure Agreements (NDAs)?",
    a: "Yes, absolutely. We treat your intellectual property, system architecture, and proprietary business concepts with the utmost confidentiality. We are happy to sign your standard NDA or provide our enterprise mutual NDA.",
  },
  {
    q: "Can we hire a dedicated pod or individual vetted specialists?",
    a: "We support both flexible engagement models. You can engage a full cross-functional team (Architect, Frontend, Backend, QA & PM) or seamlessly augment your existing in-house engineering team with dedicated individual specialists.",
  },
  {
    q: "What does your milestone pricing structure look like?",
    a: "We work on transparent milestone-based fixed sprints or flexible bi-weekly sprints. Every milestone has clearly defined deliverables, verifiable acceptance criteria, and code commits before payment releases.",
  },
  {
    q: "Do you offer post-launch maintenance, SLAs, and DevOps support?",
    a: "Yes. Every production delivery includes a 30-day comprehensive warranty and support period, with optional 24/7 uptime monitoring, security patching, and ongoing feature development retainers.",
  },
];

export default function Contact() {
  const [selectedServices, setSelectedServices] = useState(["web"]);
  const [selectedBudget, setSelectedBudget] = useState("$15k - $40k");
  const [selectedTimeline, setSelectedTimeline] = useState("1 - 2 Months");
  const [needNda, setNeedNda] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedKey, setCopiedKey] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);

  // Live clocks for global hubs
  const [times, setTimes] = useState({
    london: "",
    sanFrancisco: "",
    singapore: "",
  });

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const formatTime = (timeZone) =>
        new Intl.DateTimeFormat("en-US", {
          timeZone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);

      setTimes({
        london: formatTime("Europe/London"),
        sanFrancisco: formatTime("America/Los_Angeles"),
        singapore: formatTime("Asia/Singapore"),
      });
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((s) => s !== id)
          : prev
        : [...prev, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, key) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2200);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setSubmittedData({
        ...form,
        services: selectedServices,
        budget: selectedBudget,
        timeline: selectedTimeline,
        needNda,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setIsSubmitting(false);
    }, 800);
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setForm({ name: "", email: "", company: "", phone: "", message: "" });
  };

  return (
    <div className="contactPage">
      {/* Top Header Wrapper */}
      <div className="contactPage-header-wrapper">
        <PageHeader
          eyebrow="Let's Build Something Exceptional"
          title="Tell us about your project or business challenge."
          text="Connect directly with our senior solution architects and technical leads. We'll assemble the exact team and roadmap to scale your vision."
        />

        {/* Live Status Ribbon */}
        <div className="container contactPage__status-ribbon">
          <div className="contactPage__status-pill">
            <span className="contactPage__status-dot" />
            <span>Accepting New Q3/Q4 Enterprise Projects</span>
          </div>
          <div className="contactPage__sla-badge">
            <span className="contactPage__sla-icon">⚡</span>
            <span>Guaranteed Architect Response: <strong>&lt; 2 Hours</strong></span>
          </div>
        </div>
      </div>

      {/* Main Interactive Contact Section */}
      <section className="contactPage__main-section">
        <div className="container">
          <div className="contactPage__grid">
            {/* Left Column: Interactive Project Discovery & Smart Form */}
            <div className="contactPage__form-column">
              <ScrollReveal>
                <div className="contactPage__form-card">
                  {submittedData ? (
                    <div className="contactPage__success-state">
                      <div className="contactPage__success-icon-wrap">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <h3 className="contactPage__success-title">
                        Inquiry Received & Solution Pod Dispatched!
                      </h3>
                      <p className="contactPage__success-desc">
                        Thank you, <strong>{submittedData.name}</strong>. Your project brief has been assigned to our lead engineering pod. A Principal Architect will contact you at <strong>{submittedData.email}</strong> within 2 hours.
                      </p>

                      <div className="contactPage__summary-box">
                        <h4 className="contactPage__summary-heading">Inquiry Summary</h4>
                        <div className="contactPage__summary-grid">
                          <div className="contactPage__summary-item">
                            <span className="contactPage__summary-label">Target Services</span>
                            <span className="contactPage__summary-val">
                              {submittedData.services.length} Selected Domains
                            </span>
                          </div>
                          <div className="contactPage__summary-item">
                            <span className="contactPage__summary-label">Target Budget</span>
                            <span className="contactPage__summary-val">{submittedData.budget}</span>
                          </div>
                          <div className="contactPage__summary-item">
                            <span className="contactPage__summary-label">Estimated Timeline</span>
                            <span className="contactPage__summary-val">{submittedData.timeline}</span>
                          </div>
                          <div className="contactPage__summary-item">
                            <span className="contactPage__summary-label">Mutual NDA</span>
                            <span className="contactPage__summary-val">
                              {submittedData.needNda ? "Requested (Pre-call)" : "Standard Protocol"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="contactPage__reset-btn"
                      >
                        ← Submit Another Project Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="contactPage__form">
                      {/* Step 1: Services Selector */}
                      <div className="contactPage__step-group">
                        <div className="contactPage__step-header">
                          <span className="contactPage__step-num">01</span>
                          <div>
                            <h3 className="contactPage__step-title">What services do you require?</h3>
                            <p className="contactPage__step-sub">Select all domains that apply to your roadmap</p>
                          </div>
                        </div>

                        <div className="contactPage__chips-grid">
                          {SERVICES_OPTIONS.map((srv) => {
                            const isSelected = selectedServices.includes(srv.id);
                            return (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => toggleService(srv.id)}
                                className={`contactPage__chip ${isSelected ? "is-selected" : ""}`}
                              >
                                <span className="contactPage__chip-icon">{srv.icon}</span>
                                <span className="contactPage__chip-text">{srv.label}</span>
                                {isSelected && (
                                  <span className="contactPage__chip-check">✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>



                      {/* Step 3: Contact Details & Project Brief */}
                      <div className="contactPage__step-group">
                        <div className="contactPage__step-header">
                          <span className="contactPage__step-num">02</span>
                          <div>
                            <h3 className="contactPage__step-title">Your Details & Project Brief</h3>
                            <p className="contactPage__step-sub">Tell us where to send the architectural breakdown</p>
                          </div>
                        </div>

                        <div className="contactPage__inputs-grid">
                          <div className="contactPage__input-wrap">
                            <label htmlFor="contact-name" className="contactPage__label">
                              Full Name *
                            </label>
                            <input
                              id="contact-name"
                              name="name"
                              type="text"
                              required
                              value={form.name}
                              onChange={handleInputChange}
                              placeholder="e.g. Alexander Vance"
                              className="contactPage__input"
                            />
                          </div>

                          <div className="contactPage__input-wrap">
                            <label htmlFor="contact-email" className="contactPage__label">
                              Work Email *
                            </label>
                            <input
                              id="contact-email"
                              name="email"
                              type="email"
                              required
                              value={form.email}
                              onChange={handleInputChange}
                              placeholder="e.g. alexander@enterprise.com"
                              className="contactPage__input"
                            />
                          </div>

                          <div className="contactPage__input-wrap">
                            <label htmlFor="contact-company" className="contactPage__label">
                              Company / Organization
                            </label>
                            <input
                              id="contact-company"
                              name="company"
                              type="text"
                              value={form.company}
                              onChange={handleInputChange}
                              placeholder="e.g. Vanguard Logistics"
                              className="contactPage__input"
                            />
                          </div>

                          <div className="contactPage__input-wrap">
                            <label htmlFor="contact-phone" className="contactPage__label">
                              Phone / WhatsApp (Optional)
                            </label>
                            <input
                              id="contact-phone"
                              name="phone"
                              type="tel"
                              value={form.phone}
                              onChange={handleInputChange}
                              placeholder="e.g. +1 (555) 019-2834"
                              className="contactPage__input"
                            />
                          </div>
                        </div>

                        <div className="contactPage__input-wrap contactPage__input-wrap--full">
                          <label htmlFor="contact-message" className="contactPage__label">
                            Project Goals & Technical Requirements *
                          </label>
                          <textarea
                            id="contact-message"
                            name="message"
                            rows={4}
                            required
                            value={form.message}
                            onChange={handleInputChange}
                            placeholder="Describe your current tech stack, pain points, milestones, and desired outcomes..."
                            className="contactPage__textarea"
                          />
                        </div>

                        {/* NDA Checkbox */}
                        <label className="contactPage__nda-checkbox">
                          <input
                            type="checkbox"
                            checked={needNda}
                            onChange={(e) => setNeedNda(e.target.checked)}
                          />
                          <span>
                            Please prepare a mutual Non-Disclosure Agreement (NDA) prior to our introductory call.
                          </span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <div className="contactPage__actions-row">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="contactPage__submit-btn"
                        >
                          {isSubmitting ? (
                            <span className="contactPage__loading-text">
                              <span className="contactPage__spinner" />
                              Transmitting Brief...
                            </span>
                          ) : (
                            <span>Request Architecture Proposal & Call →</span>
                          )}
                        </button>
                        <p className="contactPage__privacy-notice">
                          🔒 100% Privacy Guaranteed. We will never share your information.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Direct Channels, Global Timezones, Team & Fast-Track */}
            <aside className="contactPage__aside-column">
              <ScrollReveal>
                {/* Instant Connect Card */}
                <div className="contactPage__aside-card contactPage__aside-card--direct">
                  <div className="contactPage__card-badge">DIRECT CHANNELS</div>
                  <h3 className="contactPage__aside-title">Talk to Us Directly</h3>
                  <p className="contactPage__aside-desc">
                    Need an immediate consultation or have an urgent RFP? Connect with our team directly.
                  </p>

                  <div className="contactPage__direct-list">
                    <div
                      className="contactPage__direct-item"
                      onClick={() => handleCopy("info@digitalskillshouse.pk", "email")}
                    >
                      <div className="contactPage__direct-icon">✉️</div>
                      <div className="contactPage__direct-text">
                        <span className="contactPage__direct-label">Official Inquiries &amp; Admission</span>
                        <strong className="contactPage__direct-val">info@digitalskillshouse.pk</strong>
                      </div>
                      <span className="contactPage__copy-btn">
                        {copiedKey === "email" ? "Copied!" : "Copy"}
                      </span>
                    </div>

                    <a href="tel:+923166763282" className="contactPage__direct-item">
                      <div className="contactPage__direct-icon">📞</div>
                      <div className="contactPage__direct-text">
                        <span className="contactPage__direct-label">Phone &amp; WhatsApp</span>
                        <strong className="contactPage__direct-val">03166763282</strong>
                      </div>
                      <span className="contactPage__copy-btn">Call</span>
                    </a>

                    <div
                      className="contactPage__direct-item"
                      onClick={() => handleCopy("info@digitalskillshouse.pk", "projects")}
                    >
                      <div className="contactPage__direct-icon">🚀</div>
                      <div className="contactPage__direct-text">
                        <span className="contactPage__direct-label">Corporate &amp; Agency Projects</span>
                        <strong className="contactPage__direct-val">info@digitalskillshouse.pk</strong>
                      </div>
                      <span className="contactPage__copy-btn">
                        {copiedKey === "projects" ? "Copied!" : "Copy"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Global Operating Hubs & Real-Time World Clocks */}
                <div className="contactPage__aside-card contactPage__aside-card--clocks">
                  <div className="contactPage__card-badge contactPage__card-badge--blue">GLOBAL HUBS</div>
                  <h3 className="contactPage__aside-title">World Hubs & Live Office Hours</h3>
                  <p className="contactPage__aside-desc">
                    Our pods operate across 3 primary global time zones for 24/7 continuous engineering handoffs.
                  </p>

                  <div className="contactPage__clocks-grid">
                    <div className="contactPage__clock-box">
                      <div className="contactPage__clock-header">
                        <span className="contactPage__clock-city">London HQ (GMT)</span>
                        <span className="contactPage__clock-status">Active</span>
                      </div>
                      <div className="contactPage__clock-time">{times.london || "12:00:00 PM"}</div>
                      <span className="contactPage__clock-address">10 Finsbury Square, London, UK</span>
                    </div>

                    <div className="contactPage__clock-box">
                      <div className="contactPage__clock-header">
                        <span className="contactPage__clock-city">San Francisco (PST)</span>
                        <span className="contactPage__clock-status">Active</span>
                      </div>
                      <div className="contactPage__clock-time">{times.sanFrancisco || "04:00:00 AM"}</div>
                      <span className="contactPage__clock-address">500 Howard St, San Francisco, CA</span>
                    </div>

                    <div className="contactPage__clock-box">
                      <div className="contactPage__clock-header">
                        <span className="contactPage__clock-city">Singapore (SGT)</span>
                        <span className="contactPage__clock-status">Active</span>
                      </div>
                      <div className="contactPage__clock-time">{times.singapore || "08:00:00 PM"}</div>
                      <span className="contactPage__clock-address">1 Marina Boulevard, Singapore</span>
                    </div>
                  </div>
                </div>

                {/* Who You'll Speak With */}
                <div className="contactPage__aside-card contactPage__aside-card--team">
                  <div className="contactPage__card-badge contactPage__card-badge--purple">PRACTITIONER FIRST</div>
                  <h3 className="contactPage__aside-title">Meet Your Solution Leads</h3>
                  <p className="contactPage__aside-desc">
                    You'll speak directly with seasoned technical leaders, not commissioned sales agents.
                  </p>

                  <div className="contactPage__leads-list">
                    <Link to="/team-details/1" className="contactPage__lead-item">
                      <img src={harrisonImg} alt="Harrison Baker" className="contactPage__lead-img" />
                      <div className="contactPage__lead-info">
                        <strong className="contactPage__lead-name">Harrison Baker</strong>
                        <span className="contactPage__lead-role">Full-Stack Lead Architect</span>
                      </div>
                      <span className="contactPage__lead-arrow">→</span>
                    </Link>

                    <Link to="/team-details/2" className="contactPage__lead-item">
                      <img src={sarahImg} alt="Sarah Lindqvist" className="contactPage__lead-img" />
                      <div className="contactPage__lead-info">
                        <strong className="contactPage__lead-name">Sarah Lindqvist</strong>
                        <span className="contactPage__lead-role">Principal SEO & Growth Lead</span>
                      </div>
                      <span className="contactPage__lead-arrow">→</span>
                    </Link>

                    <Link to="/team-details/5" className="contactPage__lead-item">
                      <img src={marcoImg} alt="Marco Bellini" className="contactPage__lead-img" />
                      <div className="contactPage__lead-info">
                        <strong className="contactPage__lead-name">Marco Bellini</strong>
                        <span className="contactPage__lead-role">Lead Mobile Applications Engineer</span>
                      </div>
                      <span className="contactPage__lead-arrow">→</span>
                    </Link>
                  </div>
                </div>

                {/* Fast-Track Emergency Badge */}
                <div className="contactPage__emergency-banner">
                  <div className="contactPage__emergency-icon">🚨</div>
                  <div>
                    <strong className="contactPage__emergency-title">Emergency System Rescue?</strong>
                    <p className="contactPage__emergency-desc">
                      Critical database outage or failed deployment? Call our urgent hotline for instant engineer dispatch.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion Section */}
      <section className="contactPage__faqs-section" aria-label="Frequently Asked Questions">
        <div className="container">
          <ScrollReveal>
            <div className="contactPage__faqs-header">
              <span className="contactPage__faqs-badge">CLIENT ONBOARDING FAQ</span>
              <h2 className="contactPage__faqs-title">Frequently Asked Questions</h2>
              <p className="contactPage__faqs-desc">
                Everything you need to know about our discovery process, security standards, and delivery engagement.
              </p>
            </div>

            <div className="contactPage__faqs-list">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div
                    key={index}
                    className={`contactPage__faq-item ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="contactPage__faq-question"
                      onClick={() => setActiveFaq(isOpen ? -1 : index)}
                    >
                      <span className="contactPage__faq-qtext">{faq.q}</span>
                      <span className="contactPage__faq-toggle">{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="contactPage__faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="contactPage__trust-banner">
        <div className="container">
          <div className="contactPage__trust-grid">
            <div className="contactPage__trust-item">
              <span className="contactPage__trust-icon">🛡️</span>
              <div>
                <strong>100% IP & Code Ownership</strong>
                <span>Full repository transfers & commercial licensing upon delivery.</span>
              </div>
            </div>

            <div className="contactPage__trust-item">
              <span className="contactPage__trust-icon">🔒</span>
              <div>
                <strong>Strict NDA Confidentiality</strong>
                <span>Signed non-disclosure agreements before all technical briefings.</span>
              </div>
            </div>

            <div className="contactPage__trust-item">
              <span className="contactPage__trust-icon">⚡</span>
              <div>
                <strong>Milestone-Driven Sprints</strong>
                <span>Sprint demos and measurable acceptance criteria before approvals.</span>
              </div>
            </div>

            <div className="contactPage__trust-item">
              <span className="contactPage__trust-icon">🤝</span>
              <div>
                <strong>30-Day Post-Launch SLA</strong>
                <span>Dedicated bug fixing, performance audits, and warranty support.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoStrip />
    </div>
  );
}
