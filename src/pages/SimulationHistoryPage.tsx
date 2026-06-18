import { ExternalLink, Goal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PageHero } from "../components/shared/PageHero";
import { calcMonthlySavings } from "../components/utils/simulation";
import { parseCurrency } from "../components/utils/currency";
import { useSimulationStorage } from "../hooks/useSimulationStorage";
import type { SimulationRecord } from "../data/simulation";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

export function SimulationHistoryPage() {
  const navigate = useNavigate();
  const { listSimulations, deleteSimulation } = useSimulationStorage();

  const [items, setItems] = useState<SimulationRecord[]>([]);

  const refresh = () => setItems(listSimulations());

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasItems = items.length > 0;

  const rows = useMemo(() => {
    return items.map((item) => {
      const monthlySavings = calcMonthlySavings(item);
      const goalAmount = parseCurrency(item.goalAmount);

      return {
        id: item.id,
        goalName: item.goalName,
        dateLabel: formatDate(item.createdAt),
        goalAmountLabel: formatCurrency(goalAmount),
        deadlineLabel: `${item.goalDeadline} meses`,
        monthlySavingsLabel: formatCurrency(monthlySavings),
      };
    });
  }, [items]);

  const handleDelete = (id: string) => {
    const ok = window.confirm("Deseja excluir esta simulação?");
    if (!ok) return;

    deleteSimulation(id);
    refresh();
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#F5F4F8] to-[#EDEBF2] px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <h1 className="text-[#1F1F2E] mb-1 text-3xl font-extrabold tracking-tight sm:text-[40px]">
            Histórico de simulações
          </h1>
          <p className="text-[#6B6B7B] text-sm">
            Acompanhe o histórico de seus planos financeiros.
          </p>
        </div>

        {!hasItems && (
          <div className="rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm backdrop-blur">
            <p className="text-[#6B6B7B]">Nenhuma simulação salva ainda.</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <article
              key={row.id}
              className="group rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
            >
              <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[auto_1fr_auto]">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE]">
                    <Goal className="text-[#7C3AED]" size={22} />
                  </div>
                  <div>
                    <p className="text-[#1F1F2E] text-base font-bold">
                      {row.goalName}
                    </p>
                    <p className="text-[#9CA3AF] text-xs">{row.dateLabel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-semibold tracking-widest uppercase">
                      Custo da meta
                    </p>
                    <p className="text-[#1F1F2E] text-sm font-bold">
                      {row.goalAmountLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-semibold tracking-widest uppercase">
                      Prazo
                    </p>
                    <p className="text-[#1F1F2E] text-sm font-bold">
                      {row.deadlineLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#9CA3AF] text-[11px] font-semibold tracking-widest uppercase">
                      Economia mensal
                    </p>
                    <p className="text-[#1F1F2E] text-sm font-bold">
                      {row.monthlySavingsLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    aria-label="Excluir simulação"
                    onClick={() => handleDelete(row.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-red-50"
                  >
                    <Trash2 className="text-[#EF4444]" size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void navigate(`/resultado/${row.id}`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#1F1F2E] shadow-sm transition hover:bg-black/[0.02]"
                  >
                    <ExternalLink size={18} />
                    Ver detalhes
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
