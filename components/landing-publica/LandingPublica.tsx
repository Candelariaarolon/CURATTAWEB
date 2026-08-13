import HeaderPublico from "./HeaderPublico";
import HeroPublico from "./HeroPublico";
import ConectarPinterestSection from "./ConectarPinterestSection";
import ComoFuncionaSection from "./ComoFuncionaSection";
import FooterPublico from "./FooterPublico";

export default function LandingPublica() {
  return (
    <main className="bg-blanco">
      <HeaderPublico />
      <HeroPublico />
      <ConectarPinterestSection />
      <ComoFuncionaSection />
      <FooterPublico />
    </main>
  );
}
