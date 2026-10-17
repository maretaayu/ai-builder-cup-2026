import Image from "next/image";
import type { ReactNode } from "react";
import type { Weather } from "@/lib/store";

const INK = "#1e2a4a";

function Svg({ children, size = 64, label }: { children: ReactNode; size?: number; label?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
      stroke={INK}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const CLOUD = "M28 70 Q12 70 13 55 Q14 42 28 42 Q31 26 50 26 Q68 26 72 42 Q88 42 88 56 Q88 70 72 70 Z";

export function WeatherIcon({
  weather,
  size = 64,
  animated = false,
}: {
  weather: Weather;
  size?: number;
  animated?: boolean;
}) {
  const an = (c: string) => (animated ? c : "");
  switch (weather) {
    case "cerah":
      return (
        <Svg size={size}>
          <g className={an("anim-putar")}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line
                key={a}
                x1={50 + Math.cos((a * Math.PI) / 180) * 26}
                y1={50 + Math.sin((a * Math.PI) / 180) * 26}
                x2={50 + Math.cos((a * Math.PI) / 180) * 36}
                y2={50 + Math.sin((a * Math.PI) / 180) * 36}
              />
            ))}
          </g>
          <circle cx={50} cy={50} r={17} fill="#f6b93b" />
        </Svg>
      );
    case "mendung":
      return (
        <Svg size={size}>
          <circle cx={70} cy={34} r={12} fill="#f6b93b" />
          <g className={an("anim-awan")}>
            <path d={CLOUD} fill="#e7edf5" transform="translate(0 4)" />
          </g>
        </Svg>
      );
    case "hujan":
      return (
        <Svg size={size}>
          <path d={CLOUD} fill="#b9c8dc" transform="translate(0 -6)" />
          {[
            [34, 0],
            [50, 0.35],
            [66, 0.7],
          ].map(([x, d]) => (
            <line
              key={x}
              x1={x}
              y1={72}
              x2={x - 4}
              y2={84}
              stroke="#3a8fd1"
              className={an("anim-hujan")}
              style={animated ? { animationDelay: `${d}s` } : undefined}
            />
          ))}
        </Svg>
      );
    case "badai":
      return (
        <Svg size={size}>
          <path d={CLOUD} fill="#7c8aa3" transform="translate(0 -8)" />
          <path className={an("anim-kilat")} d="M54 56 L40 76 L51 76 L45 94 L66 70 L54 70 Z" fill="#f6b93b" />
        </Svg>
      );
  }
}

export function BalloonIcon({ size = 64, color = "#ef6f5e" }: { size?: number; color?: string }) {
  return (
    <Svg size={size}>
      <path d="M50 12 Q76 14 76 40 Q76 62 50 72 Q24 62 24 40 Q24 14 50 12 Z" fill={color} />
      <path d="M46 72 L50 80 L54 72 Z" fill={color} />
      <path d="M50 80 Q44 88 52 94" />
      <path d="M36 28 Q38 20 46 19" strokeWidth={3} stroke="#fff" />
    </Svg>
  );
}

export function BookIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M14 24 Q32 18 50 28 Q68 18 86 24 L86 74 Q68 68 50 78 Q32 68 14 74 Z" fill="#fff" />
      <path d="M50 28 L50 78" />
      <path d="M24 38 Q34 36 42 40 M24 50 Q34 48 42 52 M58 40 Q66 36 76 38 M58 52 Q66 48 76 50" strokeWidth={2.5} />
    </Svg>
  );
}

export function FaceIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx={50} cy={50} r={34} fill="#f6b93b" />
      <circle cx={38} cy={44} r={4} fill={INK} stroke="none" />
      <circle cx={62} cy={44} r={4} fill={INK} stroke="none" />
      <path d="M36 60 Q50 74 64 60" />
    </Svg>
  );
}

export function HeartHandsIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M50 78 Q18 56 18 36 Q18 20 33 20 Q44 20 50 30 Q56 20 67 20 Q82 20 82 36 Q82 56 50 78 Z" fill="#ef6f5e" />
      <path d="M38 34 Q40 29 45 28" stroke="#fff" strokeWidth={3} />
    </Svg>
  );
}

export function StarIcon({ size = 28, filled = true }: { size?: number; filled?: boolean }) {
  return (
    <Svg size={size}>
      <path
        d="M50 10 L61 38 L91 40 L68 59 L76 88 L50 72 L24 88 L32 59 L9 40 L39 38 Z"
        fill={filled ? "#f6b93b" : "#fff"}
        strokeWidth={5}
      />
    </Svg>
  );
}

export function SpeakerIcon({ size = 28, off = false }: { size?: number; off?: boolean }) {
  return (
    <Svg size={size}>
      <path d="M18 40 L34 40 L54 24 L54 76 L34 60 L18 60 Z" fill="#fff" strokeWidth={5} />
      {off ? (
        <path d="M66 38 L88 62 M88 38 L66 62" strokeWidth={5} />
      ) : (
        <>
          <path d="M66 38 Q74 50 66 62" strokeWidth={5} />
          <path d="M76 28 Q92 50 76 72" strokeWidth={5} />
        </>
      )}
    </Svg>
  );
}

export function ArrowLeftIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M62 20 L32 50 L62 80" strokeWidth={9} />
    </Svg>
  );
}

export function CheckIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M20 52 L42 74 L82 28" strokeWidth={10} />
    </Svg>
  );
}

export type Adult = "ibu" | "bapak" | "guru" | "kakek-nenek" | "paman-bibi";

export const ADULTS: { id: Adult; label: string; warna: string }[] = [
  { id: "ibu", label: "Ibu", warna: "#fbd3cc" },
  { id: "bapak", label: "Bapak", warna: "#cdeeea" },
  { id: "guru", label: "Bu/Pak Guru", warna: "#fde7ad" },
  { id: "kakek-nenek", label: "Kakek / Nenek", warna: "#e3e0f5" },
  { id: "paman-bibi", label: "Paman / Bibi", warna: "#d8efcf" },
];

export function AdultIcon({ id, size = 64 }: { id: Adult; size?: number }) {
  return (
    <Image
      src={`/img/dewasa-${id}.webp`}
      width={256}
      height={256}
      unoptimized
      alt=""
      aria-hidden
      draggable={false}
      className="select-none rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export type BodyPart = "kepala" | "dada" | "perut" | "tangan";

export function BodyIcon({ part, size = 56 }: { part: BodyPart; size?: number }) {
  const on = "#ef6f5e";
  const off = "#fff";
  return (
    <Svg size={size}>
      <circle cx={50} cy={20} r={13} fill={part === "kepala" ? on : off} />
      <rect x={32} y={36} width={36} height={52} rx={14} fill="#fde7ad" />
      <rect x={13} y={40} width={16} height={42} rx={8} fill={part === "tangan" ? on : "#fde7ad"} />
      <rect x={71} y={40} width={16} height={42} rx={8} fill="#fde7ad" />
      {part === "dada" && <circle cx={50} cy={50} r={9} fill={on} />}
      {part === "perut" && <circle cx={50} cy={72} r={9} fill={on} />}
    </Svg>
  );
}
