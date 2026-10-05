import { useState, useEffect } from "react";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import ProjectWebsite from "@/components/ProjectVideo/ProjectWebsite";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import {
  getStoredProjects,
  fetchProjectsFromDb,
  addProjectToDb,
  deleteProjectFromDb,
  SEED_PROJECTS,
  formatProjectItem,
} from "@/lib/projectsClient";
import { createProjectFromInternet } from "@/lib/webScraper";
import "./Projects.css";

export default function Projects() {
  // Constant initial state to guarantee SSR & Client initial hydration match
  const [projects, setProjects] = useState(() => SEED_PROJECTS.map((p, idx) => formatProjectItem(p, idx)));

  // Sync client storage and live PHP API endpoint on mount
  useEffect(() => {
    let isMounted = true;
    setProjects(getStoredProjects());

    fetchProjectsFromDb().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setProjects(data);
      }
    });

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
    <>
      <section className="projects-header">
        <div className="container">
          <div className="projects-header__top-row">
            <div>
              <h1 className="projects-header-title">Live Portfolio &amp; Agency Projects.</h1>
              <p className="projects-header-text">
                Explore real-world client platforms, eCommerce web applications, and live digital projects built by Digital Skills House engineers and our top trainees. Hover over any display to experience live continuous interactive website preview.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="container">
          <ScrollReveal stagger={true} staggerDelay={100}>
            <div className="projects__grid">
              {projects.map((p, idx) => (
                <ProjectWebsite
                  key={`projects-page-${p.id || 'p'}-${p.slug || ''}-${idx}`}
                  title={p.title}
                  thumbnail={p.image}
                  url={p.url || p.liveUrl || p.project_link}
                  liveUrl={p.liveUrl || p.url || p.project_link}
                  project_link={p.project_link || p.url || p.liveUrl}
                  slug={p.slug}
                  isFirstCard={idx === 0 || p.isFirstCard}
                  useIframe={p.useIframe}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <LogoStrip />
    </>
  );
}
