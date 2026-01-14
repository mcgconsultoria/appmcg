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
import forge from "node-forge";
import { SignedXml } from "xml-crypto";
import https from "https";
import { DOMParser } from "@xmldom/xmldom";
import xpath from "xpath";
import { storage } from "./storage";

// Curitiba NFS-e endpoints (ABRASF 2.04)
// Service paths for each operation
const NFSE_PRODUCTION_BASE = "https://nfse.curitiba.pr.gov.br";
const NFSE_HOMOLOG_BASE = "https://nfsehomolog.curitiba.pr.gov.br";

const SERVICE_PATHS = {
  RecepcionarLoteRps: "/WSNFe2/Services.svc/RecepcionarLoteRps",
  ConsultarNfsePorRps: "/WSNFe2/Services.svc/ConsultarNfsePorRps",
  ConsultarLoteRps: "/WSNFe2/Services.svc/ConsultarLoteRps",
  CancelarNfse: "/WSNFe2/Services.svc/CancelarNfse",
};

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

interface CertificateInfo {
  privateKey: string;
  certificate: string;
  certPem: string;
  keyPem: string;
  validFrom: Date;
  validTo: Date;
  subject: string;
}

class NFSeService {
  private config: NFSeConfig | null = null;
  private configLoaded: boolean = false;
  private configLoadPromise: Promise<void> | null = null;
  private cachedCertInfo: CertificateInfo | null = null;

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
   * Also clears cached certificate to ensure new cert is used
   */
  async reloadConfig(): Promise<void> {
    this.configLoaded = false;
    this.configLoadPromise = null;
    this.cachedCertInfo = null; // Clear cached certificate
    await this.ensureConfigLoaded();
  }

  /**
   * Check if all required configuration is present
   * Mandatory fields: certificate, password, CNPJ, inscricao municipal
   */
  isConfigured(): boolean {
    return (
      this.config !== null &&
      !!this.config.cnpj &&
      !!this.config.certificateData &&
      !!this.config.certificatePassword &&
      !!this.config.inscricaoMunicipal
    );
  }

  /**
   * Get detailed configuration status for diagnostics
   */
  async getStatus(): Promise<{
    configured: boolean;
    sandbox: boolean;
    cnpj: string | null;
    loaded: boolean;
    missingConfig: string[];
  }> {
    await this.ensureConfigLoaded();
    
    const missingConfig: string[] = [];
    if (!this.config?.certificateData) missingConfig.push("Certificado A1 ativo");
    if (!this.config?.certificatePassword) missingConfig.push("CERTIFICATE_PASSWORD");
    if (!this.config?.cnpj) missingConfig.push("CNPJ do certificado");
    if (!this.config?.inscricaoMunicipal) missingConfig.push("INSCRICAO_MUNICIPAL");
    
    return {
      configured: this.isConfigured(),
      sandbox: this.config?.useSandbox ?? true,
      cnpj: this.config?.cnpj || null,
      loaded: this.configLoaded,
      missingConfig,
    };
  }

  private getBaseUrl(): string {
    return this.config?.useSandbox ? NFSE_HOMOLOG_BASE : NFSE_PRODUCTION_BASE;
  }

  private getServicePath(operation: keyof typeof SERVICE_PATHS): string {
    return SERVICE_PATHS[operation];
  }

