"use client";

import { useEffect, useState } from "react";
import { useSchedule } from "@/features/business/hooks/useSchedule";
import { SkeletonSchedule } from "../Skeleton/SkeletonSchedule";
import Schedule from "../views/Schedule";
import WeeklyScheduleForm from "../edits/WeeklyScheduleForm";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

interface Props {
  businessId: string;
}

export default function ScheduleContainer({ businessId }: Props) {
  const { data, isLoading, isError, error, refetch } = useSchedule(businessId);
  const [isEditing, setIsEditing] = useState(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (isError && error) {
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  }, [isError, error, addAlert]);

  if (isLoading) return <SkeletonSchedule />;

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-8 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Horarios de atención
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configura los días y horarios en los que el negocio acepta
              pedidos.
            </p>
          </div>

          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium transition hover:bg-gray-50"
          >
            {isEditing ? "Ver horarios" : "Editar horarios"}
          </button>
        </div>

        <div className="p-3">
          {isEditing || error?.statusCode === 404 ? (
            <WeeklyScheduleForm
              businessId={businessId}
              initialSchedule={data ? data : undefined}
              onSuccess={() => {
                setIsEditing(false);
                refetch();
              }}
            />
          ) : data ? (
            <Schedule data={data} />
          ) : null}
        </div>
      </div>
    </>
  );
}
