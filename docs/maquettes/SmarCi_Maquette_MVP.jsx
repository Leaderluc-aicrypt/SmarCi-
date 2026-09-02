import React from "react";
import { Home, MessageCircle, User, Package, Ship, Truck, Plane } from "lucide-react";

const colors = {
  skyTop: "#8AD1F5",
  skyBottom: "#4FA3E0",
  navy: "#1B3B6F",
  navyDeep: "#12294F",
  gold: "#F0C15C",
  goldDeep: "#C9971F",
  paper: "#FFFFFF",
  muted: "#6E93B8",
};

const waypoints = [
  { Icon: Package, angle: -60 },
  { Icon: Ship, angle: 30 },
  { Icon: Truck, angle: 120 },
  { Icon: Plane, angle: 210 },
];

export default function SmarCiHomeMVP() {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 128;
  const iconHalf = 22;

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif", background: "#EAF6FF" }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        @keyframes pulseRing {
          0% { box-shadow: 0 0 0 0 rgba(240,193,92,0.45); }
          70% { box-shadow: 0 0 0 24px rgba(240,193,92,0); }
          100% { box-shadow: 0 0 0 0 rgba(240,193,92,0); }
        }
        .hub-pulse { animation: pulseRing 3s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hub-pulse { animation: none; }
        }
      `}</style>

      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${colors.skyTop} 0%, ${colors.skyBottom} 100%)`,
          minHeight: "700px",
          border: "1px solid rgba(255,255,255,0.4)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-6 pb-2">
          <div>
            <div
              style={{ fontFamily: "'Roboto Slab', serif", color: colors.navy }}
              className="text-lg font-bold tracking-tight leading-none"
            >
              SmarCi
            </div>
            <div style={{ color: colors.navyDeep, opacity: 0.65 }} className="text-xs mt-0.5">
              Ton copilote pour importer
            </div>
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: colors.paper,
              color: colors.navy,
              border: `1px solid rgba(27,59,111,0.2)`,
            }}
            className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm"
          >
            Essai · 7j restants
          </div>
        </div>

        {/* Hub */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="relative" style={{ width: size, height: size }}>
            {/* dotted orbit ring */}
            <div
              style={{
                position: "absolute",
                inset: 12,
                borderRadius: "9999px",
                border: `1.5px dashed rgba(27,59,111,0.25)`,
              }}
            />

            {waypoints.map(({ Icon, angle }, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = cx + r * Math.cos(rad) - iconHalf;
              const y = cy + r * Math.sin(rad) - iconHalf;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, width: 44, height: 44 }}>
                  <div
                    style={{ background: colors.paper, boxShadow: "0 2px 6px rgba(18,41,79,0.15)" }}
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                  >
                    <Icon size={18} color={colors.navy} strokeWidth={1.75} />
                  </div>
                </div>
              );
            })}

            {/* center hub button */}
            <button
              className="hub-pulse absolute rounded-full flex flex-col items-center justify-center"
              style={{
                left: cx - 75,
                top: cy - 75,
                width: 150,
                height: 150,
                background: `linear-gradient(155deg, ${colors.gold}, ${colors.goldDeep})`,
                border: "none",
                cursor: "pointer",
              }}
            >
              <MessageCircle size={28} color={colors.navyDeep} strokeWidth={2} />
              <span
                style={{ fontFamily: "'Roboto Slab', serif", color: colors.navyDeep }}
                className="text-sm font-bold mt-2 leading-tight text-center px-4"
              >
                Discuter avec
                <br />
                SmarCi
              </span>
            </button>
          </div>
        </div>

        {/* bottom nav */}
        <div
          className="flex items-center justify-around px-6 py-4"
          style={{ background: colors.paper, borderTop: "1px solid rgba(27,59,111,0.08)" }}
        >
          <NavItem Icon={Home} label="Accueil" active />
          <NavItem Icon={MessageCircle} label="Conversation" />
          <NavItem Icon={User} label="Profil" />
        </div>
      </div>
    </div>
  );
}

function NavItem({ Icon, label, active }) {
  const c = active ? colors.gold : colors.muted;
  const textColor = active ? colors.navy : colors.muted;
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={20} color={active ? colors.navy : colors.muted} strokeWidth={1.75} />
      <span style={{ color: textColor, fontFamily: "'Inter', sans-serif" }} className="text-xs">
        {label}
      </span>
    </div>
  );
}
