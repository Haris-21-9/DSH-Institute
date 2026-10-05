import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { getStoredBlogs, fetchBlogsFromDb, INITIAL_BLOGS } from "@/lib/blogsClient";
import { formatRelativeTime } from "@/lib/timeUtils";
import PageHeader from "../PageHeader/PageHeader";
import Button from "@/components/Button/Button";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import defaultBlogImg from "@/assets/blog-1.jpg";
import "./BlogDetails.css";

// Individualized category presets for deliverables, metrics, and architecture tags
const DOMAIN_PROFILES = {
  "Web Development": {
    metrics: [
      { label: "Edge TTFB Latency", val: "< 80ms" },
      { label: "Core Web Vitals", val: "100% Pass" },
      { label: "Bundle Size", val: "-68% Overhead" },
      { label: "Conversion Lift", val: "+34% Uplift" },
    ],
    takeaways: [
      "Zero-Downtime Microservice Architecture & Sub-100ms Edge TTFB",
      "React 19 Server Components & Streaming SSR Pipeline",
      "Automated CI/CD Deployment with Continuous Canary Health Audits",
      "High-Throughput Database Replication with Resilient Caching",
    ],
    tags: ["React 19", "Next.js", "Server Components", "Edge Runtimes", "MongoDB Atlas", "Cloudflare CDN"],
  },
  "SEO & Growth": {
    metrics: [
      { label: "Organic SERP Uplift", val: "+340%" },
      { label: "Top-3 Commercial Ranks", val: "500+ Terms" },
      { label: "Crawl Efficiency", val: "99.8%" },
      { label: "Organic Revenue Impact", val: "+142%" },
    ],
    takeaways: [
      "Semantic HTML & Knowledge Graph Schema Implementation",
      "Technical Core Web Vitals Crawl Budget Optimization",
      "High-Intent Topic Clusters & Competitor Keyword Domination",
      "Sustainable #1 Google Ranking Dominance without Penalty Risks",
    ],
    tags: ["Technical SEO", "Schema Markup", "SERP Algorithms", "Crawl Optimization", "Search Console", "Organic Growth"],
  },
  "Mobile Apps": {
    metrics: [
      { label: "App Store Rating", val: "4.9 / 5.0" },
      { label: "Crash-Free Rate", val: "99.98%" },
      { label: "Cold Start Time", val: "0.45s" },
      { label: "Push Engagement", val: "+52%" },
    ],
    takeaways: [
      "Cross-Platform Native Parity on iOS and Android Ecosystems",
      "Sub-Second Offline-First Synchronization Architecture",
      "Automated End-to-End Mobile Testing & Fastlane Pipeline",
      "Optimized Battery and Memory Consumption Footprint",
    ],
    tags: ["React Native", "Flutter", "iOS & Android", "Offline Sync", "Fastlane", "Push Notifications"],
  },
  "Enterprise ERP": {
    metrics: [
      { label: "System Availability", val: "99.99%" },
      { label: "Transaction Speed", val: "< 60ms" },
      { label: "Admin Hours Saved", val: "40+ Hrs/Wk" },
      { label: "Data Integrity", val: "100% ACID" },
    ],
    takeaways: [
      "Real-Time Multi-Warehouse Inventory & Telemetry Sync",
      "Role-Based Granular Access Control & Security Auditing",
      "Automated Cross-Department Invoice & Financial Reconciliation",
      "Zero-Loss Disaster Recovery & Multi-Region Database Replication",
    ],
    tags: ["Enterprise ERP", "PostgreSQL", "Node.js", "Redis Cache", "Role-Based ACL", "High Availability"],
  },
  "Digital Marketing": {
    metrics: [
      { label: "ROAS Multiplier", val: "4.8x" },
      { label: "Cost Per Acquisition", val: "-42%" },
      { label: "Attribution Accuracy", val: "99.2%" },
      { label: "Qualified Leads", val: "+210%" },
    ],
    takeaways: [
      "Full-Funnel Multi-Touch Attribution & Event Tracking Matrix",
      "High-Conversion Landing Page & Dynamic Heatmap Optimizations",
      "Algorithmic Paid Campaign Scaling across Google and Meta",
      "Automated Omnichannel Email & SMS Retention Flows",
    ],
    tags: ["Performance Marketing", "Meta Ads", "Google Ads", "Conversion Rate", "Attribution Tracking", "Funnel Strategy"],
  },
  "Cloud & DevOps": {
    metrics: [
      { label: "Deploy Frequency", val: "10x Daily" },
      { label: "Recovery Time (MTTR)", val: "< 4 Mins" },
      { label: "Cloud Cost Efficiency", val: "-38%" },
      { label: "Security Compliance", val: "SOC2 & ISO" },
    ],
    takeaways: [
      "Infrastructure as Code (Terraform) with Automated Rollbacks",
      "Multi-Cloud Container Orchestration with Kubernetes (EKS)",
      "Zero-Trust Network Architecture & Continuous Threat Monitoring",
      "Real-Time Telemetry, Distributed Tracing & Grafana Observability",
    ],
    tags: ["AWS Cloud", "Kubernetes", "Docker", "Terraform", "CI/CD Pipelines", "Zero-Trust Security"],
  },
};

