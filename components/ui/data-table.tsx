"use client";

import { useState, useMemo, type ReactNode } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hidden?: "md" | "lg";
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  emptyMessage?: string;
  headerSlot?: ReactNode;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchable = false,
  searchPlaceholder = "Buscar...",
  searchFn,
  emptyMessage = "Nenhum resultado encontrado",
  headerSlot,
  onRowClick,
  pageSize = 25,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || !searchFn) return data;
    const q = search.toLowerCase();
    return data.filter((row) => searchFn(row, q));
  }, [data, search, searchFn]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = col.sortValue!(a);
      const bVal = col.sortValue!(b);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const hiddenClass = {
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(searchable || headerSlot) && (
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {searchable && (
            <div className="relative flex-1 w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.06] bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          )}
          {headerSlot && <div className="flex items-center gap-2 ml-auto">{headerSlot}</div>}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.04] bg-gray-50/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left py-3 px-4 font-medium text-gray-400 text-[10px] uppercase tracking-wider ${col.hidden ? hiddenClass[col.hidden] : ""} ${col.sortable ? "cursor-pointer select-none hover:text-gray-600 transition-colors" : ""}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {col.label}
                        {col.sortable && (
                          sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30" />
                          )
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    className={`border-b border-black/[0.02] last:border-0 hover:bg-gray-50/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-4 ${col.hidden ? hiddenClass[col.hidden] : ""}`}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-gray-400">
            {sorted.length} resultado(s) — pagina {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-black/[0.06] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-black/[0.06] rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Proximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
