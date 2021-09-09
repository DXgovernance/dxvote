import styled from 'styled-components';
import { useContext } from '../../contexts';

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

    function toAddressStub(address) {
        const start = address.slice(0, 6);
        const end = address.slice(-4);

        switch (size) {
          case "short":
            return `${start}..`;
          case "long":
            return address;
          default:
            return `${start}...${end}`;
        }
    }
    
    function href() {
        switch (type) {
          case "user":
            return `${window.location.pathname}#/user/${address}`;
          default:
            if (networkName === 'arbitrum')
              return `https://explorer5.arbitrum.io/#/address/${address}`
            else
              return `https://${networkName}.etherscan.io/address/${address}`
        }
    }

    return (
        <AddressLink href={href()}>
          {toAddressStub(address)}
        </AddressLink>
    );
};

export default UserAddress;
