import { useMemo } from 'react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Allocation {
  resourceName: string;
  allocationPercent: number;
}

interface Props {
  allocations: Allocation[];
}

const COLORS = [
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
];

export default function CapacityAnalytics({
  allocations,
}: Props) {

  // =========================
  // RESOURCE GROUPING
  // =========================

  const groupedResources = useMemo(() => {
    const grouped: Record<string, number> = {};

    allocations.forEach((allocation) => {
      grouped[allocation.resourceName] =
        (grouped[allocation.resourceName] || 0) +
        allocation.allocationPercent;
    });

    return Object.entries(grouped).map(
      ([resourceName, totalAllocation]) => ({
        resourceName,
        totalAllocation,
      })
    );
  }, [allocations]);

  // =========================
  // KPI CALCULATIONS
  // =========================

  const totalResources =
    groupedResources.length;

  const totalCapacity =
    totalResources * 100;

  const allocatedCapacity =
    groupedResources.reduce(
      (sum, resource) =>
        sum + resource.totalAllocation,
      0
    );

  const availableCapacity =
    Math.max(
      0,
      totalCapacity - allocatedCapacity
    );

  // =========================
  // UTILIZATION DISTRIBUTION
  // =========================

  const utilizationData = useMemo(() => {
    let available = 0;
    let fullyAllocated = 0;
    let overallocated = 0;

    groupedResources.forEach((resource) => {
      if (resource.totalAllocation > 100) {
        overallocated += 1;
      } else if (
        resource.totalAllocation >= 80
      ) {
        fullyAllocated += 1;
      } else {
        available += 1;
      }
    });

    return [
      {
        name: 'Available',
        value: available,
      },
      {
        name: 'Fully Allocated',
        value: fullyAllocated,
      },
      {
        name: 'Overallocated',
        value: overallocated,
      },
    ];
  }, [groupedResources]);

  // =========================
  // DEMAND VS CAPACITY
  // =========================

  const demandCapacityData = [
    {
      name: 'Capacity',
      value: totalCapacity,
      fill: '#3b82f6',
    },
    {
      name: 'Allocated',
      value: allocatedCapacity,
      fill: '#8b5cf6',
    },
    {
      name: 'Available',
      value: availableCapacity,
      fill: '#22c55e',
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

      {/* DEMAND VS CAPACITY */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Demand vs Capacity
          </CardTitle>
        </CardHeader>

        <CardContent className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={demandCapacityData}
              barCategoryGap={30}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.15}
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <Tooltip
                cursor={{
                  fill: 'rgba(255,255,255,0.04)',
                }}
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#111827',
                  color: '#fff',
                }}
              />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
              >
                {demandCapacityData.map(
                  (entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* UTILIZATION DISTRIBUTION */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Utilization Distribution
          </CardTitle>
        </CardHeader>

        <CardContent className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={utilizationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={45}
                paddingAngle={3}
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${value}`
                }
              >
                {utilizationData.map(
                  (_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index % COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#111827',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RISK SUMMARY */}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Capacity Risk Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="rounded-xl border p-4 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Organization Utilization
            </div>

            <div className="text-3xl font-bold mt-2">
              {Math.round(
                (allocatedCapacity /
                  totalCapacity) *
                  100
              )}
              %
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Overallocated Resources
            </div>

            <div className="text-3xl font-bold mt-2 text-red-500">
              {
                utilizationData.find(
                  (d) =>
                    d.name ===
                    'Overallocated'
                )?.value
              }
            </div>
          </div>

          <div className="rounded-xl border p-4 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Available Capacity
            </div>

            <div className="text-3xl font-bold mt-2 text-green-500">
              {availableCapacity}%
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}