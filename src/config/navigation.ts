import {
  LayoutDashboard,
  Users,
  FileText,
  UserSquare2,
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
    href: "/clientes",
    icon: Users,
    enabled: false,
    description: "Cartera y estado de cuenta",
  },
  {
    label: "Facturación",
    href: "/facturacion",
    icon: FileText,
    enabled: false,
    description: "Comprobantes y cobros",
  },
  {
    label: "Empleados",
    href: "/empleados",
    icon: UserSquare2,
    enabled: false,
    description: "Legajos y horas",
  },
  {
    label: "Reportes",
    href: "/reportes",
    icon: BarChart3,
    enabled: false,
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
