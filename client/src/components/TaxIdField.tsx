import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCPF, formatCNPJ, validateCPF, validateCNPJ } from "@/lib/documentValidation";

type DocumentType = "cpf" | "cnpj";

interface TaxIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  documentType?: DocumentType;
  onDocumentTypeChange?: (type: DocumentType) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  showValidation?: boolean;
  "data-testid"?: string;
}

function detectDocumentType(value: string): DocumentType {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return "cpf";
  }
  return "cnpj";
}

export function TaxIdField({
  value,
  onChange,
  documentType: externalDocType,
  onDocumentTypeChange,
  label = "CPF/CNPJ",
  disabled = false,
  showValidation = true,
  "data-testid": testId,
}: TaxIdFieldProps) {
  const [internalDocType, setInternalDocType] = useState<DocumentType>(() => {
    if (value) {
      const digits = value.replace(/\D/g, "");
      // Only auto-detect on initial load when value has full length
      if (digits.length === 11) return "cpf";
      if (digits.length === 14) return "cnpj";
    }
    return "cnpj";
  });
  const [validationError, setValidationError] = useState<string>("");
  const [userSelected, setUserSelected] = useState(false);

  // Only auto-detect when editing existing data (not while typing)
  useEffect(() => {
    if (value && !externalDocType && !userSelected) {
      const digits = value.replace(/\D/g, "");
      // Only switch if value has complete length (editing existing)
      if (digits.length === 11 && internalDocType !== "cpf") {
        setInternalDocType("cpf");
      } else if (digits.length === 14 && internalDocType !== "cnpj") {
        setInternalDocType("cnpj");
      }
    }
  }, []);

  const docType = externalDocType ?? internalDocType;

  const handleDocTypeChange = (newType: DocumentType) => {
    setUserSelected(true);
    if (onDocumentTypeChange) {
      onDocumentTypeChange(newType);
    } else {
      setInternalDocType(newType);
    }
    onChange("");
    setValidationError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = docType === "cpf" ? formatCPF(rawValue) : formatCNPJ(rawValue);
    onChange(formatted);
  };

  useEffect(() => {
    if (!showValidation || !value) {
      setValidationError("");
      return;
    }

    const digits = value.replace(/\D/g, "");
    const expectedLength = docType === "cpf" ? 11 : 14;

    if (digits.length === expectedLength) {
      const result = docType === "cpf" ? validateCPF(value) : validateCNPJ(value);
      setValidationError(result.valid ? "" : result.message);
    } else if (digits.length > 0) {
      setValidationError("");
    }
  }, [value, docType, showValidation]);

  const placeholder = docType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00";

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Select value={docType} onValueChange={(v) => handleDocTypeChange(v as DocumentType)}>
          <SelectTrigger className="w-24" data-testid={`${testId}-type`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cnpj">CNPJ</SelectItem>
            <SelectItem value="cpf">CPF</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          data-testid={testId}
        />
      </div>
      {showValidation && validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
    </div>
  );
}

interface FormTaxIdFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  "data-testid"?: string;
}

export function FormTaxIdField({
  value,
  onChange,
  disabled = false,
  "data-testid": testId,
}: FormTaxIdFieldProps) {
  return (
    <TaxIdField
      value={value}
      onChange={onChange}
      disabled={disabled}
      label=""
      showValidation={true}
      data-testid={testId}
    />
  );
}
