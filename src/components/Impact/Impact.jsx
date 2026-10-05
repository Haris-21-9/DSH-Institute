import clock from "@/assets/clock.PNG";
import colorfulPens from "@/assets/colorful_pens.jpg";
import "./Impact.css";

export default function Impact() {
  return (
    <section className="impact">
      <div className="container">
        <div className="impact__head">
          <h2 className="impact__title">
            Master High-Demand Tech Skills. Build Global Careers.
          </h2>
          <p className="impact__text">
            At Digital Skills House, every course and project is more than just lectures — it is a hands-on opportunity to build real-world software, master in-demand tools, and launch a successful freelancing or corporate career.
          </p>
        </div>

        <div className="impact__grid">
          <img
            src={clock}
            alt="Impact clock image"
            loading="lazy"
            width={920}
            height={920}
          />
          <img
            src={colorfulPens}
            alt="Impact colorful pens image"
            loading="lazy"
            width={920}
            height={920}
          />
        </div>
      </div>
    </section>
  );
}
