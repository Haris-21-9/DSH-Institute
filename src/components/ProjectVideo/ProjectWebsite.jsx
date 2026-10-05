import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import "./ProjectWebsite.css";

// Desktop standard render dimensions for high-fidelity live web preview
const IFRAME_W = 1280;
const IFRAME_H = 5600;

export default function ProjectWebsite({ title, thumbnail, image, url, liveUrl, website, project_link, isFirstCard, slug }) {
  const [scale, setScale] = useState(0.28);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const previewImage = thumbnail || image;

  // ── Iframe & Scroller refs ───────────────────────────────────────────────
  const iframeRef = useRef(null);
  const iframeScrollerRef = useRef(null);
  const containerRef = useRef(null);
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

  // Normalize target URL (supports url, liveUrl, website, or project_link)
  const actualUrl = (url || liveUrl || website || project_link || "").trim();
  const normalizedUrl = actualUrl ? (actualUrl.startsWith("http") ? actualUrl : `https://${actualUrl}`) : "";
  const proxySrc = normalizedUrl ? `/api/proxy?url=${encodeURIComponent(normalizedUrl)}` : "";

  // Compute responsive scale to guarantee 100% inner screen width fit for live website iframe
  const updateScale = useCallback(() => {
    if (containerRef.current) {
      const containerW = containerRef.current.clientWidth;
      if (containerW > 0) {
        setScale(containerW / IFRAME_W);
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

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  // ── Continuous scrolling loop helper ─────────────────────────────────────
  const makeStep = useCallback((maxScroll) => {
    const SPEED = 80; // smooth reading speed in px/s
    const PAUSE_BOT = 1400; // pause at bottom to view footer
    const REWIND = 600; // swift smooth rewind
    const PAUSE_TOP = 400; // brief pause at top before next loop

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

  // ── Stop and reset to top when mouse leaves ──────────────────────────────
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

  // ── Start continuous scrolling on hover ──────────────────────────────────
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

    const containerH = container.clientHeight || 230;
    const childEl = scroller.firstElementChild;
    let visualH = IFRAME_H * (scale || 0.28);
    if (childEl && childEl.tagName === "IMG" && childEl.offsetHeight > 50) {
      visualH = childEl.offsetHeight;
    }
    const maxScroll = Math.max(140, visualH - containerH);

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
  }, [scale, makeStep]);

  useEffect(() => () => stopScrolling(), [stopScrolling]);

  // Extract clean official website domain/name (e.g., dealex.pk, digitalskillshouse.pk, vaks.com.pk)
  let officialDomain = "";
  try {
    if (normalizedUrl) {
      const u = new URL(normalizedUrl);
      officialDomain = u.hostname.replace(/^www\./, "");
    }
  } catch {}

  return (
    <article
      className="projects__card imac-card"
      onMouseEnter={startScrolling}
      onMouseLeave={stopScrolling}
    >
      <div className="imac-wrapper">
        {/* iMac Display Enclosure */}
        <div className="imac-display">
          {/* Top FaceTime Camera */}
          <div className="imac-camera" aria-hidden="true" />

          {/* Screen Viewport with Live Website Frame */}
          <div ref={containerRef} className="imac-screen">
            {/* Live Website embedded through link */}
            <div ref={iframeScrollerRef} className="imac-iframe-scroller">
              {proxySrc ? (
                <iframe
                  ref={iframeRef}
                  src={proxySrc}
                  title={title}
                  className="imac-screen-iframe"
                  style={{
                    width: `${IFRAME_W}px`,
                    height: `${IFRAME_H}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    pointerEvents: "none",
                  }}
                  scrolling="no"
                  tabIndex={-1}
                  aria-hidden="true"
                  loading="eager"
                  onLoad={handleIframeLoad}
                />
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt={title}
                  className="imac-screen-preview"
                  loading="eager"
                  onLoad={() => setIframeLoaded(true)}
                />
              ) : null}
            </div>

            {/* Loading shimmer overlay until preview is rendered */}
            {!iframeLoaded && (
              <div className="imac-screen-loading-overlay">
                <div className="imac-screen-spinner" />
                <span className="imac-screen-loading-text">Loading live website...</span>
              </div>
            )}

            {/* Subtle Screen Glare */}
            <div className="imac-screen-glare" aria-hidden="true" />
          </div>

          {/* Silver Aluminum Chin with Centered Apple Logo */}
          <div className="imac-chin" aria-hidden="true">
            <svg
              className="imac-apple-logo"
              viewBox="0 0 170 170"
              width="15"
              height="15"
              fill="currentColor"
            >
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12-14.42-6.19-9.46-11.05-20.17-14.58-32.12-3.53-11.96-5.3-23.4-5.3-34.31 0-14.03 3.69-25.77 11.07-35.22 7.38-9.46 16.64-14.28 27.78-14.47 5.01 0 10.5 1.25 16.47 3.75 5.97 2.5 10.12 3.81 12.45 3.93 1.96-.24 6.33-1.66 13.11-4.26 6.78-2.6 12.72-3.77 17.82-3.51 13.06.66 23.63 5.37 31.71 14.13-11.43 6.97-17.03 16.65-16.8 29.04.24 9.69 4.09 17.75 11.55 24.18 7.46 6.43 16.29 10.02 26.49 10.78-2.6 7.63-5.99 15.34-10.17 23.13zM119.22 31.84c0-7.39 2.66-14.36 7.98-20.91 5.32-6.55 11.98-10.45 19.98-11.7.54 1.74.82 3.59.82 5.54 0 7.39-2.77 14.57-8.31 21.54-5.54 6.97-12.33 10.99-20.37 12.06-.06-2.18-.1-4.36-.1-6.53z" />
            </svg>
          </div>
        </div>

        {/* iMac Aluminum Stand & Pedestal */}
        <div className="imac-stand" aria-hidden="true">
          <div className="imac-stand-neck" />
          <div className="imac-stand-foot" />
          <div className="imac-stand-shadow" />
        </div>
      </div>

      <div className="projects__card-meta">
        <div className="projects__card-info">
          <h3 className="projects__card-title">{title}</h3>
          <div className="projects__card-subrow">
            {officialDomain && (
              <span className="projects__card-domain" title={`Official Website: ${officialDomain}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{officialDomain}</span>
              </span>
            )}
            <span className="projects__card-hint">
              {iframeLoaded ? "• Hover to scroll" : "• Loading live site…"}
            </span>
          </div>
        </div>
        <div className="projects__card-actions">
          {slug && (
            <Link
              to="/project-details"
              hash={slug}
              className="projects__card-details-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Case Study</span>
            </Link>
          )}
          <a
            href={normalizedUrl || actualUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="projects__card-link"
            onClick={(e) => e.stopPropagation()}
            title={`Open ${title} in new tab`}
          >
            <span>Visit Site</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
