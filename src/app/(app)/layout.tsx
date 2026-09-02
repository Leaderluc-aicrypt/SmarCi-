import { BottomNav } from "@/components/layout/bottom-nav";

/**
 * Coquille de l'application : dégradé de fond et navigation basse.
 *
 * La maquette présentait l'écran dans une carte de téléphone posée sur une
 * page ; en production, l'application occupe tout le viewport.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ background: "var(--app-gradient)" }}
    >
      {children}
      <BottomNav />
    </div>
  );
}
