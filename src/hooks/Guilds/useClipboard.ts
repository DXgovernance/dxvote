import { useState, useEffect } from 'react';
import copy from 'copy-to-clipboard';

export default function useClipboard(
  text: string,
  successDuration?: number
): [boolean, () => void] {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied && successDuration) {
      const id = setTimeout(() => {
        setIsCopied(false);
      }, successDuration);

      return () => clearTimeout(id);
    }

    return undefined;
  }, [isCopied, successDuration]);

  return [
    isCopied,
    () => {
      const didCopy = copy(text);
      setIsCopied(didCopy);
    },
  ];
}
