import { GuildCardProps } from './types';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import useGuildMemberTotal from 'hooks/Guilds/ether-swr/guild/useGuildMemberTotal';
import { Loading } from 'Components/Primitives/Loading';
import {
  Header,
  MemberWrapper,
  ProposalsInformation,
} from './GuildCardHeader.styled';
import { useTranslation } from 'react-i18next';
import useActiveProposalsNow from 'hooks/Guilds/ether-swr/guild/useGuildActiveProposals';

const Members: React.FC<GuildCardProps> = ({ guildAddress }) => {
  const { data: numberOfMembers } = useGuildMemberTotal(guildAddress);
  return <div>{numberOfMembers?.toString()}</div>;
};

const Proposals: React.FC<GuildCardProps> = ({ guildAddress }) => {
  const { t } = useTranslation();
  const { data: numberOfActiveProposals } = useActiveProposalsNow(guildAddress);
  return (
    <ProposalsInformation proposals={'active'}>
      {t('proposals', {
        count: parseInt(numberOfActiveProposals),
      })}
    </ProposalsInformation>
  );
};

const GuildCardHeader: React.FC<GuildCardProps> = ({ guildAddress }) => {
  return (
    <Header>
      <MemberWrapper>
        <MdOutlinePeopleAlt size={24} />
        {guildAddress ? (
          <Members guildAddress={guildAddress} />
        ) : (
          <Loading skeletonProps={{ width: 20 }} text loading />
        )}
      </MemberWrapper>
      {guildAddress ? (
        <Proposals guildAddress={guildAddress} />
      ) : (
        <Loading
          style={{ height: 43, alignItems: 'center', display: 'flex' }}
          skeletonProps={{ width: 100, height: 22 }}
          text
          loading
        />
      )}
    </Header>
  );
};

export default GuildCardHeader;
