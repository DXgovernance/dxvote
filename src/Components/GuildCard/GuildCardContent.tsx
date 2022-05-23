import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout/index';
import { DaoIcon } from './GuildCardContent.styled';
import dxDaoIcon from '../../assets/images/dxdao-icon.svg';
import { GuildCardProps } from './types';
import useENSNameFromAddress from 'hooks/Guilds/ether-swr/ens/useENSNameFromAddress';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
import { Heading } from 'old-components/Guilds/common/Typography';
import { Loading } from 'Components/Primitives/Loading';

const Content = styled(Box)`
  margin-top: 2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const DaoTitle = styled(Heading)`
  margin-left: 4px;
  line-height: 24px;
`;

const Title: React.FC<GuildCardProps> = ({ guildAddress }) => {
  const ensName = useENSNameFromAddress(guildAddress)?.split('.')[0];
  const { data } = useGuildConfig(guildAddress);
  return <DaoTitle size={2}>{ensName ?? data?.name}</DaoTitle>;
};

const GuildCardContent: React.FC<GuildCardProps> = ({ guildAddress }) => {
  return (
    <Content>
      <DaoIcon src={dxDaoIcon} />
      {guildAddress ? (
        <Title guildAddress={guildAddress} />
      ) : (
        <Loading
          skeletonProps={{ width: 100, height: 20 }}
          style={{ marginTop: 20 }}
          text
          loading
        />
      )}
    </Content>
  );
};

export default GuildCardContent;
