import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import RoboMascot from "./RoboMascot";
import heroVideo from "@/assets/hero-vedio.mp4";
import dshLogo from "@/assets/Logo.png";
import { getStoredTeam, fetchTeamFromDb } from "@/lib/teamClient";
import { getStoredHeroSettings, fetchHeroSettingsFromDb, DEFAULT_HERO_TRUST } from "@/lib/heroTrustClient";
import "./Hero.css";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [heroSettings, setHeroSettings] = useState(DEFAULT_HERO_TRUST);

  useEffect(() => {
    setIsVisible(true);

    // Initial sync from local storage
    const storedTeam = getStoredTeam();
    setTeamMembers(storedTeam);
    setHeroSettings(getStoredHeroSettings());

    // Async sync from MongoDB Atlas database
    fetchTeamFromDb().then((data) => {
      if (data && Array.isArray(data)) {
        setTeamMembers(data);
      }
    });

    fetchHeroSettingsFromDb().then((settings) => {
      if (settings) {
        setHeroSettings(settings);
      }
    });

    // Real-time event listeners for live updates from Admin Panel
    const handleTeamUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTeamMembers(e.detail);
      } else {
        setTeamMembers(getStoredTeam());
      }
    };

    const handleTrustUpdate = (e) => {
      if (e.detail) {
        setHeroSettings(e.detail);
      } else {
        setHeroSettings(getStoredHeroSettings());
      }
    };

    const handleStorage = () => {
      setTeamMembers(getStoredTeam());
      setHeroSettings(getStoredHeroSettings());
    };

    window.addEventListener("colabify_team_updated", handleTeamUpdate);
    window.addEventListener("colabify_hero_trust_updated", handleTrustUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("colabify_team_updated", handleTeamUpdate);
      window.removeEventListener("colabify_hero_trust_updated", handleTrustUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Only display real team members that have been added (up to 5)
  const displayAvatars = teamMembers.slice(0, 5);

  return (
    <section className="hero-robo">
      {/* Background Continuous Video */}
      <video
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        className="hero-robo__video-bg"
      />

      {/* Subtle Neutral Video Scrim */}
      <div className="hero-robo__video-overlay" aria-hidden="true" />

      {/* Main Hero Content Layout Grid */}
      <div className="container hero-content-layout">
        {/* Left Column: Heading, Social Proof, Testimonial Card */}
        <div className="hero-col hero-col--left">
          <h1 className="hero-heading">
            Empowering Your<br />
            Future with Cutting-Edge<br />
            Digital Skills
          </h1>

          {/* Social Proof: Avatars & Rating linked to Team */}
          <div className="hero-rating-box">
            {displayAvatars.length > 0 && (
              <Link to="/team" className="hero-avatar-stack" title="View our expert team members and mentors">
                {displayAvatars.map((member, idx) => {
                  const memberName = member.name || "Team Member";
                  const memberRole = member.role || "Mentor";
                  const tooltipText = `${memberName} — ${memberRole}`;

                  if (member.image) {
                    return (
                      <img
                        key={`hero-avatar-${member.id || idx}`}
                        src={member.image}
                        alt={memberName}
                        className="hero-avatar-bubble hero-avatar-bubble--img"
                        title={tooltipText}
                      />
                    );
                  }

                  const initial = memberName.charAt(0).toUpperCase() || "M";
                  return (
                    <span
                      key={`hero-avatar-init-${member.id || idx}`}
                      className="hero-avatar-bubble hero-avatar-bubble--initial"
                      title={tooltipText}
                    >
                      {initial}
                    </span>
                  );
                })}
              </Link>
            )}

            <div className="hero-rating-info">
              <div className="hero-stars-row">
                <span className="hero-stars">{heroSettings.starsText || "★★★★★"}</span>
                <span className="hero-rating-score">{heroSettings.ratingScore || "4.9/5"}</span>
              </div>
              <Link to="/team" style={{ textDecoration: "none" }}>
                <span className="hero-rating-text">{heroSettings.trustText || "Trusted by 5,000+ Clients"}</span>
              </Link>
            </div>
          </div>

          {/* Glassmorphism Testimonial Card */}
          <div className="hero-testimonial-card">
            <p className="hero-testimonial-quote">
              At Digital Skills House, we empower aspiring developers and businesses through hands-on professional IT training and digital solutions.
            </p>
            <div className="hero-testimonial-author">
              <div className="hero-author-avatar">
                <img
                  src={dshLogo}
                  alt="Digital Skills House Logo"
                  className="hero-author-logo-img"
                />
              </div>
              <div className="hero-author-details">
                <span className="hero-author-name">Digital Skills House</span>
                <span className="hero-author-role">FBR &amp; PSEB Registered Institute</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive 3D Robot Mascot */}
        <div className="hero-col hero-col--center">
          <div className={`hero-robo__mascot-center ${isVisible ? 'is-active' : ''}`}>
            <RoboMascot />
          </div>
        </div>

        {/* Right Column: Paragraph and Action Buttons */}
        <div className="hero-col hero-col--right">
          <p className="hero-right-desc">
            Master in-demand tech skills in Web Development, Mobile Apps, SEO, Digital Marketing, and WordPress with live industry project training in Multan.
          </p>
          <div className="hero-cta-group">
            <a href="/services" className="hero-btn-primary">
              Our Services &amp; Courses
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href="/contact" className="hero-btn-secondary">
              Contact Us
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Orange Blur & Glow OVER the robot legs */}
      <div className="hero-robo__bottom-orange-glow" aria-hidden="true" />
      <div className="hero-robo__bottom-orange-mist" aria-hidden="true" />
    </section>
  );
}
