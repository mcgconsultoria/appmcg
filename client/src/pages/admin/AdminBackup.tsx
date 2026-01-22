import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Github, Database, Clock, Play, Settings, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";

interface BackupConfig {
  enabled: boolean;
  repositoryOwner: string;
  repositoryName: string;
  lastBackupAt: string | null;
  lastBackupStatus: "success" | "error" | "never";
  lastBackupError: string | null;
  scheduledHour: number;
  githubConfigured: boolean;
}

export default function AdminBackup() {
  const { toast } = useToast();
  const [repositoryOwner, setRepositoryOwner] = useState("mcgconsultoria");
  const [repositoryName, setRepositoryName] = useState("appmcg");
  const [scheduledHour, setScheduledHour] = useState("3");
  const [enabled, setEnabled] = useState(false);

  const { data: config, isLoading } = useQuery<BackupConfig>({
    queryKey: ["/api/github/backup/config"],
  });

  const { data: githubStatus } = useQuery<{ configured: boolean; user: { login: string } | null }>({
    queryKey: ["/api/github/status"],
  });

  const { data: repositories } = useQuery<Array<{ name: string; fullName: string }>>({
    queryKey: ["/api/github/repositories"],
    enabled: !!githubStatus?.configured,
  });

  useEffect(() => {
    if (config) {
      setRepositoryOwner(config.repositoryOwner || '');
      setRepositoryName(config.repositoryName || 'mcg-backup');
      setScheduledHour(String(config.scheduledHour ?? 3));
      setEnabled(config.enabled || false);
    }
  }, [config]);

  const saveConfigMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; repositoryOwner: string; repositoryName: string; scheduledHour: number }) => {
      const response = await apiRequest("POST", "/api/github/backup/config", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/backup/config"] });
      toast({
        title: "Configuracao salva",
        description: "As configuracoes de backup foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar as configuracoes.",
        variant: "destructive",
      });
    },
  });

  const runBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/github/backup/run");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/backup/config"] });
      toast({
        title: "Backup realizado",
        description: `${data.files?.length || 0} arquivos foram salvos no GitHub.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no backup",
        description: error.message || "Nao foi possivel realizar o backup.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    if (!repositoryOwner) {
      toast({
        title: "Erro",
        description: "Informe o usuario do GitHub (owner do repositorio).",
        variant: "destructive",
      });
      return;
    }

    saveConfigMutation.mutate({
      enabled,
      repositoryOwner,
      repositoryName,
      scheduledHour: parseInt(scheduledHour),
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Nunca executado</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Backup GitHub" subtitle="Configure backups automáticos para o GitHub">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Backup GitHub" subtitle="Configure backups automáticos para o GitHub">
      <div className="space-y-6" data-testid="admin-backup-page">

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Status da Conexao
            </CardTitle>
            <CardDescription>Conexao com o GitHub via Replit OAuth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>GitHub Conectado:</span>
              {githubStatus?.configured ? (
                <Badge variant="default" className="bg-green-500">Conectado</Badge>
              ) : (
                <Badge variant="secondary">Nao Conectado</Badge>
              )}
            </div>
            {githubStatus?.user && (
              <div className="flex items-center justify-between">
                <span>Usuario:</span>
                <span className="font-mono">{githubStatus.user.login}</span>
              </div>
            )}
            {!githubStatus?.configured && (
              <p className="text-sm text-muted-foreground">
                Configure a conexao com o GitHub no painel de integracoes do Replit.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Ultimo Backup
            </CardTitle>
            <CardDescription>Status do ultimo backup realizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              {config && getStatusBadge(config.lastBackupStatus)}
            </div>
            {config?.lastBackupAt && (
              <div className="flex items-center justify-between">
                <span>Data:</span>
                <span>{format(new Date(config.lastBackupAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}</span>
              </div>
            )}
            {config?.lastBackupError && (
              <div className="text-sm text-red-500">
                Erro: {config.lastBackupError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuracao de Backup
          </CardTitle>
          <CardDescription>Configure o backup automatico diario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Automatico</Label>
              <p className="text-sm text-muted-foreground">Habilitar backup diario automatico</p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={!githubStatus?.configured}
              data-testid="switch-backup-enabled"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repositoryOwner">Usuario do GitHub (Owner)</Label>
              <Input
                id="repositoryOwner"
                value={repositoryOwner}
                onChange={(e) => setRepositoryOwner(e.target.value)}
                placeholder="seu-usuario-github"
                data-testid="input-repository-owner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repositoryName">Nome do Repositorio</Label>
              <Input
                id="repositoryName"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
                placeholder="mcg-backup"
                data-testid="input-repository-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledHour">Horario do Backup Diario</Label>
            <Select value={scheduledHour} onValueChange={setScheduledHour}>
              <SelectTrigger className="w-[200px]" data-testid="select-scheduled-hour">
                <SelectValue placeholder="Selecione o horario" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {String(i).padStart(2, "0")}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              O backup sera executado automaticamente neste horario (horario do servidor)
            </p>
          </div>

          {repositories && repositories.length > 0 && (
            <div className="space-y-2">
              <Label>Repositorio Configurado</Label>
              <div className="flex flex-wrap gap-2">
                {repositories
                  .filter((repo) => repo.fullName === "mcgconsultoria/appmcg")
                  .map((repo) => (
                  <Badge
                    key={repo.fullName}
                    variant="outline"
                    className="cursor-pointer hover-elevate"
                    onClick={() => {
                      const [owner, name] = repo.fullName.split("/");
                      setRepositoryOwner(owner);
                      setRepositoryName(name);
                    }}
                  >
                    {repo.fullName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleSaveConfig}
              disabled={saveConfigMutation.isPending}
              data-testid="button-save-config"
            >
              {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configuracao"}
            </Button>

            <Button
              variant="outline"
              onClick={() => runBackupMutation.mutate()}
              disabled={runBackupMutation.isPending || !githubStatus?.configured || !repositoryOwner}
              data-testid="button-run-backup"
            >
              <Play className="h-4 w-4 mr-2" />
              {runBackupMutation.isPending ? "Executando..." : "Executar Backup Agora"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>O que e salvo no backup?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Dados de usuarios (sem senhas)</li>
            <li>Clientes e contatos</li>
            <li>Tarefas e projetos</li>
            <li>Registros financeiros</li>
            <li>Atas de reuniao</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Os backups sao salvos em pastas organizadas por data no repositorio configurado.
          </p>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  );
}
