export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function validateCPF(cpf: string): { valid: boolean; message: string } {
  const digits = cpf.replace(/\D/g, "");
  
  if (digits.length === 0) {
    return { valid: true, message: "" };
  }
  
  if (digits.length !== 11) {
    return { valid: false, message: "CPF deve ter 11 digitos" };
  }
  
  if (/^(\d)\1+$/.test(digits)) {
    return { valid: false, message: "CPF invalido" };
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) {
    return { valid: false, message: "CPF invalido - digito verificador incorreto" };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) {
    return { valid: false, message: "CPF invalido - digito verificador incorreto" };
  }
  
  return { valid: true, message: "" };
}

export function validateCNPJ(cnpj: string): { valid: boolean; message: string } {
  const digits = cnpj.replace(/\D/g, "");
  
  if (digits.length === 0) {
    return { valid: true, message: "" };
  }
  
  if (digits.length !== 14) {
    return { valid: false, message: "CNPJ deve ter 14 digitos" };
  }
  
  if (/^(\d)\1+$/.test(digits)) {
    return { valid: false, message: "CNPJ invalido" };
  }
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits[12])) {
    return { valid: false, message: "CNPJ invalido - digito verificador incorreto" };
  }
  
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits[13])) {
    return { valid: false, message: "CNPJ invalido - digito verificador incorreto" };
  }
  
  return { valid: true, message: "" };
}

export function validateDocument(type: "cpf" | "cnpj", value: string): { valid: boolean; message: string } {
  if (type === "cpf") {
    return validateCPF(value);
  }
  return validateCNPJ(value);
}

export function formatDocument(type: "cpf" | "cnpj", value: string): string {
  if (type === "cpf") {
    return formatCPF(value);
  }
  return formatCNPJ(value);
}
