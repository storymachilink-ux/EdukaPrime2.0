# Implementação de Eventos TikTok Pixel

## Visão Geral
O arquivo `src/lib/tiktokTracker.ts` agora contém todas as funções necessárias para rastrear eventos padrão do TikTok conforme recomendado pela plataforma.

## Eventos Implementados

### 1. Identificação de Usuário com PII (Dados Pessoais)
```typescript
import { identifyUserWithPII } from './lib/tiktokTracker';

// Usar após login/cadastro do usuário
await identifyUserWithPII({
  email: user.email,
  phone_number: user.phone,
  external_id: user.id
});
```

**Notas:**
- Os dados são automaticamente hasheados com SHA-256 no cliente
- Use quando o usuário fizer login ou se cadastre
- Recomendado: Chamar logo após autenticação bem-sucedida

### 2. ViewContent - Visualização de Conteúdo
```typescript
import { trackViewContent } from './lib/tiktokTracker';

trackViewContent(
  [
    {
      content_id: 'video-123',
      content_type: 'product',
      content_name: 'Vídeo de Matemática'
    }
  ],
  99.90, // Valor (opcional)
  'BRL'  // Moeda
);
```

**Quando usar:**
- Quando usuário visualiza um vídeo
- Quando usuário acessa uma atividade
- Quando usuário visualiza um bonus

### 3. AddToWishlist - Adicionar à Lista de Desejos
```typescript
import { trackAddToWishlist } from './lib/tiktokTracker';

trackAddToWishlist(
  [
    {
      content_id: 'atividade-456',
      content_type: 'product',
      content_name: 'Atividade: Equações'
    }
  ]
);
```

### 4. Search - Busca
```typescript
import { trackSearchTikTok } from './lib/tiktokTracker';

trackSearchTikTok(
  [
    {
      content_id: 'search-result-1',
      content_type: 'product',
      content_name: 'Português'
    }
  ],
  'português' // search_string
);
```

### 5. AddPaymentInfo - Adicionar Informações de Pagamento
```typescript
import { trackAddPaymentInfo } from './lib/tiktokTracker';

trackAddPaymentInfo(
  [
    {
      content_id: 'plano-premium',
      content_type: 'product',
      content_name: 'Plano Premium'
    }
  ],
  129.90, // valor
  'BRL'
);
```

**Quando usar:**
- Quando usuário adiciona/atualiza método de pagamento
- Quando usuario clica em botão de upgrade de plano

### 6. AddToCart - Adicionar ao Carrinho
```typescript
import { trackAddToCartTikTok } from './lib/tiktokTracker';

trackAddToCartTikTok(
  [
    {
      content_id: 'plano-anual',
      content_type: 'product',
      content_name: 'Acesso Anual'
    }
  ],
  259.90,
  'BRL'
);
```

### 7. InitiateCheckout - Iniciar Checkout
```typescript
import { trackInitiateCheckout } from './lib/tiktokTracker';

trackInitiateCheckout(
  [
    {
      content_id: 'plano-anual',
      content_type: 'product',
      content_name: 'Acesso Anual'
    }
  ],
  259.90,
  'BRL'
);
```

**Quando usar:**
- Quando usuário clica em "Ir para Checkout"
- Quando página de checkout é carregada

### 8. PlaceAnOrder - Colocar Pedido
```typescript
import { trackPlaceAnOrder } from './lib/tiktokTracker';

trackPlaceAnOrder(
  [
    {
      content_id: 'pedido-001',
      content_type: 'product',
      content_name: 'Acesso Anual'
    }
  ],
  259.90,
  'BRL'
);
```

**Quando usar:**
- Quando pedido é confirmado (antes do pagamento ser processado)

### 9. CompleteRegistration - Completar Registro
```typescript
import { trackCompleteRegistration } from './lib/tiktokTracker';

trackCompleteRegistration(
  [
    {
      content_id: 'signup',
      content_type: 'product',
      content_name: 'Novo Usuário'
    }
  ]
);
```

**Quando usar:**
- Quando usuário conclui cadastro com sucesso
- Após verificação de email (se aplicável)

### 10. Purchase - Compra
```typescript
import { trackPurchaseTikTok } from './lib/tiktokTracker';

// Quando pagamento é confirmado
trackPurchaseTikTok(
  [
    {
      content_id: 'transacao-123',
      content_type: 'product',
      content_name: 'Plano Premium - Anual'
    }
  ],
  259.90,
  'BRL'
);
```

**Quando usar:**
- Quando transação de pagamento é confirmada
- Webhook de confirmação de pagamento

## Exemplo de Implementação em um Componente de Login

```typescript
import { useAuth } from '../contexts/AuthContext';
import { identifyUserWithPII, trackCompleteRegistration } from '../lib/tiktokTracker';

export default function Login() {
  const { signUp } = useAuth();

  const handleRegister = async (email: string, password: string, nome: string) => {
    try {
      const user = await signUp(email, password, nome);

      // Rastrear registro completo
      await identifyUserWithPII({
        email: user.email,
        external_id: user.id
      });

      trackCompleteRegistration([
        {
          content_id: 'signup',
          content_type: 'product',
          content_name: 'Nova Conta'
        }
      ]);

    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };
}
```

## Exemplo de Implementação em Página de Pagamento

```typescript
import { trackInitiateCheckout, trackPurchaseTikTok } from '../lib/tiktokTracker';

export default function CheckoutPage() {
  const handleCheckoutClick = () => {
    trackInitiateCheckout([
      {
        content_id: 'plano-premium',
        content_type: 'product',
        content_name: 'Plano Premium - R$129.90/mês'
      }
    ], 129.90, 'BRL');
  };

  const handlePaymentSuccess = () => {
    trackPurchaseTikTok([
      {
        content_id: 'transacao-' + Date.now(),
        content_type: 'product',
        content_name: 'Plano Premium - R$129.90/mês'
      }
    ], 129.90, 'BRL');
  };

  return (
    <div>
      {/* Seu formulário de checkout */}
    </div>
  );
}
```

## Recomendações

1. **Segurança de Dados:**
   - Nunca envie dados PII sem hash ao TikTok
   - Use `identifyUserWithPII` que já faz o hash automaticamente

2. **Timing:**
   - `ViewContent` → assim que usuário carrega página
   - `CompleteRegistration` → após cadastro bem-sucedido
   - `Purchase` → após confirmação de pagamento

3. **Contents Array:**
   - Use apenas UM item no array `contents` para maioria dos casos
   - Use múltiplos itens se rastreando multiple products na mesma transação

4. **Valores:**
   - Use sempre números decimais (ex: 129.90)
   - Use sempre código ISO 4217 para moeda (BRL para Real)

## Checklist de Implementação

- [ ] Adicionar `identifyUserWithPII` após login bem-sucedido
- [ ] Adicionar `trackCompleteRegistration` após cadastro
- [ ] Adicionar `trackViewContent` em páginas de vídeo/atividades
- [ ] Adicionar `trackInitiateCheckout` na página de checkout
- [ ] Adicionar `trackPurchaseTikTok` após confirmação de pagamento
- [ ] Testar eventos no TikTok Events Manager

## Contato TikTok
Para dúvidas, acesse: https://business.tiktok.com/help
