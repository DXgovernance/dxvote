import { useContext } from "react";
import { MultichainContext } from "../contexts/MultichainProvider";

export default function useMultichainJsonRpcProvider(chainId: number) {
  const { providers } = useContext(MultichainContext);
  return providers[chainId];
}