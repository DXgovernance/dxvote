import { useEffect, useState } from 'react';

export default function useTimedRerender(intervalMs: number) {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimestamp(Date.now());
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [intervalMs]);

  return timestamp;
}
