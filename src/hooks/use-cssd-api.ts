import { useState, useEffect, useCallback } from 'react';
import { cssdAPI, CSSDRequest, ReceivedItem, IssuedItem, PackageKit, StockItem, SterilizationProcess, ConsumptionReport } from '@/lib/api';

// Generic hook for data operations
export function useCSSDData<T>(
  fetchFunction: () => Promise<T[]>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for each data type
export function useRequests() {
  return useCSSDData(() => cssdAPI.getRequests());
}

export function useReceivedItems() {
  return useCSSDData(() => cssdAPI.getReceivedItems());
}

export function useIssuedItems() {
  return useCSSDData(() => cssdAPI.getIssuedItems());
}

export function usePackageKits() {
  return useCSSDData(() => cssdAPI.getPackageKits());
}

export function useStockItems() {
  return useCSSDData(() => cssdAPI.getStockItems());
}

export function useSterilizationProcesses() {
  return useCSSDData(() => cssdAPI.getSterilizationProcesses());
}

export function useConsumptionReports() {
  return useCSSDData(() => cssdAPI.getConsumptionReports());
}

// Dashboard stats hook
export function useDashboardStats() {
  const [stats, setStats] = useState({
    activeRequests: 0,
    sterilizationInProgress: 0,
    itemsReady: 0,
    lowStockItems: 0,
    totalRequests: 0,
    totalReceived: 0,
    totalIssued: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.getDashboardStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

// Search hooks
export function useSearchRequests(query: string) {
  return useCSSDData(
    () => cssdAPI.searchRequests(query),
    [query]
  );
}

export function useSearchIssuedItems(query: string) {
  return useCSSDData(
    () => cssdAPI.searchIssuedItems(query),
    [query]
  );
}

// Mutation hooks
export function useCreateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (request: Omit<CSSDRequest, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.createRequest(request);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createRequest, loading, error };
}

export function useCreateReceivedItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReceivedItem = useCallback(async (item: Omit<ReceivedItem, 'id' | 'receivedAt' | 'receivedDate'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.createReceivedItem(item);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createReceivedItem, loading, error };
}

export function useCreateIssuedItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIssuedItem = useCallback(async (item: Omit<IssuedItem, 'id' | 'issuedTime' | 'issuedDate'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.createIssuedItem(item);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createIssuedItem, loading, error };
}

export function useCreatePackageKit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPackageKit = useCallback(async (kit: Omit<PackageKit, 'id' | 'creationDate'>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.createPackageKit(kit);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPackageKit, loading, error };
}

export function useUpdateRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRequest = useCallback(async (id: string, updates: Partial<CSSDRequest>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.updateRequest(id, updates);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateRequest, loading, error };
}

export function useDeleteRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRequest = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cssdAPI.deleteRequest(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteRequest, loading, error };
}

// Utility hooks
export function useInitializeData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await cssdAPI.initializeSampleData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { initializeData, loading, error };
}

export function useClearData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await cssdAPI.clearAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { clearData, loading, error };
} 