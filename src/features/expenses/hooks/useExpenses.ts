import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/lib/queryClient';
import { linkMedicationToInventory } from '@/features/medications/services/medicationService';
import type { CategoriaGasto, Gasto } from '@/types/database';

import type { ExpenseSubmission } from '../schema';
import {
  createExpense,
  createExpenseWithNewItem,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from '../services/expenseService';

/** Todos los gastos (una sola consulta en caché; cada pestaña filtra la suya). */
export function useExpenses(categoria?: CategoriaGasto) {
  return useQuery({
    queryKey: queryKeys.expenses,
    queryFn: listExpenses,
    select: categoria ? (list: Gasto[]) => list.filter((g) => g.categoria === categoria) : undefined,
  });
}

export function useExpense(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.expense(id ?? ''),
    queryFn: () => getExpense(id as string),
    enabled: Boolean(id),
  });
}

/** Las compras cambian el stock: refrescamos también inventario, historial y medicamentos. */
function invalidateAfterPurchase(client: ReturnType<typeof useQueryClient>) {
  client.invalidateQueries({ queryKey: queryKeys.expenses });
  client.invalidateQueries({ queryKey: queryKeys.inventory });
  client.invalidateQueries({ queryKey: queryKeys.records });
  client.invalidateQueries({ queryKey: queryKeys.medications });
}

export function useSaveExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, submission }: { id?: string; submission: ExpenseSubmission }) => {
      const { values, createItem, umbralBajo, medicamentoId } = submission;
      // La base de datos suma (o ajusta) las unidades en el inventario vinculado
      const saved =
        !id && createItem
          ? await createExpenseWithNewItem(values, umbralBajo)
          : id
            ? await updateExpense(id, values)
            : await createExpense(values);

      // Si la compra vino de un medicamento sin stock vinculado, lo vinculamos
      // para que sus tomas se descuenten de este ítem.
      if (medicamentoId && saved.inventario_id) {
        await linkMedicationToInventory(medicamentoId, saved.inventario_id).catch(() => undefined);
      }
      return saved;
    },
    onSuccess: () => invalidateAfterPurchase(client),
  });
}

export function useDeleteExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => invalidateAfterPurchase(client),
  });
}

export type CheapestOption = {
  /** Nombre tal como se escribió la última vez */
  nombre: string;
  lugar: string;
  precioUnitario: number;
  /** Cuánto más caro fue el lugar más costoso, por unidad */
  ahorroUnitario: number;
  lugaresComparados: number;
};

/** Normaliza nombres para agrupar ("Losartán 50mg" ≈ "losartan 50 mg"). */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '');
}

/**
 * Resumen de una lista de gastos: total del mes actual y, para cada producto
 * comprado en 2 o más lugares, dónde salió más barato por unidad.
 */
export function useExpenseSummary(expenses: Gasto[] | undefined) {
  return useMemo(() => {
    const list = expenses ?? [];
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTotal = list
      .filter((g) => g.fecha.startsWith(monthPrefix))
      .reduce((sum, g) => sum + g.precio, 0);

    // Mejor precio unitario por producto y lugar
    const byProduct = new Map<string, { nombre: string; porLugar: Map<string, number> }>();
    for (const g of list) {
      if (!g.lugar) continue;
      const key = normalizeName(g.nombre);
      const entry = byProduct.get(key) ?? { nombre: g.nombre, porLugar: new Map<string, number>() };
      const unit = g.precio / g.cantidad;
      const previous = entry.porLugar.get(g.lugar);
      if (previous === undefined || unit < previous) entry.porLugar.set(g.lugar, unit);
      byProduct.set(key, entry);
    }

    const cheapest: CheapestOption[] = [];
    for (const { nombre, porLugar } of byProduct.values()) {
      if (porLugar.size < 2) continue;
      const sorted = [...porLugar.entries()].sort((a, b) => a[1] - b[1]);
      const [lugar, precioUnitario] = sorted[0]!;
      const mostExpensive = sorted[sorted.length - 1]![1];
      cheapest.push({
        nombre,
        lugar,
        precioUnitario,
        ahorroUnitario: mostExpensive - precioUnitario,
        lugaresComparados: porLugar.size,
      });
    }
    cheapest.sort((a, b) => b.ahorroUnitario - a.ahorroUnitario);

    // Lugares ya usados, del más reciente al más antiguo (para sugerirlos en el formulario)
    const lugares = [...new Set(list.map((g) => g.lugar).filter((l): l is string => Boolean(l)))];

    return { monthTotal, cheapest, lugares };
  }, [expenses]);
}
