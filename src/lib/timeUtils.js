/**
 * Format timestamp or ISO date string into live social-media style relative time
 * (e.g. "Just now", "2 mins ago", "1 hour ago", "3 days ago")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "Just now";

  let dateObj;
  if (typeof dateInput === "number") {
    dateObj = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === "string") {
    const parsed = Date.parse(dateInput);
    if (!isNaN(parsed)) {
      dateObj = new Date(parsed);
    } else {
      // Fallback for non-parsable formatted date strings like "Sep 22, 2026"
      return dateInput;
    }
  } else {
    return "Just now";
  }

  const now = Date.now();
  const diffSec = Math.floor((now - dateObj.getTime()) / 1000);

  if (diffSec < 0) return "Just now";
  if (diffSec < 45) return "Just now";
  if (diffSec < 90) return "1 min ago";
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }
  if (diffSec < 7200) return "1 hour ago";
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffSec < 172800) return "1 day ago";
  if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    return `${days} days ago`;
  }
  if (diffSec < 2592000) {
    const weeks = Math.floor(diffSec / 604800);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Calculate reading time automatically based on word count
 * (average adult reading speed ~ 180-200 words per minute)
 */
export function calculateReadTime(text = "") {
  if (!text || typeof text !== "string") return "2 min read";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}
