import { SettingsInfoCard } from "@/components/settings/SettingsInfoCard";
import { billingSettings } from "@/lib/mock/settings";

export function BillingSection() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Parámetros de facturación</h2>
        <p className="mt-1 text-sm text-slate-500">Valores por defecto usados al emitir nuevos comprobantes</p>
      </section>

      <SettingsInfoCard
        title="Comprobantes"
        description="Numeración y condiciones que se aplican a las facturas nuevas"
        fields={[
          { label: "IVA por defecto", value: `${billingSettings.ivaPorDefecto}%` },
          { label: "Moneda", value: billingSettings.moneda },
          { label: "Condición de pago por defecto", value: billingSettings.condicionPagoPorDefecto },
          { label: "Días de vencimiento", value: `${billingSettings.diasVencimiento} días` },
          { label: "Punto de venta", value: billingSettings.puntoVenta },
          { label: "Próximo número de factura", value: billingSettings.proximoNumeroFactura },
        ]}
      />
    </div>
  );
}
