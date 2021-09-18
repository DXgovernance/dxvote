import styled from 'styled-components';
import Copy from '../common/Copy';
import { injected } from 'provider/connectors';
import { getBlockchainLink } from '../../utils';

import Link from '../../components/common/Link';
import { useContext } from '../../contexts';

const OptionButton = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid var(--active-button-border);
  background-color: var(--blue-text);
  color: #ffffff;
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
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1rem 1rem;`};
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

  font-weight: 500;
  font-size: 1rem;

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
  openOptions: any;
}

export default function AccountDetails(props: Props) {
  const { openOptions } = props;
  const {
    context: { providerStore, configStore },
  } = useContext();
  const { account, connector } = providerStore.getActiveWeb3React();

  const networkName = configStore.getActiveChainName();

  return (
    <UpperSection>
      <AccountSection>
        <YourAccount>
          <InfoCard>
            <AccountGroupingRow>
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
                  {' '}
                  <GreenCircle />{' '}
                </CircleWrapper>
              </div>
            </AccountGroupingRow>
            <AccountGroupingRow>
              <AccountControl>
                <StyledLink
                  href={getBlockchainLink(account, networkName, 'address')}
                >
                  {account} ↗
                </StyledLink>
                <Copy toCopy={account} />
              </AccountControl>
            </AccountGroupingRow>
          </InfoCard>
        </YourAccount>

        <ConnectButtonRow>
          <OptionButton
            onClick={() => {
              openOptions();
            }}
          >
            Connect to a different wallet
          </OptionButton>
        </ConnectButtonRow>
      </AccountSection>
    </UpperSection>
  );
}
