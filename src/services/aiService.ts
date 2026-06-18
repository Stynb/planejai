interface IAResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// OBS: No Vite, somente variáveis com prefixo VITE_ ficam disponíveis no front-end.
const AZURE_OPENAI_KEY = String(import.meta.env.VITE_AZURE_OPENAI_KEY ?? "");
const AZURE_OPENAI_ENDPOINT = String(
  import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ?? ""
);
const AZURE_OPENAI_DEPLOYMENT_NAME = String(
  import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME ?? ""
);
const AZURE_OPENAI_API_VERSION = String(
  import.meta.env.VITE_AZURE_OPENAI_API_VERSION ?? ""
);

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/+$/, "");

const assertEnv = () => {
  const missing: string[] = [];
  if (!AZURE_OPENAI_KEY) missing.push("VITE_AZURE_OPENAI_KEY");
  if (!AZURE_OPENAI_ENDPOINT) missing.push("VITE_AZURE_OPENAI_ENDPOINT");
  if (!AZURE_OPENAI_DEPLOYMENT_NAME)
    missing.push("VITE_AZURE_OPENAI_DEPLOYMENT_NAME");
  if (!AZURE_OPENAI_API_VERSION)
    missing.push("VITE_AZURE_OPENAI_API_VERSION");

  if (missing.length) {
    throw new Error(
      `Azure OpenAI env não carregada: ${missing.join(", ")}. ` +
        `Verifique se o arquivo se chama .env.local (ou .env) na raiz do projeto ` +
        `e reinicie o servidor do Vite.`
    );
  }
};

const buildAzureUrl = () => {
  assertEnv();
  return `${normalizeEndpoint(
    AZURE_OPENAI_ENDPOINT
  )}/openai/deployments/${encodeURIComponent(
    AZURE_OPENAI_DEPLOYMENT_NAME
  )}/chat/completions?api-version=${encodeURIComponent(AZURE_OPENAI_API_VERSION)}`;
};

const callAzureAPI = async (messages: { role: string; content: string }[]) => {
  const url = buildAzureUrl();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": AZURE_OPENAI_KEY,
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Erro na requisição Azure OpenAI: ${response.status}${body ? ` - ${body}` : ""}`
    );
  }

  return (await response.json()) as IAResponse;
};

export interface InsightData {
  feasibility: {
    status: "viable" | "needs_adjustment" | "unfeasible";
    content: string;
  };
  diagnosis: { content: string };
  suggestions: { items: string[] };
  extraIncome: { items: string[] };
  investment: { items: string[] };
  motivation: { content: string };
}

export const getInsight = async (prompt: string) => {
  const response = await callAzureAPI([{ role: "user", content: prompt }]);
  const json = response.choices[0].message.content;
  return JSON.parse(json) as InsightData;
};

export const getChatAnswer = async (prompt: string) => {
  const response = await callAzureAPI([{ role: "user", content: prompt }]);
  return response.choices[0].message.content;
};

// Utilitário opcional para debug no console do browser
export const __debugAzureEnv = () => ({
  VITE_AZURE_OPENAI_ENDPOINT: AZURE_OPENAI_ENDPOINT,
  VITE_AZURE_OPENAI_DEPLOYMENT_NAME: AZURE_OPENAI_DEPLOYMENT_NAME,
  VITE_AZURE_OPENAI_API_VERSION: AZURE_OPENAI_API_VERSION,
  hasKey: Boolean(AZURE_OPENAI_KEY),
});
