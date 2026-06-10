import { useMemo } from 'react';

import {
  AlertTriangle,
  Clock3,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Allocation {
  resourceName: string;
  allocationPercent: number;
  endDate: string;
}

interface Props {
  allocations: Allocation[];
}

export default function CapacityAlerts({
  allocations,
}: Props) {

  // =========================
  // GROUPED RESOURCE TOTALS
  // =========================

  const groupedResources = useMemo(() => {
    const grouped: Record<string, number> = {};

    allocations.forEach((allocation) => {
      grouped[allocation.resourceName] =
        (grouped[allocation.resourceName] || 0) +
        allocation.allocationPercent;
    });

    return grouped;
  }, [allocations]);

  // =========================
  // OVERALLOCATED
  // =========================

  const overallocatedResources =
    Object.entries(groupedResources)
      .filter(
        ([_, allocation]) =>
          allocation > 100
      )
      .map(([resource]) => resource);

  // =========================
  // UPCOMING ROLL OFFS
  // =========================

  const today = new Date();

  const upcomingRollOffs =
    allocations.filter((allocation) => {
      const endDate = new Date(
        allocation.endDate
      );

      const diffDays =
        (endDate.getTime() -
          today.getTime()) /
        (1000 * 60 * 60 * 24);

      return diffDays >= 0 &&
        diffDays <= 30;
    });

  // =========================
  // CAPACITY SHORTAGE
  // =========================

  const totalCapacity =
    Object.keys(groupedResources)
      .length * 100;

  const totalAllocation =
    Object.values(groupedResources)
      .reduce(
        (sum, value) => sum + value,
        0
      );

  const shortage =
    totalAllocation > totalCapacity;

  // =========================
  // FORECAST MISMATCH
  // =========================

  const mismatchResources =
    Object.entries(groupedResources)
      .filter(
        ([_, allocation]) =>
          allocation >= 90 &&
          allocation <= 110
      )
      .map(([resource]) => resource);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Exception Alerts
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* OVERALLOCATED */}

        <div className="flex items-start gap-3 p-4 border rounded-xl bg-red-50 dark:bg-red-950/20">

          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />

          <div>
            <div className="font-medium">
              Overallocated Resources
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {overallocatedResources.length > 0
                ? overallocatedResources.join(', ')
                : 'No overallocation detected'}
            </div>
          </div>
        </div>

        {/* SHORTAGE */}

        <div className="flex items-start gap-3 p-4 border rounded-xl bg-amber-50 dark:bg-amber-950/20">

          <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5" />

          <div>
            <div className="font-medium">
              Capacity Shortage
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {shortage
                ? 'Organization demand exceeds available capacity'
                : 'Capacity levels are stable'}
            </div>
          </div>
        </div>

        {/* UPCOMING ROLL OFFS */}

        <div className="flex items-start gap-3 p-4 border rounded-xl bg-blue-50 dark:bg-blue-950/20">

          <Clock3 className="h-5 w-5 text-blue-500 mt-0.5" />

          <div>
            <div className="font-medium">
              Upcoming Roll-Offs
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {upcomingRollOffs.length > 0
                ? `${upcomingRollOffs.length} allocations ending within 30 days`
                : 'No upcoming roll-offs'}
            </div>
          </div>
        </div>

        {/* FORECAST MISMATCH */}

        <div className="flex items-start gap-3 p-4 border rounded-xl bg-green-50 dark:bg-green-950/20">

          <Users className="h-5 w-5 text-green-500 mt-0.5" />

          <div>
            <div className="font-medium">
              Forecast Mismatch Indicators
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {mismatchResources.length > 0
                ? `${mismatchResources.length} resources nearing utilization thresholds`
                : 'No forecast mismatches detected'}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}