import { IOrder } from "../types/order";

export function usePrintTicket() {
  const print = (order: IOrder, contentHtml: string) => {
    const iframe = document.createElement("iframe");
    
    // Lo hacemos invisible para el usuario
    Object.assign(iframe.style, {
      position: "absolute",
      right: "10000px",
      top: "0",
      width: "0",
      height: "0",
      border: "none"
    });

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Capturamos los estilos de la App (Tailwind y globales)
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Locus_Ticket_${order.id.slice(-6)}</title>
          ${styles}
          <style>
            body { margin: 0; padding: 0; background: white !important; }
            @page { margin: 0; size: auto; }
            /* Forzamos visibilidad y ancho de ticketera */
            .force-print-area { 
              display: block !important; 
              visibility: visible !important; 
              width: 80mm; 
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="force-print-area">
            ${contentHtml}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.focus();
                window.print();
                window.frameElement.remove();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return { print };
}