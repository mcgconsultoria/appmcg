/**
 * NFS-e (Nota Fiscal de Serviços Eletronica) Integration Service
 * Curitiba Municipality - ABRASF Standard
 * 
 * This module handles integration with the Curitiba NFS-e webservice.
 * 
 * Important Requirements:
 * - Requires e-CNPJ certificate (A1 or A3) - e-CPF is NOT accepted for automated emission
 * - Certificate must be valid and not expired
 * - Company must be registered in Curitiba's ISSQN system
 * 
 * ABRASF Webservice Endpoints (Curitiba):
 * - Production: https://nfse.curitiba.pr.gov.br/ws/
 * - Homologation: https://nfsehomolog.curitiba.pr.gov.br/ws/
 * 
 * Reference: https://www.curitiba.pr.gov.br/conteudo/nota-curitiba-nfs-e/1568
 */

import crypto from "crypto";
import { storage } from "./storage";

// Curitiba NFS-e endpoints
const NFSE_PRODUCTION_URL = "https://nfse.curitiba.pr.gov.br/ws/";
const NFSE_HOMOLOG_URL = "https://nfsehomolog.curitiba.pr.gov.br/ws/";

// ABRASF service operations
const ABRASF_OPERATIONS = {
  RECEPCIONAR_LOTE_RPS: "RecepcionarLoteRps",
  CONSULTAR_LOTE_RPS: "ConsultarLoteRps",
  CONSULTAR_SITUACAO_LOTE_RPS: "ConsultarSituacaoLoteRps",
  CONSULTAR_NFSE_POR_RPS: "ConsultarNfsePorRps",
  CONSULTAR_NFSE: "ConsultarNfse",
  CANCELAR_NFSE: "CancelarNfse",
  SUBSTITUIR_NFSE: "SubstituirNfse",
};

interface RPS {
  numero: number;
  serie: string;
  tipo: number; // 1=RPS, 2=Nota Fiscal Conjugada, 3=Cupom
  dataEmissao: string;
  naturezaOperacao: number; // 1-6 per ABRASF
  optanteSimplesNacional: boolean;
  incentivadorCultural: boolean;
  status: number; // 1=Normal, 2=Cancelado
}

interface Servico {
  valores: {
    valorServicos: number;
    valorDeducoes?: number;
    valorPis?: number;
    valorCofins?: number;
    valorInss?: number;
    valorIr?: number;
    valorCsll?: number;
    issRetido?: boolean;
    valorIss?: number;
    valorIssRetido?: number;
    outrasRetencoes?: number;
    baseCalculo?: number;
    aliquota?: number;
    valorLiquidoNfse?: number;
    descontoIncondicionado?: number;
    descontoCondicionado?: number;
  };
  itemListaServico: string; // Codigo do servico na lista LC 116
  codigoCnae?: string;
  codigoTributacaoMunicipio?: string;
  discriminacao: string;
  municipioPrestacaoServico: string; // Codigo IBGE
}

interface Prestador {
  cnpj: string;
  inscricaoMunicipal?: string;
}

interface Tomador {
  cpfCnpj: string;
  razaoSocial: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    codigoMunicipio?: string;
    uf?: string;
    cep?: string;
  };
  contato?: {
    telefone?: string;
    email?: string;
  };
}

interface NFSeRequest {
  rps: RPS;
  servico: Servico;
  prestador: Prestador;
  tomador: Tomador;
}

interface NFSeResponse {
  success: boolean;
  numeroNfse?: string;
  codigoVerificacao?: string;
  dataEmissao?: string;
  protocolo?: string;
  errorCode?: string;
  errorMessage?: string;
  xmlResponse?: string;
}

interface NFSeConfig {
  certificateData: string;
  certificatePassword: string;
  cnpj: string;
  inscricaoMunicipal: string;
  useSandbox: boolean;
}

class NFSeService {
  private config: NFSeConfig | null = null;
  private configLoaded: boolean = false;
  private configLoadPromise: Promise<void> | null = null;

  constructor() {
    // Don't await in constructor - use lazy loading
  }

  /**
   * Ensure configuration is loaded before use
   */
  private async ensureConfigLoaded(): Promise<void> {
    if (this.configLoaded) return;
    
    if (!this.configLoadPromise) {
      this.configLoadPromise = this.loadConfig();
    }
    
    await this.configLoadPromise;
  }

