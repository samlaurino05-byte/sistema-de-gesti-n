"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { clients } from "@/lib/mock/clients";
import { employees } from "@/lib/mock/employees";
import { formatCurrency } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

export function NewHourEntryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [proyecto, setProyecto] = useState("");
  const [fecha, setFecha] = useState(today);
  const [horas, setHoras] = useState("1");
  const [descripcion, setDescripcion] = useState("");

  const selectedEmployee = employees.find((employee) => employee.id === employeeId);
  const selectedClient = clients.find((client) => client.id === clientId);

  const { costo, facturacion, margen } = useMemo(() => {
    const hoursValue = Number(horas) || 0;
    const valorHoraInterno = selectedEmployee?.valorHoraInterno ?? 0;
    const valorHoraCliente = selectedClient?.valorHora ?? 0;
    const costoCalculado = hoursValue * valorHoraInterno;
    const facturacionCalculada = hoursValue * valorHoraCliente;

    return {
      costo: costoCalculado,
      facturacion: facturacionCalculada,
      margen: facturacionCalculada - costoCalculado,
    };
  }, [horas, selectedEmployee, selectedClient]);

  function handleClose() {
    setIsOpen(false);
    setProyecto("");
    setFecha(today);
    setHoras("1");
    setDescripcion("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        Nueva carga de horas
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Nueva carga de horas</h2>
                <p className="mt-0.5 text-xs text-slate-500">Formulario mock — el cálculo se actualiza en vivo</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-600">
                Empleado
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Cliente
                <select
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nombreComercial}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Proyecto
                <input
                  type="text"
                  value={proyecto}
                  onChange={(event) => setProyecto(event.target.value)}
                  placeholder="Ej: Cierre mensual"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Fecha
                <input
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-medium text-slate-600">
                Cantidad de horas
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={horas}
                  onChange={(event) => setHoras(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
                Descripción
                <textarea
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  placeholder="Detalle de la tarea realizada"
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-indigo-50 p-3 ring-1 ring-inset ring-indigo-100">
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Costo interno</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(costo)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Monto facturable</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(facturacion)}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-indigo-400">Margen</p>
                <p className="mt-0.5 text-sm font-semibold text-indigo-900">{formatCurrency(margen)}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Registrar carga
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
