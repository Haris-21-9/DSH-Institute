import { useEffect, useState, useRef, useCallback } from "react";
import PageHeader from "../PageHeader/PageHeader";
import Button from "@/components/Button/Button";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import { getStoredProjects, fetchProjectsFromDb, SEED_PROJECTS } from "@/lib/projectsClient";
import { Link } from "@tanstack/react-router";
import "./ProjectDetails.css";

function ProjectDetailsPreview({ project }) {
  const [scale, setScale] = useState(0.35);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const iframeScrollerRef = useRef(null);
  const animRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const isHoveredRef = useRef(false);

  const scrollStateRef = useRef({
    currentY: 0,
    phase: "scrolling-down",
    phaseStartTime: 0,
    rewindStartY: 0,
    lastTimestamp: 0,
  });

  const actualUrl = (project.project_link || project.url || project.liveUrl || "").trim();
  const normalizedUrl = actualUrl ? (actualUrl.startsWith("http") ? actualUrl : `https://${actualUrl}`) : "";
  const proxySrc = normalizedUrl ? `/api/proxy?url=${encodeURIComponent(normalizedUrl)}` : "";

  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      if (containerW > 0) {
        setScale(containerW / 1280);
      }
    }
  }, []);

  useEffect(() => {
    updateScale();
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      updateScale();
    });
    ro.observe(containerRef.current);
    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [updateScale]);

  const makeStep = useCallback((maxScroll) => {
    const SPEED = 85;
    const PAUSE_BOT = 1500;
    const REWIND = 650;
    const PAUSE_TOP = 500;

    const step = (ts) => {
      if (!isHoveredRef.current) return;
      const s = scrollStateRef.current;
      if (!s.lastTimestamp) s.lastTimestamp = ts;
      const dt = Math.min((ts - s.lastTimestamp) / 1000, 0.08);
      s.lastTimestamp = ts;

      if (s.phase === "scrolling-down") {
        s.currentY += SPEED * dt;
        if (s.currentY >= maxScroll) {
          s.currentY = maxScroll;
          s.phase = "pause-bottom";
          s.phaseStartTime = ts;
        }
      } else if (s.phase === "pause-bottom") {
        if (ts - s.phaseStartTime >= PAUSE_BOT) {
          s.phase = "rewind";
          s.phaseStartTime = ts;
          s.rewindStartY = s.currentY;
        }
      } else if (s.phase === "rewind") {
        const elapsed = ts - s.phaseStartTime;
        const p = Math.min(1, elapsed / REWIND);
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        s.currentY = s.rewindStartY * (1 - ease);
        if (p >= 1) {
          s.currentY = 0;
          s.phase = "pause-top";
          s.phaseStartTime = ts;
        }
      } else if (s.phase === "pause-top") {
        if (ts - s.phaseStartTime >= PAUSE_TOP) {
          s.phase = "scrolling-down";
          s.lastTimestamp = ts;
        }
      }

      if (iframeScrollerRef.current) {
        iframeScrollerRef.current.style.transform = `translateY(-${s.currentY}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };

    return step;
  }, []);

  const stopScrolling = useCallback(() => {
    isHoveredRef.current = false;
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    const scroller = iframeScrollerRef.current;
    if (scroller) {
      scroller.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
      scroller.style.transform = "translateY(0px)";
      resetTimeoutRef.current = setTimeout(() => {
        if (!isHoveredRef.current && scroller) {
          scroller.style.transform = "";
          scroller.style.transition = "";
        }
      }, 400);
    }
    scrollStateRef.current = {
      currentY: 0,
      phase: "scrolling-down",
      phaseStartTime: 0,
      rewindStartY: 0,
      lastTimestamp: 0,
    };
  }, []);

  const startScrolling = useCallback(() => {
    isHoveredRef.current = true;
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    if (!containerRef.current || !iframeScrollerRef.current) return;
    const scroller = iframeScrollerRef.current;
    const container = containerRef.current;
    scroller.style.transition = "none";
    const containerH = container.clientHeight || 460;
    const scrollerH = scroller.scrollHeight || 0;
    const visualH = useIframeFallback
      ? 2600 * scale
      : Math.max(scrollerH, containerH + 120);
    const maxScroll = Math.max(200, visualH - containerH);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    scrollStateRef.current = {
      currentY: scrollStateRef.current.currentY || 0,
      phase: "scrolling-down",
      phaseStartTime: 0,
      rewindStartY: scrollStateRef.current.currentY || 0,
      lastTimestamp: 0,
    };
    const step = makeStep(maxScroll);
    animRef.current = requestAnimationFrame(step);
  }, [scale, makeStep, useIframeFallback]);

  useEffect(() => () => stopScrolling(), [stopScrolling]);

  return (
    <div
      className="project-details__image-frame"
      onMouseEnter={startScrolling}
      onMouseLeave={stopScrolling}
    >
      {/* Browser Chrome Header */}
      <div className="project-details__browser-bar">
        <div className="project-details__browser-dots">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <div className="project-details__browser-url">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{actualUrl}</span>
        </div>
        <span className="project-details__scroll-hint">Hover to scroll live site</span>
      </div>

      {/* Live Website Viewport with Link-based Iframe Scroll */}
      <div ref={containerRef} className="project-details__img-viewport">
        <div ref={iframeScrollerRef} className="project-details__iframe-scroller">
          {proxySrc ? (
            <iframe
              ref={iframeRef}
              src={proxySrc}
              title={project.title}
              className="project-details__live-iframe"
              style={{
                width: "1280px",
                height: "2600px",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
              scrolling="no"
              tabIndex={-1}
              aria-hidden="true"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          ) : (project.image || project.thumbnail) ? (
            <img
              src={project.image || project.thumbnail}
              alt={project.title}
              className="project-details__live-preview-img"
              style={{
                width: "100%",
                height: "auto",
                minHeight: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                display: "block",
                pointerEvents: "none",
                userSelect: "none",
                backgroundColor: "#0b0f19",
              }}
              onLoad={() => setImgLoaded(true)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [activeProject, setActiveProject] = useState(null);

  // Sync projects from storage and database after hydration
  useEffect(() => {
    setProjects(getStoredProjects());
    let isMounted = true;
    fetchProjectsFromDb().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setProjects(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Smooth scroll and focus highlight when navigating with hash
  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;

      const element =
        document.getElementById(hash) ||
        document.getElementById(`project-${hash}`) ||
        document.getElementById(`case-study-${hash}`);

      if (element) {
        setActiveProject(hash);
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          element.classList.add("project-details__card--highlighted");
          setTimeout(() => {
            element.classList.remove("project-details__card--highlighted");
          }, 3000);
        }, 200);
      }
    };

    handleScrollToHash();
    window.addEventListener("hashchange", handleScrollToHash);
    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, [projects]);

  const scrollToProject = (slug) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("project-details__card--highlighted");
      setTimeout(() => {
        element.classList.remove("project-details__card--highlighted");
      }, 2500);
    }
  };

  return (
    <div className="project-details-page">
      <PageHeader
        eyebrow="Case Studies &amp; Live Deployments"
        title="Explore Our Proven Project Portfolio &amp; Results"
        text="Discover how Digital Skills House partners with local and international businesses to build high-performance web platforms, eCommerce engines, and custom software with measurable outcomes."
      />

      {/* Quick Jump Navigation Bar */}
      <section className="project-details__nav-bar" aria-label="Project Quick Navigation">
        <div className="container">
          <div className="project-details__nav-wrapper">
            <span className="project-details__nav-label">JUMP TO CASE STUDY:</span>
            <div className="project-details__nav-pills">
              {projects.map((p, navIdx) => (
                <button
                  key={p.slug || p.id || navIdx}
                  type="button"
                  onClick={() => scrollToProject(p.slug)}
                  className={`project-details__nav-pill ${
                    activeProject === p.slug ? "project-details__nav-pill--active" : ""
                  }`}
                >
                  <span className="project-details__nav-dot" />
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase Section */}
      <section className="project-details">
        <div className="container">
          {projects.map((project, index) => (
            <ScrollReveal key={project.slug || project.id} delay={index * 80}>
              <article
                id={project.slug}
                className="project-details__card"
              >
                <div id={`project-${project.id}`} className="project-details__anchor" />

                {/* Left Column: Comprehensive Details */}
                <div className="project-details__content">
                  {/* Category & Badge Header */}
                  <div className="project-details__header-top">
                    <div className="project-details__badge-group">
                      <span className="project-details__number">CASE STUDY #0{index + 1}</span>
                      <span className="project-details__badge">{project.categoryBadge || project.category}</span>
                    </div>
                    <span className="project-details__location">{project.location}</span>
                  </div>

                  <h2 className="project-details__title">{project.title}</h2>
                  <p className="project-details__tagline">{project.tagline}</p>
                  
                  {/* Meta Specs Grid */}
                  <div className="project-details__meta">
                    <div className="project-details__meta-item">
                      <span className="project-details__meta-label">Client</span>
                      <span className="project-details__meta-value">{project.client}</span>
                    </div>
                    <div className="project-details__meta-item">
                      <span className="project-details__meta-label">Timeline</span>
                      <span className="project-details__meta-value">{project.duration}</span>
                    </div>
                    <div className="project-details__meta-item">
                      <span className="project-details__meta-label">Dedicated Team</span>
                      <span className="project-details__meta-value">{project.team}</span>
                    </div>
                  </div>

                  {/* Overview, Challenge & Solution */}
                  <div className="project-details__body-text">
                    <div className="project-details__text-block">
                      <h3 className="project-details__block-title">Project Overview</h3>
                      <p className="project-details__paragraph">{project.overview}</p>
                    </div>

                    <div className="project-details__text-block">
                      <h3 className="project-details__block-title">Technical Challenge & Scope</h3>
                      <p className="project-details__paragraph">{project.challenge}</p>
                    </div>

                    <div className="project-details__text-block">
                      <h3 className="project-details__block-title">Engineering Solution</h3>
                      <p className="project-details__paragraph">{project.solution}</p>
                    </div>
                  </div>

                  {/* Key Deliverables */}
                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="project-details__deliverables">
                      <h3 className="project-details__block-title">Key Deliverables & Standards</h3>
                      <ul className="project-details__deliverables-list">
                        {project.deliverables.map((item, dIdx) => (
                          <li key={`${project.slug || project.id}-del-${dIdx}`} className="project-details__deliverable-item">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ea580c"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="project-details__check-icon"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technologies Used */}
                  {(() => {
                    const techList = Array.isArray(project.technologies)
                      ? project.technologies
                      : Array.isArray(project.techStack)
                      ? project.techStack
                      : typeof (project.technologies || project.techStack) === "string"
                      ? (project.technologies || project.techStack).split(",").map((t) => t.trim()).filter(Boolean)
                      : [];
                    return techList.length > 0 ? (
                      <div className="project-details__technologies">
                        <h3 className="project-details__technologies-title">Technology Stack:</h3>
                        <div className="project-details__tech-tags">
                          {techList.map((tech, i) => (
                            <span key={`${project.slug || project.id}-tech-${i}`} className="project-details__tech-tag">
                              {typeof tech === "string" ? tech : JSON.stringify(tech)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Measurable Results Box */}
                  <div className="project-details__results-box">
                    <div className="project-details__results-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    </div>
                    <div className="project-details__results-content">
                      <span className="project-details__results-label">MEASURABLE IMPACT & OUTCOMES</span>
                      <p className="project-details__results-text">
                        {Array.isArray(project.results)
                          ? project.results
                              .map((item) =>
                                typeof item === "object" && item !== null
                                  ? `${item.metric ? item.metric + " " : ""}${item.label || ""}`.trim()
                                  : String(item)
                              )
                              .filter(Boolean)
                              .join(" • ")
                          : typeof project.results === "object" && project.results !== null
                          ? `${project.results.metric ? project.results.metric + " " : ""}${project.results.label || ""}`.trim() ||
                            "100% Production Uptime, Sub-Second Page Loads, Streamlined Customer Engagement"
                          : String(project.results || "100% Production Uptime, Sub-Second Page Loads, Streamlined Customer Engagement")}
                      </p>
                    </div>
                  </div>

                  {/* Project Actions */}
                  <div className="project-details__actions">
                    <a
                      href={project.url || project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-details__live-link"
                    >
                      <span>Visit Live Website</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                    <Link to="/contact" className="project-details__consult-link">
                      <span>Start Similar Project →</span>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Live Website Preview with Link-based Scrolling */}
                <div className="project-details__image-container">
                  <ProjectDetailsPreview project={project} />

                  <a
                    href={project.url || project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-details__preview-overlay-btn"
                  >
                    <span>Launch Live Site: {project.title} ↗</span>
                  </a>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        {/* Global Bottom CTA */}
        <div className="container project-details__cta">
          <ScrollReveal>
            <div className="project-details__cta-card">
              <div className="project-details__cta-glow" aria-hidden="true" />
              <div className="project-details__cta-inner">
                <span className="project-details__cta-eyebrow">HAVE A PROJECT IN MIND?</span>
                <h2 className="project-details__cta-title">
                  Let’s Build Your Next High-Performance Platform
                </h2>
                <p className="project-details__cta-desc">
                  Schedule a complimentary technical discovery session with our senior engineers and digital consultants.
                </p>
                <div className="project-details__cta-buttons">
                  <Button to="/contact">Get Free Consultation</Button>
                  <Link to="/projects" className="project-details__gallery-link">
                    Back to Interactive Showcase →
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <LogoStrip />
    </div>
  );
}
