import type { SVGProps } from "react";

const PATH = {
  home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16 8l-2 6-6 2 2-6z",
  book: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.2 13.9L7 23l5-3 5 3-1.2-9.1",
  chart: "M12 20V10 M18 20V4 M6 20v-4",
  trophy: "M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M17 5h3v2a3 3 0 0 1-3 3 M7 5H4v2a3 3 0 0 0 3 3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  close: "M6 6l12 12 M18 6L6 18",
  chevron: "M6 9l6 6 6-6",
  check: "M5 12l5 5L20 7",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
  play: "M6 4l14 8-14 8z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 16v-4 M12 8h.01",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  calendar: "M4 6h16v15H4z M4 10h16 M8 3v4 M16 3v4",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  print: "M6 9V3h12v6 M6 18H4v-7h16v7h-2 M6 14h12v7H6z",
} as const;

export type NamaIkon = keyof typeof PATH;

export function Ikon({ nama, size = 20, ...rest }: { nama: NamaIkon; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d={PATH[nama]} />
    </svg>
  );
}

/** Lambang Baku Jaga: dua tangan menopang hati (sederhana, milik sendiri). */
export function Lambang({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#fff" fillOpacity="0.14" />
      <path d="M20 29.5c-6-4.3-9-7.4-9-11 0-2.7 2-4.5 4.4-4.5 1.9 0 3.6 1 4.6 2.7 1-1.7 2.7-2.7 4.6-2.7 2.4 0 4.4 1.8 4.4 4.5 0 3.6-3 6.7-9 11z" fill="#fff" />
      <path d="M9 27c3 3.6 6.600 5 11 5s8-1.400 11-5" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
