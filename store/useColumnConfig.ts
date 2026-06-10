import { create } from "zustand";

interface ColumnConfig {
  page: string;
  columns: string[];
}

interface ColumnStore {
  configs: ColumnConfig[];

  updateColumns: (
    page: string,
    columns: string[]
  ) => void;

  getColumns: (
    page: string
  ) => string[];
}

export const useColumnConfig =
  create<ColumnStore>((set, get) => ({
    configs: [],

    updateColumns: (page, columns) =>
      set((state) => ({
        configs: [
          ...state.configs.filter(
            (c) => c.page !== page
          ),
          { page, columns },
        ],
      })),

    getColumns: (page) => {
      const config = get().configs.find(
        (c) => c.page === page
      );

      return config?.columns ?? [];
    },
  }));