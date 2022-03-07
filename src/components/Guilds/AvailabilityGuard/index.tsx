import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import useContractAvailability from 'hooks/Guilds/contracts/useContractAvailability';
import { useRouteMatch } from 'react-router-dom';
import Result, { ResultState } from '../common/Result';
import { ButtonIcon, IconButton } from '../common/Button';
import { Box } from '../common/Layout';
import { getNetworkById } from 'utils';
import UnstyledLink from '../common/UnstyledLink';
import { iconsByChain } from '../Header/NetworkButton';

const GreyText = styled(Box)`
  margin-top: 2rem;
  margin-bottom: 0.3rem;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};
`;

const NetworkIconButton = styled(IconButton)`
  margin-bottom: 0.5rem;
`;

const AvailabilityGuard: React.FC = ({ children }) => {
  const routeMatch = useRouteMatch<{ guild_id?: string }>(
    '/:chain_name/:guild_id'
  );
  const { chainId } = useWeb3React();

  const guildId = routeMatch?.params?.guild_id;
  const availability = useContractAvailability(guildId);

  if (
    Object.keys(availability).includes(String(chainId)) &&
    !availability?.[chainId]
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
                    <UnstyledLink
                      to={`/#/guilds/${chainConfig?.name}/${guildId}`}
                    >
                      <NetworkIconButton iconLeft>
                        <ButtonIcon
                          src={iconsByChain[chainConfig?.id]}
                          alt={chainConfig?.name}
                        />{' '}
                        {chainConfig?.displayName}
                      </NetworkIconButton>
                    </UnstyledLink>
                  </div>
                );
              })}
            </div>
          </>
        }
      />
    );
  }

  return <>{children}</>;
};

export default AvailabilityGuard;
