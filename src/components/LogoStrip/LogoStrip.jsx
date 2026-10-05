import { TECH_STACK } from "@/data/techStack";
import "./LogoStrip.css";

export default function LogoStrip({ 
  withHeader = false, 
  title = "Modern Full-Stack Technologies & Frameworks",
  badge = "TECH STACK & LANGUAGES"
}) {
  return (
    <section className="logoStrip" aria-label="Web Development Technologies & Stack">
      <div className="container">
        {withHeader && (
          <div className="logoStrip__header">
            <div className="logoStrip__badge">
              <span className="logoStrip__badge-dot" />
              <span>{badge}</span>
            </div>
            <h2 className="logoStrip__title">{title}</h2>
          </div>
        )}

        <div className="logoStrip__track">
          <div className="logoStrip__logos">
            {TECH_STACK.map(({ name, category, categoryType, Icon }, i) => (
              <div key={`${name}-${i}`} className="logoStrip__logo">
                <span className="logoStrip__icon">
                  <Icon />
                </span>
                <span className="logoStrip__logo-name">{name}</span>
                <span className={`logoStrip__category-chip logoStrip__category--${categoryType}`}>
                  {category}
                </span>
              </div>
            ))}
            {TECH_STACK.map(({ name, category, categoryType, Icon }, i) => (
              <div key={`${name}-dup-${i}`} className="logoStrip__logo">
                <span className="logoStrip__icon">
                  <Icon />
                </span>
                <span className="logoStrip__logo-name">{name}</span>
                <span className={`logoStrip__category-chip logoStrip__category--${categoryType}`}>
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
