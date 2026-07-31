"use client";

import { CheckCircle2 } from "lucide-react";

interface SuccessAlertProps {
  title: string;
  message?: string;
}

export function SuccessAlert({
  title,
  message,
}: SuccessAlertProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50 p-4 shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <h4 className="font-[Space_Grotesk,sans-serif] text-sm font-bold text-slate-900">
            {title}
          </h4>

          {message && (
            <p className="mt-1 text-sm text-slate-600">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}