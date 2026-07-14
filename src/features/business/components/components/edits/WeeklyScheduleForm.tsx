"use client";

import { useForm, useFieldArray, Controller, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, Loader2 } from "lucide-react";
import { useUpdateSchedule } from "@/features/business/hooks/useSchedule";
import { useState } from "react";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

const daysOfWeek = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const daysInSpanish: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const rangeSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:mm"),
  })
  .refine((data) => data.end > data.start, {
    message: "La hora de fin debe ser mayor a la de inicio",
    path: ["end"],
  });

const formSchema = z.object({
  schedule: z.record(z.array(rangeSchema)),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  businessId: string;
  initialSchedule?: Record<string, string[]>;
  onSuccess?: () => void;
}

export default function WeeklyScheduleForm({
  businessId,
  initialSchedule,
  onSuccess,
}: Props) {
  const { addAlert } = useAlert();

  const defaultValues: FormValues = {
    schedule: daysOfWeek.reduce((acc, day) => {
      const ranges = initialSchedule?.[day] ?? [];
      acc[day] = ranges.map((r) => {
        const [start, end] = r.split("-");
        return { start, end };
      });
      return acc;
    }, {} as Record<(typeof daysOfWeek)[number], { start: string; end: string }[]>),
  };

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const updateSchedule = useUpdateSchedule(businessId);
  const [success, setSuccess] = useState(false);

  const onSubmit = (data: FormValues) => {
    setSuccess(false);

    const payload = Object.fromEntries(
      Object.entries(data.schedule).map(([day, ranges]) => [
        day,
        ranges.map((r) => `${r.start}-${r.end}`),
      ])
    );

    updateSchedule.mutate(payload, {
      onSuccess: () => {
        setSuccess(true);
        onSuccess?.();
      },
      onError: (error) => {
        addAlert({
          message: getDisplayErrorMessage(error),
          type: "error",
        });
      },
    });

    setSuccess(false);
  };

  return (
<form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-6"
>
  {daysOfWeek.map((day) => (
    <DayScheduleField
      key={day}
      control={control}
      day={day}
      label={daysInSpanish[day]}
      isDisabled={updateSchedule.isPending}
    />
  ))}

  <div className="border-t border-gray-200 pt-6 flex justify-end">
    <button
      type="submit"
      disabled={updateSchedule.isPending}
      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-black disabled:opacity-50"
    >
      {updateSchedule.isPending && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}

      {updateSchedule.isPending
        ? "Guardando..."
        : "Guardar cambios"}
    </button>
  </div>
</form>
  );
}

interface DayProps {
  control: Control<FormValues>;
  day: string;
  label: string;
  isDisabled?: boolean;
}

function DayScheduleField({
  control,
  day,
  label,
  isDisabled,
}: DayProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `schedule.${day}`,
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => append({ start: "09:00", end: "17:00" })}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar horario
        </button>
      </div>

      {/* Body */}
      <div className="space-y-4 p-5">
        {fields.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center text-sm text-gray-500">
            Sin horarios configurados.
          </div>
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* Hora inicio */}
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Desde
                </label>

                <Controller
                  control={control}
                  name={`schedule.${day}.${index}.start`}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        type="time"
                        {...field}
                        disabled={isDisabled}
                        className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 ${
                          fieldState.error
                            ? "border-red-400 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                      />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Hora fin */}
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Hasta
                </label>

                <Controller
                  control={control}
                  name={`schedule.${day}.${index}.end`}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        type="time"
                        {...field}
                        disabled={isDisabled}
                        className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 ${
                          fieldState.error
                            ? "border-red-400 focus:ring-red-200"
                            : "border-gray-300 focus:ring-blue-200"
                        }`}
                      />

                      {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>

              {/* Botón eliminar */}
              <div className="flex justify-end lg:justify-center">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => remove(index)}
                  className="rounded-xl p-3 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
