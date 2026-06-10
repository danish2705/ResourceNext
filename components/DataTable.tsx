// src/components/DataTable.tsx

import { useState, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Column Type
// ─────────────────────────────────────────────────────────────

export interface Column<T extends object> {
  key: keyof T | string;

  header: string;

  render?: (row: T, index: number) => React.ReactNode;

  sortable?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface Props<T extends object> {
  data: T[];

  columns: Column<T>[];

  searchPlaceholder?: string;

  pageSize?: number;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function DataTable<T extends object>({
  data,
  columns,
  pageSize: defaultPageSize = 10,
}: Props<T>) {
  const [search] = useState("");

  const [page, setPage] = useState(0);

  const [pageSize] = useState(defaultPageSize);

  const [sortKey, setSortKey] = useState<string | null>(null);

  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ───────────────────────────────────────────────────────────
  // Search Filter
  // ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search) return data;

    const s = search.toLowerCase();

    return data.filter((row) =>
      columns.some((col) => {
        if (!(col.key in (row as object))) return false;

        return String(row[col.key as keyof T] ?? "")
          .toLowerCase()
          .includes(s);
      }),
    );
  }, [data, search, columns]);

  // ───────────────────────────────────────────────────────────
  // Sorting
  // ───────────────────────────────────────────────────────────

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const av = a[sortKey as keyof T];

      const bv = b[sortKey as keyof T];

      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
        numeric: true,
      });

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // ───────────────────────────────────────────────────────────
  // Pagination
  // ───────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // ───────────────────────────────────────────────────────────
  // Sorting Handler
  // ───────────────────────────────────────────────────────────

  const handleSort = (key: string) => {
    if (!data.length || !(key in (data[0] as object))) return;

    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);

      setSortDir("asc");
    }
  };

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
  <div className="flex flex-col h-[calc(100vh-280px)]">
    {/* Table Container */}
    <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
      <div className="h-full overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
  key={String(col.key)}
  className={`
    sticky top-0
    z-30
    bg-background
    border-b
    shadow-sm
    ${
      col.sortable !== false
        ? "cursor-pointer select-none hover:bg-muted/50"
        : ""
    }
  `}
  onClick={() =>
    col.sortable !== false && handleSort(String(col.key))
  }
>
  {col.header}
  {sortKey === col.key &&
    (sortDir === "asc" ? " ↑" : " ↓")}
</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow key={i} className="hover:bg-accent/30">
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(row, page * pageSize + i)
                        : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  );
}
