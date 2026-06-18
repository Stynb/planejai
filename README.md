# Planej.ai

Aplicação web para **simular um plano financeiro** (renda, custos, dívidas e uma meta) e mostrar:
- **resultado da simulação** (economia mensal, prazo, custo da meta);
- **insights personalizados** gerados por IA (Azure OpenAI);
- **histórico de simulações** salvas;
- **conversa com um educador financeiro** (perguntas e respostas por simulação).

---

## Como executar a aplicação

### 1) Pré-requisitos
- Node.js (recomendado: versão LTS)
- npm

### 2) Instalar dependências
```bash
npm install
```

### 3) Configurar variáveis de ambiente (Azure OpenAI)
Crie/edite o arquivo **`.env.local`** na raiz do projeto (importante: no Vite precisa ter o prefixo `VITE_`):

```env
VITE_AZURE_OPENAI_KEY=...
VITE_AZURE_OPENAI_ENDPOINT=https://<seu-resource>.cognitiveservices.azure.com
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=...
VITE_AZURE_OPENAI_API_VERSION=2024-05-01-preview
```

> Depois de alterar `.env.local`, **reinicie** o servidor (`npm run dev`).

### 4) Rodar em desenvolvimento
```bash
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### 5) Build de produção (opcional)
```bash
npm run build
npm run preview
```

---

## Tecnologias usadas
- **React** + **TypeScript**
- **Vite**
- **React Router**
- **TailwindCSS**
- **lucide-react** (ícones)
- Integração com **Azure OpenAI** via `fetch`

---

## Melhorias implementadas (durante o desafio)

### Desafio 1 — Página de Histórico de Simulações
- Criada a página **/historico** com layout responsivo (cards), exibindo um resumo de cada simulação.
- Ações:
  - **Excluir simulação** com confirmação.
  - **Ver detalhes** navegando para `/resultado/:id` mantendo os insights previamente gerados.
- Persistência em **localStorage**.

### Desafio 2 — Conversando com o Educador Financeiro
- Adicionado um chat dentro do **AIInsightsCard** para fazer perguntas sobre a simulação.
- Requisitos atendidos:
  - múltiplas perguntas por simulação;
  - histórico completo exibido na tela;
  - **auto-scroll** ao receber respostas;
  - feedback de **carregamento** e **erro**;
  - conversa persistida em **localStorage** (vinculada à simulação).

---

## Como testar o fluxo principal

1) Acesse `http://localhost:5173/`
2) Preencha o formulário de simulação e clique em **Gerar simulação**
3) Na tela de resultados (`/resultado/:id`):
   - confirme os cards com os valores calculados;
   - aguarde o **Insight Financeiro Personalizado**;
   - faça uma pergunta no chat (ex.: “Como posso atingir a meta mais rápido?”)
4) Vá para **Histórico** (`/historico`):
   - confirme que a simulação aparece na lista;
   - clique em **Ver detalhes** e verifique se insights + conversa continuam disponíveis;
   - teste a exclusão pelo ícone de lixeira.

---

## O que eu aprendi durante o desafio
- A importância de **separar dados e UI**, mantendo persistência e regras de negócio em hooks/serviços.
- No **Vite**, variáveis para o front precisam do prefixo **`VITE_`** e o arquivo correto (`.env.local`).
- Como evitar loops de render no React (ex.: dependências instáveis em `useEffect`/`useCallback`).
- Como projetar um fluxo com **IA** pensando em UX: carregamento, erro, persistência e histórico de conversa.
