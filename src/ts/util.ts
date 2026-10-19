// Kleine hulpfuncties zonder toestand.
export const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : [];

export const COLOR_HEX: Record<string, string> = {
  zwart: "#1d1d1d", wit: "#f6f6f2", ecru: "#ece4d2", "crème": "#ece4d2", beige: "#d8c8a8", camel: "#c19a6b",
  bruin: "#6b4a2b", tabak: "#7a4a2a", kaki: "#a8a07a", khaki: "#a8a07a", olijf: "#5b6140", groen: "#2f6b3a",
  navy: "#1f2a44", blauw: "#2f5fa0", lichtblauw: "#9cc0e0", donkerblauw: "#1f2a44", denim: "#3d5a80",
  grijs: "#8c8c8c", antraciet: "#3a3c3f", rood: "#b23a2e", bordeaux: "#6e1f2a", oranje: "#d9792b",
  geel: "#d8b33a", mosterd: "#c49a2c", roze: "#e3a5b5", paars: "#6b4a8a", taupe: "#8b7d6b", zand: "#cdbb94",
  turquoise: "#3aa7a0",
};
export const hex = (c: string) => COLOR_HEX[c.toLowerCase()] ?? "transparent";

export const fmtDate = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(+d) ? s : d.toLocaleDateString("nl-BE", { day: "numeric", month: "short", year: "numeric" });
};

/** Middenkoers yuan naar euro op 27 september 2026. */
export const RATE = 0.130746;
export const eur = (n: number) => "€" + n.toFixed(2).replace(".", ",");
export const two = (n: number) => String(n).padStart(2, "0");
export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
