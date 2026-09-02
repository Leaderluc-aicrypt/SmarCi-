"use client";

import { MessageCircle, Package, Plane, Ship, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";

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

/** Durée de l'ouverture. Courte : elle s'intercale à chaque accès au copilote. */
const OUVERTURE_MS = 420;

type Origine = { x: number; y: number; taille: number };

export function Hub({ href }: { href: string }) {
  const router = useRouter();
  const [origine, setOrigine] = useState<Origine | null>(null);

  // La destination est préchargée : l'animation masque le chargement au lieu
  // de s'y ajouter.
  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  function ouvrir(event: MouseEvent<HTMLAnchorElement>) {
    // Laisse passer les ouvertures dans un nouvel onglet.
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    event.preventDefault();

    const reduit = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduit) {
      router.push(href);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Diamètre suffisant pour couvrir l'écran depuis ce point, quel qu'il soit.
    const taille =
      2 *
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

    setOrigine({ x, y, taille });
    window.setTimeout(() => router.push(href), OUVERTURE_MS);
  }

  return (
    <>
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
          onClick={ouvrir}
          className="absolute top-1/2 left-1/2 flex size-[53%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center transition-transform outline-none hover:scale-[1.02] focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:animate-[hub-pulse_3s_ease-out_infinite]"
          style={{
            background:
              "linear-gradient(155deg, var(--hub-from), var(--hub-to))",
            color: "var(--hub-foreground)",
          }}
        >
          <MessageCircle size={28} strokeWidth={2} aria-hidden />
          <span className="mt-2 px-4 font-display text-sm leading-tight font-bold">
            Discuter avec SmarCi
          </span>
        </Link>
      </div>

      {/* Ouverture : le disque doré s'étend jusqu'à couvrir l'écran, puis la
          navigation prend le relais. */}
      {origine ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        >
          <div
            className="absolute rounded-full"
            style={{
              left: origine.x,
              top: origine.y,
              width: origine.taille,
              height: origine.taille,
              marginLeft: -origine.taille / 2,
              marginTop: -origine.taille / 2,
              background:
                "linear-gradient(155deg, var(--hub-from), var(--hub-to))",
              animation: `hub-ouverture ${OUVERTURE_MS}ms ease-in forwards`,
            }}
          />
        </div>
      ) : null}
    </>
  );
}
