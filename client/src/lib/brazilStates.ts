export const brazilStates = [
  { uf: "AC", name: "Acre", icms: 17 },
  { uf: "AL", name: "Alagoas", icms: 18 },
  { uf: "AP", name: "Amapá", icms: 18 },
  { uf: "AM", name: "Amazonas", icms: 18 },
  { uf: "BA", name: "Bahia", icms: 18 },
  { uf: "CE", name: "Ceará", icms: 18 },
  { uf: "DF", name: "Distrito Federal", icms: 18 },
  { uf: "ES", name: "Espírito Santo", icms: 17 },
  { uf: "GO", name: "Goiás", icms: 17 },
  { uf: "MA", name: "Maranhão", icms: 18 },
  { uf: "MT", name: "Mato Grosso", icms: 17 },
  { uf: "MS", name: "Mato Grosso do Sul", icms: 17 },
  { uf: "MG", name: "Minas Gerais", icms: 18 },
  { uf: "PA", name: "Pará", icms: 17 },
  { uf: "PB", name: "Paraíba", icms: 18 },
  { uf: "PR", name: "Paraná", icms: 18 },
  { uf: "PE", name: "Pernambuco", icms: 18 },
  { uf: "PI", name: "Piauí", icms: 18 },
  { uf: "RJ", name: "Rio de Janeiro", icms: 20 },
  { uf: "RN", name: "Rio Grande do Norte", icms: 18 },
  { uf: "RS", name: "Rio Grande do Sul", icms: 17 },
  { uf: "RO", name: "Rondônia", icms: 17.5 },
  { uf: "RR", name: "Roraima", icms: 17 },
  { uf: "SC", name: "Santa Catarina", icms: 17 },
  { uf: "SP", name: "São Paulo", icms: 18 },
  { uf: "SE", name: "Sergipe", icms: 18 },
  { uf: "TO", name: "Tocantins", icms: 18 },
];

export function getIcmsRate(uf: string): number {
  const state = brazilStates.find((s) => s.uf === uf);
  return state ? state.icms : 18;
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
