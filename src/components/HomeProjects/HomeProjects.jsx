import { useState, useEffect } from "react";
import ProjectWebsite from "../ProjectVideo/ProjectWebsite";
import Button from "../Button/Button";
import { getStoredProjects, fetchProjectsFromDb, SEED_PROJECTS } from "@/lib/projectsClient";
import "./HomeProjects.css";

export default function HomeProjects() {
  const [projects, setProjects] = useState(SEED_PROJECTS);

  useEffect(() => {
    setProjects(getStoredProjects());
    let isMounted = true;
    fetchProjectsFromDb().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setProjects(data);
      }
    });

    // Listen for storage changes if added in another tab/action
    const handleStorage = () => {
      setProjects(getStoredProjects());
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <section className="homeProjects" id="projects-section" aria-label="Featured Projects & Case Studies">
      {/* Ambient Radial Mesh & Warm Atmospheric Glow */}
      <div className="homeProjects__ambient-glow" aria-hidden="true" />
      <div className="homeProjects__ambient-glow-secondary" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <header className="homeProjects__header">
          <div className="homeProjects__tag">
            <span className="homeProjects__tag-dot" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="homeProjects__tag-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>LIVE PORTFOLIO &amp; AGENCY PROJECTS</span>
          </div>

          <div className="homeProjects__header-row">
            <h2 className="homeProjects__title">
              Proven Results, <span className="homeProjects__title-gradient">Real-World Projects</span>
            </h2>
            <p className="homeProjects__subheading">
              Explore live interactive web platforms, eCommerce systems, and client solutions engineered by Digital Skills House. Hover over any screen to preview continuous live website scrolling.
            </p>
          </div>
        </header>

        {/* Screen Cards Grid with Interactive Scroll - Showing 3 Newest Projects */}
        <div className="homeProjects__grid">
          {projects.slice(0, 3).map((p, idx) => (
            <ProjectWebsite
              key={`home-proj-${p.id || 'p'}-${p.slug || ''}-${idx}`}
              title={p.title}
              thumbnail={p.image}
              url={p.url || p.liveUrl || p.project_link}
              liveUrl={p.liveUrl || p.url || p.project_link}
              project_link={p.project_link || p.url || p.liveUrl}
              slug={p.slug}
              isFirstCard={idx === 0}
              useIframe={p.useIframe}
            />
          ))}
        </div>

        {/* Footer Action Bar */}
        <div className="homeProjects__action-row">
          <div className="homeProjects__action-cta">
            <Button to="/projects">View All {projects.length} Projects</Button>
          </div>
          <div className="homeProjects__action-hint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Over 100+ Live Client &amp; Student Deployments Launched</span>
          </div>
        </div>
      </div>
    </section>
  );
}
