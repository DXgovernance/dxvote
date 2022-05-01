import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { useRouteMatch } from 'react-router-dom';
import { getNetworkById } from 'utils';
import Result, { ResultState } from 'components/Guilds/common/Result';
import { ButtonIcon, IconButton } from 'components/Guilds/common/Button';
import { iconsByChain } from 'components/Guilds/Header/NetworkButton';
import { Box } from 'components/Guilds/common/Layout';
import { MultichainContext } from 'contexts/MultichainProvider';
import UnstyledLink from 'components/Guilds/common/UnstyledLink';
import useNetworkSwitching from 'hooks/Guilds/web3/useNetworkSwitching';
import { FiArrowLeft } from 'react-icons/fi';

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
  const routeMatch = useRouteMatch('/:chainName/:guildId');
  const guildId = routeMatch?.params?.guildId;
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

  const isLoading = useMemo(
    () => !Object.keys(availability).includes(String(currentChainId)),
    [availability, currentChainId]
  );

  if (!isLoading && !availability?.[currentChainId]) {
    return (
      <Result
        state={ResultState.ERROR}
        title="Guild not available."
        subtitle={
          Object.values(availability).includes(true)
            ? 'This guild is not available on this network.'
            : 'No guild exists on this address.'
        }
        extra={
          Object.values(availability).includes(true) ? (
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
          ) : (
            <UnstyledLink to={`/`}>
              <IconButton iconLeft>
                <FiArrowLeft /> Take me home
              </IconButton>
            </UnstyledLink>
          )
        }
      />
    );
  }

  return (
    <GuildAvailabilityContext.Provider
      value={{
        availability,
        isLoading,
      }}
    >
      {children}
    </GuildAvailabilityContext.Provider>
  );
};

export default GuildAvailabilityProvider;
