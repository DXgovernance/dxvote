import { isDesktop } from 'react-device-detect';
import styled from 'styled-components';
import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { IconButton } from '../common/Button';
import useENSAvatar from '../../../hooks/Guilds/ens/useENSAvatar';
import Avatar from '../Avatar';
import { shortenAddress } from '../../../utils';
import { Badge } from '../common/Badge';
import { DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';

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

const StyledAddressButton = styled(IconButton)`
  margin-top: 0;
  margin-bottom: 0;
  padding: 0.3rem;

  @media only screen and (min-width: 768px) {
    padding: 0.3rem 0.5rem;
  }

  /* hover state for when having child Badge */
  &:hover,
  &:active {
    ${Badge} {
      background-color: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const AddressText = styled.span`
  margin-left: 0.2rem;
  margin-right: 0.3rem;
`;

interface AddressButtonProps {
  address?: string;
  chainId?: number;
  transactionsCounter?: number;
  onClick?: () => void;
}

const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  chainId = DEFAULT_ETH_CHAIN_ID,
  transactionsCounter,
  onClick,
}) => {
  const { ensName, imageUrl, avatarUri } = useENSAvatar(address, chainId);

  const imageUrlToUse = useMemo(() => {
    if (avatarUri) {
      // TODO: Consider chainId when generating ENS metadata service fallback URL
      return (
        imageUrl || `https://metadata.ens.domains/mainnet/avatar/${ensName}`
      );
    } else {
      return null;
    }
  }, [imageUrl, ensName, avatarUri]);

  return (
    <StyledAddressButton onClick={onClick} iconLeft>
      <IconHolder>
        {address ? (
          <Avatar src={imageUrlToUse} defaultSeed={address} size={24} />
        ) : (
          <Skeleton circle width={24} height={24} />
        )}
      </IconHolder>
      {isDesktop && (
        <AddressText>
          {ensName || address ? (
            shortenAddress(address)
          ) : (
            <Skeleton width={100} />
          )}
        </AddressText>
      )}
      {transactionsCounter && <Badge size="25">{transactionsCounter}</Badge>}
    </StyledAddressButton>
  );
};

export default AddressButton;
