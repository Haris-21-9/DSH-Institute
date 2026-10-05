import { useEffect, useRef, useState } from "react";
import React from "react";
import "./ScrollReveal.css";

const ANIMATION_TYPES = {
  FADE_UP: "fade-up",
  FADE_IN: "fade-in",
  SLIDE_UP: "slide-up",
  SCALE_IN: "scale-in",
  SLIDE_LEFT: "slide-left",
  SLIDE_RIGHT: "slide-right",
};

const ScrollReveal = ({
  children,
  type = "fade-up",
  delay = 0,
  threshold = 0.15,
  className = "",
  stagger = false,
  staggerDelay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  const animationClass = ANIMATION_TYPES[type] || ANIMATION_TYPES.FADE_UP;

  if (stagger) {
    return (
      <div
        ref={elementRef}
        className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`}
        style={{ "--delay": `${delay}ms` }}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              className: `scroll-reveal__child ${child.props.className || ""}`,
              style: {
                ...(child.props.style || {}),
                "--stagger-delay": `${index * staggerDelay}ms`,
              },
            });
          }
          return child;
        })}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal--${animationClass} ${isVisible ? "is-visible" : ""} ${className}`}
      style={{ "--delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
