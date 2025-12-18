export const brazilStates = [
  { uf: "AC", name: "Acre", icms: 17, region: "N" },
  { uf: "AL", name: "Alagoas", icms: 18, region: "NE" },
  { uf: "AP", name: "Amapá", icms: 18, region: "N" },
  { uf: "AM", name: "Amazonas", icms: 18, region: "N" },
  { uf: "BA", name: "Bahia", icms: 18, region: "NE" },
  { uf: "CE", name: "Ceará", icms: 18, region: "NE" },
  { uf: "DF", name: "Distrito Federal", icms: 18, region: "CO" },
  { uf: "ES", name: "Espírito Santo", icms: 17, region: "SE" },
  { uf: "GO", name: "Goiás", icms: 17, region: "CO" },
  { uf: "MA", name: "Maranhão", icms: 18, region: "NE" },
  { uf: "MT", name: "Mato Grosso", icms: 17, region: "CO" },
  { uf: "MS", name: "Mato Grosso do Sul", icms: 17, region: "CO" },
  { uf: "MG", name: "Minas Gerais", icms: 18, region: "SE" },
  { uf: "PA", name: "Pará", icms: 17, region: "N" },
  { uf: "PB", name: "Paraíba", icms: 18, region: "NE" },
  { uf: "PR", name: "Paraná", icms: 18, region: "S", tollExemptFromIcms: true },
  { uf: "PE", name: "Pernambuco", icms: 18, region: "NE" },
  { uf: "PI", name: "Piauí", icms: 18, region: "NE" },
  { uf: "RJ", name: "Rio de Janeiro", icms: 20, region: "SE" },
  { uf: "RN", name: "Rio Grande do Norte", icms: 18, region: "NE" },
  { uf: "RS", name: "Rio Grande do Sul", icms: 17, region: "S" },
  { uf: "RO", name: "Rondônia", icms: 17.5, region: "N" },
  { uf: "RR", name: "Roraima", icms: 17, region: "N" },
  { uf: "SC", name: "Santa Catarina", icms: 17, region: "S" },
  { uf: "SP", name: "São Paulo", icms: 18, region: "SE" },
  { uf: "SE", name: "Sergipe", icms: 18, region: "NE" },
  { uf: "TO", name: "Tocantins", icms: 18, region: "N" },
];

export const icmsInterestadual: Record<string, Record<string, number>> = {
  N: { N: 12, NE: 12, CO: 12, SE: 7, S: 7 },
  NE: { N: 12, NE: 12, CO: 12, SE: 7, S: 7 },
  CO: { N: 12, NE: 12, CO: 12, SE: 7, S: 7 },
  SE: { N: 12, NE: 12, CO: 12, SE: 12, S: 12 },
  S: { N: 12, NE: 12, CO: 12, SE: 12, S: 12 },
};

export const productTypes = [
  { value: "granel_solido", label: "Granel Sólido", anttCode: "granel_solido" },
  { value: "granel_liquido", label: "Granel Líquido", anttCode: "granel_liquido" },
  { value: "carga_geral", label: "Carga Geral", anttCode: "carga_geral" },
  { value: "neogranel", label: "Neogranel", anttCode: "neogranel" },
  { value: "frigorificada", label: "Frigorificada/Refrigerada", anttCode: "frigorificada" },
  { value: "conteinerizada", label: "Conteinerizada", anttCode: "conteinerizada" },
  { value: "perigosa", label: "Perigosa", anttCode: "perigosa" },
  { value: "perigosa_granel", label: "Perigosa Granel Líquido", anttCode: "perigosa_granel" },
  { value: "perigosa_frigo", label: "Perigosa Frigorificada", anttCode: "perigosa_frigo" },
  { value: "perigosa_container", label: "Perigosa Conteinerizada", anttCode: "perigosa_container" },
  { value: "perigosa_geral", label: "Perigosa Carga Geral", anttCode: "perigosa_geral" },
  { value: "pressurizada", label: "Granel Pressurizada", anttCode: "pressurizada" },
];

export const packagingTypes = [
  { value: "pallet", label: "Pallet/Paletizada" },
  { value: "bombonas", label: "Bombonas" },
  { value: "batida_chao", label: "Batida ao Chão" },
  { value: "big_bag", label: "Big Bag" },
  { value: "caixas", label: "Caixas" },
  { value: "sacaria", label: "Sacaria" },
  { value: "granel", label: "Granel (sem embalagem)" },
  { value: "container", label: "Container" },
  { value: "tanque", label: "Tanque" },
];

