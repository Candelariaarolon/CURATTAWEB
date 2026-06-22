import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import PrivacyPolicy from "@/components/PrivacyPolicy";

export default function Page() {
  return (
    <main id="top">
      <Hero />

      <section id="demo" aria-label="Demo">
        <Demo />
      </section>

      <section id="privacidad" aria-label="Política de privacidad">
        <PrivacyPolicy />
      </section>
    </main>
  );
}
