import { Middleware, SWRHook } from 'swr';

const loggerMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const extendedFetcher = (...args) => {
      console.debug(`[SWR ${key}] Request triggered`);
      return fetcher(...args);
    };

    const response = useSWRNext(key, extendedFetcher, config);
    if (response.data) {
      console.debug(`[SWR ${key}] Response:`, {
        data: response.data,
        error: response.error,
      });
    } else if (response.error) {
      console.error(`[SWR ${key}] Response:`, {
        data: response.data,
        error: response.error,
      });
    }
    return response;
  };

export default loggerMiddleware;
