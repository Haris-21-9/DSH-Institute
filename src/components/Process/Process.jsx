import Button from "../Button/Button";
import processMan from "@/assets/process-man.jpg";
import "./Process.css";

const STEPS = [
  {
    no: "01",
    icon: "➤",
    title: "Share Your Needs",
    text: "Post your project or describe the challenge your business is facing. The more details you give, the better we can match you with the right expert.",
  },
  {
    no: "02",
    icon: "☺",
    title: "Get Matched with Experts",
    text: "We connect you with vetted freelancers and consultants who have the exact skills and experience you need. Review profiles, proposals.",
  },
  {
    no: "03",
    icon: "☍",
    title: "Collaborate Seamlessly",
    text: "Work together through our secure platform. Chat, share files, and track progress in one place for a smooth workflow.",
  },
  {
    no: "04",
    icon: "▤",
    title: "Pay with Confidence",
    text: "Funds stay protected until milestones are approved, so every payment is released only when the work meets your expectations.",
  },
];

export default function Process() {
  return (
    <section className="process">
      <div className="container process__inner">
        <div className="process__left">
          <h2 className="process__title">
            Simple, transparent, and built to get results.
          </h2>
          <p className="process__text">
            Unlock your company’s full potential with expert guidance tailored
            to your goals. Our consulting services help streamline operations.
          </p>
          <div className="process__cta">
            <Button to="/contact">Get Started Today</Button>
          </div>

          <div className="process__media">
            <img
              src={processMan}
              alt="Freelancer working on a laptop from a bean bag chair"
              loading="lazy"
              width={900}
              height={900}
            />
            <button
              type="button"
              className="process__play"
              aria-label="Play video"
            >
              ▶
            </button>
          </div>
        </div>

        <ol className="process__steps">
          {STEPS.slice(0, 3).map((step) => (
            <li key={step.no} className="process__step">
              <span className="process__no">{step.no}</span>
              <article className="process__card">
                <span className="process__icon" aria-hidden="true">
                  {step.icon}
                </span>
                <h3 className="process__cardTitle">{step.title}</h3>
                <p className="process__cardText">{step.text}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
