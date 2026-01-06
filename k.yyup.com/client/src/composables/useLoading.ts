import { ref, readonly } from 'vue';

export function useLoading(initialState = false) {
  const loading = ref(initialState);
  const error = ref<string | null>(null);

  const setLoading = (state: boolean) => {
    loading.value = state;
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
  };

  const withLoading = async <T>(asyncFunction: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    setLoading,
    setError,
    withLoading
  };
}