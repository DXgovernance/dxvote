import { createContext, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useRouteMatch } from 'react-router-dom';
import { getNetworkById } from 'utils';
import Result, { ResultState } from 'components/Guilds/common/Result';
import { ButtonIcon, IconButton } from 'components/Guilds/common/Button';
import { iconsByChain } from 'components/Guilds/Header/NetworkButton';
import { Box } from 'components/Guilds/common/Layout';
import { MultichainContext } from 'contexts/MultichainProvider';
import useNetworkSwitching from 'hooks/Guilds/web3/useNetworkSwitching';

interface ContractAvailability {
  [chainId: number]: boolean;
}

interface GuildAvailabilityContextInterface {
  availability?: ContractAvailability;
  isLoading?: boolean;
}

const GreyText = styled(Box)`
  margin-top: 2rem;
  margin-bottom: 0.3rem;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const NetworkIconButton = styled(IconButton)`
  margin-bottom: 0.5rem;
`;

export const GuildAvailabilityContext =
  createContext<GuildAvailabilityContextInterface>({});

const GuildAvailabilityProvider = ({ children }) => {
  const routeMatch = useRouteMatch<{ guild_id?: string }>(
    '/:chain_name/:guild_id'
  );
  const guildId = routeMatch?.params?.guild_id;
  const { providers: multichainProviders } = useContext(MultichainContext);
  const [availability, setAvailability] = useState<ContractAvailability>({});
  const { chainId: currentChainId } = useWeb3React();
  const { trySwitching } = useNetworkSwitching();

  useEffect(() => {
    if (!guildId || !multichainProviders) {
      setAvailability({});
      return;
    }

    async function getAvailability() {
      let providers = Object.entries(multichainProviders);

      providers.forEach(async ([chainId, provider]) => {
        provider
          .getCode(guildId)
          .then(code => code !== '0x')
          .then(result => {
            setAvailability(prev => ({
              ...prev,
              [chainId]: result,
            }));
          })
          .catch(() => {
            setAvailability(prev => ({
              ...prev,
              [chainId]: false,
            }));
          });
      });
    }

    getAvailability();
  }, [guildId, multichainProviders]);

  if (
    Object.keys(availability).includes(String(currentChainId)) &&
    !availability?.[currentChainId]
  ) {
    return (
      <Result
        state={ResultState.ERROR}
        title="Guild not available."
        subtitle="This guild is not available on this network."
        extra={
          <>
            <GreyText>Access it on</GreyText>
            <div>
              {Object.keys(availability).map(chainId => {
                if (!availability[chainId]) return null;
                const chainConfig = getNetworkById(Number(chainId));
                return (
                  <div key={chainConfig?.id}>
                    <NetworkIconButton
                      iconLeft
                      onClick={() => trySwitching(chainConfig)}
                    >
                      <ButtonIcon
                        src={iconsByChain[chainConfig?.id]}
                        alt={chainConfig?.name}
                      />{' '}
                      {chainConfig?.displayName}
                    </NetworkIconButton>
                  </div>
                );
              })}
            </div>
          </>
        }
      />
    );
  }

  return (
    <GuildAvailabilityContext.Provider
      value={{
        availability,
        isLoading: !Object.keys(availability).includes(String(currentChainId)),
      }}
    >
      {children}
    </GuildAvailabilityContext.Provider>
  );
};

export default GuildAvailabilityProvider;
