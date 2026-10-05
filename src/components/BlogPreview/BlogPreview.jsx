import { Link } from "@tanstack/react-router";
import { BLOGS } from "@/data/blogs";
import "./BlogPreview.css";

export default function BlogPreview() {
  // Take top 3 articles for the home page showcase
  const featuredPosts = BLOGS.slice(0, 3);

  return (
    <section className="blogPrev" id="blog-section" aria-label="Latest Articles & Insights">
      {/* Subtle Ambient Radial Glow */}
      <div className="blogPrev__ambient-glow" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <header className="blogPrev__header">
          <div className="blogPrev__header-left">
            <div className="blogPrev__tag">
              <span className="blogPrev__tag-dot" />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="blogPrev__tag-icon">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>LATEST INSIGHTS & ENGINEERING ARTICLES</span>
            </div>
            <h2 className="blogPrev__title">
              Insights, Tips & Guides to <span className="blogPrev__title-gradient">Power Your Growth</span>
            </h2>
            <p className="blogPrev__subheading">
              Practical guides on modern web development, SEO domination, cross-platform mobile apps, and custom enterprise software straight from our specialist leads.
            </p>
          </div>

          <div className="blogPrev__header-action">
            <Link to="/blog" className="blogPrev__all-btn">
              <span>View All Articles</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </header>

        {/* 3-Column Modern Blog Cards Grid */}
        <div className="blogPrev__grid">
          {featuredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog-details/${post.id}`}
              className="blogPrev__card-link"
              aria-label={`Read article: ${post.title}`}
            >
              <article className="blogPrev__card">
                {/* Image Frame with Floating Badge */}
                <div className="blogPrev__image-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    width={600}
                    height={380}
                    className="blogPrev__img"
                  />
                  <div className="blogPrev__image-overlay" />
                  <span className="blogPrev__category-badge">{post.category}</span>
                </div>

                {/* Card Content Body */}
                <div className="blogPrev__body">
                  <div className="blogPrev__meta-row">
                    <span className="blogPrev__date">{post.date}</span>
                    <span className="blogPrev__meta-dot">•</span>
                    <span className="blogPrev__read-time">{post.readTime}</span>
                  </div>

                  <h3 className="blogPrev__card-title">{post.title}</h3>
                  <p className="blogPrev__tagline">{post.tagline}</p>

                  {/* Author and Action Row */}
                  <div className="blogPrev__footer">
                    <div className="blogPrev__author">
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="blogPrev__author-avatar"
                        loading="lazy"
                        width={38}
                        height={38}
                      />
                      <div className="blogPrev__author-info">
                        <span className="blogPrev__author-name">{post.author}</span>
                        <span className="blogPrev__author-role">{post.authorRole}</span>
                      </div>
                    </div>

                    <div className="blogPrev__arrow-btn" aria-hidden="true">
                      <svg
                        width="15"
                        height="15"
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
  );
}
