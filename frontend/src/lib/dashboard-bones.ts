// src/lib/dashboard-bones.ts
import type { ResponsiveBones } from "boneyard-js";

type Bone = [number, number, number, number, number | string] | [number, number, number, number, number | string, boolean];

// Bones internos de una tarjeta de estadística (icono + label + valor + tendencia)
// x y w son % del contenedor; y y h son px.
function cardBones(cardX: number, cardY: number, cardW: number, cardH: number): Bone[] {
  const innerX = cardX + 2.2; // padding interno aprox (1.5rem de 1152px ~ 2.1%)
  return [
    [cardX, cardY, cardW, cardH, 12, true], // contenedor de la card
    // label (arriba)
    [innerX, cardY + 16, cardW * 0.28, 12, 4],
    // icono (esquina derecha)
    [cardX + cardW - 10, cardY + 12, 8, 32, 8],
    // valor (grande)
    [innerX, cardY + 42, cardW * 0.45, 30, 4],
    // tendencia
    [innerX, cardY + cardH - 22, cardW * 0.32, 10, 4],
  ];
}

function buildStatCards(count: number, gapPx: number, containerW: number): Bone[] {
  const bones: Bone[] = [];
  const gap = (gapPx / containerW) * 100;
  const cardW = (100 - gap * (count - 1)) / count;
  const cardH = 110;
  for (let i = 0; i < count; i++) {
    const x = i * (cardW + gap);
    bones.push(...cardBones(x, 0, cardW, cardH));
  }
  return bones;
}

// Tabla "Consumo por Vehículo": título + header + filas
function tableBones(y: number): Bone[] {
  return [
    [0, y, 100, 60, 12, true], // contenedor glass
    [3, y + 18, 30, 20, 4], // título
    [3, y + 52, 94, 18, 4], // header
    [3, y + 82, 94, 26, 4],
    [3, y + 112, 94, 26, 4],
    [3, y + 142, 94, 26, 4],
  ];
}

const mobile: Bone[] = [
  ...buildStatCards(1, 24, 327),
  ...tableBones(140 + 40), // y después de 4 cards apiladas
];

const tablet: Bone[] = [
  ...buildStatCards(2, 24, 720),
  ...tableBones(244 + 40),
];

const desktop: Bone[] = [
  ...buildStatCards(4, 24, 1152),
  ...tableBones(150 + 40),
];

export const dashboardBones: ResponsiveBones = {
  breakpoints: {
    375: { name: "dashboard", viewportWidth: 375, width: 327, height: 540, bones: mobile },
    768: { name: "dashboard", viewportWidth: 768, width: 720, height: 460, bones: tablet },
    1280: { name: "dashboard", viewportWidth: 1280, width: 1152, height: 320, bones: desktop },
  },
};
