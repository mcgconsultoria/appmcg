import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating MCG Consultoria products in Stripe...');

  // Check if products already exist
  const existingProducts = await stripe.products.list({ active: true, limit: 100 });
  const existingNames = existingProducts.data.map(p => p.name);

  // Plan: Gratuito (Free)
  if (!existingNames.includes('Gratuito')) {
    console.log('Creating: Gratuito...');
    const freeProduct = await stripe.products.create({
      name: 'Gratuito',
      description: 'Acesso às calculadoras de frete e armazenagem',
      metadata: {
        features: 'Calculadora de Frete com ICMS,Calculadora de Armazenagem,3 cálculos gratuitos',
        plan_type: 'free',
        order: '1',
      },
    });
    // Free plan doesn't need a price, but we create one with 0 for consistency
    await stripe.prices.create({
      product: freeProduct.id,
      unit_amount: 0,
      currency: 'brl',
      recurring: { interval: 'month' },
    });
    console.log('Created: Gratuito');
  }

  // Plan: Profissional
  if (!existingNames.includes('Profissional')) {
    console.log('Creating: Profissional...');
    const proProduct = await stripe.products.create({
      name: 'Profissional',
      description: 'Todas as ferramentas para gestão comercial completa',
      metadata: {
        features: 'Tudo do plano Gratuito,Cálculos ilimitados,CRM de Clientes,Pipeline de Vendas (Kanban),Checklists de 15 Departamentos,Calendário Comercial,Ata Plano de Ação,Gestão Financeira,Suporte por email',
        plan_type: 'professional',
        order: '2',
        popular: 'true',
      },
    });
    await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 49900, // R$ 499,00
      currency: 'brl',
      recurring: { interval: 'month' },
    });
    console.log('Created: Profissional');
  }

  // Plan: Corporativo
  if (!existingNames.includes('Corporativo')) {
    console.log('Creating: Corporativo...');
    const corpProduct = await stripe.products.create({
      name: 'Corporativo',
      description: 'Para operações em grande escala',
      metadata: {
        features: 'Tudo do plano Profissional,Multi-usuários (até 10),Gestão de Tarefas e Projetos,Indicadores e Curva ABC,Módulo de Marketing,Integrações personalizadas,Suporte prioritário,Treinamento dedicado',
        plan_type: 'enterprise',
        order: '3',
      },
    });
    await stripe.prices.create({
      product: corpProduct.id,
      unit_amount: 149900, // R$ 1.499,00
      currency: 'brl',
      recurring: { interval: 'month' },
    });
    console.log('Created: Corporativo');
  }

  // Individual Products
  const individualProducts = [
    {
      name: 'Calculadora de Frete',
      description: 'Cálculo de frete com ICMS para 27 estados',
      price: 4700, // R$ 47,00
      features: 'Cálculo de frete,ICMS para todos os estados,Pedágios incluídos',
    },
    {
      name: 'Calculadora de Armazenagem',
      description: 'Cálculo completo de custos de armazenagem',
      price: 4700,
      features: 'Cálculo de armazenagem,Custos operacionais,Análise de paletização',
    },
    {
      name: 'Checklist Operacional',
      description: 'Checklists para 20 departamentos de logística',
      price: 9700,
      features: '18 seções de checklist,Acompanhamento de progresso,Diagnóstico completo',
    },
    {
      name: 'Ata Plano de Ação',
      description: 'Registro de reuniões com itens de ação e PDF',
      price: 4700,
      features: 'Registro de reuniões,Itens de ação,Geração de PDF,Envio por email',
    },
    {
      name: 'RFI',
      description: 'Perfil técnico da empresa para participação em BIDs',
      price: 4700,
      features: 'Perfil técnico completo,Dados da empresa,Pronto para BIDs',
    },
  ];

  for (const prod of individualProducts) {
    if (!existingNames.includes(prod.name)) {
      console.log(`Creating: ${prod.name}...`);
      const product = await stripe.products.create({
        name: prod.name,
        description: prod.description,
        metadata: {
          features: prod.features,
          plan_type: 'addon',
        },
      });
      await stripe.prices.create({
        product: product.id,
        unit_amount: prod.price,
        currency: 'brl',
        recurring: { interval: 'month' },
      });
      console.log(`Created: ${prod.name}`);
    }
  }

  console.log('\nAll products created successfully!');
  console.log('Run syncBackfill to sync products to local database.');
}

createProducts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creating products:', err);
    process.exit(1);
  });
