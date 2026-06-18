import type { SimulationFormData, SimulationRecord } from "../data/simulation";

const LOCAL_STORAGE_KEY = "simulation-data";

const safeParse = (value: string | null) => {
  if (!value) return [] as SimulationRecord[];
  try {
    const parsed = JSON.parse(value) as SimulationRecord[];
    return Array.isArray(parsed) ? parsed : ([] as SimulationRecord[]);
  } catch {
    return [] as SimulationRecord[];
  }
};

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID();
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    };

    const savedData = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY));

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([record, ...savedData])
    );

    return id;
  };

  const listSimulations = () => {
    const savedData = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY));
    // Ordena mais recente primeiro
    return [...savedData].sort((a, b) =>
      String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
    );
  };

  const deleteSimulation = (id: string) => {
    const savedData = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY));
    const updated = savedData.filter((record) => record.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const getFormData = (id: string) => {
    const savedData = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY));
    return savedData.find((record) => record.id === id) || null;
  };

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const savedData = safeParse(localStorage.getItem(LOCAL_STORAGE_KEY));

    const updated = savedData.map((record) =>
      record.id === id ? { ...record, ...data, id } : record
    );

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    saveFormData,
    listSimulations,
    deleteSimulation,
    getFormData,
    updateSimulation,
  };
};
