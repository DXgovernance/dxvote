import { DaoIcon, Content, DaoTitle } from './styles';
import dxDaoIcon from 'assets/images/dxdao-icon.svg';
import { Loading } from 'Components/Primitives/Loading';
import { GuildCardContentProps } from './types';

const GuildCardContent: React.FC<GuildCardContentProps> = ({
  isLoading,
  ensName,
  data,
}) => {
  return (
    <Content>
      <DaoIcon src={dxDaoIcon} />
      {isLoading ? (
        <Loading
          skeletonProps={{ width: 100, height: 20 }}
          style={{ marginTop: 20 }}
          text
          loading
        />
      ) : (
        <DaoTitle size={2}>{ensName ?? data?.name}</DaoTitle>
      )}
    </Content>
  );
};

export default GuildCardContent;
