import { SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useChat } from "../../../hooks/useChat";
import { useInsight } from "../../../hooks/useInsight";
import { Content } from "../Insights/Content";
import { Error_ } from "../Insights/Error_";

import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";

interface AIInsightCardProps {
  simulationId: string;
}

function ChatBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-[#7C3AED] text-white"
            : "bg-white/80 text-[#1F1F2E] backdrop-blur",
        ].join(" ")}
      >
        {content}
      </div>
    </div>
  );
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId);
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    ask,
  } = useChat(simulationId);

  const [question, setQuestion] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const showInsight = !isLoading && !!insight;
  const showChat = !!insight; // chat só aparece depois do insight existir

  const hasMessages = messages.length > 0;

  const combinedError = useMemo(() => {
    return chatError || error;
  }, [chatError, error]);

  useEffect(() => {
    // auto-scroll quando chega resposta (ou quando lista muda)
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isChatLoading]);

  const handleSubmit = async () => {
    const q = question.trim();
    if (!q) return;

    setQuestion("");
    await ask(q);
  };

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}

      {!isLoading && error && (
        <Error_
          simulationId={simulationId}
          message={error}
          onRetry={() => fetchInsight(simulationId)}
        />
      )}

      {showInsight && <Content insight={insight} />}

      {showChat && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground text-sm font-semibold">
              Converse com o educador financeiro
            </h3>
            {isChatLoading && (
              <span className="text-muted-foreground text-xs">Respondendo…</span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-black/5 bg-gradient-to-b from-white/60 to-white/30 p-4 shadow-sm backdrop-blur"
            aria-label="Histórico de conversa"
          >
            {!hasMessages && (
              <p className="text-muted-foreground text-sm">
                Faça uma pergunta sobre sua simulação.
              </p>
            )}
            {messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} content={m.content} />
            ))}
          </div>

          {combinedError && (
            <p className="mt-2 text-sm text-red-500">⚠️ {combinedError}</p>
          )}

          <div className="mt-3 flex gap-2">
            <label className="sr-only" htmlFor="chat-question">
              Pergunte ao educador financeiro
            </label>
            <input
              id="chat-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="Ex: Como posso reduzir gastos e bater a meta mais rápido?"
              className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#7C3AED]"
              disabled={isChatLoading}
            />

            <button
              type="button"
              aria-label="Enviar pergunta"
              onClick={() => void handleSubmit()}
              disabled={isChatLoading || question.trim().length === 0}
              className="inline-flex items-center justify-center rounded-2xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-60"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
