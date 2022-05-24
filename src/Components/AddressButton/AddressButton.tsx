import { isDesktop } from 'react-device-detect';
import React from 'react';
import { shortenAddress } from 'utils';
import { Badge } from 'old-components/Guilds/common/Badge';
import { Loading } from 'Components/Primitives/Loading';
import { AddressButtonProps } from 'Components/AddressButton/types';
import {
  IconHolder,
  StyledAddressButton,
  AddressText,
} from 'Components/AddressButton/AddressButton.styled';
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';
import useENS from 'hooks/Guilds/ether-swr/ens/useENS';

const AddressButton: React.FC<AddressButtonProps> = ({
  address,
  transactionsCounter,
  onClick,
}) => {
  const { name: ensName } = useENS(address, 1);

  return (
    <StyledAddressButton variant="secondary" onClick={onClick} iconLeft>
      <IconHolder>
        <ENSAvatar address={address} />
      </IconHolder>
      {isDesktop && (
        <AddressText>
          {address ? (
            ensName || shortenAddress(address)
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
