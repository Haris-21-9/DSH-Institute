import logoDark from "../../assets/Logo.png";
import logoWhite from "../../assets/logo-white.png";
import "./Logo.css";

/**
 * Colabify Brand Logo
 * @param {number} size - pixel dimensions (width/height)
 * @param {"dark" | "light"} variant - "dark" for light backgrounds, "light" for dark backgrounds
 * @param {string} className - extra CSS classes
 */
export default function Logo({ size = 40, variant = "dark", className = "" }) {
  const src = variant === "light" ? logoWhite : logoDark;

  return (
    <img
      src={src}
      alt="Digital Skills House Logo"
      width={size}
      height={size}
      className={`logo__image logo__image--${variant} ${className}`}
      loading="eager"
    />
  );
}