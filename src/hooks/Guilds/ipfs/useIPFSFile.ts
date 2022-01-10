import { useEffect, useState } from 'react';

export default function useIPFSFile<T>(contentHash: string) {
  const [file, setFile] = useState<T>(null);

  useEffect(() => {
    async function getContentFromIPFS(hash: string) {
      async function fetcher(url: string): Promise<T> {
        const response = await fetch(url, {
          headers: { 'content-type': 'application/json' },
        });
        if (response.ok) {
          return response.json() as Promise<T>;
        } else {
          throw new Error('Unable to get content.');
        }
      }

      const response = await Promise.any([
        fetcher('https://ipfs.io/ipfs/' + hash),
        fetcher('https://gateway.ipfs.io/ipfs/' + hash),
        fetcher('https://cloudflare-ipfs.com/ipfs/' + hash),
        fetcher('https://gateway.pinata.cloud/ipfs/' + hash),
        fetcher('https://dweb.link/ipfs/' + hash),
        fetcher('https://infura-ipfs.io/ipfs/' + hash),
      ]);

      return response;
    }

    if (!contentHash) {
      return setFile(null);
    }

    getContentFromIPFS(contentHash).then(setFile);
  }, [contentHash]);

  return file;
}
