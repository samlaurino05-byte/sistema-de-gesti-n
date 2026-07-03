import {
  LayoutDashboard,
  Users,
  FileText,
  HandCoins,
  UserSquare2,
  Clock3,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  description: string;
};

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    enabled: true,
    description: "Centro de operaciones",
  },
  {
    label: "Clientes",
    href: "/clients",
    icon: Users,
    enabled: true,
    description: "Cartera y estado de cuenta",
  },
  {
    label: "Facturación",
    href: "/invoices",
    icon: FileText,
    enabled: true,
    description: "Comprobantes y cobros",
  },
  {
    label: "Cobranzas",
    href: "/collections",
    icon: HandCoins,
    enabled: true,
    description: "Seguimiento de pagos pendientes",
  },
  {
    label: "Empleados",
    href: "/employees",
    icon: UserSquare2,
    enabled: true,
    description: "Legajos y horas",
  },
  {
    label: "Horas",
    href: "/hours",
    icon: Clock3,
    enabled: true,
    description: "Registro de horas trabajadas",
  },
  {
    label: "Reportes",
    href: "/reports",
    icon: BarChart3,
    enabled: true,
    description: "Indicadores y balances",
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: Settings,
    enabled: false,
    description: "Preferencias del sistema",
  },
];
