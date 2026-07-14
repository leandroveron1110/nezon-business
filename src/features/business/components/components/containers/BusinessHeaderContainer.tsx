// src/components/containers/BusinessHeaderContainer.tsx
"use client";

import { useState } from "react";
import BusinessHeaderEditor from "../edits/BusinessHeaderEditor";
import BusinessHeader from "../views/BusinessHeader";
import { BusinessHeaderData } from "@/features/business/types/business-form";
import { useBusinessHeaderUpdater } from "@/features/business/hooks/useBusinessHeaderUpdater";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

interface BusinessHeaderContainerProps {
  businessId: string;
  logoUrl?: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
}

export default function BusinessHeaderContainer({
  businessId,
  logoUrl,
  name,
  shortDescription,
  fullDescription,
}: BusinessHeaderContainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessHeaderData>({
    logoUrl,
    name,
    shortDescription,
    fullDescription,
  });

  // Utiliza el hook de mutación
  const { updateHeader } = useBusinessHeaderUpdater(businessId);
  const { addAlert } = useAlert()

const getChangedFields = (
  oldData: BusinessHeaderData,
  newData: BusinessHeaderData
) => {
  const diff: Partial<Omit<BusinessHeaderData, "logoUrl">> = {};

  const keysToCompare = (
    Object.keys(newData) as (keyof BusinessHeaderData)[]
  ).filter((key) => key !== "logoUrl");

  keysToCompare.forEach((key) => {
    if (newData[key] !== oldData[key]) {
      // Cast seguro, no usamos 'any'
      diff[key] = newData[key] as Partial<Omit<BusinessHeaderData, "logoUrl">>[typeof key];
    }
  });

  return diff;
};


  const handleSave = (newData: BusinessHeaderData) => {
    const changes = getChangedFields(businessData, newData);

    // Solo actualiza si hay cambios en los campos de texto
    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      return;
    }

    // Llama al hook para enviar los cambios al backend
    updateHeader(changes, {
      onSuccess: () => {
        setBusinessData((prev) => ({ ...prev, ...changes }));
        setIsEditing(false);
      },
      onError: (err) => {
        addAlert({
          message: getDisplayErrorMessage(err),
          type: 'error'
        })
      },
    });
  };

  return (
    <div>
      {isEditing ? (
        <BusinessHeaderEditor
          businessId={businessId}
          {...businessData}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
        />
      ) : (
        <BusinessHeader {...businessData} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
