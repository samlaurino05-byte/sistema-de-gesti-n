type HourTableHeadProps = {
  showEmployee?: boolean;
  showClient?: boolean;
};

export function HourTableHead({ showEmployee = true, showClient = true }: HourTableHeadProps) {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
        <th className="whitespace-nowrap px-4 py-3">Fecha</th>
        {showEmployee && <th className="whitespace-nowrap px-4 py-3">Empleado</th>}
        {showClient && <th className="whitespace-nowrap px-4 py-3">Cliente</th>}
        <th className="whitespace-nowrap px-4 py-3">Proyecto</th>
        <th className="whitespace-nowrap px-4 py-3">Horas</th>
        <th className="whitespace-nowrap px-4 py-3">Valor h. interno</th>
        <th className="whitespace-nowrap px-4 py-3">Valor h. cliente</th>
        <th className="whitespace-nowrap px-4 py-3">Costo</th>
        <th className="whitespace-nowrap px-4 py-3">Facturación</th>
        <th className="whitespace-nowrap px-4 py-3">Margen</th>
        <th className="whitespace-nowrap px-4 py-3">Estado</th>
      </tr>
    </thead>
  );
}
