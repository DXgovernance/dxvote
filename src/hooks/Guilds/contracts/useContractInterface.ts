import { utils } from 'ethers';

const useContractInterface = (ABI: any) => {
  let ERC20Contract = new utils.Interface(ABI);

  return ERC20Contract;
};

export default useContractInterface;
