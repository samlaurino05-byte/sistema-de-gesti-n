import { AppShell } from "@/components/layout/AppShell";
import { ActiveSessionProvider } from "@/components/layout/active-session-context";
import { requireActiveSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireActiveSession();

  return (
    <ActiveSessionProvider session={session}>
      <AppShell>{children}</AppShell>
    </ActiveSessionProvider>
  );
}
