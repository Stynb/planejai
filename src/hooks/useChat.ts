import { useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage, SimulationRecord } from "../data/simulation";
import { buildAIChatPrompt } from "../data/aiPrompt";
import { getChatAnswer } from "../services/aiService";
import { useSimulationStorage } from "./useSimulationStorage";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const useChat = (simulationId: string) => {
  const storage = useSimulationStorage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRequestPending = useRef(false);

  const simulation = useMemo(() => {
    return simulationId ? storage.getFormData(simulationId) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);

  useEffect(() => {
    const chat = simulation?.chat ?? [];
    setMessages(chat);
    setError(null);
    setIsLoading(false);
    isRequestPending.current = false;
  }, [simulationId, simulation]);

  const ask = async (question: string) => {
    if (!simulationId) {
      setError("Simulação inválida.");
      return;
    }

    const sim = storage.getFormData(simulationId);
    if (!sim) {
      setError("Simulação não encontrada.");
      return;
    }

    const content = question.trim();
    if (!content) return;

    if (isRequestPending.current) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...(sim.chat ?? []), userMsg];

    // otimista
    setMessages(nextMessages);
    setError(null);
    setIsLoading(true);
    isRequestPending.current = true;

    // persiste pergunta
    storage.updateSimulation(simulationId, {
      ...(sim as SimulationRecord),
      chat: nextMessages,
    });

    try {
      const insightJson = sim.insight ? JSON.stringify(sim.insight) : undefined;
      const prompt = buildAIChatPrompt({
        simulation: sim,
        userQuestion: content,
        insightJson,
        previousMessages: nextMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const answer = await getChatAnswer(prompt);

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: String(answer ?? "").trim(),
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      storage.updateSimulation(simulationId, {
        ...(sim as SimulationRecord),
        chat: finalMessages,
      });
    } catch {
      setError("Erro ao enviar pergunta. Tente novamente.");
      // mantém histórico com a pergunta; não apaga
    } finally {
      setIsLoading(false);
      isRequestPending.current = false;
    }
  };

  return { messages, isLoading, error, ask };
};
