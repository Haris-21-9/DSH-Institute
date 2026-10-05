import PageHeader from "../PageHeader/PageHeader";
import AboutIntro from "@/components/AboutIntro/AboutIntro";
import Testimonials from "@/components/Testimonials/Testimonials";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import "./About.css";

const VALUES = [
  {
    title: "100% Practical & Project-Based",
    text: "Every course and project at Digital Skills House involves live coding, real client work, and demonstrable outcomes.",
  },
  {
    title: "Industry-Certified Mentorship",
    text: "Learn directly from senior software engineers, SEO leads, and full-stack agency veterans.",
  },
  {
    title: "Career & Freelance Success",
    text: "Comprehensive support for Upwork, Fiverr, international client acquisition, and high-paying tech jobs.",
  },
];

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="About Digital Skills House"
        title="Empowering the Next Generation of IT Professionals & Innovators."
        text="Digital Skills House is an FBR & PSEB registered premier IT institute and digital agency in Multan, Pakistan. We provide hands-on training in Web Development, SEO, Mobile Apps, Digital Marketing, and WordPress."
      />
      <AboutIntro />

      <section className="aboutValues">
        <div className="container aboutValues__grid">
          {VALUES.map((v) => (
            <article key={v.title} className="aboutValues__card">
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      <Testimonials />
      <LogoStrip />
    </>
  );
}
