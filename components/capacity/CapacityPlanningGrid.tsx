import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  timelineMonths,
  getMonthlyAllocation,
} from '@/utils/capacityTimeline';

interface CapacityGridRow {
  id: string;
  resourceName: string;
  role: string;
  vendor: string;
  project: string;
  allocationPercent: number;
  totalAllocation: number;
  availableCapacity: number;
  planningStatus: string;
  startDate: string;
  endDate: string;
}

interface Props {
  data: CapacityGridRow[];
}

const getUtilizationColor = (allocation: number) => {
  if (allocation > 100) {
    return 'text-red-600 bg-red-50 border-red-200';
  }

  if (allocation >= 80) {
    return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  }

  if (allocation > 0) {
    return 'text-green-700 bg-green-50 border-green-200';
  }

  return 'text-muted-foreground bg-muted';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Overallocated':
      return 'bg-red-100 text-red-700 border border-red-200';

    case 'Fully Allocated':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';

    case 'Partial Allocation':
      return 'bg-green-100 text-green-700 border border-green-200';

    case 'Available':
      return 'bg-blue-100 text-blue-700 border border-blue-200';

    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function CapacityPlanningGrid({
  data,
}: Props) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  // =========================
  // GROUP DATA
  // =========================

  const groupedData = useMemo(() => {
    const groups: Record<string, CapacityGridRow[]> = {};

    data.forEach((item) => {
      if (!groups[item.resourceName]) {
        groups[item.resourceName] = [];
      }

      groups[item.resourceName].push(item);
    });

    return Object.entries(groups).map(([resourceName, allocations]) => {
      const totalAllocation = allocations.reduce(
        (sum, item) => sum + item.allocationPercent,
        0
      );

      const availableCapacity = Math.max(
        0,
        100 - totalAllocation
      );

      let planningStatus = 'Available';

      if (totalAllocation > 100) {
        planningStatus = 'Overallocated';
      } else if (totalAllocation === 100) {
        planningStatus = 'Fully Allocated';
      } else if (totalAllocation > 0) {
        planningStatus = 'Partial Allocation';
      }

      return {
        resourceName,
        role: allocations[0].role,
        vendor: allocations[0].vendor,
        totalAllocation,
        availableCapacity,
        planningStatus,
        allocations,
      };
    });
  }, [data]);

  const toggleRow = (resourceName: string) => {
    setOpenRows((prev) => ({
      ...prev,
      [resourceName]: !prev[resourceName],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Capacity Planning Grid
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto border rounded-md">
          <Table className="w-full table-fixed min-w-[1700px]">

            {/* COLUMN MODEL */}

            <colgroup>
              <col style={{ width: '24%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />

              {timelineMonths.map((month) => (
                <col
                  key={month.key}
                  style={{ width: '10%' }}
                />
              ))}
            </colgroup>

            {/* HEADER */}

            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>
                  Resource
                </TableHead>

                <TableHead className="whitespace-nowrap">
                  Vendor
                </TableHead>

                <TableHead className="whitespace-nowrap text-center">
                  Total Allocation %
                </TableHead>

                <TableHead className="whitespace-nowrap text-center">
                  Available Capacity %
                </TableHead>

                <TableHead className="whitespace-nowrap">
                  Planning Status
                </TableHead>

                {timelineMonths.map((month) => (
                  <TableHead
                    key={month.key}
                    className="whitespace-nowrap text-center"
                  >
                    {month.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* BODY */}

            <TableBody>
              {groupedData.map((group) => (
                <Fragment key={group.resourceName}>

                  {/* PARENT ROW */}

                  <TableRow>
                    {/* RESOURCE */}

                    <TableCell>
                      <button
                        onClick={() =>
                          toggleRow(group.resourceName)
                        }
                        className="flex items-start gap-3 text-left w-full"
                      >
                        <div className="mt-1 shrink-0">
                          {openRows[group.resourceName] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {group.resourceName}
                          </div>

                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {group.role}
                          </div>
                        </div>
                      </button>
                    </TableCell>

                    {/* VENDOR */}

                    <TableCell className="whitespace-nowrap align-middle">
                      {group.vendor}
                    </TableCell>

                    {/* TOTAL ALLOCATION */}

                    <TableCell className="text-center align-middle">
                      <div
                        className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border whitespace-nowrap ${getUtilizationColor(
                          group.totalAllocation
                        )}`}
                      >
                        {group.totalAllocation}%
                      </div>
                    </TableCell>

                    {/* AVAILABLE CAPACITY */}

                    <TableCell className="text-center whitespace-nowrap align-middle">
                      {group.availableCapacity}%
                    </TableCell>

                    {/* STATUS */}

                    <TableCell className="align-middle">
                      <div
                        className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(
                          group.planningStatus
                        )}`}
                      >
                        {group.planningStatus}
                      </div>
                    </TableCell>

                    {/* TIMELINE MONTHS */}

                    {timelineMonths.map((month) => {
                      const monthlyAllocation =
                        group.allocations.reduce(
                          (sum, allocation) =>
                            sum +
                            getMonthlyAllocation(
                              allocation.startDate,
                              allocation.endDate,
                              allocation.allocationPercent,
                              month.start,
                              month.end
                            ),
                          0
                        );

                      return (
                        <TableCell
                          key={month.key}
                          className="text-center align-middle"
                        >
                          <div
                            className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border whitespace-nowrap ${getUtilizationColor(
                              monthlyAllocation
                            )}`}
                          >
                            {monthlyAllocation}%
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>

                  {/* CHILD ROWS */}

                  {openRows[group.resourceName] &&
                    group.allocations.map((allocation) => (
                      <TableRow
                        key={allocation.id}
                        className="bg-muted/20"
                      >
                        {/* PROJECT */}

                        <TableCell className="pl-12">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {allocation.project}
                            </div>

                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              {allocation.role}
                            </div>
                          </div>
                        </TableCell>

                        {/* VENDOR */}

                        <TableCell className="whitespace-nowrap align-middle">
                          {allocation.vendor}
                        </TableCell>

                        {/* ALLOCATION */}

                        <TableCell className="text-center align-middle">
                          <div
                            className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border whitespace-nowrap ${getUtilizationColor(
                              allocation.allocationPercent
                            )}`}
                          >
                            {allocation.allocationPercent}%
                          </div>
                        </TableCell>

                        {/* AVAILABLE */}

                        <TableCell className="text-center whitespace-nowrap align-middle text-muted-foreground">
                          —
                        </TableCell>

                        {/* STATUS */}

                        <TableCell className="align-middle">
                          <div
                            className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(
                              allocation.planningStatus
                            )}`}
                          >
                            {allocation.planningStatus}
                          </div>
                        </TableCell>

                        {/* TIMELINE MONTHS */}

                        {timelineMonths.map((month) => {
                          const monthlyAllocation =
                            getMonthlyAllocation(
                              allocation.startDate,
                              allocation.endDate,
                              allocation.allocationPercent,
                              month.start,
                              month.end
                            );

                          return (
                            <TableCell
                              key={month.key}
                              className="text-center align-middle"
                            >
                              <div
                                className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium border whitespace-nowrap ${getUtilizationColor(
                                  monthlyAllocation
                                )}`}
                              >
                                {monthlyAllocation}%
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}