/**
 * Calcula a luminosidade relativa de uma cor (W3C WCAG 2.0)
 * @param hex - Cor em formato hexadecimal (#RRGGBB)
 * @returns Valor de luminosidade entre 0 e 1
 */
export function getRelativeLuminance(hex: string): number {
  // Remove o # se houver
  const cleanHex = hex.replace('#', '');

  // Converte hex para RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Normaliza os valores RGB (0-255 para 0-1)
  const [rs, gs, bs] = [r, g, b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // Calcula a luminosidade relativa
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Retorna a cor de texto ideal (preto ou branco) baseada no fundo
 * @param backgroundColor - Cor de fundo em formato hexadecimal
 * @returns '#FFFFFF' (branco) ou '#000000' (preto)
 */
export function getContrastColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);

  // Se a luminosidade for alta (fundo claro), retorna texto escuro
  // Se a luminosidade for baixa (fundo escuro), retorna texto claro
  return luminance > 0.5 ? '#0F2741' : '#FFFFFF';
}

/**
 * Calcula a razão de contraste entre duas cores (W3C WCAG 2.0)
 * @param color1 - Primeira cor em formato hexadecimal
 * @param color2 - Segunda cor em formato hexadecimal
 * @returns Razão de contraste (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}
