import { TECH_STACK } from "@/data/techStack";
import "./TrustBar.css";

export default function TrustBar() {
  return (
    <section className="trust" aria-label="Web Development Technologies & Stack">
      <div className="container">
        <div className="trust__header">
          <div className="trust__badge">
            <span className="trust__badge-dot" />
            <span>CORE TECH STACK &amp; LANGUAGES</span>
          </div>
          <h2 className="trust__title">Modern Technologies, Frameworks &amp; Programming Languages</h2>
        </div>
        <div className="trust__track">
          <div className="trust__logos">
            {TECH_STACK.map(({ name, category, categoryType, Icon }, i) => (
              <div key={`${name}-${i}`} className="trust__logo">
                <span className="trust__icon">
                  <Icon />
                </span>
                <span className="trust__logo-name">{name}</span>
                <span className={`trust__category-chip trust__category--${categoryType}`}>
                  {category}
                </span>
              </div>
            ))}
            {TECH_STACK.map(({ name, category, categoryType, Icon }, i) => (
              <div key={`${name}-dup-${i}`} className="trust__logo">
                <span className="trust__icon">
                  <Icon />
                </span>
                <span className="trust__logo-name">{name}</span>
                <span className={`trust__category-chip trust__category--${categoryType}`}>
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
