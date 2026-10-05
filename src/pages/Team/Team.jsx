import { useState, useEffect } from "react";
import PageHeader from "../PageHeader/PageHeader";
import Button from "@/components/Button/Button";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import { Link } from "@tanstack/react-router";
import {
  getStoredTeam,
  fetchTeamFromDb,
  INITIAL_TEAM_MEMBERS,
} from "@/lib/teamClient";
import defaultAvatar from "@/assets/team/harrison.jpg";
import "./Team.css";

export default function Team() {
  const [team, setTeam] = useState(INITIAL_TEAM_MEMBERS);

  // Keep state in sync with storage and MongoDB Atlas
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

  return (
    <>
      <div className="team-header-wrapper">
        <PageHeader
          eyebrow="Expert Instructors &amp; Specialists"
          title="Seasoned industry mentors, ready to elevate your career."
          text="Learn from certified domain leads with deep real-world project mastery in Full-Stack Web Development, SEO, Mobile Apps, Digital Marketing, and WordPress."
        />

        <div className="container team__actions-bar">
          <div className="team__count-badge">
            <span className="team__count-dot" />
            <span>{team.length} Active Domain Experts</span>
          </div>
        </div>
      </div>

      <section className="team">
        <div className="container team__grid">
          {team.map((p, idx) => (
            <Link key={`team-card-${p.id || 'm'}-${idx}`} to={`/team-details/${p.id}`} className="team__card-link">
              <article className="team__card">
                <div className="team__avatar-wrap">
                  <img
                    src={p.image || defaultAvatar}
                    alt={p.name}
                    className="team__avatar"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                  <span className="team__status-dot" title="Available for Consultation" />
                </div>
                <h3 className="team__name">{p.name}</h3>
                <span className="team__role">{p.role}</span>
                <p className="team__skills">{Array.isArray(p.skills) ? p.skills.join(", ") : p.skills}</p>
                <div className="team__card-more">
                  <span>View Member Profile →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="container team__cta">
          <Button to="/contact">Hire Our Team</Button>
        </div>
      </section>

      <LogoStrip />
    </>
  );
}
