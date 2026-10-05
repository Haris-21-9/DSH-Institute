import { useState, useEffect } from "react";
import PageHeader from "../PageHeader/PageHeader";
import Button from "@/components/Button/Button";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import { Link } from "@tanstack/react-router";
import { getStoredTeam, fetchTeamFromDb, INITIAL_TEAM_MEMBERS } from "@/lib/teamClient";
import defaultAvatar from "@/assets/team/harrison.jpg";
import "./TeamDetails.css";

export default function TeamDetails({ memberId = 1 }) {
  const [team, setTeam] = useState(INITIAL_TEAM_MEMBERS);
  const [currentMemberId, setCurrentMemberId] = useState(memberId);

  useEffect(() => {
    const loaded = getStoredTeam();
    setTeam(loaded);
    if (memberId !== undefined && memberId !== null) {
      setCurrentMemberId(memberId);
    } else if (loaded.length > 0) {
      setCurrentMemberId(loaded[0].id);
    }
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
  }, [memberId]);

  // Find active member or fallback to first
  const activeMember =
    team.find((m) => String(m.id) === String(currentMemberId)) || team[0];

  const otherMembers = team.filter((m) => String(m.id) !== String(activeMember?.id));

  return (
    <div className="teamDetailsPage">
      <PageHeader
        eyebrow="Specialist Instructor Profile"
        title={activeMember ? activeMember.name : "Instructor Profile"}
        text="Get to know the dedicated architects, engineers, and mentors driving high-quality education and digital solutions at Digital Skills House."
      />

      {/* Member Fast Navigation Tabs */}
      <section className="team-details__nav-bar" aria-label="Team Members Selector">
        <div className="container">
          <div className="team-details__nav-list">
            {team.map((m) => {
              const isActive = String(m.id) === String(activeMember?.id);
              return (
                <Link
                  key={m.id}
                  to={`/team-details/${m.id}`}
                  onClick={() => setCurrentMemberId(m.id)}
                  className={`team-details__nav-tab ${isActive ? "is-active" : ""}`}
                >
                  <img
                    src={m.image || defaultAvatar}
                    alt={m.name}
                    className="team-details__nav-avatar"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <div className="team-details__nav-text">
                    <span className="team-details__nav-name">{m.name}</span>
                    <span className="team-details__nav-role">{m.role.split(" ")[0]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="team-details">
        <div className="container">
          {activeMember ? (
            <ScrollReveal>
              <article className="team-details__card">
                {/* Left Column: Image, Socials, Quick Action */}
                <div className="team-details__left">
                  <div className="team-details__image-wrap">
                    <img
                      src={activeMember.image || defaultAvatar}
                      alt={activeMember.name}
                      className="team-details__img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <div className="team-details__avail-badge">
                      <span className="team-details__avail-dot" />
                      <span>Available for Hire</span>
                    </div>
                  </div>

                  {activeMember.social && (
                    <div className="team-details__social">
                      <h4 className="team-details__social-heading">
                        Connect with {activeMember.name.split(" ")[0]}
                      </h4>
                      <div className="team-details__social-links">
                        <a
                          href={activeMember.social.linkedin || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="team-details__social-link"
                          aria-label="LinkedIn"
                          title="LinkedIn Profile"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                            <circle cx="4" cy="4" r="2" />
                          </svg>
                        </a>
                        <a
                          href={activeMember.social.twitter || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="team-details__social-link"
                          aria-label="Twitter"
                          title="Twitter Profile"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                        </a>
                        <a
                          href={activeMember.social.facebook || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="team-details__social-link"
                          aria-label="Facebook"
                          title="Facebook Profile"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                          </svg>
                        </a>
                        <a
                          href={activeMember.social.youtube || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="team-details__social-link"
                          aria-label="YouTube"
                          title="YouTube Channel"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33zM9.75 15.02l5.75-3.27-5.75-3.27z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="team-details__left-cta">
                    <Button to="/contact" variant="primary">
                      Consult with {activeMember.name.split(" ")[0]}
                    </Button>
                  </div>
                </div>

                {/* Right Column: In-depth Profile Details */}
                <div className="team-details__content">
                  <div className="team-details__content-header">
                    <span className="team-details__role-pill">{activeMember.role}</span>
                    <h2 className="team-details__name">{activeMember.name}</h2>
                    <p className="team-details__skills-lead">{activeMember.skills}</p>
                  </div>

                  {/* Meta Specs Grid */}
                  <div className="team-details__meta-grid">
                    <div className="team-details__meta-item">
                      <span className="team-details__meta-label">Experience</span>
                      <span className="team-details__meta-value">{activeMember.years}</span>
                    </div>
                    <div className="team-details__meta-item">
                      <span className="team-details__meta-label">Education / Credentials</span>
                      <span className="team-details__meta-value">{activeMember.education}</span>
                    </div>
                    <div className="team-details__meta-item">
                      <span className="team-details__meta-label">Client Engagements</span>
                      <span className="team-details__meta-value">50+ Projects Shipped</span>
                    </div>
                    <div className="team-details__meta-item">
                      <span className="team-details__meta-label">Delivery SLA</span>
                      <span className="team-details__meta-value">100% On-Time</span>
                    </div>
                  </div>

                  {/* Biography */}
                  <div className="team-details__section-block">
                    <h3 className="team-details__section-title">Specialist Biography</h3>
                    <p className="team-details__bio">{activeMember.bio}</p>
                  </div>

                  {/* Experience Profile */}
                  {Array.isArray(activeMember.experience) && activeMember.experience.length > 0 && (
                    <div className="team-details__section-block">
                      <h3 className="team-details__section-title">Core Domain Competencies</h3>
                      <div className="team-details__skills-tags">
                        {activeMember.experience.map((item, i) => (
                          <div key={i} className="team-details__skill-tag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Achievements */}
                  {Array.isArray(activeMember.achievements) && activeMember.achievements.length > 0 && (
                    <div className="team-details__section-block">
                      <h3 className="team-details__section-title">Highlights & Key Milestones</h3>
                      <ul className="team-details__achievements-list">
                        {activeMember.achievements.map((achievement, i) => (
                          <li key={i} className="team-details__achievement-item">
                            <span className="team-details__achievement-bullet">✓</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            </ScrollReveal>
          ) : (
            <div className="team-details__not-found">
              <h2>Team Member Not Found</h2>
              <p>Sorry, we couldn't find the team member you're looking for.</p>
              <Button to="/team">Back to Team Roster</Button>
            </div>
          )}
        </div>

        {/* Separated Profiles for All Other Team Members */}
        {otherMembers.length > 0 && (
          <div className="container team-details__more-members">
            <ScrollReveal>
              <div className="team-details__more-header">
                <h3 className="team-details__more-title">Other Specialized Consultants</h3>
                <Link to="/team" className="team-details__view-all-link">
                  View Full Team Roster →
                </Link>
              </div>

              <div className="team-details__more-grid">
                {otherMembers.map((other) => (
                  <Link
                    key={other.id}
                    to={`/team-details/${other.id}`}
                    onClick={() => {
                      setCurrentMemberId(other.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="team-details__more-card"
                  >
                    <img
                      src={other.image || defaultAvatar}
                      alt={other.name}
                      className="team-details__more-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = defaultAvatar;
                      }}
                    />
                    <div className="team-details__more-info">
                      <h4 className="team-details__more-name">{other.name}</h4>
                      <span className="team-details__more-role">{other.role}</span>
                      <span className="team-details__more-action">View Full Profile →</span>
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
