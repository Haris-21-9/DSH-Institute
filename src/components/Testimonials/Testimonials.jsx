import { useState, useEffect, useCallback, useRef } from "react";
import { Star, MessageSquarePlus, X, CheckCircle2, UploadCloud, Sparkles } from "lucide-react";
import {
  getStoredReviews,
  fetchReviewsFromDb,
  addReviewToDb,
  INITIAL_REVIEWS,
} from "@/lib/reviewsClient";
import "./Testimonials.css";

export default function Testimonials() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    tag: "Web Development",
    rating: 5,
    title: "",
    quote: "",
    avatar: "",
  });

  const loadReviews = useCallback(async () => {
    try {
      const data = await fetchReviewsFromDb();
      if (data && Array.isArray(data) && data.length > 0) {
        setReviews(data);
      }
    } catch {
      setReviews(getStoredReviews());
    }
  }, []);

  // Load reviews on mount and listen to updates
  useEffect(() => {
    setReviews(getStoredReviews());
    loadReviews();

    const handleStorage = () => {
      setReviews(getStoredReviews());
    };

    const handleReviewEvent = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setReviews(e.detail);
      } else {
        setReviews(getStoredReviews());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("colabify_reviews_updated", handleReviewEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("colabify_reviews_updated", handleReviewEvent);
    };
  }, [loadReviews]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, avatar: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quote) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      tag: form.tag || "Student Review",
      rating: Number(form.rating) || 5,
      title: form.title.trim() || "Exceptional Experience at DSH",
      quote: form.quote.trim(),
      author: {
        name: form.name.trim(),
        role: form.role.trim() || "Student / Graduate",
        company: form.company.trim() || "Digital Skills House",
        avatar: form.avatar || "",
        verified: true,
      },
      createdAt: new Date().toISOString(),
    };

    // Immediately update UI view
    setReviews((prev) => [newReview, ...prev].slice(0, 6));

    // Close modal & display success alert
    setShowModal(false);
    setSuccessToast("Thank you! Your review has been saved to the database and published.");
    setTimeout(() => setSuccessToast(""), 4500);

    setForm({
      name: "",
      role: "",
      company: "",
      tag: "Web Development",
      rating: 5,
      title: "",
      quote: "",
      avatar: "",
    });

    // Save to MongoDB Atlas & backend
    try {
      await addReviewToDb(newReview);
    } catch (err) {
      console.warn("Backend review save error:", err);
    }
  };

  // Limit to exactly 6 reviews
  const displayedReviews = reviews.slice(0, 6);

  return (
    <section className="testi" id="testimonials">
      <div className="container">
        {/* Header Section */}
        <div className="testi__head">
          <div className="testi__badge">
            <span className="testi__badge-dot" />
            <span>STUDENT SUCCESS &amp; CLIENT REVIEWS</span>
          </div>

          <h2 className="testi__title">Real stories from our students &amp; business partners.</h2>
          <p className="testi__sub">
            Discover how Digital Skills House empowers students to build lucrative freelance careers, secure tech roles, and assists businesses with industry-grade software solutions.
          </p>

          {/* Social Proof Bar & Write Review CTA */}
          <div className="testi__action-bar">
            <div className="testi__proof-bar">
              <div className="testi__proof-item">
                <span className="testi__proof-stars">★★★★★</span>
                <strong>4.9 / 5.0</strong>
                <span>Student Rating</span>
              </div>
              <div className="testi__proof-divider" />
              <div className="testi__proof-item">
                <strong>5,000+</strong>
                <span>Students Trained</span>
              </div>
              <div className="testi__proof-divider" />
              <div className="testi__proof-item">
                <strong>100%</strong>
                <span>Practical Projects</span>
              </div>
            </div>

            {/* Write a Review Button */}
            <button
              type="button"
              className="testi__write-btn"
              onClick={() => setShowModal(true)}
              title="Share your feedback or experience with Digital Skills House"
            >
              <MessageSquarePlus size={18} />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Success Toast */}
          {successToast && (
            <div className="testi__success-alert">
              <CheckCircle2 size={18} />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* 6 Clean Review Cards Grid (3x2 Desktop, 2x3 Tablet, 1 col Mobile) */}
        <div className="testi__grid">
          {displayedReviews.map((item) => {
            const authorInitial = item.author?.name ? item.author.name.charAt(0).toUpperCase() : "S";

            return (
              <article key={item.id} className="testi__card">
                {/* Top card metadata */}
                <div className="testi__card-top">
                  <span className="testi__card-tag">{item.tag}</span>
                  <div className="testi__stars">
                    <span className="testi__stars-icons">{"★".repeat(item.rating || 5)}</span>
                    <span className="testi__stars-score">{item.rating || 5}.0</span>
                  </div>
                </div>

                {/* Card Title & Quote */}
                <div className="testi__card-body">
                  <h3 className="testi__card-title">{item.title}</h3>
                  <p className="testi__quote">“{item.quote}”</p>
                </div>

                {/* Author footer */}
                <footer className="testi__person">
                  <div className="testi__avatar-wrap">
                    {item.author?.avatar ? (
                      <img
                        src={item.author.avatar}
                        alt={item.author.name}
                        className="testi__avatar-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="testi__avatar-initial">
                        {authorInitial}
                      </div>
                    )}
                    {item.author?.verified && (
                      <span className="testi__verified-badge" title="Verified Student / Client">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="testi__person-info">
                    <strong className="testi__person-name">{item.author?.name || "Student"}</strong>
                    <span className="testi__person-role">{item.author?.role || "Graduate"}</span>
                    <span className="testi__person-company">{item.author?.company || "Digital Skills House"}</span>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </div>

      {/* ─── WRITE A REVIEW MODAL ─── */}
      {showModal && (
        <div className="testi__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="testi__modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="testi__modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div className="testi__modal-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="testi__modal-title">Share Your Review</h3>
                  <p className="testi__modal-subtitle">Saved securely to MongoDB Atlas database.</p>
                </div>
              </div>
              <button
                type="button"
                className="testi__modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="testi__modal-form">
              {/* Star Rating Selector */}
              <div className="testi__form-group">
                <label className="testi__form-label">Overall Rating *</label>
                <div className="testi__star-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={`star-${star}`}
                      type="button"
                      className={`testi__star-btn ${star <= form.rating ? "is-selected" : ""}`}
                      onClick={() => setForm({ ...form, rating: star })}
                    >
                      ★
                    </button>
                  ))}
                  <span className="testi__rating-text">
                    {form.rating === 5 ? "5.0 - Outstanding" : `${form.rating}.0 Stars`}
                  </span>
                </div>
              </div>

              {/* Full Name & Course / Role */}
              <div className="testi__form-row">
                <div className="testi__form-group">
                  <label className="testi__form-label">Your Name *</label>
                  <input
                    type="text"
                    className="testi__form-input"
                    placeholder="e.g. Ali Raza"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="testi__form-group">
                  <label className="testi__form-label">Course / Current Role</label>
                  <input
                    type="text"
                    className="testi__form-input"
                    placeholder="e.g. Web Dev Graduate"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>

              {/* Category & Headline */}
              <div className="testi__form-row">
                <div className="testi__form-group">
                  <label className="testi__form-label">Skill / Program</label>
                  <select
                    className="testi__form-input"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="SEO & Digital Marketing">SEO &amp; Digital Marketing</option>
                    <option value="WordPress & eCommerce">WordPress &amp; eCommerce</option>
                    <option value="UI/UX & Design">UI/UX &amp; Design</option>
                    <option value="Custom Software">Custom Software &amp; ERP</option>
                  </select>
                </div>
                <div className="testi__form-group">
                  <label className="testi__form-label">Review Headline</label>
                  <input
                    type="text"
                    className="testi__form-input"
                    placeholder="e.g. Best Tech Institute in Multan!"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              {/* Review Quote Text */}
              <div className="testi__form-group">
                <label className="testi__form-label">Your Review &amp; Experience *</label>
                <textarea
                  className="testi__form-textarea"
                  rows="3"
                  placeholder="Share what you learned, mentorship experience, and outcomes achieved..."
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="testi__form-group">
                <label className="testi__form-label">Profile Photo (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />

                {!form.avatar ? (
                  <div
                    className="testi__photo-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud size={20} color="var(--brand-orange, #ff6b00)" />
                    <span>Click to upload photo from your device</span>
                  </div>
                ) : (
                  <div className="testi__photo-preview-box">
                    <img src={form.avatar} alt="Avatar preview" className="testi__photo-preview-img" />
                    <button
                      type="button"
                      className="testi__photo-remove-btn"
                      onClick={() => setForm({ ...form, avatar: "" })}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="testi__modal-footer">
                <button
                  type="button"
                  className="testi__btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="testi__btn-submit">
                  Submit &amp; Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
