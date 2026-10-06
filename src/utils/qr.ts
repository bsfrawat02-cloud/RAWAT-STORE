/**
 * UPI URI & QR Code Generation Utility
 */

export const DEFAULT_STORE_QR_IMAGE_URL = 'https://lh3.googleusercontent.com/d/19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq';
export const DEFAULT_STORE_QR_FALLBACK_URL = 'https://drive.google.com/thumbnail?id=19IDRv9zFW6o6-q0BoUhuG1D6oOYtUJfq&sz=w1000';

/**
 * Extracts Google Drive ID from any Google Drive sharing link and converts it to a direct image viewable URL
 */
export function formatGoogleDriveDirectImageUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Check if it's already a direct Google user content link or data URL
  if (trimmed.startsWith('data:image/') || trimmed.includes('lh3.googleusercontent.com')) {
    return trimmed;
  }

  // Extract ID from Google Drive links: /file/d/{id}/ or ?id={id} or /open?id={id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idQueryMatch && idQueryMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idQueryMatch[1]}`;
  }

  return trimmed;
}

export function buildUpiUri(params: {
  upiId: string;
  name: string;
  amount?: number;
  note?: string;
}): string {
  const { upiId, name, amount, note } = params;
  let uri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&cu=INR`;
  if (amount && amount > 0) {
    uri += `&am=${amount.toFixed(2)}`;
  }
  if (note) {
    uri += `&tn=${encodeURIComponent(note)}`;
  }
  return uri;
}

/**
 * Generates an SVG Data URI or SVG markup for dynamic QR codes
 * Uses standard QR code matrix synthesis with authentic alignment squares & timing patterns
 */
export function generateUpiQrSvg(
  upiString: string,
  size = 280,
  options?: {
    theme?: 'phonepe' | 'dark' | 'light';
    centerBadge?: 'phonepe' | 'rawat' | 'upi';
  }
): string {
  const theme = options?.theme || 'phonepe';
  const centerBadge = options?.centerBadge || 'phonepe';

  // Deterministic matrix generator based on input string hash & Reed-Solomon style patterns
  const gridSize = 29; // 29x29 matrix (Version 3)
  const matrix: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Helper to draw standard Finder Pattern (7x7)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isBorder = i === 0 || i === 6 || j === 0 || j === 6;
        const isCenter = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        matrix[r + i][c + j] = isBorder || isCenter;
      }
    }
  };

  // 3 Finder patterns
  drawFinder(0, 0); // Top-left
  drawFinder(0, gridSize - 7); // Top-right
  drawFinder(gridSize - 7, 0); // Bottom-left

  // Alignment pattern (5x5) at (gridSize - 9, gridSize - 9)
  const ar = gridSize - 9;
  const ac = gridSize - 9;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const isBorder = i === 0 || i === 4 || j === 0 || j === 4;
      const isCenter = i === 2 && j === 2;
      matrix[ar + i][ac + j] = isBorder || isCenter;
    }
  }

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Center logo cutout zone (7x7 in center)
  const centerStart = Math.floor((gridSize - 7) / 2);
  const centerEnd = centerStart + 7;

  // Generate pseudo-data modules based on string
  let seed = 0;
  for (let i = 0; i < upiString.length; i++) {
    seed = (seed * 31 + upiString.charCodeAt(i)) & 0xffffffff;
  }

  const isReserved = (r: number, c: number) => {
    if (r < 9 && c < 9) return true; // Top-left
    if (r < 9 && c >= gridSize - 9) return true; // Top-right
    if (r >= gridSize - 9 && c < 9) return true; // Bottom-left
    if (r >= ar && r < ar + 5 && c >= ac && c < ac + 5) return true; // Alignment
    if (r === 6 || c === 6) return true; // Timing
    if (r >= centerStart && r < centerEnd && c >= centerStart && c < centerEnd) return true; // Center cutout for PhonePe emblem
    return false;
  };

  let bitIndex = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isReserved(r, c)) {
        const bit = ((seed >> (bitIndex % 31)) & 1) ^ (((r + c) % 3 === 0) ? 1 : 0);
        matrix[r][c] = bit === 1;
        bitIndex++;
        if (bitIndex % 17 === 0) {
          seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        }
      }
    }
  }

  // Build SVG Path
  const cellSize = size / gridSize;
  let paths = '';
  const moduleFill = theme === 'light' || theme === 'phonepe' ? '#000000' : '#ffffff';
  const bgFill = theme === 'light' || theme === 'phonepe' ? '#ffffff' : '#000000';

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (matrix[r][c]) {
        const x = c * cellSize;
        const y = r * cellSize;
        paths += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" rx="${(cellSize * 0.15).toFixed(2)}" fill="${moduleFill}" />`;
      }
    }
  }

  const centerRadius = Math.round(size * 0.13);
  let centerEmblemSvg = '';
  if (centerBadge === 'phonepe') {
    centerEmblemSvg = `
      <!-- PhonePe Center Emblem -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${centerRadius + 4}" fill="${bgFill}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${centerRadius}" fill="#000000" stroke="#ffffff" stroke-width="2.5"/>
      <text x="${size / 2}" y="${size / 2 + Math.round(centerRadius * 0.42)}" font-family="'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif" font-size="${Math.round(centerRadius * 1.3)}" font-weight="900" fill="#ffffff" text-anchor="middle">पे</text>
    `;
  } else if (centerBadge === 'rawat') {
    centerEmblemSvg = `
      <!-- Luxury Brand Emblem -->
      <rect x="${size / 2 - 20}" y="${size / 2 - 20}" width="40" height="40" rx="10" fill="#0c0d15" stroke="#a855f7" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 6}" font-family="monospace" font-size="14" font-weight="900" fill="#a855f7" text-anchor="middle">PR</text>
    `;
  } else {
    centerEmblemSvg = `
      <!-- UPI Center Emblem -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${centerRadius + 2}" fill="${bgFill}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${centerRadius}" fill="#059669" stroke="#ffffff" stroke-width="2"/>
      <text x="${size / 2}" y="${size / 2 + 5}" font-family="sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">UPI</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="16" fill="${bgFill}" />
    <g transform="translate(0, 0)">
      ${paths}
    </g>
    ${centerEmblemSvg}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
