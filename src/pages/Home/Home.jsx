import Hero from "@/components/Hero/Hero";
import TrustBar from "@/components/TrustBar/TrustBar";
import AboutIntro from "@/components/AboutIntro/AboutIntro";
import Services from "@/components/Services/Services";
import HomeProjects from "@/components/HomeProjects/HomeProjects";
import Testimonials from "@/components/Testimonials/Testimonials";
import LogoStrip from "@/components/LogoStrip/LogoStrip";
import ScrollReveal from "@/components/Animations/ScrollReveal";

export default function Home() {
  return (
    <>
      <Hero />
      <ScrollReveal>
        <TrustBar />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <AboutIntro />
      </ScrollReveal>
      <ScrollReveal delay={200}>
        <Services limit={5} />
      </ScrollReveal>
      <ScrollReveal delay={300}>
        <HomeProjects />
      </ScrollReveal>
      <ScrollReveal delay={400}>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal delay={500}>
        <LogoStrip />
      </ScrollReveal>
    </>
  );
}
