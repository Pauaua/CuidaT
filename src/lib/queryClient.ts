import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Claves centralizadas de React Query. */
export const queryKeys = {
  profile: ['profile'] as const,
  persons: ['persons'] as const,
  person: (id: string) => ['persons', id] as const,
  medications: ['medications'] as const,
  medicationsByPerson: (personId: string) => ['medications', 'person', personId] as const,
  medication: (id: string) => ['medications', 'detail', id] as const,
  inventory: ['inventory'] as const,
  inventoryItem: (id: string) => ['inventory', id] as const,
  records: ['records'] as const,
  recordsFiltered: (filters: object) => ['records', 'list', filters] as const,
  givenDoses: (date: string) => ['records', 'doses', date] as const,
  infos: ['infos'] as const,
  info: (id: string) => ['infos', id] as const,
  events: ['events'] as const,
  eventsRange: (from: string, to: string) => ['events', 'range', from, to] as const,
  event: (id: string) => ['events', 'detail', id] as const,
};
