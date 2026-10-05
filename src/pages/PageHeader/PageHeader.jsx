import { useEffect, useState } from "react";
import "./PageHeader.css";

export default function PageHeader({ eyebrow, title, text }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="pageHeader">
      <div className="container">
        {eyebrow && (
          <span className={`eyebrow animate-fade-in ${isVisible ? 'animate-delay-100' : ''}`}>
            {eyebrow}
          </span>
        )}
        <h1 className={`pageHeader__title animate-fade-in-up ${isVisible ? 'animate-delay-200' : ''}`}>
          {title}
        </h1>
        {text && (
          <p className={`pageHeader__text animate-fade-in-up ${isVisible ? 'animate-delay-300' : ''}`}>
            {text}
          </p>
        )}
      </div>
    </section>
  );
}
