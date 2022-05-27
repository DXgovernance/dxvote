import { MdOutlinePeopleAlt } from 'react-icons/md';
import { Loading } from 'Components/Primitives/Loading';
import {
  Header,
  MemberWrapper,
  MemberNumberWrapper,
  ProposalsInformation,
} from './styles';

const Members = ({ numberOfMembers }) => {
  return (
    <MemberNumberWrapper>{numberOfMembers?.toString()}</MemberNumberWrapper>
  );
};

const Proposals = ({ t, numberOfActiveProposals }) => {
  return (
    <ProposalsInformation proposals={numberOfActiveProposals >= 1 && 'active'}>
      {t('proposals', {
        count: parseInt(numberOfActiveProposals),
      })}
    </ProposalsInformation>
  );
};

interface GuildCardHeaderProps {
  isLoading?: boolean;
  t: any;
  numberOfActiveProposals: any;
  numberOfMembers: any;
}

const GuildCardHeader: React.FC<GuildCardHeaderProps> = ({
  isLoading,
  t,
  numberOfActiveProposals,
  numberOfMembers,
}) => {
  return (
    <Header>
      <MemberWrapper>
        <MdOutlinePeopleAlt size={24} />
        {isLoading ? (
          <Loading skeletonProps={{ width: 20 }} text loading />
        ) : (
          <Members numberOfMembers={numberOfMembers} />
        )}
      </MemberWrapper>
      {isLoading ? (
        <Loading
          style={{ height: 43, alignItems: 'center', display: 'flex' }}
          skeletonProps={{ width: 100, height: 22 }}
          text
          loading
        />
      ) : (
        <Proposals t={t} numberOfActiveProposals={numberOfActiveProposals} />
      )}
    </Header>
  );
};

export default GuildCardHeader;
