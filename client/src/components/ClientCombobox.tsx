import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "wouter";
import type { Client } from "@shared/schema";

interface ClientComboboxProps {
  clients: Client[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  allowNone?: boolean;
  disabled?: boolean;
  "data-testid"?: string;
  showAddButton?: boolean;
}

export function ClientCombobox({
  clients,
  value,
  onValueChange,
  placeholder = "Selecione um cliente",
  allowNone = true,
  disabled = false,
  "data-testid": testId,
  showAddButton = true,
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const selectedClient = clients.find((c) => c.id.toString() === value);

  const handleAddClient = () => {
    setOpen(false);
    setLocation("/clientes");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
          data-testid={testId}
        >
          {selectedClient ? selectedClient.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-2">
                <span>Nenhum cliente encontrado.</span>
                {showAddButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddClient}
                    className="gap-1"
                    data-testid="button-add-client-from-combobox"
                  >
                    <Plus className="h-4 w-4" />
                    Cadastrar Cliente
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {allowNone && (
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onValueChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "" || value === "none" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Nenhum
                </CommandItem>
              )}
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    onValueChange(client.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    {client.segment && (
                      <span className="text-xs text-muted-foreground">{client.segment}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
