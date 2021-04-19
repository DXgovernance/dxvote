import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Jazzicon from 'jazzicon';
import { useStores } from '../../contexts/storesContext';

const AddressLink = styled.a`
    padding: 2px 5px;
    font-family: var(--roboto);
    font-size: 13px;
    line-height: 17px;
    letter-spacing: 0.2px;
    color: var(--dark-text-gray);
    text-decoration: none;
    color: inherit;
`;

const UserAddress = ({ address, size, type }) => {
  
    const {
        root: { configStore },
    } = useStores();
    
    const networkName = configStore.getActiveChainName();

    function toAddressStub(address) {
        const start = address.slice(0, 6);
        const end = address.slice(-4);

        switch (size) {
          case "short":
            return `${start}..`;
          break;
          case "long":
            return address;
          break;
          default:
            return `${start}...${end}`;
        }
    }
    
    function href() {
        const start = address.slice(0, 6);
        const end = address.slice(-4);

        switch (type) {
          case "user":
            return `${window.location.pathname}#/user/${address}`;
          break;
          default:
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
