import { DependencyList, useState, useEffect, useCallback } from 'react';
import { Convo } from '@theconvospace/sdk';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

import useJsonRpcProvider from './Guilds/web3/useJsonRpcProvider';
import { useContext } from '../contexts';

const apiKey = process.env.REACT_APP_CONVO_API_KEY;
const spaceUrl = window.location.origin;
const convo = new Convo(apiKey);

export function useComments(threadId) {
  return useAsync(() => convo.comments.query({ threadId }), [threadId]);
}

export function useCreateComment() {
  const { context } = useContext();
  const { account } = context.providerStore.getActiveWeb3React();

  return useAsyncFn(
    ({ threadId, token, comment }) =>
      convo.comments.create(account, token, comment, threadId, spaceUrl),
    [account]
  );
}

export function useUpvoteComment() {
  const { context } = useContext();
  const { account } = context.providerStore.getActiveWeb3React();

  return useAsyncFn(
    ({ token, commentId }) =>
      convo.comments.toggleUpvote(account, token, commentId),
    [account]
  );
}

export function useConvoAuth() {
  const { chainId } = useWeb3React();
  const provider = useJsonRpcProvider(chainId);

  return useAsyncFn(async () => {
    try {
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Try to get cached token first and see if it's valid
      const storedToken = localStorage.getItem('convo_token');
      if (
        storedToken &&
        (await convo.auth.validate(signerAddress, storedToken)).success
      ) {
        return storedToken;
      }

      // Request signature
      const message = convo.auth.getSignatureDataV2(spaceUrl, signerAddress, 1);
      const signature = await provider.send('personal_sign', [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)),
        signerAddress.toLowerCase(),
      ]);

      // Authenticate and get token
      const resp = await convo.auth.authenticateV2(message, signature);
      if (resp.success) {
        localStorage.setItem('convo_token', resp.message);
      }
      return resp.message;
    } catch (error) {
      console.log(error);
    }
  }, [provider]);
}

// Helper functions.
// Would suggest to use react-query or react-use instead to help with async state management
function useAsyncFn<T>(
  fn: Function,
  deps: DependencyList = [],
  initialState = {}
) {
  const [state, setState] = useState<{
    loading: boolean;
    error?: Error | null;
    data?: T;
  }>({
    loading: false,
    error: null,
    data: undefined,
    ...initialState,
  });

  const callback = useCallback((...args) => {
    setState(s => ({ ...s, loading: true }));
    return fn(...args)
      .then(data => {
        setState({ loading: false, data });
        return data;
      })
      .catch(error => {
        setState({ loading: false, error });
        return error;
      });
  }, deps);

  return [state, callback as any];
}

function useAsync(fn, deps: DependencyList = []) {
  const [state, callback] = useAsyncFn(fn, deps, { loading: true });
  useEffect(() => {
    callback();
  }, [callback]);

  return [state, callback];
}
