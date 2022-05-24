import { MdOutlinePeopleAlt } from 'react-icons/md';
import { Loading } from 'Components/Primitives/Loading';
import {
  Header,
  MemberWrapper,
  ProposalsInformation,
} from './GuildCardHeader.styled';

const Proposals = ({ t, numberOfActiveProposals }) => {
  return (
    <ProposalsInformation proposals={'active'}>
      {t('proposals', {
        count: parseInt(numberOfActiveProposals),
      })}
    </ProposalsInformation>
  );
};

interface GuildCardHeaderProps {
  guildAddress: string;
  t: any;
  numberOfActiveProposals: any;
  numberOfMembers: any;
}

const GuildCardHeader: React.FC<GuildCardHeaderProps> = ({
  guildAddress,
  t,
  numberOfActiveProposals,
  numberOfMembers,
}) => {
  console.log(t);
  return (
    <Header>
      <MemberWrapper>
        <MdOutlinePeopleAlt size={24} />
        {guildAddress ? (
          <div>{numberOfMembers?.toString()}</div>
        ) : (
          <Loading skeletonProps={{ width: 20 }} text loading />
        )}
      </MemberWrapper>
      {guildAddress ? (
        <Proposals t={t} numberOfActiveProposals={numberOfActiveProposals} />
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
