import { Link } from "@tanstack/react-router";
import "./Button.css";

/**
 * Shared button. variant: "primary" | "outline" | "ghost"
 * Pass `to` to render a router link, otherwise it is a <button>.
 */
export default function Button({
  children,
  variant = "primary",
  to,
  arrow = true,
  onClick,
  type = "button",
  className = "",
}) {
  const classes = `btn btn--${variant} button-animate ${className}`.trim();
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <span className="btn__arrow button-icon">&#8594;</span>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {inner}
    </button>
  );
}
