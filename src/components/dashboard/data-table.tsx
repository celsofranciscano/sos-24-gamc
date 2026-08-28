"use client";

// ============================================================
// TABLA GENÉRICA RESPONSIVE DEL DASHBOARD
// En escritorio renderiza una tabla con scroll horizontal;
// en móvil convierte cada fila en una tarjeta apilada.
// ============================================================

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  loading,
  emptyMessage = "Sin registros.",
  onRowClick,
  mobileTitle,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  mobileTitle?: (row: T) => React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      {/* Escritorio */}
      <div className="hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              {columns.map((col) => (
                <th key={col.key} className={`px-3 py-2.5 font-medium ${col.className ?? ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={String(row[Object.keys(row)[0]] ?? index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b last:border-b-0 ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 align-middle ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="space-y-2 md:hidden">
        {rows.map((row, index) => (
          <div
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            key={String(row[Object.keys(row)[0]] ?? index)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }
                : undefined
            }
            className={`w-full rounded-xl border p-3 text-left ${onRowClick ? "cursor-pointer active:bg-muted/60" : ""}`}
          >
            {mobileTitle && <div className="mb-1.5 font-medium">{mobileTitle(row)}</div>}
            <dl className="space-y-1">
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-xs text-muted-foreground">{col.header}</dt>
                  <dd className="text-right text-sm">{col.render(row)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
