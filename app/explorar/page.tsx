import AppHeader from "@/components/shared/AppHeader";
import ExplorarCatalogo from "@/components/explorar/ExplorarCatalogo";
import FooterPublico from "@/components/landing-publica/FooterPublico";
import { ColeccionesProvider } from "@/components/shared/ColeccionesProvider";
import { catalogoTiendanube } from "@/lib/catalogo-tiendanube";

export default function ExplorarPage() {
  return (
    <main className="bg-blanco">
      <AppHeader active="explorar" />
      <ColeccionesProvider>
        <ExplorarCatalogo productos={catalogoTiendanube} />
      </ColeccionesProvider>
      <FooterPublico />
    </main>
  );
}
