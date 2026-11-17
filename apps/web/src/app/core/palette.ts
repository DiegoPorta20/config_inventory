/** Mirrors how a brand color becomes a 50-950 scale; the base color is shade 600. */
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const TOWARD_WHITE: Record<number, number> = {
  50: 0.95,
  100: 0.9,
  200: 0.78,
  300: 0.62,
  400: 0.4,
  500: 0.18,
};
const TOWARD_BLACK: Record<number, number> = { 700: 0.22, 800: 0.42, 900: 0.62, 950: 0.78 };

function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex(rgb: number[]): string {
  return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function mix(hex: string, target: number, ratio: number): string {
  return toHex(channels(hex).map((c) => c + (target - c) * ratio));
}

export function buildPalette(base: string): Record<number, string> {
  const palette: Record<number, string> = {};
  for (const shade of SHADES) {
    if (shade === 600) palette[shade] = base.toLowerCase();
    else if (shade in TOWARD_WHITE) palette[shade] = mix(base, 255, TOWARD_WHITE[shade] ?? 0);
    else palette[shade] = mix(base, 0, TOWARD_BLACK[shade] ?? 0);
  }
  return palette;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
