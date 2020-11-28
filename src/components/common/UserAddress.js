import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Jazzicon from 'jazzicon';

const AddressPill = styled.div`
    height: 40px;
    width: 166px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    background: #ffffff;
    border: 1px solid #e1e3e7;
    box-sizing: border-box;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
    border-radius: 6px;

    font-family: var(--roboto);
    font-size: 14px;
    line-height: 17px;
    letter-spacing: 0.2px;
    color: var(--dark-text-gray);
`;

const StyledIdenticon = styled.div`
    height: 20px;
    width: 20px;
    border-radius: 15px;
    background-color: #ffffff;
`;

const UserAddress = ({ address }) => {
    const ref = useRef();

    function toAddressStub(address) {
        const start = address.slice(0, 6);
        const end = address.slice(-4);

        return `${start}...${end}`;
    }

    useEffect(() => {
        if (address && ref.current) {
            ref.current.innerHTML = '';
            ref.current.appendChild(
                Jazzicon(20, parseInt(address.slice(2, 10), 16))
            );
        }
    });

    return (
        <AddressPill>
            <StyledIdenticon ref={ref} />
            {toAddressStub(address)}
        </AddressPill>
    );
};

export default UserAddress;