export const vehicleAxles = [
  { value: 2, label: "2 eixos (Toco)" },
  { value: 3, label: "3 eixos (Truck)" },
  { value: 4, label: "4 eixos" },
  { value: 5, label: "5 eixos (Carreta)" },
  { value: 6, label: "6 eixos (Carreta LS)" },
  { value: 7, label: "7 eixos (Bitrem)" },
  { value: 9, label: "9 eixos (Rodotrem)" },
];

export const anttCoefficients: Record<string, Record<number, { ccd: number; cc: number }>> = {
  granel_solido: {
    2: { ccd: 2.8521, cc: 267.42 },
    3: { ccd: 3.4526, cc: 289.37 },
    4: { ccd: 4.2145, cc: 395.12 },
    5: { ccd: 5.5749, cc: 520.16 },
    6: { ccd: 6.1234, cc: 572.45 },
    7: { ccd: 7.2456, cc: 678.34 },
    9: { ccd: 9.1234, cc: 854.67 },
  },
  granel_liquido: {
    2: { ccd: 2.9856, cc: 279.89 },
    3: { ccd: 3.6123, cc: 302.45 },
    4: { ccd: 4.4089, cc: 413.26 },
    5: { ccd: 5.8312, cc: 544.12 },
    6: { ccd: 6.4089, cc: 598.56 },
    7: { ccd: 7.5789, cc: 709.45 },
    9: { ccd: 9.5432, cc: 894.12 },
  },
  carga_geral: {
    2: { ccd: 2.7234, cc: 255.34 },
    3: { ccd: 3.2956, cc: 276.12 },
    4: { ccd: 4.0234, cc: 377.23 },
    5: { ccd: 5.3234, cc: 496.78 },
    6: { ccd: 5.8456, cc: 546.34 },
    7: { ccd: 6.9123, cc: 647.23 },
    9: { ccd: 8.7123, cc: 815.45 },
  },
  frigorificada: {
    2: { ccd: 3.1567, cc: 296.12 },
    3: { ccd: 3.8234, cc: 320.45 },
    4: { ccd: 4.6678, cc: 437.56 },
    5: { ccd: 6.1859, cc: 580.43 },
    6: { ccd: 6.7934, cc: 637.89 },
    7: { ccd: 8.0345, cc: 754.12 },
    9: { ccd: 10.1234, cc: 949.34 },
  },
  neogranel: {
    2: { ccd: 2.8234, cc: 264.78 },
    3: { ccd: 3.4123, cc: 285.67 },
    4: { ccd: 4.1678, cc: 390.34 },
    5: { ccd: 5.5123, cc: 514.23 },
    6: { ccd: 6.0567, cc: 566.78 },
    7: { ccd: 7.1678, cc: 671.12 },
    9: { ccd: 9.0345, cc: 846.45 },
  },
  conteinerizada: {
    2: { ccd: 3.0123, cc: 282.45 },
    3: { ccd: 3.6456, cc: 305.78 },
    4: { ccd: 4.4523, cc: 417.34 },
    5: { ccd: 5.8934, cc: 549.89 },
    6: { ccd: 6.4734, cc: 604.23 },
    7: { ccd: 7.6567, cc: 716.78 },
    9: { ccd: 9.6456, cc: 902.34 },
  },
  perigosa: {
    2: { ccd: 3.2345, cc: 303.12 },
    3: { ccd: 3.9123, cc: 327.56 },
    4: { ccd: 4.7789, cc: 447.89 },
    5: { ccd: 6.3234, cc: 593.34 },
    6: { ccd: 6.9489, cc: 652.78 },
    7: { ccd: 8.2134, cc: 771.23 },
    9: { ccd: 10.3456, cc: 970.45 },
  },
  perigosa_granel: {
    2: { ccd: 3.3567, cc: 314.67 },
    3: { ccd: 4.0623, cc: 340.12 },
    4: { ccd: 4.9612, cc: 464.89 },
    5: { ccd: 6.5645, cc: 615.78 },
    6: { ccd: 7.2134, cc: 677.34 },
    7: { ccd: 8.5289, cc: 800.56 },
    9: { ccd: 10.7423, cc: 1007.23 },
  },
  perigosa_frigo: {
    2: { ccd: 3.4789, cc: 326.23 },
    3: { ccd: 4.2123, cc: 352.67 },
    4: { ccd: 5.1434, cc: 481.89 },
    5: { ccd: 6.8056, cc: 638.23 },
    6: { ccd: 7.4778, cc: 701.89 },
    7: { ccd: 8.8445, cc: 829.89 },
    9: { ccd: 11.1389, cc: 1044.12 },
  },
  perigosa_container: {
    2: { ccd: 3.3012, cc: 309.45 },
    3: { ccd: 3.9956, cc: 334.78 },
    4: { ccd: 4.8789, cc: 457.34 },
    5: { ccd: 6.4534, cc: 604.89 },
    6: { ccd: 7.0912, cc: 665.45 },
    7: { ccd: 8.3856, cc: 787.12 },
    9: { ccd: 10.5623, cc: 989.78 },
  },
  perigosa_geral: {
    2: { ccd: 3.1789, cc: 298.12 },
    3: { ccd: 3.8467, cc: 322.56 },
    4: { ccd: 4.6978, cc: 440.23 },
    5: { ccd: 6.2156, cc: 582.67 },
    6: { ccd: 6.8312, cc: 640.12 },
    7: { ccd: 8.0789, cc: 756.78 },
    9: { ccd: 10.1789, cc: 954.23 },
  },
  pressurizada: {
    2: { ccd: 3.4234, cc: 321.23 },
    3: { ccd: 4.1423, cc: 347.78 },
    4: { ccd: 5.0589, cc: 474.34 },
    5: { ccd: 6.6934, cc: 627.89 },
    6: { ccd: 7.3545, cc: 689.45 },
    7: { ccd: 8.6989, cc: 816.12 },
    9: { ccd: 10.9612, cc: 1027.56 },
  },
};

