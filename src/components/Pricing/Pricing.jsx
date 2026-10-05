import Button from "../Button/Button";
import "./Pricing.css";

const PLANS = [
  {
    name: "Starter Plan",
    blurb: "Perfect for small businesses & startups.",
    price: "$299",
    features: [
      "Post up to 2 projects",
      "Access to verified consultants",
      "Secure payments",
      "Basic support",
    ],
    featured: false,
  },
  {
    name: "Growth Plan",
    blurb: "For teams who need more reach and lower fees.",
    price: "$999",
    features: [
      "Unlimited applications",
      "Priority profile listing",
      "Premium learning resources",
      "Reduced service fees",
    ],
    featured: true,
  },
  {
    name: "Enterprise Plan",
    blurb: "For top professionals scaling their business.",
    price: "$1200",
    features: [
      "Featured in client searches",
      "Exclusive project invitations",
      "Lowest platform fees",
      "Personal success manager",
    ],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section className="pricing">
      <div className="container">
        <div className="pricing__head">
          <h2 className="pricing__title">Pricing Choices</h2>
          <p className="pricing__text">
            Choose the plan that works best for you whether you're a business
            hiring talent or a freelancer offering your expertise.
          </p>
        </div>
        <div className="pricing__panel">
          {PLANS.map((plan) => (
            <article key={plan.name} className="pricing__card">
              <span className="pricing__icon" aria-hidden="true">
                ◫
              </span>
              <h3 className="pricing__name">{plan.name}</h3>
              <p className="pricing__blurb">{plan.blurb}</p>

              <div className="pricing__price">
                <strong>{plan.price}</strong>
                <span>/per month</span>
              </div>

              <ul className="pricing__features">
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <Button to="/contact" variant={plan.featured ? "primary" : "outline"}>
                Get Started
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
