export type Palette = Record<string, string>;

const channels = (hex: string): number[] =>
  [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

const toHex = (rgb: number[]): string =>
  '#' + rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('');

const mix = (hex: string, target: number, ratio: number): string =>
  toHex(channels(hex).map((value) => value + (target - value) * ratio));

const LIGHTER: Record<string, number> = {
  '50': 0.95,
  '100': 0.9,
  '200': 0.78,
  '300': 0.62,
  '400': 0.4,
  '500': 0.18,
};
const DARKER: Record<string, number> = { '700': 0.22, '800': 0.42, '900': 0.62, '950': 0.78 };

/** The brand scale used for menus, buttons and highlights. The chosen color is shade 600. */
export function primaryPalette(base: string): Palette {
  const palette: Palette = {};
  for (const [shade, ratio] of Object.entries(LIGHTER)) palette[shade] = mix(base, 255, ratio);
  palette['600'] = base.toLowerCase();
  for (const [shade, ratio] of Object.entries(DARKER)) palette[shade] = mix(base, 0, ratio);
  return palette;
}

/** The accent scale. The chosen color is shade 500. */
export function accentPalette(base: string): Palette {
  return {
    '50': mix(base, 255, 0.9),
    '100': mix(base, 255, 0.76),
    '400': mix(base, 255, 0.22),
    '500': base.toLowerCase(),
    '600': mix(base, 0, 0.16),
  };
}
