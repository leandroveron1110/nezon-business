"use client";

import { CheckCircle, CircleSlash } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  data: Record<string, string[]>;
}

const daysES: Record<string, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export default function Schedule({ data }: Props) {
  const today = dayjs().format("dddd").toUpperCase() as Weekday;

  const todayIntervals = data[today] ?? [];
  const isOpenToday = todayIntervals.length > 0;

  return (
    <section className="space-y-8">
      {/* Estado de hoy */}
      <div
        className={`rounded-2xl border p-5 ${
          isOpenToday
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        {isOpenToday ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>Abierto hoy</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {todayIntervals.map((interval) => (
                <span
                  key={interval}
                  className="rounded-full bg-white px-3 py-1 text-sm font-medium text-green-700 shadow-sm"
                >
                  {interval}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-semibold text-red-600">
            <CircleSlash className="h-5 w-5 shrink-0" />
            <span>Cerrado hoy</span>
          </div>
        )}
      </div>

      {/* Lista semanal */}
      <div className="space-y-3">
        {Object.entries(data).map(([day, intervals]) => {
          const isToday = day === today;

          return (
            <div
              key={day}
              className={`rounded-2xl border px-5 py-4 transition-all ${
                isToday
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Día */}
                <div className="flex flex-col">
                  <span
                    className={`font-semibold ${
                      isToday ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    {daysES[day]}
                  </span>

                  {isToday && (
                    <span className="mt-1 text-xs font-medium text-blue-600">
                      Hoy
                    </span>
                  )}
                </div>

                {/* Horarios */}
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {intervals.length === 0 ? (
                    <span className="text-sm text-gray-400">
                      Cerrado
                    </span>
                  ) : (
                    intervals.map((interval) => (
                      <span
                        key={interval}
                        className={`rounded-lg px-3 py-1 text-sm font-medium ${
                          isToday
                            ? "bg-white text-blue-700 shadow-sm"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {interval}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}