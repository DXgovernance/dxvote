import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { FiCheckCircle, FiCopy, FiExternalLink } from 'react-icons/fi';
import { isMobile, isDesktop } from 'react-device-detect';

import {
  getBlockchainLink,
  NETWORK_NAMES,
  shortenAddress,
  MAINNET_ID,
} from '../../../../utils';
import useENSAvatar from '../../../../hooks/Guilds/ether-swr/ens/useENSAvatar';
import useClipboard from '../../../../hooks/Guilds/useClipboard';
import { findWalletType } from '../../../../provider/connectors';

import LiveIndicator from './LiveIndicator';
import { Button, IconButton } from '../../common/Button';
import Avatar from '../../Avatar';

const Wrapper = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
  margin: 1.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const ConnectionStatusText = styled(Row)`
  font-size: 0.9rem;
`;

const ConnectionStatusRow = styled(Row)`
  justify-content: space-between;
`;

const WalletAddressRow = styled(Row)`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.5rem 0 1rem 0;
`;

const ExternalLink = styled.a`
  text-decoration: none;
`;

const ConnectionActionButton = styled(IconButton)`
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.modalBackground};
  display: flex;
  justify-content: center;
  padding: 0;
  padding-right: 1rem;
`;

const AddressText = styled.span`
  margin-left: 0.2rem;
  margin-right: 0.3rem;
`;

const IconHolder = styled.span`
  display: flex;
  justify-content: center;

  @media only screen and (min-width: 768px) {
    margin-right: 0.3rem;
  }

  img {
    border-radius: 50%;
    margin-right: 0;
  }
`;

const CenteredButton = styled(Button)`
  margin: auto;
  display: flex;
  margin-top: 20px;
`;

interface Props {
  openOptions: any;
}

export default function WalletInfoBox({ openOptions }: Props) {
  const { account, connector, chainId } = useWeb3React();
  const { ensName, imageUrl } = useENSAvatar(account, MAINNET_ID);
  const [isCopied, copyAddress] = useClipboard(account, 3000);

  const networkName = NETWORK_NAMES[chainId];

  return (
    <Wrapper>
      <ConnectionStatusRow>
        <ConnectionStatusText>
          <LiveIndicator />
          Connected to {findWalletType(connector)}
        </ConnectionStatusText>
        {isDesktop && (
          <div>
            <Button onClick={openOptions}>Change</Button>
          </div>
        )}
      </ConnectionStatusRow>

      <WalletAddressRow>
        <IconHolder>
          <Avatar src={imageUrl} defaultSeed={account} size={24} />
        </IconHolder>
        <AddressText>{ensName || shortenAddress(account)}</AddressText>
      </WalletAddressRow>

      <Row>
        <ConnectionActionButton
          variant="minimal"
          onClick={copyAddress}
          iconLeft
        >
          {isCopied ? <FiCheckCircle /> : <FiCopy />}
          {isCopied ? 'Copied Address!' : 'Copy Address'}
        </ConnectionActionButton>

        <ExternalLink
          href={getBlockchainLink(account, networkName, 'address')}
          target="_blank"
        >
          <ConnectionActionButton variant="minimal" iconLeft>
            <FiExternalLink />
            View on Explorer
          </ConnectionActionButton>
        </ExternalLink>
      </Row>
      {isMobile && (
        <CenteredButton onClick={openOptions}>Change Connection</CenteredButton>
      )}
    </Wrapper>
  );
}
