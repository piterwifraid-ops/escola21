export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  attempts = 3,
  initialDelay = 300
): Promise<T> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt < attempts) {
    try {
      return await requestFn();
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt >= attempts) break;
      const backoff = initialDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100);
      await new Promise((res) => setTimeout(res, backoff));
    }
  }

  throw lastError;
}

export default requestWithRetry;
