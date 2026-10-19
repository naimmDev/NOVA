import { useCallback, useEffect, useState } from 'react';

const LOAD_ERROR = 'No se pudo cargar la información. Intenta de nuevo.';

// Loads data from an async service. `reload()` fetches it again (call it after a change).
// Previous data stays visible while reloading, so tables do not flicker.
export function useAsyncData(load, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: '' });
      })
      .catch(() => {
        if (!cancelled) setState((current) => ({ ...current, loading: false, error: LOAD_ERROR }));
      });
    return () => {
      cancelled = true;
    };
    // `load` is read from the render that triggered the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { ...state, reload };
}