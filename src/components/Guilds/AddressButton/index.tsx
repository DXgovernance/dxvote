import { isDesktop } from 'react-device-detect';
import styled from 'styled-components';
import React from 'react';
import { IconButton } from '../common/Button';
import useENSAvatar from '../../../hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from '../Avatar';
import { shortenAddress } from '../../../utils';
import { Badge } from '../common/Badge';
import { DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';
import { Loading } from '../common/Loading';

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
  transactionsCounter?: number;
  onClick?: () => void;
}

const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  transactionsCounter,
  onClick,
}) => {
  const { ensName, imageUrl } = useENSAvatar(address, DEFAULT_ETH_CHAIN_ID);

  return (
    <StyledAddressButton variant="secondary" onClick={onClick} iconLeft>
      <IconHolder>
        {address ? (
          <Avatar src={imageUrl} defaultSeed={address} size={24} />
        ) : (
          <Loading
            loading
            text
            skeletonProps={{ circle: true, width: '24px', height: '24px' }}
          />
        )}
      </IconHolder>
      {isDesktop && (
        <AddressText>
          {ensName || address ? (
            shortenAddress(address)
          ) : (
            <Loading loading text />
          )}
        </AddressText>
      )}
      {transactionsCounter ? (
        <Badge size="25">{transactionsCounter}</Badge>
      ) : null}
    </StyledAddressButton>
  );
};

export default AddressButton;
