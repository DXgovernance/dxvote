import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from 'ethers/providers';
import { getContract } from '../../../utils/contracts';

export default function useContract(
  contractId: string,
  abi: any,
  web3Context?: string
) {
  const { library } = useWeb3React(web3Context);
  const provider = new Web3Provider(library.currentProvider);
  const contract = getContract(contractId, abi, provider);

  return contract;
}