  private async loadConfig(): Promise<void> {
    try {
      // Try to get active e-CNPJ certificate from database
      const certificates = await storage.getDigitalCertificates();
      const activeCert = certificates.find(
        (c) => c.isActive && c.type === "A1" && c.cnpj
      );

      if (activeCert && activeCert.certificateData) {
        this.config = {
          certificateData: activeCert.certificateData,
          certificatePassword: process.env.CERTIFICATE_PASSWORD || "",
          cnpj: activeCert.cnpj || "",
          inscricaoMunicipal: process.env.INSCRICAO_MUNICIPAL || "",
          useSandbox: process.env.NFSE_SANDBOX !== "false", // Default to sandbox
        };
      }
    } catch (error) {
      console.error("[NFS-e] Error loading config:", error);
    } finally {
      this.configLoaded = true;
    }
  }

  /**
   * Reload configuration (useful after certificate changes)
   */
  async reloadConfig(): Promise<void> {
    this.configLoaded = false;
    this.configLoadPromise = null;
    await this.ensureConfigLoaded();
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.cnpj && !!this.config.certificateData;
  }

  async getStatus(): Promise<{ configured: boolean; sandbox: boolean; cnpj: string | null; loaded: boolean }> {
    await this.ensureConfigLoaded();
    return {
      configured: this.isConfigured(),
      sandbox: this.config?.useSandbox ?? true,
      cnpj: this.config?.cnpj || null,
      loaded: this.configLoaded,
    };
  }

  private getBaseUrl(): string {
    return this.config?.useSandbox ? NFSE_HOMOLOG_URL : NFSE_PRODUCTION_URL;
  }

