import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { Bingkai } from "@/components/Bingkai";
import { FxLayer } from "@/components/FxLayer";
import { LangSync } from "@/components/LangSwitch";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Teman Ada",
  description:
    "Teman bermain untuk mengenali dan menenangkan perasaan, dengan pendamping dewasa yang siap menolong.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff6e5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${baloo.variable} ${nunito.variable} ${jakarta.variable}`}>
      <body>
        <Bingkai>{children}</Bingkai>
        <FxLayer />
        <LangSync />
      </body>
    </html>
  );
}
