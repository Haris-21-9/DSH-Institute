import PageHeader from "../PageHeader/PageHeader";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import "./License.css";

export default function License() {
  return (
    <>
      <PageHeader
        eyebrow="License"
        title="License Information"
        text="Learn about the licenses and attributions for the resources used in this project."
      />

      <section className="license">
        <div className="container">
          <ScrollReveal>
            <div className="license__content">
              <div className="license__row">
                <h2 className="license__section-title">Font</h2>
                <div className="license__item">
                  <h3 className="license__item-title">DM Sans</h3>
                  <p className="license__item-text">
                    <a href="https://fonts.google.com/specimen/DM+Sans" target="_blank" rel="noopener noreferrer">DM Sans</a> font for free to create great typography. Create a custom image with your own words. This is taken from <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer">Google Fonts.</a>
                  </p>
                </div>
              </div>

              <div className="license__row">
                <h2 className="license__section-title">Image</h2>
                <div className="license__item">
                  <h3 className="license__item-title">Lummi</h3>
                  <p className="license__item-text">
                    <a href="https://lummi.ai" target="_blank" rel="noopener noreferrer">Lummi</a> has many free images created by top AI artists that you can use without paying royalties. These high-quality visuals are available for your presentations, websites, social media, and more, without any cost.
                  </p>
                </div>
              </div>

              <div className="license__row">
                <h2 className="license__section-title">Icon</h2>
                <div className="license__item">
                  <h3 className="license__item-title">Lucide</h3>
                  <p className="license__item-text">
                    This template features icons sourced from <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">Lucide</a>, available for personal and free use.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}