export function getIcmsRate(uf: string): number {
  const state = brazilStates.find((s) => s.uf === uf);
  return state ? state.icms : 18;
}

export function getInterestadualIcms(originUf: string, destinationUf: string): number {
  if (originUf === destinationUf) {
    return getIcmsRate(destinationUf);
  }
  const originState = brazilStates.find((s) => s.uf === originUf);
  const destState = brazilStates.find((s) => s.uf === destinationUf);
  if (!originState || !destState) return 12;
  return icmsInterestadual[originState.region]?.[destState.region] || 12;
}

export function isTollExemptFromIcms(originUf: string): boolean {
  const state = brazilStates.find((s) => s.uf === originUf);
  return state?.tollExemptFromIcms === true;
}

export function calculateAnttMinFreight(
  distanceKm: number,
  productType: string,
  axles: number
): number {
  const coefficients = anttCoefficients[productType]?.[axles];
  if (!coefficients) {
    const defaultCoeff = anttCoefficients.carga_geral?.[5] || { ccd: 5.3234, cc: 496.78 };
    return distanceKm * defaultCoeff.ccd + defaultCoeff.cc;
  }
  return distanceKm * coefficients.ccd + coefficients.cc;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export function getRouteType(
  originState: string,
  originCity: string,
  destinationState: string,
  destinationCity: string
): "municipal" | "intermunicipal" | "interestadual" {
  if (originState !== destinationState) return "interestadual";
  if (originCity !== destinationCity) return "intermunicipal";
  return "municipal";
}

export function getTaxInfo(
  originState: string,
  originCity: string,
  destinationState: string,
  destinationCity: string
): { taxType: "ICMS" | "ISS"; rate: number; description: string } {
  const routeType = getRouteType(originState, originCity, destinationState, destinationCity);
  
  if (routeType === "municipal") {
    return {
      taxType: "ISS",
      rate: 5,
      description: "Transporte municipal - ISS 5%",
    };
  }
  
  const icmsRate = routeType === "interestadual"
    ? getInterestadualIcms(originState, destinationState)
    : getIcmsRate(destinationState);
    
  return {
    taxType: "ICMS",
    rate: icmsRate,
    description: routeType === "interestadual"
      ? `Transporte interestadual - ICMS ${icmsRate}%`
      : `Transporte intermunicipal - ICMS ${icmsRate}%`,
  };
}
