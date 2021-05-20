import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { shortenAddress } from 'utils/address';
import WalletModal from 'components/WalletModal';
import { isChainIdSupported } from 'provider/connectors';
import { useStores } from '../../contexts/storesContext';

const WrongNetworkButton = styled.button`
    width: 142px;
    font-size: 0.9rem;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid var(--wrong-network-border);
    background-color: var(--wrong-network);
    color: var(--white);
    
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
    font-size:0.9rem;
    font-weight:500;
    box-sizing: border-box;
    border-radius: 6px;
    user-select: none;
    &:hover {
        cursor: pointer;
        border: 1px solid var(--wrong-network-border-hover);
        background-color: var(--wrong-network-hover);
    }
    :focus {
        outline: none;
    }
`;

const AccountButton = styled.div`
    background: #FFFFFF;
    border: 1px solid #E1E3E7;
    box-sizing: border-box;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
    border-radius: 6px;

    display: flex;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;

    font-family: var(--roboto);
    color: var(--dark-text-gray);
    font-style: normal;
    font-weight: 500;
    font-size: 15px;
    line-height: 16px;
    letter-spacing: 0.2px;
    cursor: pointer;

    width: 150px;
    height: 40px;
`;

const Web3ConnectStatus = observer((props) => {

    const ConnectButton = styled.div`
        height: 38px;
        width: ${props.wide ? "unset" : "154px"}
        display: flex;
        justify-content: center;
        align-items: center;

        box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 18px;
        letter-spacing: 1px;

        cursor: pointer;
        user-select: none;
        
        padding: 0.5rem;
        border-image: initial;
        background: var(--blue-text);
        color: var(--white);
        border: 1px solid var(--active-button-border);
        box-sizing: border-box;
        border-radius: 6px;
        &:hover{
            cursor: pointer;
            background: var(--blue-onHover);
            border: 1px solid var(--blue-onHover-border);
        }

    `;
    
    const {
        root: { modalStore, transactionStore, providerStore },
    } = useStores();
    const {
        chainId,
        account,
        error,
    } = providerStore.getActiveWeb3React();
    
    let pending = undefined;
    let confirmed = undefined;

    if (chainId && account && isChainIdSupported(chainId)) {
        pending = transactionStore.getPendingTransactions(account);
        confirmed = transactionStore.getConfirmedTransactions(account);
    }

    const toggleWalletModal = () => {
        modalStore.toggleWalletModal();
    };

    function getWeb3Status() {
        console.debug('[GetWeb3Status]', {
            account,
            chainId: chainId,
            error,
        });
        // Wrong network
        if (account && chainId && !isChainIdSupported(chainId)) {
            return (
                <WrongNetworkButton onClick={toggleWalletModal}>
                    Wrong Network
                </WrongNetworkButton>
            );
        } else if (account) {
            return (
                <AccountButton onClick={toggleWalletModal}>
                  {shortenAddress(account)}
                </AccountButton>
            );
        } else if (error) {
            return (
                <WrongNetworkButton onClick={toggleWalletModal}>
                    Wrong Network
                </WrongNetworkButton>
            );
        } else {
            return (
                <ConnectButton
                    onClick={toggleWalletModal}
                    active={true}
                    >
                    {props.text}
                </ConnectButton>
                
            );
        }
    }

    return (
        <>
            {getWeb3Status()}
            <WalletModal
                pendingTransactions={pending}
                confirmedTransactions={confirmed}
            />
        </>
    );
});

export default Web3ConnectStatus;
