"use client";

export function usePrintTicket() {
  const print = async (
    element: HTMLElement,
    paperWidth: 58 | 80 = 80
  ) => {
    // Esperamos dos frames para asegurar que React terminó de renderizar
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const ticketWidth = `${paperWidth}mm`;

    // Clonamos exactamente el nodo renderizado
    const clone = element.cloneNode(true) as HTMLElement;

    // Contenedor temporal
    const printArea = document.createElement("div");
    printArea.id = "mobile-print-area";
    printArea.appendChild(clone);

    // CSS exclusivo para impresión
    const style = document.createElement("style");

    style.innerHTML = `
      @media screen {
        #mobile-print-area {
          display: none !important;
        }
      }

      @media print {

        @page {
          size: ${ticketWidth};
          margin: 0;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: ${ticketWidth} !important;
          min-width: ${ticketWidth} !important;
          max-width: ${ticketWidth} !important;
          overflow: hidden !important;
          background: white !important;
        }

        body > *:not(#mobile-print-area) {
          display: none !important;
        }

        #mobile-print-area {

          display: block !important;

          width: ${ticketWidth} !important;
          min-width: ${ticketWidth} !important;
          max-width: ${ticketWidth} !important;

          margin: 0 !important;
          padding: 0 !important;

          transform: none !important;
          zoom: 1 !important;
        }

        #mobile-print-area * {
          transform: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(printArea);

    // DEBUG
    console.log(
      "Ancho real del ticket:",
      element.getBoundingClientRect().width,
      "px"
    );
    const rect = element.getBoundingClientRect();

    console.table({
  widthPx: rect.width,
  widthMmEsperado: paperWidth,
});

    window.print();

    printArea.remove();
    style.remove();
  };

  return { print };
}