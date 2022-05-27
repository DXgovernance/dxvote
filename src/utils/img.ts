import arbitrumIcon from 'assets/images/arbitrum.png';
import ethereumIcon from 'assets/images/ethereum.svg';
import gnosisIcon from 'assets/images/gnosis-icon-green.svg';

const iconsByChain = {
  1: ethereumIcon,
  4: ethereumIcon,
  100: gnosisIcon,
  42161: arbitrumIcon,
  421611: arbitrumIcon,
  1337: ethereumIcon,
};

export const getChainIcon = (chainId: number) => {
  if (!chainId) return null;
  return iconsByChain[chainId] ?? null;
};
