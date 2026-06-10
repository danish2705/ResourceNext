import { useMemo, useState } from 'react';

import {
  AlertTriangle,
  Calculator,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Allocation {
  id: string;
  resourceName: string;
  project: string;
  allocationPercent: number;
}

interface Props {
  allocations: Allocation[];
}

export default function ScenarioPlanning({
  allocations,
}: Props) {

  // =========================
  // SIMULATION STATE
  // =========================

  const [adjustments, setAdjustments] =
    useState<Record<string, number>>({});

  // =========================
  // SIMULATED DATA
  // =========================

  const simulatedAllocations =
    useMemo(() => {

      return allocations.map(
        (allocation) => {

          const adjustment =
            adjustments[allocation.id] || 0;

          const simulatedValue =
            allocation.allocationPercent +
            adjustment;

          return {
            ...allocation,
            simulatedValue,
          };
        }
      );

    }, [
      allocations,
      adjustments,
    ]);

  // =========================
  // RESOURCE TOTALS
  // =========================

  const groupedTotals = useMemo(() => {

    const grouped: Record<
      string,
      number
    > = {};

    simulatedAllocations.forEach(
      (allocation) => {

        grouped[
          allocation.resourceName
        ] =
          (
            grouped[
              allocation.resourceName
            ] || 0
          ) +
          allocation.simulatedValue;

      }
    );

    return grouped;

  }, [simulatedAllocations]);

  return (
    <Card>

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          Scenario Planning
        </CardTitle>
      </CardHeader>

      <CardContent>

        <div className="overflow-x-auto border rounded-md">

          <Table>

            <TableHeader>

              <TableRow>
                <TableHead>
                  Resource
                </TableHead>

                <TableHead>
                  Project
                </TableHead>

                <TableHead>
                  Current %
                </TableHead>

                <TableHead>
                  Adjustment
                </TableHead>

                <TableHead>
                  Simulated %
                </TableHead>

                <TableHead>
                  Conflict
                </TableHead>
              </TableRow>

            </TableHeader>

            <TableBody>

              {simulatedAllocations.map(
                (allocation) => {

                  const total =
                    groupedTotals[
                      allocation.resourceName
                    ];

                  const hasConflict =
                    total > 100;

                  return (
                    <TableRow
                      key={allocation.id}
                    >

                      <TableCell className="font-medium">
                        {
                          allocation.resourceName
                        }
                      </TableCell>

                      <TableCell>
                        {
                          allocation.project
                        }
                      </TableCell>

                      <TableCell>
                        {
                          allocation.allocationPercent
                        }
                        %
                      </TableCell>

                      <TableCell>

                        <Input
                          type="number"
                          value={
                            adjustments[
                              allocation.id
                            ] || 0
                          }
                          onChange={(e) =>
                            setAdjustments(
                              (
                                prev
                              ) => ({
                                ...prev,
                                [
                                  allocation.id
                                ]:
                                  Number(
                                    e.target
                                      .value
                                  ),
                              })
                            )
                          }
                          className="w-24"
                        />

                      </TableCell>

                      <TableCell>

                        <div
                          className={
                            hasConflict
                              ? 'text-red-600 font-medium'
                              : ''
                          }
                        >
                          {
                            allocation.simulatedValue
                          }
                          %
                        </div>

                      </TableCell>

                      <TableCell>

                        {hasConflict ? (
                          <div className="flex items-center gap-1 text-red-600 text-sm">

                            <AlertTriangle className="h-4 w-4" />

                            Overallocated

                          </div>
                        ) : (
                          <div className="text-green-600 text-sm">
                            Healthy
                          </div>
                        )}

                      </TableCell>

                    </TableRow>
                  );
                }
              )}

            </TableBody>

          </Table>

        </div>

      </CardContent>

    </Card>
  );
}