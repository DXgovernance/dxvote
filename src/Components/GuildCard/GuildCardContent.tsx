import styled from 'styled-components';
import { Box } from 'Components/Primitives/Layout/index';
import { DaoIcon } from './GuildCardContent.styled';
import dxDaoIcon from 'assets/images/dxdao-icon.svg';
// import { GuildCardProps } from './types';
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

interface GuildCardContentProps {
  guildAddress: string;
  ensName: string;
  data: any;
}

const GuildCardContent: React.FC<GuildCardContentProps> = ({
  guildAddress,
  ensName,
  data,
}) => {
  return (
    <Content>
      <DaoIcon src={dxDaoIcon} />
      {guildAddress ? (
        <DaoTitle size={2}>{ensName ?? data?.name}</DaoTitle>
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
