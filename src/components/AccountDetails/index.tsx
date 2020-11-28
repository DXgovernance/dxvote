import React from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import Copy from './Copy';
import { injected, SUPPORTED_WALLETS } from 'provider/connectors';
//@ts-ignore
import { ReactComponent as Close } from '../../assets/images/x.svg';
import { getEtherscanLink } from 'utils/etherscan';
import { web3Window as window } from 'provider/Web3Window';

import { Link } from '../../theme';
import { useStores } from '../../contexts/storesContext';

const OptionButton = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    border: 1px solid var(--active-button-border);
    background-color: var(--blue-text);
    color: #FFFFFF;
    padding: 8px 24px;

    &:hover {
        cursor: pointer;
        border: 1px solid var(--blue-onHover-border);
        background-color: var(--blue-onHover);
    }

    ${({ theme }) => theme.mediaWidth.upToMedium`
      font-size: 12px;
    `};
`;

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1.5rem 1.5rem;
    font-weight: 500;
    color: var(--header-text);
    ${({ theme }) => theme.mediaWidth.upToMedium`
      padding: 1rem;
    `};
`;

const UpperSection = styled.div`
    position: relative;
    background-color: var(--panel-background);

    h5 {
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 400;
    }

    h5:last-child {
        margin-bottom: 0px;
    }

    h4 {
        margin-top: 0;
        font-weight: 500;
    }
`;

const InfoCard = styled.div`
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.placeholderGray};
    border-radius: 20px;
`;

const AccountGroupingRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    color: ${({ theme }) => theme.textColor};

    div {
        ${({ theme }) => theme.flexRowNoWrap}
        align-items: center;
    }

    &:first-of-type {
        margin-bottom: 20px;
    }
`;

const AccountSection = styled.div`
    background-color: var(--panel-background);
    padding: 0rem 1.5rem;
    ${({ theme }) =>
        theme.mediaWidth.upToMedium`padding: 0rem 1rem 1rem 1rem;`};
`;

const YourAccount = styled.div`
    h5 {
        margin: 0 0 1rem 0;
        font-weight: 400;
    }

    h4 {
        margin: 0;
        font-weight: 500;
    }
`;

const GreenCircle = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    justify-content: center;
    align-items: center;

    &:first-child {
        height: 8px;
        width: 8px;
        margin-left: 12px;
        margin-right: 2px;
        background-color: ${({ theme }) => theme.connectedGreen};
        border-radius: 50%;
    }
`;

const CircleWrapper = styled.div`
    color: ${({ theme }) => theme.connectedGreen};
    display: flex;
    justify-content: center;
    align-items: center;
`;

const AccountControl = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    align-items: center;
    min-width: 0;

    font-weight: ${({ hasENS, isENS }) => (hasENS ? (isENS ? 500 : 400) : 500)};
    font-size: ${({ hasENS, isENS }) =>
        hasENS ? (isENS ? '1rem' : '0.8rem') : '1rem'};

    a:hover {
        text-decoration: underline;
    }

    a {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

const ConnectButtonRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    justify-content: center;
    margin: 30px;
`;

const StyledLink = styled(Link)`
    color: var(--turquois-text);
`;

const CloseIcon = styled.div`
    position: absolute;
    right: 1rem;
    top: 14px;
    color: var(--header-text);
    &:hover {
        cursor: pointer;
        opacity: 0.6;
    }
`;

const CloseColor = styled(Close)`
    path {
        stroke: ${({ theme }) => theme.chaliceGray};
    }
`;

const WalletName = styled.div`
    padding-left: 0.5rem;
    width: initial;
`;

const IconWrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    & > img,
    span {
        height: ${({ size }) => (size ? size + 'px' : '32px')};
        width: ${({ size }) => (size ? size + 'px' : '32px')};
    }
    ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
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
    toggleWalletModal: any;
    ENSName: any;
    openOptions: any;
}

export default function AccountDetails(props: Props) {
    const {
        toggleWalletModal,
        ENSName,
        openOptions,
    } = props;
    const {
        root: { providerStore },
    } = useStores();
    const { chainId, account, connector } = providerStore.getActiveWeb3React();

    function formatConnectorName() {
        const isMetaMask =
            window.ethereum && window.ethereum.isMetaMask ? true : false;
        const name = Object.keys(SUPPORTED_WALLETS)
            .filter(
                (k) =>
                    SUPPORTED_WALLETS[k].connector === connector &&
                    (connector !== injected ||
                        isMetaMask === (k === 'METAMASK'))
            )
            .map((k) => SUPPORTED_WALLETS[k].name)[0];
        return <WalletName>{name}</WalletName>;
    }

    function getStatusIcon() {
        if (connector === injected) {
            return (
                <IconWrapper size={16}>
                    {formatConnectorName()}
                </IconWrapper>
            );
        } else {
          return <div />;
        }
    }

    return (
        <>
            <UpperSection>
                <CloseIcon onClick={toggleWalletModal}>
                    <CloseColor alt={'close icon'} />
                </CloseIcon>
                <HeaderRow>Account</HeaderRow>
                <AccountSection>
                    <YourAccount>
                        <InfoCard>
                            <AccountGroupingRow>
                                {getStatusIcon()}
                                <div>
                                    {connector !== injected && (
                                        <WalletAction
                                            onClick={() => {
                                                //@ts-ignore
                                                connector.close();
                                            }}
                                        >
                                            Disconnect
                                        </WalletAction>
                                    )}
                                    <CircleWrapper>
                                        <GreenCircle>
                                            <div />
                                        </GreenCircle>
                                    </CircleWrapper>
                                </div>
                            </AccountGroupingRow>
                            <AccountGroupingRow>
                                {ENSName ? (
                                    <AccountControl
                                        hasENS={!!ENSName}
                                        isENS={true}
                                    >
                                        <StyledLink
                                            hasENS={!!ENSName}
                                            isENS={true}
                                            href={getEtherscanLink(
                                                chainId,
                                                ENSName,
                                                'address'
                                            )}
                                        >
                                            {ENSName} ↗{' '}
                                        </StyledLink>
                                        <Copy toCopy={ENSName} />
                                    </AccountControl>
                                ) : (
                                    <AccountControl
                                        hasENS={!!ENSName}
                                        isENS={false}
                                    >
                                        <StyledLink
                                            hasENS={!!ENSName}
                                            isENS={false}
                                            href={getEtherscanLink(
                                                chainId,
                                                account,
                                                'address'
                                            )}
                                        >
                                            {account} ↗{' '}
                                        </StyledLink>
                                        <Copy toCopy={account} />
                                    </AccountControl>
                                )}
                            </AccountGroupingRow>
                        </InfoCard>
                    </YourAccount>

                    {!(isMobile && (window.web3 || window.ethereum)) && (
                        <ConnectButtonRow>
                            <OptionButton
                                onClick={() => {
                                    openOptions();
                                }}
                            >
                                Connect to a different wallet
                            </OptionButton>
                        </ConnectButtonRow>
                    )}
                </AccountSection>
            </UpperSection>
        </>
    );
}
