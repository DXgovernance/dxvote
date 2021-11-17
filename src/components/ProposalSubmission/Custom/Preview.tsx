import { normalizeBalance } from 'utils';
import MDEditor from '@uiw/react-md-editor';
import { Question } from '../../common';
import { useContext } from '../../../contexts';
import { ZERO_ADDRESS, NETWORK_ASSET_SYMBOL } from 'utils';

export const Preview = ({ descriptionText, schemeToUse }) => {
  const {
    context: { daoStore, configStore },
  } = useContext();
  const networkTokens = configStore.getTokensOfNetwork();
  const networkContracts = configStore.getNetworkContracts();
  const { assetLimits: transferLimits } = daoStore.getSchemeRecommendedCalls(
    schemeToUse.address
  );
  const networkAssetSymbol =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];
  return (
    <>
      <MDEditor.Markdown
        source={descriptionText}
        style={{
          backgroundColor: 'white',
          borderRadius: '5px',
          border: '1px solid gray',
          padding: '20px 10px',
        }}
      />
      {schemeToUse.type === 'ContributionReward' ||
      schemeToUse.type === 'GenericMulticall' ||
      schemeToUse.type === 'SchemeRegistrar' ||
      (schemeToUse.type === 'WalletScheme' &&
        schemeToUse.controllerAddress === networkContracts.controller) ? (
        <h2>
          Calls executed from the avatar <Question question="9" />
        </h2>
      ) : (
        <h2>
          Calls executed from the scheme <Question question="9" />
        </h2>
      )}
      {Object.keys(transferLimits).map(assetAddress => {
        if (assetAddress === ZERO_ADDRESS)
          return (
            <h3>
              Transfer limit of{' '}
              {normalizeBalance(transferLimits[assetAddress]).toString()}{' '}
              {networkAssetSymbol}
            </h3>
          );
        else {
          const token = networkTokens.find(
            networkToken => networkToken.address === assetAddress
          );
          if (token)
            return (
              <h3>
                Transfer limit of{' '}
                {normalizeBalance(
                  transferLimits[assetAddress],
                  token.decimals
                ).toString()}{' '}
                {token.symbol}
              </h3>
            );
          else
            return (
              <h3>
                Transfer limit {transferLimits[assetAddress].toString()} of
                asset {assetAddress}
              </h3>
            );
        }
      })}
    </>
  );
};
