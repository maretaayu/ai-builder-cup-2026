"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Layar anak memakai bingkai ponsel; beranda utama dan area pelatih (ToT) memakai tata letak web selebar layar. */
export function Bingkai({ children }: { children: ReactNode }) {
  const path = usePathname();
  const lebar = path === "/" || path.startsWith("/akademi") || path.startsWith("/mulai");
  return (
    <div
      className={
        lebar
          ? "lms flex min-h-dvh w-full flex-col bg-abu"
          : "mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-krem sm:border-x-4 sm:border-tinta"
      }
    >
      {children}
    </div>
  );
}
