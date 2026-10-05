import davidImg from "@/assets/team/david.jpg";
import sarahImg from "@/assets/team/sarah.jpg";
import marcoImg from "@/assets/team/marco.jpg";
import aminaImg from "@/assets/team/amina.jpg";
import harrisonImg from "@/assets/team/harrison.jpg";
import scottImg from "@/assets/team/scott.jpg";

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    tag: "Web Development",
    rating: 5,
    title: "Landed My Dream Developer Role",
    quote:
      "Digital Skills House transformed my coding journey. Building live full-stack React and Node.js projects gave me the practical confidence to secure a remote software role within 2 months of graduating.",
    author: {
      name: "David Turner",
      role: "Full-Stack Graduate",
      company: "Remote Software Engineer",
      avatar: davidImg,
      verified: true,
    },
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "rev-2",
    tag: "Mobile Apps",
    rating: 5,
    title: "Production-Ready Mobile App Skills",
    quote:
      "The Flutter and React Native course was 100% practical. I built and published two apps on Google Play Store before completing the program. The mentors are outstanding industry leaders.",
    author: {
      name: "Sarah Lindqvist",
      role: "Mobile App Student",
      company: "Freelance App Developer",
      avatar: sarahImg,
      verified: true,
    },
    createdAt: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "rev-3",
    tag: "Custom Software",
    rating: 5,
    title: "Outstanding Enterprise Delivery",
    quote:
      "We collaborated with Digital Skills House for our company's cloud-based inventory automation. Their engineering team delivered exceptional code quality, on-time and with zero downtime.",
    author: {
      name: "Marco Bellini",
      role: "Operations Director",
      company: "PrimeTech Solutions",
      avatar: marcoImg,
      verified: true,
    },
    createdAt: "2026-02-28T14:30:00.000Z",
  },
  {
    id: "rev-4",
    tag: "SEO & Digital Marketing",
    rating: 5,
    title: "Quadrupled Client Organic Traffic",
    quote:
      "The advanced SEO and performance marketing modules gave me actionable strategies. I scaled my agency's client revenue and achieved top 3 Google rankings for high-intent keywords.",
    author: {
      name: "Amina Rahman",
      role: "SEO Specialist",
      company: "Digital Growth Lead",
      avatar: aminaImg,
      verified: true,
    },
    createdAt: "2026-03-05T09:15:00.000Z",
  },
  {
    id: "rev-5",
    tag: "UI/UX & Design",
    rating: 5,
    title: "World-Class Design Mentorship",
    quote:
      "Learning Figma, design systems, and user behavior from real architects changed everything. My portfolio stood out immediately and landed me top freelance contracts on Upwork.",
    author: {
      name: "Harrison Baker",
      role: "Product Designer",
      company: "Top-Rated Freelancer",
      avatar: harrisonImg,
      verified: true,
    },
    createdAt: "2026-03-12T16:45:00.000Z",
  },
  {
    id: "rev-6",
    tag: "WordPress & eCommerce",
    rating: 5,
    title: "Built 4 Profitable Online Stores",
    quote:
      "From custom WooCommerce workflows to high-speed themes and payment gateways, the training was comprehensive and hands-on. Best IT training institute in Multan by far.",
    author: {
      name: "Scott Miles",
      role: "eCommerce Graduate",
      company: "eCom Store Owner",
      avatar: scottImg,
      verified: true,
    },
    createdAt: "2026-03-20T11:00:00.000Z",
  },
];

const STORAGE_KEY = "colabify_published_reviews";

/**
 * Get stored reviews from local storage
 */
export function getStoredReviews() {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Reviews storage read error:", e);
  }
  return INITIAL_REVIEWS;
}

/**
 * Save reviews to localStorage and notify listeners
 */
export function saveStoredReviews(reviews) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("colabify_reviews_updated", { detail: reviews }));
  } catch (e) {
    console.error("Reviews storage write error:", e);
  }
}

/**
 * Fetch reviews from Atlas / DB endpoint
 */
export async function fetchReviewsFromDb() {
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/atlas/reviews", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.reviews) && json.reviews.length > 0) {
          saveStoredReviews(json.reviews);
          return json.reviews;
        }
      }
    } catch {
      // Atlas proxy fallback
    }
  }

  return getStoredReviews();
}

/**
 * Add a new review and save to MongoDB Atlas & local storage
 */
export async function addReviewToDb(newReview) {
  const current = getStoredReviews();
  const updated = [newReview, ...current.filter((r) => String(r.id) !== String(newReview.id))];
  saveStoredReviews(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
    } catch (err) {
      console.warn("MongoDB Atlas review save notice:", err);
    }
  }

  return updated;
}

/**
 * Delete a review from MongoDB Atlas & local storage
 */
export async function deleteReviewFromDb(reviewId) {
  const current = getStoredReviews();
  const updated = current.filter((r) => String(r.id) !== String(reviewId));
  saveStoredReviews(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId }),
      });
    } catch (err) {
      console.warn("MongoDB Atlas review delete notice:", err);
    }
  }

  return updated;
}