  /**
   * Build XML envelope for ABRASF webservice
   */
  private buildSoapEnvelope(operation: string, body: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <${operation}Request xmlns="http://www.abrasf.org.br/nfse.xsd">
      ${body}
    </${operation}Request>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Build RPS XML according to ABRASF 2.04
   */
  private buildRpsXml(request: NFSeRequest): string {
    const { rps, servico, prestador, tomador } = request;

    return `
<InfDeclaracaoPrestacaoServico>
  <Rps>
    <IdentificacaoRps>
      <Numero>${rps.numero}</Numero>
      <Serie>${rps.serie}</Serie>
      <Tipo>${rps.tipo}</Tipo>
    </IdentificacaoRps>
    <DataEmissao>${rps.dataEmissao}</DataEmissao>
    <NaturezaOperacao>${rps.naturezaOperacao}</NaturezaOperacao>
    <OptanteSimplesNacional>${rps.optanteSimplesNacional ? 1 : 2}</OptanteSimplesNacional>
    <IncentivadorCultural>${rps.incentivadorCultural ? 1 : 2}</IncentivadorCultural>
    <Status>${rps.status}</Status>
  </Rps>
  <Servico>
    <Valores>
      <ValorServicos>${servico.valores.valorServicos.toFixed(2)}</ValorServicos>
      ${servico.valores.valorDeducoes ? `<ValorDeducoes>${servico.valores.valorDeducoes.toFixed(2)}</ValorDeducoes>` : ""}
      ${servico.valores.aliquota ? `<Aliquota>${servico.valores.aliquota}</Aliquota>` : ""}
      ${servico.valores.issRetido !== undefined ? `<IssRetido>${servico.valores.issRetido ? 1 : 2}</IssRetido>` : ""}
    </Valores>
    <ItemListaServico>${servico.itemListaServico}</ItemListaServico>
    ${servico.codigoCnae ? `<CodigoCnae>${servico.codigoCnae}</CodigoCnae>` : ""}
    <Discriminacao>${this.escapeXml(servico.discriminacao)}</Discriminacao>
    <MunicipioPrestacaoServico>${servico.municipioPrestacaoServico}</MunicipioPrestacaoServico>
  </Servico>
  <Prestador>
    <CpfCnpj>
      <Cnpj>${prestador.cnpj}</Cnpj>
    </CpfCnpj>
    ${prestador.inscricaoMunicipal ? `<InscricaoMunicipal>${prestador.inscricaoMunicipal}</InscricaoMunicipal>` : ""}
  </Prestador>
  <Tomador>
    <IdentificacaoTomador>
      <CpfCnpj>
        ${tomador.cpfCnpj.length === 11 ? `<Cpf>${tomador.cpfCnpj}</Cpf>` : `<Cnpj>${tomador.cpfCnpj}</Cnpj>`}
      </CpfCnpj>
    </IdentificacaoTomador>
    <RazaoSocial>${this.escapeXml(tomador.razaoSocial)}</RazaoSocial>
    ${tomador.endereco ? this.buildEnderecoXml(tomador.endereco) : ""}
    ${tomador.contato ? this.buildContatoXml(tomador.contato) : ""}
  </Tomador>
</InfDeclaracaoPrestacaoServico>`;
  }

  private buildEnderecoXml(endereco: Tomador["endereco"]): string {
    if (!endereco) return "";
    return `
<Endereco>
  ${endereco.logradouro ? `<Endereco>${this.escapeXml(endereco.logradouro)}</Endereco>` : ""}
  ${endereco.numero ? `<Numero>${endereco.numero}</Numero>` : ""}
  ${endereco.complemento ? `<Complemento>${this.escapeXml(endereco.complemento)}</Complemento>` : ""}
  ${endereco.bairro ? `<Bairro>${this.escapeXml(endereco.bairro)}</Bairro>` : ""}
  ${endereco.codigoMunicipio ? `<CodigoMunicipio>${endereco.codigoMunicipio}</CodigoMunicipio>` : ""}
  ${endereco.uf ? `<Uf>${endereco.uf}</Uf>` : ""}
  ${endereco.cep ? `<Cep>${endereco.cep.replace(/\D/g, "")}</Cep>` : ""}
</Endereco>`;
  }

  private buildContatoXml(contato: Tomador["contato"]): string {
    if (!contato) return "";
    return `
<Contato>
  ${contato.telefone ? `<Telefone>${contato.telefone.replace(/\D/g, "")}</Telefone>` : ""}
  ${contato.email ? `<Email>${contato.email}</Email>` : ""}
</Contato>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Submit RPS batch for NFS-e generation
   */
  async emitirNfse(request: NFSeRequest): Promise<NFSeResponse> {
    await this.ensureConfigLoaded();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCode: "NOT_CONFIGURED",
        errorMessage: "NFS-e nao configurado. Configure certificado e-CNPJ e inscricao municipal.",
      };
    }

    console.log("[NFS-e] Emitting for:", request.tomador.razaoSocial);

    try {
      const rpsXml = this.buildRpsXml(request);
      const loteId = `${Date.now()}`;
      const numRps = 1;

      const body = `
<LoteRps versao="2.04">
  <NumeroLote>${loteId}</NumeroLote>
  <Prestador>
    <CpfCnpj>
      <Cnpj>${this.config!.cnpj}</Cnpj>
    </CpfCnpj>
    <InscricaoMunicipal>${this.config!.inscricaoMunicipal}</InscricaoMunicipal>
  </Prestador>
  <QuantidadeRps>${numRps}</QuantidadeRps>
  <ListaRps>
    ${rpsXml}
  </ListaRps>
</LoteRps>`;

      const envelope = this.buildSoapEnvelope(ABRASF_OPERATIONS.RECEPCIONAR_LOTE_RPS, body);

      // Note: Real implementation would use HTTPS with client certificate
      // This is a placeholder for the actual SOAP call
      console.log("[NFS-e] Would send to:", this.getBaseUrl());
      console.log("[NFS-e] Envelope length:", envelope.length);

      // For development/sandbox, return mock success
      if (this.config?.useSandbox) {
        const mockNfseNumber = Math.floor(Math.random() * 1000000).toString().padStart(8, "0");
        const mockVerification = crypto.randomBytes(8).toString("hex").toUpperCase();

        return {
          success: true,
          numeroNfse: mockNfseNumber,
          codigoVerificacao: mockVerification,
          dataEmissao: new Date().toISOString(),
          protocolo: loteId,
          xmlResponse: "<MockResponse>Sandbox mode - NFS-e simulated</MockResponse>",
        };
      }

      // Production call would be here
      // const response = await this.callWebservice(envelope);
      // return this.parseResponse(response);

      return {
        success: false,
        errorCode: "NOT_IMPLEMENTED",
        errorMessage: "Producao requer certificado e-CNPJ configurado. Use modo sandbox para testes.",
      };
    } catch (error) {
      console.error("[NFS-e] Error emitting:", error);
      return {
        success: false,
        errorCode: "INTERNAL_ERROR",
        errorMessage: error instanceof Error ? error.message : "Erro ao emitir NFS-e",
      };
    }
  }

  /**
   * Query NFS-e by RPS number
   */
  async consultarPorRps(
    numeroRps: number,
    serieRps: string,
    tipoRps: number
  ): Promise<NFSeResponse> {
    await this.ensureConfigLoaded();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCode: "NOT_CONFIGURED",
        errorMessage: "NFS-e nao configurado.",
      };
    }

    console.log("[NFS-e] Consulting RPS:", numeroRps, serieRps);

    // Mock response for sandbox
    if (this.config?.useSandbox) {
      return {
        success: true,
        numeroNfse: "00001234",
        codigoVerificacao: "ABC123DEF456",
        dataEmissao: new Date().toISOString(),
        xmlResponse: "<MockResponse>Consulta simulada</MockResponse>",
      };
    }

    return {
      success: false,
      errorCode: "NOT_IMPLEMENTED",
      errorMessage: "Funcionalidade em desenvolvimento",
    };
  }

  /**
   * Cancel NFS-e
   */
  async cancelarNfse(
    numeroNfse: string,
    codigoVerificacao: string,
    motivoCancelamento: string
  ): Promise<NFSeResponse> {
    await this.ensureConfigLoaded();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        errorCode: "NOT_CONFIGURED",
        errorMessage: "NFS-e nao configurado.",
      };
    }

    console.log("[NFS-e] Cancelling:", numeroNfse, "Reason:", motivoCancelamento);

    // Mock response for sandbox
    if (this.config?.useSandbox) {
      return {
        success: true,
        numeroNfse: numeroNfse,
        xmlResponse: "<MockResponse>Cancelamento simulado</MockResponse>",
      };
    }

    return {
      success: false,
      errorCode: "NOT_IMPLEMENTED",
      errorMessage: "Funcionalidade em desenvolvimento",
    };
  }

  /**
   * Get list of valid service codes for Curitiba
   */
  getCodigosServico(): Array<{ codigo: string; descricao: string }> {
    // LC 116 service codes commonly used in logistics/consulting
    return [
      { codigo: "07.01", descricao: "Engenharia, agronomia, agrimensura, arquitetura, geologia, urbanismo, paisagismo e congêneres" },
      { codigo: "08.02", descricao: "Consultoria e assessoria de qualquer natureza, não contida em outros subitens desta lista; análise, exame, pesquisa, coleta, compilação e fornecimento de dados e informações de qualquer natureza, inclusive cadastro e similares" },
      { codigo: "10.05", descricao: "Agenciamento, corretagem ou intermediação de bens móveis ou imóveis, não abrangidos em outros itens ou subitens" },
      { codigo: "14.01", descricao: "Serviços de lubrificação, limpeza, lustração, revisão, carga e recarga, conserto, restauração, blindagem, manutenção e conservação de máquinas, veículos, aparelhos, equipamentos, motores, elevadores ou de qualquer objeto" },
      { codigo: "17.05", descricao: "Fornecimento de mão-de-obra, mesmo em caráter temporário, inclusive de empregados ou trabalhadores, avulsos ou temporários, contratados pelo prestador de serviço" },
      { codigo: "17.12", descricao: "Administração em geral, inclusive de bens e negócios de terceiros" },
      { codigo: "20.01", descricao: "Serviços portuários, ferroportuários, utilização de porto, movimentação de passageiros, reboque de embarcações, rebocador escoteiro, atracação, desatracação, serviços de praticagem, capatazia, armazenagem de qualquer natureza, serviços acessórios, movimentação de mercadorias, serviços de apoio marítimo" },
      { codigo: "20.02", descricao: "Serviços aeroportuários, utilização de aeroporto, movimentação de passageiros, armazenagem de qualquer natureza, capatazia, movimentação de aeronaves, serviços de apoio aeroportuários, serviços acessórios, movimentação de mercadorias, logística e congêneres" },
      { codigo: "20.03", descricao: "Serviços de terminais rodoviários, ferroviários, metroviários, movimentação de passageiros, mercadorias, inclusive suas operações, logística e congêneres" },
    ];
  }
}

export const nfseService = new NFSeService();
