// src/components/LocationSelector.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { EsriProvider } from "leaflet-geosearch"; 
import AddressInput from "../AddressInput";
import LocationReview from "./components/LocationReview";
import ConfirmationCard from "../ConfirmationCard";
import { AddressData } from "../../types/address-data";
import { useAlert } from "@/features/common/ui/Alert/Alert";

const MapComponent = dynamic(() => import("./components/Map"), { ssr: false });

interface LocationSelectorProps {
  onSave: (data: AddressData) => void;
}

const LocationSelector = ({ onSave }: LocationSelectorProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialPosition, setInitialPosition] = useState<
    [number, number] | null
  >(null);
  const [finalCoordinates, setFinalCoordinates] = useState<
    [number, number] | null
  >(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [rawStreetAndNumber, setRawStreetAndNumber] = useState("");
  const [lastSearchAddress, setLastSearchAddress] = useState("");
  const [step, setStep] = useState<"input" | "map" | "review">("input");

  const { addAlert } = useAlert();

  const DEFAULT_CITY = "Concepción del Uruguay";
  const DEFAULT_PROVINCE = "Entre Ríos";
  const DEFAULT_COUNTRY = "Argentina";

  const handleSearchAddress = async (
    fullAddress: string,
    streetAndNumber: string
  ) => {
    setLoading(true);
    setError(null);
    const provider = new EsriProvider();

    try {
      const results = await provider.search({ query: fullAddress });
      if (results.length > 0) {
        setInitialPosition([results[0].y, results[0].x]);
        setFinalCoordinates([results[0].y, results[0].x]);
        setRawStreetAndNumber(streetAndNumber);
        setLastSearchAddress(fullAddress);
        setShowCard(true);
        setStep("map");
      } else {
        addAlert({
          message: "No se encontraron resultados. Intenta con otra calle o número.",
          type: 'info'
        });
        resetSearch();
      }
    } catch {
      addAlert({
        message: `Error al buscar la dirección. Inténtalo de nuevo.`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setInitialPosition(null);
    setFinalCoordinates(null);
    setRawStreetAndNumber("");
    setLastSearchAddress("");
    setShowCard(false);
    setStep("input");
  };

  const handlePositionChange = (newPosition: [number, number]) => {
    setFinalCoordinates(newPosition);
  };

  const handleGoToReview = () => {
    setStep("review");
  };

  const handleConfirmLocation = async (apartment: string, notes: string) => {
    if (!finalCoordinates) {
      addAlert({
        message: "Por favor, selecciona una ubicación antes de confirmar.",
        type: 'info' 
      });
      return;
    }

    setIsConfirming(true);

    const parts = rawStreetAndNumber.trim().split(" ");
    const number = parts.pop();
    const street = parts.join(" ");

    const dataToSend: AddressData = {
      street: street,
      number: number || null,
      apartment: apartment || null,
      city: DEFAULT_CITY,
      province: DEFAULT_PROVINCE,
      country: DEFAULT_COUNTRY,
      postalCode: null,
      latitude: finalCoordinates[0],
      longitude: finalCoordinates[1],
      notes: notes,
    };

    onSave(dataToSend);
    setIsConfirming(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCard) {
      timer = setTimeout(() => {
        setShowCard(false);
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [showCard]);

  const addressForReview: AddressData | null =
    initialPosition && finalCoordinates
      ? {
          street: rawStreetAndNumber.trim().split(" ").slice(0, -1).join(" "),
          number: rawStreetAndNumber.trim().split(" ").slice(-1)[0] || null,
          city: DEFAULT_CITY,
          province: DEFAULT_PROVINCE,
          country: DEFAULT_COUNTRY,
          latitude: finalCoordinates[0],
          longitude: finalCoordinates[1],
        }
      : null;

  return (
    /* Cambiado: h-full w-full relative en lugar de min-h-screen */
    <div className="h-full w-full bg-gray-50 flex flex-col relative">
      {/* Paso 1: Input */}
      {step === "input" && (
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <AddressInput
              onSearch={handleSearchAddress}
              isLoading={loading}
              lastSearchAddress={lastSearchAddress}
            />
          </div>
        </div>
      )}

      {/* Estado de carga / error */}
      {loading && (
        <p className="mt-6 text-gray-500 text-center">Buscando dirección...</p>
      )}
      {error && <p className="mt-6 text-red-500 text-center">{error}</p>}

      {/* Paso 2: Mapa */}
      {step === "map" && initialPosition && (
        /* Cambiado: h-full / flex-1 min-h-0 en lugar de h-screen */
        <div className="relative w-full flex-1 min-h-0">
          <MapComponent
            initialPosition={initialPosition}
            onPositionChange={handlePositionChange}
          />
          {showCard && <ConfirmationCard onClose={() => setShowCard(false)} />}

          {/* Panel flotante ajustado al fondo del contenedor */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-6 space-y-4 z-50">
            <p className="text-sm text-gray-600 text-center">
              <span className="font-semibold text-gray-800">
                Dirección seleccionada:
              </span>{" "}
              {lastSearchAddress}
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetSearch}
                className="flex-1 px-4 py-3 rounded-full border border-gray-300 bg-white text-gray-700 font-medium shadow hover:bg-gray-100 transition"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={handleGoToReview}
                disabled={!finalCoordinates || isConfirming}
                className="flex-1 px-4 py-3 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Review */}
      {step === "review" && addressForReview && (
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <LocationReview
            address={addressForReview}
            onConfirm={handleConfirmLocation}
            onBack={() => setStep("map")}
            isConfirming={isConfirming}
          />
        </div>
      )}
    </div>
  );
};

export default LocationSelector;