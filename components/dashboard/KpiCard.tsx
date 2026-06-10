import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export default function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "hsl(var(--kpi-blue))",
  iconBg = "hsl(var(--kpi-blue-bg))",
}: KpiCardProps) {
  return (
    <Card className="shadow-sm border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>

          {change && (
            <span className="text-xs font-medium text-muted-foreground">
              {change}
            </span>
          )}
        </div>

        <div className="text-3xl font-bold">{value}</div>

        <div className="text-sm text-muted-foreground mt-2">
          {title}
        </div>
      </CardContent>
    </Card>
  );
}