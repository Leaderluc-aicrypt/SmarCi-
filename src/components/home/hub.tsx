import { Package, Plane, Ship, Truck } from "lucide-react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

/**
 * Hub d'accueil : le bouton central doré, entouré d'une orbite d'icônes.
 *
 * Reprend la composition de la maquette MVP, en positionnement relatif plutôt
 * qu'en pixels fixes — l'original était calibré pour une carte de 280 px, ce
 * qui débordait sur les petits écrans.
 *
 * Les icônes d'orbite sont purement décoratives : elles évoquent la chaîne
 * d'importation, elles ne mènent nulle part. Elles sont donc masquées aux
 * lecteurs d'écran.
 */
const WAYPOINTS = [
  { Icon: Package, angle: -60 },
  { Icon: Ship, angle: 30 },
  { Icon: Truck, angle: 120 },
  { Icon: Plane, angle: 210 },
] as const;

/** Rayon de l'orbite, en pourcentage du conteneur (128/280 dans la maquette). */
const ORBITE = 45.7;

export function Hub({ href }: { href: string }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      {/* Orbite en pointillés */}
      <div
        aria-hidden
        className="absolute inset-[4%] rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: "var(--orbit)" }}
      />

      {WAYPOINTS.map(({ Icon, angle }) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <div
            key={angle}
            aria-hidden
            className="absolute flex size-11 items-center justify-center rounded-full shadow-[0_2px_6px_rgba(18,41,79,0.15)]"
            style={{
              left: `${50 + ORBITE * Math.cos(rad)}%`,
              top: `${50 + ORBITE * Math.sin(rad)}%`,
              transform: "translate(-50%, -50%)",
              background: "var(--waypoint)",
              color: "var(--waypoint-foreground)",
            }}
          >
            <Icon size={18} strokeWidth={1.75} />
          </div>
        );
      })}

      <Link
        href={href}
        className="absolute top-1/2 left-1/2 flex size-[53%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center transition-transform outline-none hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-offset-2 motion-safe:animate-[hub-pulse_3s_ease-out_infinite]"
        style={{
          background: "linear-gradient(155deg, var(--hub-from), var(--hub-to))",
          color: "var(--hub-foreground)",
        }}
      >
        <MessageCircle size={28} strokeWidth={2} aria-hidden />
        <span className="mt-2 px-4 font-display text-sm leading-tight font-bold">
          Discuter avec SmarCi
        </span>
      </Link>
    </div>
  );
}
