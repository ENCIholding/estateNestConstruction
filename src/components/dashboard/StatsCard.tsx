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
    <div className="dashboard-panel group p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground/80">{subtitle}</p>
          ) : null}
        </div>

        <div className="dashboard-icon shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
