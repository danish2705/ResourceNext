import { useMemo } from 'react';

import {
  Users,
  Briefcase,
  Clock3,
  TrendingDown,
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

export default function BenchInsights({
  allocations,
}: Props) {

  // =========================
  // GROUP RESOURCE ALLOCATION
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
  // AVAILABLE RESOURCES
  // =========================

  const availableResources =
    Object.entries(groupedResources)
      .filter(
        ([_, allocation]) =>
          allocation < 50
      )
      .map(([resource]) => resource);

  // =========================
  // BENCH CAPACITY
  // =========================

  const benchCapacity =
    Object.values(groupedResources)
      .reduce(
        (sum, allocation) =>
          sum +
          Math.max(0, 100 - allocation),
        0
      );

  // =========================
  // UPCOMING AVAILABILITY
  // =========================

  const today = new Date();

  const upcomingAvailability =
    allocations.filter((allocation) => {
      const endDate = new Date(
        allocation.endDate
      );

      const diffDays =
        (endDate.getTime() -
          today.getTime()) /
        (1000 * 60 * 60 * 24);

      return diffDays >= 0 &&
        diffDays <= 45;
    });

  // =========================
  // RESOURCES BECOMING FREE
  // =========================

  const becomingFreeResources =
    [...new Set(
      upcomingAvailability.map(
        (allocation) =>
          allocation.resourceName
      )
    )];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

      {/* AVAILABLE RESOURCES */}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Available Resources
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {availableResources.length}
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            Resources below 50% allocation
          </div>
        </CardContent>
      </Card>

      {/* BENCH CAPACITY */}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Bench Capacity
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {benchCapacity}%
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            Remaining organizational capacity
          </div>
        </CardContent>
      </Card>

      {/* UPCOMING AVAILABILITY */}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Upcoming Availability
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {upcomingAvailability.length}
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            Allocations ending within 45 days
          </div>
        </CardContent>
      </Card>

      {/* RESOURCES BECOMING FREE */}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Becoming Free
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-3xl font-bold">
            {becomingFreeResources.length}
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            Resources nearing roll-off
          </div>
        </CardContent>
      </Card>

    </div>
  );
}