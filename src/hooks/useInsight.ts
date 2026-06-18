import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildAIPrompt } from "../data/aiPrompt";
import { useSimulationStorage } from "./useSimulationStorage";
import { getInsight, type InsightData } from "../services/aiService";
import type { SimulationRecord } from "../data/simulation";

export const useInsight = (id: string) => {
  const isRequestPending = useRef(false);

  // IMPORTANT: useSimulationStorage() devolve funções novas a cada render.
  // Se colocarmos getFormData/updateSimulation nas deps de useEffect/useCallback,
  // eles mudam a cada render e podem causar loops.
  const storage = useSimulationStorage();

  const [insight, setInsight] = useState<InsightData | null>(() => {
    const simulation = storage.getFormData(id);
    return simulation?.insight ?? null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mantém o snapshot mais recente da simulação para:
  // 1) evitar buscar no storage em loop
  // 2) não depender de funções instáveis nas deps
  const simulationSnapshot = useMemo(() => {
    return storage.getFormData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = storage.getFormData(simulationId);

      if (!simulation) {
        setError("Simulação não encontrada.");
        return;
      }

      isRequestPending.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const prompt = buildAIPrompt(simulation);
        const data = await getInsight(prompt);

        setInsight(data);

        storage.updateSimulation(simulationId, {
          ...simulation,
          insight: data,
        } as SimulationRecord);
      } catch {
        setError("Erro ao gerar o diagnóstico. Tente novamente.");
      } finally {
        isRequestPending.current = false;
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    // Atualiza o estado quando troca o id (navegação entre resultados)
    setInsight(simulationSnapshot?.insight ?? null);
    setError(null);
  }, [simulationSnapshot]);

  useEffect(() => {
    // Evita loop infinito de requisições
    if (!id || insight || isLoading || isRequestPending.current) {
      return;
    }

    fetchInsight(id);
  }, [id, insight, isLoading, fetchInsight]);

  return { insight, isLoading, error, fetchInsight };
};
