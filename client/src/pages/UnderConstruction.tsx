import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Construction, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function UnderConstruction() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const form = useForm({
    defaultValues: {
      interest: "",
    },
  });

  const onSubmit = (data: { interest: string }) => {
    console.log("Interesse registrado:", data);
    toast({
      title: "Obrigado pelo seu interesse!",
      description: "Recebemos sua mensagem e entraremos em contato em breve.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Construction className="w-12 h-12" />
            </div>
          </div>
          <CardTitle className="text-2xl">Página em Construção</CardTitle>
          <CardDescription>
            Estamos preparando algo especial para o seu perfil de usuário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            A MCG Consultoria está em constante evolução. Em breve você terá acesso a ferramentas exclusivas para o seu segmento.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="interest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que você está buscando no momento?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conte-nos um pouco sobre suas necessidades..." 
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <MessageSquare className="mr-2 w-4 h-4" />
                Enviar Interesse
              </Button>
            </form>
          </Form>

          <div className="pt-4 border-t text-center">
            <Button variant="ghost" asChild>
              <Link href="/">Voltar para o Início</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
