import {
  DependencyList,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';

/* 
Helper hooks for dealing with async functions.
We might want to add react-use for this instead.

Used like this:

function useHook() {
    const [{ data, error, loading }, callFunction] = useAsyncFn(() => api.getData());
}

*/

export function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}

export function useAsync<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = []
) {
  const [state, callback] = useAsyncFn(fn, deps, { loading: true });

  useEffect(() => {
    callback();
  }, [callback]);

  return state;
}

export default function useAsyncFn<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFunctionReturningPromise<T> = { loading: false }
): AsyncFnReturn<T> {
  const lastCallId = useRef(0);
  const isMounted = useMountedState();
  const [state, set] =
    useState<StateFromFunctionReturningPromise<T>>(initialState);

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const callId = ++lastCallId.current;

    if (!state.loading) {
      set(prevState => ({ ...prevState, loading: true }));
    }

    return fn(...args).then(
      data => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ data, loading: false });

        return data;
      },
      error => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ error, loading: false });

        return error;
      }
    ) as ReturnType<T>;
  }, deps);

  return [state, callback as unknown as T];
}

export type PromiseType<P extends Promise<any>> = P extends Promise<infer T>
  ? T
  : never;

export type FunctionReturningPromise = (...args: any[]) => Promise<any>;
export type AsyncState<T> =
  | {
      loading: boolean;
      error?: undefined;
      data?: undefined;
    }
  | {
      loading: true;
      error?: Error | undefined;
      data?: T;
    }
  | {
      loading: false;
      error: Error;
      data?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      data: T;
    };

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> =
  AsyncState<PromiseType<ReturnType<T>>>;

export type AsyncFnReturn<
  T extends FunctionReturningPromise = FunctionReturningPromise
> = [StateFromFunctionReturningPromise<T>, T];
