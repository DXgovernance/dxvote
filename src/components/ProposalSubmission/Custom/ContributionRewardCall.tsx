import { useContext } from 'contexts';
import { NETWORK_ASSET_SYMBOL } from 'utils';
import styled from 'styled-components';

const CallRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: row;
  margin-bottom: 10px;

  span {
    text-align: center;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    padding: 10px 10px;
  }
`;

const TextInput = styled.input`
  width: ${props => props.width || '25%'};
  height: 34px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
`;

export const ContributionRewardCall = ({
  onContributionRewardValueChange,
  contributionRewardCalls,
}) => {
  const {
    context: { configStore },
  } = useContext();
  let networkAssetSymbol =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];

  return (
    <div>
      <CallRow>
        <span style={{ width: '20%', fontSize: '13px' }}>
          Beneficiary Account
        </span>
        <span style={{ width: '20%', fontSize: '13px' }}>REP Change</span>
        <span style={{ width: '20%', fontSize: '13px' }}>
          {networkAssetSymbol} Value
        </span>
        <span style={{ width: '20%', fontSize: '13px' }}>Address of Token</span>
        <span style={{ width: '20%', fontSize: '13px' }}>
          Token Amount (in WEI)
        </span>
      </CallRow>
      <CallRow>
        <TextInput
          type="text"
          onChange={event =>
            onContributionRewardValueChange('beneficiary', event.target.value)
          }
          value={contributionRewardCalls.beneficiary}
          width="50%"
        />
        <TextInput
          type="text"
          onChange={event =>
            onContributionRewardValueChange('repChange', event.target.value)
          }
          value={contributionRewardCalls.repChange}
          width="50%"
        />
        <TextInput
          type="text"
          onChange={event =>
            onContributionRewardValueChange('ethValue', event.target.value)
          }
          value={contributionRewardCalls.ethValue}
          width="50%"
        />
        <TextInput
          type="text"
          onChange={event =>
            onContributionRewardValueChange('externalToken', event.target.value)
          }
          value={contributionRewardCalls.externalToken}
          width="50%"
        />
        <TextInput
          type="text"
          onChange={event =>
            onContributionRewardValueChange('tokenValue', event.target.value)
          }
          value={contributionRewardCalls.tokenValue}
          width="50%"
        />
      </CallRow>
    </div>
  );
};
