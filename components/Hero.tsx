"use client";

import { useState } from "react";
import TexturedSection from "./TexturedSection";
import Modal from "./Modal";

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <TexturedSection
        texture="limestone"
        overlay="carbon"
        overlayOpacity={0.82}
        className="min-h-screen"
      >
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-between px-6 py-12 text-center md:px-10 md:py-16">
          <p className="font-serif text-3xl tracking-[0.45em] text-hueso sm:text-4xl md:text-5xl">
            CURATTA
          </p>

          <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
            <h1 className="max-w-3xl font-serif text-4xl leading-[1.15] text-hueso sm:text-5xl md:text-6xl lg:text-7xl">
              Tu inspiración de Pinterest, hecha realidad
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-hueso/75 sm:text-lg">
              Conectá tus tableros de moda y descubrí dónde comprar las prendas
              que amás, con inteligencia artificial que entiende tu estilo.
            </p>

            <div className="mt-4 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="w-full border border-cuero-dark bg-cuero-dark px-7 py-3 text-sm tracking-wide text-hueso transition duration-300 ease-in-out hover:bg-cuero-light hover:border-cuero-light sm:w-auto"
                style={{ borderRadius: "2px" }}
              >
                Conectar con Pinterest
              </button>

              <button
                type="button"
                onClick={() => smoothScrollTo("privacidad")}
                className="w-full border border-hueso/70 bg-transparent px-7 py-3 text-sm tracking-wide text-hueso transition duration-300 ease-in-out hover:bg-hueso hover:text-carbon sm:w-auto"
                style={{ borderRadius: "2px" }}
              >
                Ver política de privacidad
              </button>
            </div>
          </div>

          <div aria-hidden="true" className="h-6" />
        </div>
      </TexturedSection>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        labelledBy="modal-pinterest-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="modal-pinterest-title"
            className="font-serif text-2xl text-carbon"
          >
            Casi listo
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            aria-label="Cerrar"
            className="-mr-2 -mt-2 p-2 text-carbon/60 transition duration-300 ease-in-out hover:text-carbon"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M3 3L15 15M15 3L3 15" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-carbon/75">
          Estamos esperando la aprobación de la API de Pinterest para habilitar
          esta función. Mientras tanto, podés explorar cómo funciona Curatta en
          la demo.
        </p>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="border border-carbon/30 bg-transparent px-5 py-2.5 text-sm tracking-wide text-carbon transition duration-300 ease-in-out hover:bg-carbon/5"
            style={{ borderRadius: "2px" }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              setModalOpen(false);
              setTimeout(() => smoothScrollTo("demo"), 50);
            }}
            className="border border-cuero-dark bg-cuero-dark px-5 py-2.5 text-sm tracking-wide text-hueso transition duration-300 ease-in-out hover:bg-cuero-light hover:border-cuero-light"
            style={{ borderRadius: "2px" }}
          >
            Ver demo
          </button>
        </div>
      </Modal>
    </>
  );
}
