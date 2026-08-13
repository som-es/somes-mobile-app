import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delay` ms. Used to keep the search field's every keystroke
 * out of the react-query key — typing "Budget" would otherwise fire six
 * requests and six cache entries.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
