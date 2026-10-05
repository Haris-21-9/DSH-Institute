import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import Button from "../Button/Button";
import { getStoredTeam, fetchTeamFromDb, INITIAL_TEAM_MEMBERS } from "@/lib/teamClient";
import defaultAvatar from "@/assets/team/harrison.jpg";
import "./HomeTeam.css";

export default function HomeTeam() {
  const [team, setTeam] = useState(INITIAL_TEAM_MEMBERS);

  useEffect(() => {
    setTeam(getStoredTeam());
    let isMounted = true;
    fetchTeamFromDb().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setTeam(data);
      }
    });

    const handleStorage = () => {
      setTeam(getStoredTeam());
    };
    const handleCustomEvent = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTeam(e.detail);
      } else {
        setTeam(getStoredTeam());
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("colabify_team_updated", handleCustomEvent);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("colabify_team_updated", handleCustomEvent);
    };
  }, []);

  const displayTeam = team.slice(0, 3);

  return (
    <section className="homeTeam" id="team-section" aria-label="Our Service Specialists">
      {/* Ambient Radial Mesh & Warm Atmospheric Glow */}
      <div className="homeTeam__ambient-glow" aria-hidden="true" />
      <div className="homeTeam__ambient-glow-secondary" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <header className="homeTeam__header">
          <div className="homeTeam__tag">
            <span className="homeTeam__tag-dot" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="homeTeam__tag-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>EXPERT INSTRUCTORS &amp; DOMAIN SPECIALISTS</span>
          </div>

          <div className="homeTeam__header-row">
            <h2 className="homeTeam__title">
              Learn from Seasoned <span className="homeTeam__title-gradient">Industry Mentors</span>
            </h2>
            <p className="homeTeam__subheading">
              Each discipline at Digital Skills House is championed by a seasoned specialist lead — ensuring you master Web Development, SEO, Mobile Engineering, Digital Marketing, and Custom Software with world-class agency standards.
            </p>
          </div>
        </header>

        {/* 3 Service Specialist Cards Grid (Top 3 Newest Team Members) */}
        <div className="homeTeam__grid">
          {displayTeam.map((p, idx) => (
            <Link
              key={p.id}
              to={`/team-details/${p.id}`}
              className="homeTeam__card-link"
              aria-label={`View profile of ${p.name}, ${p.role}`}
            >
              <article className="homeTeam__card">
                {/* Image Frame with Floating Service Badge */}
                <div className="homeTeam__image-wrap">
                  <img
                    src={p.image || defaultAvatar}
                    alt={p.name}
                    className="homeTeam__img"
                    loading="lazy"
                    width={400}
                    height={400}
                  />
                  <div className="homeTeam__image-overlay" />
                  <span className="homeTeam__category-badge">{p.badge || p.role || "Specialist Mentor"}</span>
                </div>

                {/* Content Under Image */}
                <div className="homeTeam__body">
                  <div className="homeTeam__info">
                    <div className="homeTeam__service-tag">
                      <span className="homeTeam__service-dot" />
                      <span>{p.capability || `Mentor 0${idx + 1}`} • {p.service || p.role || "Lead Engineer"}</span>
                    </div>
                    <h3 className="homeTeam__name">{p.name}</h3>
                    <span className="homeTeam__role">{p.role}</span>
                  </div>

                  <div className="homeTeam__meta">
                    <div className="homeTeam__skills-wrap">
                      <span className="homeTeam__skills-label">Core Tech Stack:</span>
                      <p className="homeTeam__skills">{p.skills || (Array.isArray(p.experience) ? p.experience.slice(0, 3).join(", ") : "Modern Agency Architecture & Cloud Development")}</p>
                    </div>

                    <div className="homeTeam__arrow-wrap">
                      <span className="homeTeam__profile-hint">View Profile</span>
                      <span className="homeTeam__arrow-circle">
                        <svg
                          width="14"
                          height="14"
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
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Row */}
        <div className="homeTeam__action-row">
          <div className="homeTeam__cta-group">
            <Button to="/team">View All

              Team Members</Button>
          </div>
          <div className="homeTeam__action-hint">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Top vetted service leads assigned directly to client engagements</span>
          </div>
        </div>
      </div>
    </section>
  );
}
