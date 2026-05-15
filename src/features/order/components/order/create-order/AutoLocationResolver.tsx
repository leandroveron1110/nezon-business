// features/locationSelector/hooks/useAutoResolveLocation.ts
import { useState } from "react";
import { EsriProvider } from "leaflet-geosearch";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { AddressData } from "@/features/locationSelector/types/address-data";

export function useAutoResolveLocation() {
  const [isResolving, setIsResolving] = useState(false);
  const { addAlert } = useAlert();

  const resolve = async (streetAndNumber: string): Promise<AddressData | null> => {
    if (!streetAndNumber || streetAndNumber.length < 3) return null;

    setIsResolving(true);
    const provider = new EsriProvider();
    const city = "Concepción del Uruguay";
    const fullQuery = `${streetAndNumber}, ${city}, Entre Ríos, Argentina`;

    try {
      // Pedimos los resultados a ESRI
      const results = await provider.search({ query: fullQuery });

      if (results.length > 0) {
        const best = results[0];
        
        // --- VALIDACIÓN CRÍTICA ---
        // Accedemos a la data cruda de ESRI que viene en 'raw'
        // Si el tipo de dirección es 'Locality', significa que no encontró la calle 
        // y nos mandó al centro de la ciudad.
        const addrType = best.raw?.feature?.attributes?.Addr_Type || "";
        
        if (addrType === "Locality" || addrType === "City") {
          console.warn("Falso positivo: ESRI devolvió el centro de la ciudad.");
          return null; // Devolvemos null para que el componente dispare el reintento con alias
        }

        // Si llegamos aquí, es StreetName o PointAddress (resultado válido)
        const parts = streetAndNumber.trim().split(" ");
        const number = parts.length > 1 ? parts.pop() : null;
        const streetName = parts.join(" ");

        return {
          street: streetName,
          number: number || null,
          city,
          province: "Entre Ríos",
          country: "Argentina",
          latitude: best.y,
          longitude: best.x,
          notes: "",
        };
      }
      
      return null;
    } catch (err) {
      console.error("Error en geocodificación:", err);
      return null;
    } finally {
      setIsResolving(false);
    }
  };

  return { resolve, isResolving };
}