import { useMemo } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

import { injected } from 'provider/connectors';
import {
  getBlockchainLink,
  NETWORK_NAMES,
  shortenAddress,
} from '../../../utils';
import { Button, IconButton } from '../common/Button';
import Avatar from '../Avatar';
import useENSAvatar from '../../../hooks/Guilds/ens/useENSAvatar';
import useClipboard from '../../../hooks/Guilds/useClipboard';
import { FiCheckCircle, FiCopy, FiExternalLink } from 'react-icons/fi';

const Wrapper = styled.div`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.curved2};
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
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  justify-content: center;
  padding: 0;
  padding-right: 1rem;
`;

const AddressText = styled.span`
  margin-left: 0.2rem;
  margin-right: 0.3rem;
`;

const GreenCircle = styled.span`
  height: 8px;
  width: 8px;
  margin-right: 0.5rem;
  background-color: #4cc7a2;
  border-radius: 50%;
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

const WalletAction = styled.div`
  color: ${({ theme }) => theme.chaliceGray};
  margin-left: 16px;
  font-weight: 400;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;
interface Props {
  openOptions: any;
}

export default function WalletInfoBox({ openOptions }: Props) {
  const { account, connector, deactivate, chainId } = useWeb3React();
  const { ensName, imageUrl, avatarUri } = useENSAvatar(account);
  const [isCopied, copyAddress] = useClipboard(account, 5000);

  const imageUrlToUse = useMemo(() => {
    if (avatarUri) {
      return (
        imageUrl || `https://metadata.ens.domains/mainnet/avatar/${ensName}`
      );
    } else {
      return null;
    }
  }, [imageUrl, ensName, avatarUri]);

  const networkName = NETWORK_NAMES[chainId];

  return (
    <Wrapper>
      <ConnectionStatusRow>
        <ConnectionStatusText>
          <GreenCircle />
          Connected to MetaMask
        </ConnectionStatusText>
        <div>
          <Button onClick={openOptions}>Change</Button>
        </div>
      </ConnectionStatusRow>

      <WalletAddressRow>
        <IconHolder>
          <Avatar src={imageUrlToUse} defaultSeed={account} size={24} />
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
          Copy Address
        </ConnectionActionButton>

        <ExternalLink href={getBlockchainLink(account, networkName, 'address')}>
          <ConnectionActionButton variant="minimal" iconLeft>
            <FiExternalLink />
            View on Explorer
          </ConnectionActionButton>
        </ExternalLink>
      </Row>

      {connector !== injected && (
        <WalletAction
          onClick={() => {
            //@ts-ignore
            connector.close();
            deactivate();
          }}
        >
          Disconnect
        </WalletAction>
      )}
    </Wrapper>
  );
}
