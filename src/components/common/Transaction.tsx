import styled from 'styled-components';
import { useContext } from '../../contexts';
import { toAddressStub } from 'utils';

const AddressLink = styled.a`
  padding: 2px 5px;
  font-family: var(--roboto);
  line-height: 17px;
  letter-spacing: 0.2px;
  text-decoration: none;
  color: inherit;
`;

const UserAddress = ({ address, size = 'default', type = 'default' }) => {
  const {
    context: { configStore },
  } = useContext();

  const networkName = configStore.getActiveChainName();

  function href() {
    switch (type) {
      case 'user':
        return `${window.location.pathname}#/user/${address}`;
      default:
        if (networkName === 'arbitrum')
          return `https://explorer5.arbitrum.io/#/address/${address}`;
        else return `https://${networkName}.etherscan.io/address/${address}`;
    }
  }

  return (
    <AddressLink href={href()}>{toAddressStub(address, size)}</AddressLink>
  );
};

export default UserAddress;
