import Button from "../Button/Button";
import aboutVideoImg from "@/assets/about-video.jpg";
import "./AboutIntro.css";

export default function AboutIntro() {
  return (
    <section className="aboutIntro" id="about-intro" aria-label="About Digital Skills House">
      {/* Ambient Radial Mesh & Warm Backdrop Glow */}
      <div className="aboutIntro__ambient-glow" aria-hidden="true" />

      <div className="container aboutIntro__inner">
        {/* Left Column: Asymmetric Bento Media Card */}
        <div className="aboutIntro__media-wrapper">
          <div className="aboutIntro__media">
            <img
              src={aboutVideoImg}
              alt="Digital Skills House instructor reviewing project code on laptop"
              loading="lazy"
              width={900}
              height={800}
              className="aboutIntro__img"
            />
            <div className="aboutIntro__media-backdrop" />

            {/* Top-Left Rapid Match Badge */}
            <div className="aboutIntro__speed-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>100% Practical Training</span>
            </div>

            {/* Top-Right Live Status Pill */}
            <div className="aboutIntro__live-badge">
              <span className="aboutIntro__live-dot" />
              <span>PSEB &amp; FBR Registered</span>
            </div>

            {/* Bottom-Left Floating Social Proof Glass Card */}
            <div className="aboutIntro__review-badge">
              <div className="aboutIntro__review-avatars">
                <span className="aboutIntro__review-avatar" style={{ background: '#fa7126' }}>
                  <span>DS</span>
                </span>
                <span className="aboutIntro__review-avatar" style={{ background: '#2563eb' }}>
                  <span>PK</span>
                </span>
                <span className="aboutIntro__review-avatar" style={{ background: '#059669' }}>
                  <span>IT</span>
                </span>
              </div>
              <div className="aboutIntro__review-info">
                <div className="aboutIntro__review-stars">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  <span className="aboutIntro__review-score">4.9/5</span>
                </div>
                <span className="aboutIntro__review-text">From 5,000+ Enrolled Students</span>
              </div>
            </div>
          </div>

          <div className="aboutIntro__media-glow" aria-hidden="true" />
        </div>

        {/* Right Column: Editorial Pitch & Bento Grid */}
        <div className="aboutIntro__copy">
          {/* Top Pill / Kicker */}
          <div className="aboutIntro__tag">
            <span className="aboutIntro__tag-dot" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="aboutIntro__tag-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>ABOUT DIGITAL SKILLS HOUSE</span>
          </div>

          {/* Headline */}
          <h2 className="aboutIntro__title">
            The Premier IT Institute &amp; <span className="aboutIntro__title-gradient">Digital Agency in Multan</span>
          </h2>

          {/* Mission Narrative */}
          <p className="aboutIntro__text">
            At Digital Skills House, we bridge the gap between academia and the global tech industry. We provide{" "}
            <strong className="aboutIntro__highlight">100% practical, project-based training</strong> in Web Development,
            SEO, Mobile App Development, Digital Marketing, and WordPress. We empower freelancers and companies with{" "}
            <strong className="aboutIntro__highlight">industry-grade expertise</strong> and digital solutions.
          </p>

          {/* 3 Bento Feature / Value Pillar Cards */}
          <div className="aboutIntro__features">
            {/* Bento Card 1: Top 1% */}
            <div className="aboutIntro__feature-card">
              <div className="aboutIntro__feature-header">
                <div className="aboutIntro__feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="aboutIntro__feature-pill">TOP MENTORS</span>
              </div>
              <div className="aboutIntro__feature-body">
                <h3 className="aboutIntro__feature-title">Certified Expert Instructors</h3>
                <p className="aboutIntro__feature-desc">Learn directly from seasoned software engineers and agency leaders.</p>
              </div>
            </div>

            {/* Bento Card 2: 24h Matching */}
            <div className="aboutIntro__feature-card">
              <div className="aboutIntro__feature-header">
                <div className="aboutIntro__feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="aboutIntro__feature-pill">LIVE PROJECTS</span>
              </div>
              <div className="aboutIntro__feature-body">
                <h3 className="aboutIntro__feature-title">Hands-On Real Experience</h3>
                <p className="aboutIntro__feature-desc">Build portfolio-ready full-stack applications and real client projects.</p>
              </div>
            </div>

            {/* Bento Card 3: Zero Overhead */}
            <div className="aboutIntro__feature-card">
              <div className="aboutIntro__feature-header">
                <div className="aboutIntro__feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <span className="aboutIntro__feature-pill">CAREER ROADMAP</span>
              </div>
              <div className="aboutIntro__feature-body">
                <h3 className="aboutIntro__feature-title">Freelancing &amp; Job Support</h3>
                <p className="aboutIntro__feature-desc">Dedicated coaching on Upwork, Fiverr, resume building, and tech interviews.</p>
              </div>
            </div>
          </div>

          {/* Action Row: CTA Button + Trust Proof */}
          <div className="aboutIntro__cta-row">
            <div className="aboutIntro__cta">
              <Button to="/about">About Digital Skills House</Button>
            </div>
            <div className="aboutIntro__trust-check">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Government Registered • PSEB &amp; FBR Certified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
