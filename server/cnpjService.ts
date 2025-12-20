// Servico de consulta CNPJ usando API CNPJa gratuita
// https://cnpja.com/en/api/open

interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  cnae: string;
  cnaeDescricao: string;
  naturezaJuridica: string;
  dataAbertura: string;
  capitalSocial: number;
}

export async function consultarCNPJ(cnpj: string): Promise<CNPJData | null> {
  // Remove caracteres especiais do CNPJ
  const cnpjLimpo = cnpj.replace(/[^\d]/g, "");
  
  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve ter 14 digitos");
  }

  try {
    // Usando a API CNPJa gratuita
    const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 429) {
        throw new Error("Limite de consultas excedido. Tente novamente em alguns minutos.");
      }
      throw new Error(`Erro ao consultar CNPJ: ${response.status}`);
    }

    const data = await response.json();

    return {
      cnpj: cnpjLimpo,
      razaoSocial: data.razao_social || "",
      nomeFantasia: data.estabelecimento?.nome_fantasia || data.razao_social || "",
      situacaoCadastral: data.estabelecimento?.situacao_cadastral || "",
      endereco: {
        logradouro: data.estabelecimento?.logradouro || "",
        numero: data.estabelecimento?.numero || "",
        complemento: data.estabelecimento?.complemento || "",
        bairro: data.estabelecimento?.bairro || "",
        municipio: data.estabelecimento?.cidade?.nome || "",
        uf: data.estabelecimento?.estado?.sigla || "",
        cep: data.estabelecimento?.cep || "",
      },
      cnae: data.estabelecimento?.atividade_principal?.id || "",
      cnaeDescricao: data.estabelecimento?.atividade_principal?.descricao || "",
      naturezaJuridica: data.natureza_juridica?.descricao || "",
      dataAbertura: data.estabelecimento?.data_inicio_atividade || "",
      capitalSocial: data.capital_social || 0,
    };
  } catch (error) {
    console.error("Erro ao consultar CNPJ:", error);
    throw error;
  }
}
