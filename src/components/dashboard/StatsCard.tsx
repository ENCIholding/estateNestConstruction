import React from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{value}</h3>
          {subtitle ? (
            <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
          ) : null}
        </div>

        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}
