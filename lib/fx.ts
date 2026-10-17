/** Efek visual global (bintang terbang, konfeti, percikan) lewat peristiwa jendela. Dirender oleh FxLayer. */

function emit(name: string, detail: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export const fx = {
  bintang: (n = 1) => emit("rr:bintang", { n }),
  rayakan: () => emit("rr:rayakan", {}),
  percik: (x: number, y: number, warna?: string) => emit("rr:percik", { x, y, warna }),
};