export default function BlogDetails({ articleId = 1 }) {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [currentId, setCurrentId] = useState(articleId);
  const [copied, setCopied] = useState(false);
  const [, setTimeTick] = useState(0);

  // Auto-refresh relative timestamps periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loaded = getStoredBlogs();
    setBlogs(loaded);
    if (articleId !== undefined && articleId !== null) {
      setCurrentId(articleId);
    } else if (loaded.length > 0) {
      setCurrentId(loaded[0].id);
    }
    let isMounted = true;
    fetchBlogsFromDb().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setBlogs(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [articleId]);

  // Find active article by ID or slug
  const activeArticle =
    blogs.find((b) => String(b.id) === String(currentId) || b.slug === String(currentId)) ||
    blogs[0];

  // More articles excluding active
  const otherArticles = blogs.filter((b) => String(b.id) !== String(activeArticle?.id));

  // Determine individual domain profile
  const profile =
    DOMAIN_PROFILES[activeArticle?.category] || DOMAIN_PROFILES["Web Development"];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  if (!activeArticle) {
    return (
      <div className="blogDetails-not-found">
        <div className="container">
          <h2>Article Not Found</h2>
          <p>The requested publication could not be located in our journal library.</p>
          <Button to="/blog">Back to Blog Journal</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="blogDetailsPage">
      {/* Top Header */}
      <PageHeader
        eyebrow="Tech Blog &amp; IT Insights"
        title={activeArticle.title}
        text={activeArticle.tagline || "In-depth web development guides, SEO playbooks, and freelancing case studies from Digital Skills House."}
      />

      {/* Main Content Layout */}
      <section className="blogDetails__main-section">
        <div className="container">
          <div className="blogDetails__layout-grid">
            {/* Left Column: Full Case Study & Article Body */}
            <div className="blogDetails__left-col">
              <ScrollReveal>
                <article className="blogDetails__card">
                  {/* Main Article Top Showcase (Live Original Website or Main Cover Image) */}
                  {(activeArticle?.url || activeArticle?.blog_link || activeArticle?.link) ? (
                    <div style={{ marginBottom: "1.5rem", background: "rgba(15, 23, 42, 0.85)", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(245, 130, 42, 0.3)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--brand-orange)" }} />
                          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f8fafc" }}>
                            Live Original Website: {(() => {
                              try {
                                const target = activeArticle.url || activeArticle.blog_link || activeArticle.link;
                                return new URL(target).hostname.replace(/^www\./, "");
                              } catch {
                                return "External Article Link";
                              }
                            })()}
                          </span>
                        </div>
                        <a
                          href={activeArticle.url || activeArticle.blog_link || activeArticle.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "0.45rem 0.95rem",
                            borderRadius: "8px",
                            background: "var(--brand-orange)",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            textDecoration: "none",
                            boxShadow: "0 4px 12px rgba(245, 130, 42, 0.3)"
                          }}
                        >
                          <span>Visit Original Website</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </a>
                      </div>

                      {/* Live Website Embedded Proxy Frame */}
                      <div style={{ width: "100%", height: "480px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)", background: "#ffffff" }}>
                        <iframe
                          src={`/api/proxy?url=${encodeURIComponent(activeArticle.url || activeArticle.blog_link || activeArticle.link)}`}
                          title={activeArticle.title}
                          style={{ width: "100%", height: "100%", border: "none" }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : activeArticle.image ? (
                    <div className="blogDetails__banner-wrap">
                      <img
                        src={activeArticle.image}
                        alt={activeArticle.title}
                        className="blogDetails__banner-img"
                        loading="eager"
                      />
                      <div className="blogDetails__badge-overlay">
                        <span className="blogDetails__badge-dot" />
                        <span>{activeArticle.category}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Metadata Header (Clean: Date & Views) */}
                  <div className="blogDetails__card-header">
                    <div className="blogDetails__header-status-line">
                      <span className="blogDetails__header-cat-badge">{activeArticle.category}</span>
                      <div className="blogDetails__meta-pills">
                        <span className="blogDetails__meta-pill">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatRelativeTime(activeArticle.createdAt || activeArticle.timestamp || activeArticle.date)}
                        </span>
                        <span className="blogDetails__meta-pill">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {activeArticle.views || "2.4k views"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Lead Box */}
                  <div className="blogDetails__lead-box">
                    <span className="blogDetails__lead-badge">EXECUTIVE SUMMARY</span>
                    <p className="blogDetails__lead-text">{activeArticle.excerpt}</p>
                  </div>

                  {/* Individual Key Performance Benchmarks Grid */}
                  <div className="blogDetails__metrics-banner">
                    <span className="blogDetails__metrics-heading">PROVEN ARCHITECTURAL BENCHMARKS</span>
                    <div className="blogDetails__metrics-grid">
                      {profile.metrics.map((m, idx) => (
                        <div key={idx} className="blogDetails__metric-box">
                          <span className="blogDetails__metric-val">{m.val}</span>
                          <span className="blogDetails__metric-label">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Strategic Highlights / Deliverables */}
                  <div className="blogDetails__takeaways-block">
                    <h3 className="blogDetails__block-title">Key Engineering Takeaways & Deliverables</h3>
                    <div className="blogDetails__takeaways-grid">
                      {profile.takeaways.map((takeaway, idx) => (
                        <div key={idx} className="blogDetails__takeaway-item">
                          <span className="blogDetails__takeaway-check">✓</span>
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Editorial Markdown Body */}
                  <div className="blogDetails__editorial-body">
                    {(activeArticle.content || "").split("\n\n").map((block, idx) => {
                      const trimmed = block.trim();
                      if (trimmed.startsWith("## ")) {
                        return (
                          <h2 key={idx} className="blogDetails__h2">
                            {trimmed.replace("## ", "")}
                          </h2>
                        );
                      }
                      if (trimmed.startsWith("### ")) {
                        return (
                          <h3 key={idx} className="blogDetails__h3">
                            {trimmed.replace("### ", "")}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith("```")) {
                        const codeLines = trimmed.split("\n");
                        const codeContent = codeLines.slice(1, -1).join("\n");
                        return (
                          <div key={idx} className="blogDetails__code-block">
                            <pre>
                              <code>{codeContent}</code>
                            </pre>
                          </div>
                        );
                      }
                      if (trimmed.startsWith("---")) {
                        return <hr key={idx} className="blogDetails__divider" />;
                      }
                      if (trimmed.startsWith("- ")) {
                        const items = trimmed.split("\n").map((li) => li.replace(/^- /, ""));
                        return (
                          <ul key={idx} className="blogDetails__list">
                            {items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (trimmed.startsWith("1. ")) {
                        const items = trimmed.split("\n").map((li) => li.replace(/^\d+\.\s*/, ""));
                        return (
                          <ol key={idx} className="blogDetails__num-list">
                            {items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ol>
                        );
                      }
                      return (
                        <p key={idx} className="blogDetails__paragraph">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>

                  {/* Core Topics / Competencies Pill Cloud */}
                  <div className="blogDetails__topics-block">
                    <span className="blogDetails__topics-title">Core Competencies & Technologies:</span>
                    <div className="blogDetails__topics-cloud">
                      {profile.tags.map((tag, idx) => (
                        <span key={idx} className="blogDetails__topic-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action & Share Footer */}
                  <div className="blogDetails__share-row">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="blogDetails__share-action-btn"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span>{copied ? "Link Copied!" : "Copy Article Link"}</span>
                    </button>

                    <Link to="/blog" className="blogDetails__back-btn">
                      ← Back to All Articles
                    </Link>
                  </div>
                </article>
              </ScrollReveal>
            </div>

            {/* Right Column: Sticky Article Specifications & Table of Contents */}
            <aside className="blogDetails__right-col">
              <div className="blogDetails__sticky-panel">
                {/* Specifications Widget */}
                <div className="blogDetails__specs-card">
                  <h4 className="blogDetails__widget-heading">Publication Specs</h4>
                  <div className="blogDetails__specs-grid">
                    <div className="blogDetails__spec-item">
                      <span className="blogDetails__spec-label">Domain</span>
                      <span className="blogDetails__spec-value">{activeArticle.category}</span>
                    </div>
                    <div className="blogDetails__spec-item">
                      <span className="blogDetails__spec-label">Date Published</span>
                      <span className="blogDetails__spec-value">
                        {formatRelativeTime(activeArticle.createdAt || activeArticle.timestamp || activeArticle.date)}
                      </span>
                    </div>
                    <div className="blogDetails__spec-item">
                      <span className="blogDetails__spec-label">Review Status</span>
                      <span className="blogDetails__spec-value">Verified Peer-Reviewed</span>
                    </div>
                  </div>
                </div>

                {/* Table of Contents */}
                {activeArticle.toc && activeArticle.toc.length > 0 && (
                  <div className="blogDetails__toc-card">
                    <h4 className="blogDetails__widget-heading">Table of Contents</h4>
                    <ul className="blogDetails__toc-list">
                      {activeArticle.toc.map((item, idx) => (
                        <li key={item.id || idx} className="blogDetails__toc-item">
                          <span className="blogDetails__toc-badge">{`0${idx + 1}`}</span>
                          <span className="blogDetails__toc-text">{item.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Consultation CTA Widget */}
                <div className="blogDetails__consult-widget">
                  <div className="blogDetails__consult-tag">NEED EXPERT EXECUTION?</div>
                  <h4 className="blogDetails__consult-title">Partner with Our Engineering Specialists</h4>
                  <p className="blogDetails__consult-desc">
                    Book a strategy session with our engineering specialists and technical pod to implement these scalable patterns on your project.
                  </p>
                  <Button to="/contact" variant="primary">
                    Get Free Strategy Call
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Other Articles & Case Studies Grid */}
        {otherArticles.length > 0 && (
          <div className="container blogDetails__more-section">
            <ScrollReveal>
              <div className="blogDetails__more-header">
                <h3 className="blogDetails__more-title">More Case Studies & Technical Insights</h3>
                <Link to="/blog" className="blogDetails__more-all-link">
                  View Full Journal ({blogs.length} Articles) →
                </Link>
              </div>

              <div className="blogDetails__more-grid">
                {otherArticles.slice(0, 6).map((other) => (
                  <Link
                    key={other.id}
                    to={`/blog-details/${other.id}`}
                    onClick={() => setCurrentId(other.id)}
                    className="blogDetails__more-card"
                  >
                    <div className="blogDetails__more-img-wrap">
                      <img
                        src={other.image || defaultBlogImg}
                        alt={other.title}
                        className="blogDetails__more-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = defaultBlogImg;
                        }}
                      />
                      <span className="blogDetails__more-badge">{other.category}</span>
                    </div>

                    <div className="blogDetails__more-body">
                      <div className="blogDetails__more-meta">
                        <span>{formatRelativeTime(other.createdAt || other.timestamp || other.date)}</span>
                      </div>

                      <h4 className="blogDetails__more-name">{other.title}</h4>

                      <div className="blogDetails__more-footer">
                        <span className="blogDetails__more-arrow">Read Case Study →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        )}
      </section>
    </div>
  );
}
