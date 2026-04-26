import { toPng } from 'html-to-image';

export function usePrintTicket() {
  const print = (contentHtml: string) => {
    // 1. Creamos un contenedor para el área de impresión
    const printWindow = document.createElement("div");
    printWindow.id = "mobile-print-area";
    
    // Estilos para que solo sea visible al imprimir
    const style = document.createElement("style");
    style.innerHTML = `
      @media screen {
        #mobile-print-area { display: none !important; }
      }
      @media print {
        body > *:not(#mobile-print-area) { display: none !important; }
        #mobile-print-area { 
          display: block !important; 
          width: 100%;
        }
      }
    `;

    // 2. Capturamos los estilos de Tailwind para que el ticket se vea bien
    const existingStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('');

    // 3. Inyectamos el contenido
    printWindow.innerHTML = `
      ${existingStyles}
      <div class="force-print-area">
        ${contentHtml}
      </div>
    `;

    // 4. Limpieza y ejecución
    document.head.appendChild(style);
    document.body.appendChild(printWindow);

    // Pequeño delay para que el navegador móvil procese el nuevo DOM
    setTimeout(() => {
      window.print();
      
      // Limpiamos después de imprimir (o cancelar)
      setTimeout(() => {
        printWindow.remove();
        style.remove();
      }, 1000);
    }, 500);
  };

  const generateImage = async (element: HTMLElement, fileName: string) => {
    try {
      // Convertimos el HTML a una URL de datos (Base64)
      const dataUrl = await toPng(element, { 
        quality: 0.95,
        backgroundColor: '#ffffff', // Forzamos fondo blanco
        style: {
          visibility: 'visible', // Nos aseguramos que sea visible para la captura
        }
      });
      
      // Convertimos esa URL en un objeto de archivo real
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], `${fileName}.png`, { type: 'image/png' });
    } catch (err) {
      console.error("Error generando imagen del ticket", err);
      return null;
    }
  };

  return { print, generateImage };
}