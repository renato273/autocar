export const FUEL_TYPES = [
  { value: "NAFTA_COMUN", label: "Nafta Común" },
  { value: "NAFTA_INTERMEDIA", label: "Nafta Intermedia" },
  { value: "NAFTA_PREMIUM", label: "Nafta Premium" },
  { value: "GASOIL", label: "Gasoil / Diésel" },
  { value: "GASOIL_PREMIUM", label: "Gasoil Premium" },
  { value: "GLP", label: "GLP Vehicular" },
  { value: "BIOETANOL", label: "Bioetanol (E85)" },
] as const;

export const fuelTypeLabel = (value?: string) =>
  FUEL_TYPES.find(f => f.value === value)?.label ?? value ?? "—";

export const VEHICLE_TYPES = [
  { value: "AUTO", label: "Automóvil" },
  { value: "SUV", label: "SUV" },
  { value: "MISUV", label: "Mini SUV" },
  { value: "CARRIAGE", label: "Camioneta" },
  { value: "MOTO", label: "Motocicleta" },
] as const;

export const vehicleTypeLabel = (value?: string) =>
  VEHICLE_TYPES.find(t => t.value === value)?.label ?? value ?? "—";

export const PLATE_REGEX = /^[A-Za-z0-9-]{3,10}$/;

export const isValidPlate = (plate: string) => PLATE_REGEX.test(plate);

export const PLATE_ERROR = "Matrícula inválida: usa solo letras, números y guiones (3 a 10 caracteres)";

export const formatGuarani = (value: number) =>
  `₲ ${value.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
