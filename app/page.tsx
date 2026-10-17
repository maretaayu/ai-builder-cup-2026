"use client";

import { Aman, CaraKerja, CopilotDemo, Masalah, NavAtas, Penutup, Pintu } from "@/components/landing/Bagian";
import { Hero } from "@/components/landing/Hero";

export default function Beranda() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <NavAtas />
      <Hero />
      <Masalah />
      <CaraKerja />
      <Pintu />
      <CopilotDemo />
      <Aman />
      <Penutup />
    </div>
  );
}
