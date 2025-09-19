export async function suppressErrors<T>(func: () => T | Promise<T>): Promise<T> {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {};

  try {
    const result = func();
    // handle both sync and async
    if (result instanceof Promise) {
      return await result;
    }
    return result;
  } finally {
    console.error = originalError;
  }
}
