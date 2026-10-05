import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import PageHeader from "../PageHeader/PageHeader";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import Button from "@/components/Button/Button";
import {
  getStoredBlogs,
  fetchBlogsFromDb,
  INITIAL_BLOGS,
} from "@/lib/blogsClient";
import { formatRelativeTime } from "@/lib/timeUtils";
import defaultBlogImg from "@/assets/blog-1.jpg";
import "./Blog.css";

export default function Blog() {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [, setTimeTick] = useState(0);

  // Ticker for live social media relative time updates every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync client storage and MongoDB Atlas on mount after hydration
  useEffect(() => {
    setBlogs(getStoredBlogs());
    let isMounted = true;
    fetchBlogsFromDb().then((data) => {
      if (isMounted && Array.isArray(data)) {
        setBlogs(data);
      }
    });

    const handleStorage = () => {
      setBlogs(getStoredBlogs());
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <div className="blogPage">
      {/* Top Header Wrapper */}
      <div className="blogPage-header-wrapper">
        <PageHeader
          eyebrow="Tech Blog &amp; IT Insights"
          title="Web development guides, SEO strategies, and career insights."
          text="Deep dives, tech tutorials, and freelance guides authored by Digital Skills House instructors and software engineers."
        />

        <div className="container blogPage__actions-bar">
          <div className="blogPage__count-badge">
            <span className="blogPage__count-dot" />
            <span>{blogs.length} Published Articles</span>
          </div>
        </div>
      </div>

      {/* Main Blog Grid */}
      <section className="blogPage__grid-section" aria-label="All Blog Articles">
        <div className="container">
          <div className="blogPage__grid">
            {blogs.map((blog, idx) => (
              <Link
                key={`blog-card-${blog.id || 'b'}-${idx}`}
                to={`/blog-details/${blog.id}`}
                className="blogPage__card-link"
                aria-label={`Read article: ${blog.title}`}
              >
                <article className="blogPage__card">
                  {/* Card Image */}
                  <div className="blogPage__card-image-wrap" style={{ height: "190px", overflow: "hidden", position: "relative" }}>
                    {(blog.url || blog.blog_link || blog.link) ? (
                      <div style={{ width: "100%", height: "100%", overflow: "hidden", background: "#0f172a" }}>
                        <iframe
                          src={`/api/proxy?url=${encodeURIComponent(blog.url || blog.blog_link || blog.link)}`}
                          title={blog.title}
                          style={{
                            width: "1280px",
                            height: "800px",
                            transform: "scale(0.32)",
                            transformOrigin: "top left",
                            border: "none",
                            pointerEvents: "none",
                            background: "#ffffff",
                          }}
                          loading="lazy"
                        />
                      </div>
                    ) : blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="blogPage__card-img"
                        loading="lazy"
                      />
                    ) : null}
                    <span className="blogPage__card-badge">{blog.category}</span>
                  </div>

                  {/* Card Body */}
                  <div className="blogPage__card-body">
                    <div className="blogPage__card-meta" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{formatRelativeTime(blog.createdAt || blog.timestamp || blog.date)}</span>
                      {(blog.url || blog.blog_link || blog.link) && (
                        <span style={{ fontSize: "0.72rem", color: "var(--brand-orange)", fontWeight: 700 }}>
                          {(() => {
                            try { return new URL(blog.url || blog.blog_link || blog.link).hostname.replace(/^www\./, ""); } catch { return "Original Link"; }
                          })()}
                        </span>
                      )}
                    </div>

                    <h3 className="blogPage__card-title">{blog.title}</h3>
                    <p className="blogPage__card-tagline">{blog.tagline}</p>

                    <div className="blogPage__card-footer">
                      <span className="blogPage__read-more-text">Read Case Study</span>
                      <div className="blogPage__arrow-circle">
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
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="blogPage__newsletter" aria-label="Newsletter Subscription">
        <div className="container">
          <div className="blogPage__newsletter-card">
            <div className="blogPage__newsletter-glow" aria-hidden="true" />
            <div className="blogPage__newsletter-content">
              <span className="blogPage__newsletter-tag">TECH BULLETIN</span>
              <h2 className="blogPage__newsletter-title">
                Stay Ahead of Changing Tech & Search Algorithms
              </h2>
              <p className="blogPage__newsletter-desc">
                Get monthly deep dives on full-stack architecture, Google ranking updates, mobile app toolchains, and enterprise software delivered to your inbox.
              </p>
              <div className="blogPage__newsletter-actions">
                <Button to="/contact">Get In Touch</Button>
                <Link to="/services" className="blogPage__services-cta">
                  Explore Our 9 Core Services →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoStrip />
    </div>
  );
}