  /**
   * Parse PKCS#12 (PFX) certificate and extract private key and certificate
   */
  private parsePkcs12(pfxBase64: string, password: string): CertificateInfo {
    try {
      const pfxDer = forge.util.decode64(pfxBase64);
      const asn1 = forge.asn1.fromDer(pfxDer);
      const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);

      // Extract certificate
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = certBags[forge.pki.oids.certBag];
      if (!certBag || certBag.length === 0) {
        throw new Error("Certificado nao encontrado no arquivo PFX");
      }
      const cert = certBag[0].cert;
      if (!cert) {
        throw new Error("Certificado invalido no arquivo PFX");
      }

      // Extract private key
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
      if (!keyBag || keyBag.length === 0) {
        throw new Error("Chave privada nao encontrada no arquivo PFX");
      }
      const privateKey = keyBag[0].key;
      if (!privateKey) {
        throw new Error("Chave privada invalida no arquivo PFX");
      }

      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(privateKey);

      return {
        privateKey: keyPem,
        certificate: certPem,
        certPem,
        keyPem,
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        subject: cert.subject.getField("CN")?.value || "Unknown",
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid password")) {
        throw new Error("Senha do certificado incorreta");
      }
      throw error;
    }
  }

  /**
   * Get certificate info (cached for performance)
   */
  private getCertificateInfo(): CertificateInfo {
    if (this.cachedCertInfo) {
      return this.cachedCertInfo;
    }

    if (!this.config) {
      throw new Error("Configuracao nao carregada");
    }

    this.cachedCertInfo = this.parsePkcs12(
      this.config.certificateData,
      this.config.certificatePassword
    );

    // Check expiration
    if (this.cachedCertInfo.validTo < new Date()) {
      console.warn("[NFS-e] ATENCAO: Certificado expirado em", this.cachedCertInfo.validTo);
    }

    return this.cachedCertInfo;
  }

  /**
   * Sign XML using XML-DSig (ABRASF Enveloped Signature with X509Data)
   */
  private signXml(xml: string, elementId: string): string {
    const certInfo = this.getCertificateInfo();

    // Extract certificate base64 (remove PEM headers)
    const certBase64 = certInfo.certPem
      .replace(/-----BEGIN CERTIFICATE-----/g, "")
      .replace(/-----END CERTIFICATE-----/g, "")
      .replace(/\s/g, "");

    const sig = new SignedXml({
      privateKey: certInfo.keyPem,
      signatureAlgorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
      canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
    });

    // Reference with URI pointing to element Id (ABRASF requirement)
    sig.addReference({
      uri: `#${elementId}`,
      digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1",
      transforms: [
        "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
        "http://www.w3.org/2001/10/xml-exc-c14n#",
      ],
    });

    // Add X509Data to KeyInfo (ABRASF requirement)
    sig.keyInfoProvider = {
      getKeyInfo: () => `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`,
    };

    sig.computeSignature(xml, {
      location: { reference: `//*[@Id='${elementId}']`, action: "append" },
    });

    return sig.getSignedXml();
  }

  /**
   * Send SOAP request to NFS-e webservice with client certificate authentication
   */
  private async sendSoapRequest(envelope: string, operation: keyof typeof SERVICE_PATHS): Promise<string> {
    const certInfo = this.getCertificateInfo();
    const baseUrl = this.getBaseUrl();
    const servicePath = this.getServicePath(operation);
    const fullUrl = `${baseUrl}${servicePath}`;
    const url = new URL(fullUrl);

    console.log(`[NFS-e] SOAP request to: ${fullUrl}`);

    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "Content-Length": Buffer.byteLength(envelope, "utf8"),
          SOAPAction: `http://www.abrasf.org.br/nfse.xsd/${operation}`,
        },
        key: certInfo.keyPem,
        cert: certInfo.certPem,
        rejectUnauthorized: true,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`[NFS-e] Response status: ${res.statusCode}`);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        console.error(`[NFS-e] Request error:`, error.message);
        reject(error);
      });
      req.write(envelope);
      req.end();
    });
  }

  /**
   * Parse NFS-e response XML using namespace-aware XPath
   * Targets InfNfse specifically to avoid RPS identifiers
   */
  private parseNfseResponse(xmlResponse: string): NFSeResponse {
    try {
      const doc = new DOMParser().parseFromString(xmlResponse, "text/xml");
      
      // Define namespace resolver for ABRASF
      const select = xpath.useNamespaces({
        "nfse": "http://www.abrasf.org.br/nfse.xsd",
        "soap": "http://schemas.xmlsoap.org/soap/envelope/",
      });

      // Helper to get text from first matching node (namespace-agnostic)
      // Handles both node results and string results from xpath
      const getText = (xpathExpr: string): string | undefined => {
        try {
          const result = select(xpathExpr, doc);
          
          // xpath can return string, number, boolean, or node array
          if (typeof result === "string") {
            return result.trim() || undefined;
          }
          if (typeof result === "number") {
            return String(result);
          }
          if (typeof result === "boolean") {
            return undefined;
          }
          
          // Handle node array
          if (Array.isArray(result) && result.length > 0) {
            const node = result[0] as any;
            
            // Text node - get nodeValue
            if (node.nodeType === 3) { // TEXT_NODE
              return node.nodeValue?.trim() || undefined;
            }
            
            // Element node - get textContent
            if (node.textContent) {
              return node.textContent.trim() || undefined;
            }
            
            // Attribute node
            if (node.value) {
              return node.value.trim() || undefined;
            }
          }
          
          return undefined;
        } catch (xpathError) {
          console.warn("[NFS-e] XPath error:", xpathExpr, xpathError);
          return undefined;
        }
      };

      // 1. Check for errors first - ListaMensagemRetorno/MensagemRetorno
      // Using local-name() for namespace-agnostic matching
      const errorCode = getText("//*[local-name()='MensagemRetorno']/*[local-name()='Codigo']/text()");
      const errorMessage = getText("//*[local-name()='MensagemRetorno']/*[local-name()='Mensagem']/text()");
      const errorCorrecao = getText("//*[local-name()='MensagemRetorno']/*[local-name()='Correcao']/text()");
      
      if (errorCode) {
        return {
          success: false,
          errorCode,
          errorMessage: errorCorrecao ? `${errorMessage} - ${errorCorrecao}` : (errorMessage || "Erro desconhecido"),
          xmlResponse,
        };
      }

      // 2. Extract NFS-e data from InfNfse (NOT from IdentificacaoRps)
      // InfNfse contains the actual NFS-e data, not RPS identifiers
      const nfseNumero = getText("//*[local-name()='InfNfse']/*[local-name()='Numero']/text()");
      const nfseCodigoVerificacao = getText("//*[local-name()='InfNfse']/*[local-name()='CodigoVerificacao']/text()");
      const nfseDataEmissao = getText("//*[local-name()='InfNfse']/*[local-name()='DataEmissao']/text()");
      
      if (nfseNumero || nfseCodigoVerificacao) {
        return {
          success: true,
          numeroNfse: nfseNumero,
          codigoVerificacao: nfseCodigoVerificacao,
          dataEmissao: nfseDataEmissao,
          xmlResponse,
        };
      }

      // 3. Check for protocol (async processing)
      const protocolo = getText("//*[local-name()='Protocolo']/text()");
      if (protocolo) {
        return {
          success: true,
          protocolo,
          xmlResponse,
        };
      }

      // 4. Check for NumeroLote (batch received confirmation)
      const numeroLote = getText("//*[local-name()='NumeroLote']/text()");
      if (numeroLote) {
        return {
          success: true,
          protocolo: numeroLote,
          xmlResponse,
        };
      }

      return {
        success: false,
        errorCode: "PARSE_ERROR",
        errorMessage: "Nao foi possivel extrair dados da resposta. Verifique o XML retornado.",
        xmlResponse,
      };
    } catch (parseError) {
      console.error("[NFS-e] XML parsing error:", parseError);
      return {
        success: false,
        errorCode: "XML_PARSE_ERROR",
        errorMessage: parseError instanceof Error ? parseError.message : "Erro ao processar XML de resposta",
        xmlResponse,
      };
    }
  }

  /**
   * Build XML envelope for ABRASF webservice (Curitiba format)
   * Curitiba uses specific envelope structure with Envio suffix
   */
  private buildSoapEnvelope(operation: string, body: string): string {
    // Curitiba expects the operation name with proper namespace
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:nfse="http://www.abrasf.org.br/nfse.xsd">
  <soap:Body>
    <nfse:${operation}Envio>
      ${body}
    </nfse:${operation}Envio>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Build RPS XML according to ABRASF 2.04 with Id attribute for signing
   */
  private buildRpsXml(request: NFSeRequest, rpsId: string): string {
    const { rps, servico, prestador, tomador } = request;

    return `
<InfDeclaracaoPrestacaoServico Id="${rpsId}" xmlns="http://www.abrasf.org.br/nfse.xsd">
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
   * 
   * Note: Production mode requires:
   * - Valid e-CNPJ A1 certificate (.pfx)
   * - xml-crypto library for XML-DSig signing
   * - node-soap or similar for SOAP transport
   * 
   * Sandbox mode simulates the complete flow for testing.
   */
  async emitirNfse(request: NFSeRequest): Promise<NFSeResponse> {
    await this.ensureConfigLoaded();
    
    // Validate all required configuration
    const status = await this.getStatus();
    if (!status.configured) {
      return {
        success: false,
        errorCode: "NOT_CONFIGURED",
        errorMessage: `NFS-e nao configurado. Faltando: ${status.missingConfig.join(", ")}`,
      };
    }

    console.log("[NFS-e] Emitting for:", request.tomador.razaoSocial);
    console.log("[NFS-e] Mode:", this.config?.useSandbox ? "SANDBOX" : "PRODUCTION");

    try {
      const loteId = `${Date.now()}`;
      const numRps = 1;
      const rpsId = `RPS_${loteId}_1`;

      // Build RPS XML with Id attribute for signing
      const rpsXml = this.buildRpsXml(request, rpsId);

      console.log("[NFS-e] Target URL:", this.getBaseUrl());

      // Sandbox mode: simulate successful emission
      if (this.config?.useSandbox) {
        const mockNfseNumber = Math.floor(Math.random() * 1000000).toString().padStart(8, "0");
        const mockVerification = crypto.randomBytes(8).toString("hex").toUpperCase();

        console.log("[NFS-e] SANDBOX: Simulating successful emission");
        return {
          success: true,
          numeroNfse: mockNfseNumber,
          codigoVerificacao: mockVerification,
          dataEmissao: new Date().toISOString(),
          protocolo: loteId,
          xmlResponse: `<SimulacaoSandbox><NumeroNfse>${mockNfseNumber}</NumeroNfse><CodigoVerificacao>${mockVerification}</CodigoVerificacao></SimulacaoSandbox>`,
        };
      }

      // Production mode: full XML signing and SOAP transport
      console.log("[NFS-e] PRODUCTION: Signing XML with e-CNPJ certificate");
      
      // 1. Validate certificate can be parsed and is not expired
      let certInfo;
      try {
        certInfo = this.getCertificateInfo();
        console.log("[NFS-e] Certificate subject:", certInfo.subject);
        console.log("[NFS-e] Certificate valid until:", certInfo.validTo);
        
        if (certInfo.validTo < new Date()) {
          return {
            success: false,
            errorCode: "CERTIFICATE_EXPIRED",
            errorMessage: `Certificado expirado em ${certInfo.validTo.toLocaleDateString("pt-BR")}`,
          };
        }
      } catch (certError) {
        console.error("[NFS-e] Certificate error:", certError);
        return {
          success: false,
          errorCode: "CERTIFICATE_ERROR",
          errorMessage: certError instanceof Error ? certError.message : "Erro ao processar certificado",
        };
      }

      // 2. Build complete Rps element and sign it (signing must include Rps wrapper)
      const rpsElement = `<Rps xmlns="http://www.abrasf.org.br/nfse.xsd">${rpsXml}</Rps>`;
      const signedRpsXml = this.signXml(rpsElement, rpsId);
      console.log("[NFS-e] RPS XML signed successfully");
      
      // 3. Build SOAP envelope with signed RPS (signed Rps includes signature inside)
      const body = `
<LoteRps versao="2.04" xmlns="http://www.abrasf.org.br/nfse.xsd">
  <NumeroLote>${loteId}</NumeroLote>
  <Prestador>
    <CpfCnpj>
      <Cnpj>${this.config!.cnpj}</Cnpj>
    </CpfCnpj>
    <InscricaoMunicipal>${this.config!.inscricaoMunicipal}</InscricaoMunicipal>
  </Prestador>
  <QuantidadeRps>${numRps}</QuantidadeRps>
  <ListaRps>
    ${signedRpsXml}
  </ListaRps>
</LoteRps>`;

      const envelope = this.buildSoapEnvelope(ABRASF_OPERATIONS.RECEPCIONAR_LOTE_RPS, body);
      console.log("[NFS-e] SOAP envelope length:", envelope.length);

      // 4. Send SOAP request with client certificate auth
      const xmlResponse = await this.sendSoapRequest(envelope, "RecepcionarLoteRps");
      console.log("[NFS-e] Response received, length:", xmlResponse.length);

      // 5. Parse and return response
      return this.parseNfseResponse(xmlResponse);
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
