import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useRpcUrls } from 'provider/providerHooks';
import { getChains } from 'provider/connectors';
import arbitrumIcon from '../../../assets/images/arbitrum.png';
import ethereumIcon from '../../../assets/images/ethereum.svg';
import gnosisIcon from '../../../assets/images/gnosis-icon-green.svg';
import { Modal } from '../common/Modal';
import Option from './components/Option';
import useNetworkSwitching from 'hooks/Guilds/web3/useNetworkSwitching';

const iconsByChain = {
  1: ethereumIcon,
  4: ethereumIcon,
  100: gnosisIcon,
  42161: arbitrumIcon,
  421611: arbitrumIcon,
  1337: ethereumIcon,
};
const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
`;

const ContentWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: var(--body-text);
  padding: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`;

const UpperSection = styled.div`
  position: relative;
  background-color: var(--panel-background);

  h5 {
    margin: 0;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const OptionGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkModal: React.FC<NetworkModalProps> = ({ isOpen, onClose }) => {
  const { chainId } = useWeb3React();
  const rpcUrls = useRpcUrls();
  const { trySwitching } = useNetworkSwitching();

  return (
    <Modal
      header={<div>Switch network</div>}
      isOpen={isOpen}
      onDismiss={onClose}
      maxWidth={380}
    >
      <Wrapper>
        <UpperSection>
          <ContentWrapper>
            {rpcUrls && (
              <OptionGrid>
                {getChains(rpcUrls).map(chain => (
                  <Option
                    onClick={() => trySwitching(chain).then(onClose)}
                    key={chain.name}
                    icon={iconsByChain[chain.id] || null}
                    active={chain.id === chainId}
                    header={chain.displayName}
                  />
                ))}
              </OptionGrid>
            )}
          </ContentWrapper>
        </UpperSection>
      </Wrapper>
    </Modal>
  );
};

export default NetworkModal;
