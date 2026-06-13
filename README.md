# 🎫 UTAD FastTicket

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Prisma Version](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS Version](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

O **UTAD FastTicket** é uma plataforma moderna, segura e de alta performance desenvolvida especificamente para a gestão, venda e validação de bilhetes de eventos da comunidade académica da **Universidade de Trás-os-Montes e Alto Douro (UTAD)**. 

Este projeto foi desenhado sob uma arquitetura serverless de última geração, garantindo escalabilidade, carregamento ultra-rápido e otimização para motores de busca (SEO).

---

## 🚀 Funcionalidades Principais

A plataforma dispõe de 4 painéis de controlo dedicados a diferentes perfis de utilizador:

| Perfil | Ações Disponíveis |
| :--- | :--- |
| **👤 Participante** | Explorar a agenda de eventos, gerir favoritos (wishlist), comprar bilhetes com checkout interativo, aceder ao histórico de faturas e visualizar os bilhetes em formato digital com QR Codes gerados dinamicamente. |
| **🤝 Promotor** | Afiliar-se a eventos organizados para vender bilhetes através de links de afiliado exclusivos, acompanhando as vendas e comissões ganhas em tempo real. |
| **🛡️ Staff** | Validar entradas no dia do evento em tempo real através do **FastTicket Scanner** (câmara fotográfica/QR Code ou pesquisa manual de tokens) e acompanhar os contadores de lotação. |
| **🖥️ Organizador** | Criar e editar eventos (via assistente passo-a-passo e gravação de rascunhos), personalizar o design visual dos bilhetes, gerir lotes de preços, aprovar candidaturas de promotores, associar equipa de staff e aceder a estatísticas detalhadas de vendas (gráficos). |
| **👑 Administrador** | Auditar utilizadores, gerir permissões globais e monitorizar logs globais do sistema. |

---

## 🎨 Motor de Personalização de Bilhetes

Um dos grandes destaques da plataforma é o **Ticket Customizer**, que permite aos organizadores moldar a experiência visual do bilhete final que o participante recebe por e-mail ou descarrega no painel:
* **Cores Customizadas:** Definição livre das cores de fundo e do texto.
* **Branding do Evento:** Upload de logo e imagem de fundo (*background*) do bilhete.
* **Aesthetics Modernos:** Efeito opcional de brilho neon (*Glow effect*) e seleção de templates de design (Clássico, Moderno, Minimalista).

---

## 🛠️ Stack Tecnológica

* **Framework:** [Next.js 16.2](https://nextjs.org/) (App Router, Server Actions, Middleware e Metadados Dinâmicos)
* **Design & UI:** [Tailwind CSS v4](https://tailwindcss.com/) (Estilização responsiva e HSL harmoniosos), Google Fonts (Outfit, Inter) e Material Symbols
* **Base de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) (Neon Database Serverless) gerido via [Prisma ORM](https://www.prisma.io/)
* **Pagamentos:** [Stripe API](https://stripe.com/) (Checkout Sessions e Webhooks)
* **Autenticação:** Sessões seguras e cifradas baseadas em cookies JWT com a biblioteca [jose](https://github.com/panva/jose)
* **Validação de Dados:** [Zod](https://zod.dev/) para esquemas rigorosos no cliente e servidor
* **Gráficos & Métricas:** [Recharts](https://recharts.org/) para análise de vendas

---

## 📐 Fluxo de Dados & Arquitetura

O diagrama abaixo ilustra a interação entre os diferentes módulos da plataforma:

```mermaid
graph TD
    A[Cliente / Browser] -->|Pedido HTTP / Server Action| B(Next.js App Router)
    B -->|Validação Zod| C{Autenticado?}
    C -->|Sim| D[Prisma Client]
    C -->|Não| E[Redireciona / Erro]
    D -->|Query SQL| F[(PostgreSQL Neon)]
    B -->|Webhook Evento| G[Stripe API]
    G -->|Confirmação Pagamento| D
```

---

## 🛡️ Segurança & Otimizações Realizadas

> [!IMPORTANT]
> **Base64 In-Memory Uploads (Cloud-Ready):** 
> Para solucionar o erro de escrita em discos de leitura estrita (`EROFS: read-only file system`) comum em ambientes serverless como o Vercel, todos os uploads de imagens foram convertidos para conversão e armazenamento direto em memória no formato **Base64 Data URL**. Não há criação de ficheiros locais no servidor.

> [!TIP]
> **URLs Amigáveis Híbridas (SEO-Friendly):**
> Os caminhos de visualização dos eventos utilizam o formato `/evento/[id]-[slug]` (ex: `/evento/12-concerto-de-ano-novo-utad`). Isto melhora significativamente a indexação em motores de busca (SEO) ao mesmo tempo que mantém 100% de compatibilidade com links antigos baseados puramente no ID do evento.

> [!WARNING]
> **Contas Sem Password (Guest Checkout):**
> Utilizadores criados automaticamente via compra de convidado não possuem palavra-passe inicial (guardados com a flag `"NO_PASSWORD"`). A plataforma deteta e oculta o campo "Password Atual" no painel de perfil, permitindo-lhes configurar a sua primeira palavra-passe de forma simples e intuitiva.

---

## ⚙️ Configuração Local

### 1. Clonar o repositório
```bash
git clone https://github.com/Esquerdo31/fastticket-utad.git
cd fastticket-utad
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Variáveis de Ambiente (`.env`)
Crie um ficheiro `.env` na raiz do projeto com o seguinte formato:
```env
# Ligação à base de dados PostgreSQL (Neon / Local)
DATABASE_URL="postgresql://utilizador:password@host/database?sslmode=require"

# Chave secreta de encriptação dos Cookies JWT
JWT_SECRET="insira-um-segredo-longo-e-seguro-aqui"

# Integração com a Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# URL Base da Aplicação
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Executar Migrações e Preparar o Prisma
Gere os esquemas do Prisma Client e atualize a estrutura da base de dados:
```bash
npx prisma generate
npx prisma db push
```

*(Opcional)* Se possuir um script de sementes configurado:
```bash
npx prisma db seed
```

### 5. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra o navegador em [http://localhost:3000](http://localhost:3000) para testar a aplicação.

---

## 📦 Compilação para Produção

Para testar o build final de produção ou otimizar a aplicação:
```bash
# Executa a compilação do TypeScript e empacotamento Next.js
npm run build

# Inicia o servidor com o build otimizado
npm run start
```
