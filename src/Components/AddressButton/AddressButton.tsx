import { isDesktop } from 'react-device-detect';
import React from 'react';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from 'Components/Primitives/Avatar';
import { shortenAddress } from 'utils';
import { Badge } from 'old-components/Guilds/common/Badge';
import { Loading } from 'Components/Primitives/Loading';
import { AddressButtonProps } from 'Components/AddressButton/types';
import {
  IconHolder,
  StyledAddressButton,
  AddressText,
} from 'Components/AddressButton/AddressButton.styled';

const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  transactionsCounter,
  onClick,
}) => {
  const { ensName, imageUrl } = useENSAvatar(address, 1);

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
        <Badge size={25}>{transactionsCounter}</Badge>
      ) : null}
    </StyledAddressButton>
  );
};

export default AddressButton;
