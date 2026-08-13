import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/auth";
import AppHeader from "@/components/shared/AppHeader";
import MisColeccionesContent from "@/components/mis-colecciones/MisColeccionesContent";
import FooterPublico from "@/components/landing-publica/FooterPublico";
import { ColeccionesProvider } from "@/components/shared/ColeccionesProvider";

export default async function MisColeccionesPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="bg-blanco">
      <AppHeader active="colecciones" />

      <section className="relative isolate min-h-[50vh]">
        <Image
          src="/textures/kateryna-hliznitsova-2NDtPNiLcD0-unsplash.jpg"
          alt=""
          fill
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(251,248,243,0.94),rgba(251,248,243,0.97))]" />
        <ColeccionesProvider>
          <MisColeccionesContent />
        </ColeccionesProvider>
      </section>

      <FooterPublico />
    </main>
  );
}
