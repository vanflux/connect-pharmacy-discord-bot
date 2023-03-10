
export function handleExceptions<T extends (...args: any) => any>(fn: T) {
  return ((...args: any) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch(exc => {
          console.log('[Exception] Unexpected exception caught:', exc);
        });
      } else {
        return result;
      }
    } catch (exc) {
      console.log('[Exception] Unexpected exception caught:', exc);
    }
  }) as T
}
