import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import "./Header.css";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Projects", to: "/projects", hasDropdown: true, dropdown: [{ label: "Projects", to: "/projects" }, { label: "Project Details", to: "/project-details" }] },
  { label: "Team", to: "/team", hasDropdown: true, dropdown: [{ label: "Team", to: "/team" }, { label: "Team Details", to: "/team-details" }] },
  {
    label: "Blog",
    to: "/blog",
    hasDropdown: true,
    dropdown: [
      { label: "Blog", to: "/blog" },
      { label: "Blog Details", to: "/blog-details" },
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown whenever clicking anywhere on screen
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleScreenClick = (event) => {
      // If clicked inside the toggle button itself, handleDropdownToggle will handle the toggle
      if (event.target.closest(".header__dropdown-toggle")) {
        return;
      }
      setDropdownOpen(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(null);
        setOpen(false);
      }
    };

    // Attach click listener on next tick so the click that opened it doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener("click", handleScreenClick);
      document.addEventListener("keydown", handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleScreenClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleDropdownToggle = (label) => {
    setDropdownOpen(dropdownOpen === label ? null : label);
  };

  const handleNavClick = () => {
    setOpen(false);
    setDropdownOpen(null);
  };

  return (
    <header className={`header ${isScrolled ? "is-scrolled" : ""}`}>
      <div className="container header__inner">
        <Link to="/" className="header__brand" onClick={handleNavClick}>
          <Logo className="header__logo" />
          <span className="header__name">Digital Skills House</span>
        </Link>

        <nav className={`header__nav ${open ? "is-open" : ""}`}>
          {NAV.map((item) => (
            <div key={item.to} className="header__nav-item">
              {item.hasDropdown ? (
                <>
                  <button
                    className="header__link link-underline header__dropdown-toggle"
                    onClick={() => handleDropdownToggle(item.label)}
                    aria-expanded={dropdownOpen === item.label}
                  >
                    {item.label}
                    <span className="header__dropdown-arrow">▼</span>
                  </button>
                  {dropdownOpen === item.label && (
                    <div className="header__dropdown">
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.to}
                          to={dropdownItem.to}
                          className="header__dropdown-link"
                          onClick={handleNavClick}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.to}
                  className="header__link link-underline"
                  activeProps={{ className: "header__link is-active" }}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={handleNavClick}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="header__nav-cta">
            <Button to="/contact" onClick={handleNavClick}>Contact Us</Button>
          </div>
        </nav>

        <div className="header__cta">
          <Button to="/contact" onClick={handleNavClick}>Contact Us</Button>
        </div>

        <button
          type="button"
          className="header__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
