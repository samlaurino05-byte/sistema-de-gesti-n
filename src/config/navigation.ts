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
};

export const navigation: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Clientes", href: "/clientes", icon: Users, enabled: false },
  { label: "Facturación", href: "/facturacion", icon: FileText, enabled: false },
  { label: "Empleados", href: "/empleados", icon: UserSquare2, enabled: false },
  { label: "Reportes", href: "/reportes", icon: BarChart3, enabled: false },
  { label: "Configuración", href: "/configuracion", icon: Settings, enabled: false },
];
