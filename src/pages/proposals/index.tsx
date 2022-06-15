import { useHistory, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useContext } from '../../contexts';
import {
  LinkButton,
  Positive,
  Negative,
  Separator,
  TableHeader,
  HeaderCell,
  TableBody,
  DataCell,
} from '../../components/common';
import PulsingIcon from '../../components/common/LoadingIcon';
import Footer from '../../components/Footer';
import {
  formatPercentage,
  normalizeBalance,
  timeToTimestamp,
  formatNumberValue,
  PendingAction,
  isVoteNo,
  VotingMachineProposalState,
} from '../../utils';
import {
  FiFeather,
  FiCheckCircle,
  FiCheckSquare,
  FiAlertTriangle,
} from 'react-icons/fi';
import {
  StatusSearch,
  SchemeSearch,
  TitleSearch,
} from '../../components/Proposals/Search';
import {
  ProposalsWrapper,
  SidebarWrapper,
  ProposalTableHeaderActions,
  NewProposalButton,
  LoadingBox,
  FooterWrap,
  TableProposal,
  UnstyledAnchor,
  StyledTableRow,
} from './styles';
import { useFilteredProposals } from '../../hooks/useFilteredProposals';
import ProposalsExporter from '../../components/Proposals/ProposalsExporter';
import { useRep } from 'hooks/useRep';
import { useEffect, useState } from 'react';

const ProposalsPage = observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();

  const { getRep } = useRep();

  const votingMachines = configStore.getNetworkContracts().votingMachines;
  const networkName = configStore.getActiveChainName();
  const { account } = providerStore.getActiveWeb3React();
  const userEvents = daoStore.getUserEvents(account);
  const [allProposals, setAllProposals] = useState(daoStore.getAllProposals);
  console.log('All proposals length', allProposals.length);
  useEffect(() => {
    setAllProposals(daoStore.getAllProposals);
  }, [daoStore.getAllProposals]);

  const {
    proposals,
    loading,
    titleFilter,
    setTitleFilter,
    stateFilter,
    setStateFilter,
    schemesFilter,
    setSchemesFilter,
  } = useFilteredProposals();

  const activeProposalsCount = allProposals.filter(
    proposal =>
      proposal.stateInVotingMachine > VotingMachineProposalState.Executed
  ).length;

  const history = useHistory();
  return (
    <ProposalsWrapper>
      <SidebarWrapper>
        <ProposalTableHeaderActions>
          <NewProposalButton>
            <LinkButton route={`/${networkName}/create/type`} width="200px">
              + New Proposal
            </LinkButton>
          </NewProposalButton>
          <TitleSearch value={titleFilter} onFilter={setTitleFilter} />
          <StatusSearch value={stateFilter} onFilter={setStateFilter} />
          <SchemeSearch value={schemesFilter} onFilter={setSchemesFilter} />
          <strong style={{ alignSelf: 'center' }}>
            {allProposals.length} Total Proposals
          </strong>
          <strong style={{ alignSelf: 'center' }}>
            {activeProposalsCount} Active Proposals
          </strong>
        </ProposalTableHeaderActions>
        <FooterWrap>
          <ProposalsExporter />
          <Footer />
        </FooterWrap>
      </SidebarWrapper>
      {loading && (
        <LoadingBox>
          <div className="loader">
            <PulsingIcon size={80} inactive={false} />
          </div>
        </LoadingBox>
      )}
      {!loading && (
        <TableProposal>
          <TableBody>
            <TableHeader>
              <HeaderCell>Title</HeaderCell>
              <HeaderCell>Scheme</HeaderCell>
              <HeaderCell>Status</HeaderCell>
              <HeaderCell>Stakes</HeaderCell>
              <HeaderCell>Votes</HeaderCell>
            </TableHeader>
            {proposals.map((proposal, i) => {
              const positiveStake = formatNumberValue(
                normalizeBalance(proposal.positiveStakes, 18),
                1
              );
              const negativeStake = formatNumberValue(
                normalizeBalance(proposal.negativeStakes, 18),
                1
              );

              const repAtCreation = getRep(
                proposal.creationEvent.blockNumber
              ).totalSupply;

              const positiveVotesPercentage = formatPercentage(
                proposal.positiveVotes.div(repAtCreation),
                2
              );
              const negativeVotesPercentage = formatPercentage(
                proposal.negativeVotes.div(repAtCreation),
                2
              );
              const timeToBoost = timeToTimestamp(proposal.boostTime);
              const timeToFinish = timeToTimestamp(proposal.finishTime);

              const votingMachineTokenName =
                votingMachines[
                  daoStore.getVotingMachineOfProposal(proposal.id).address
                ].type == 'DXDVotingMachine'
                  ? 'DXD'
                  : 'GEN';

              const voted =
                userEvents.votes.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;
              const staked =
                userEvents.stakes.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;
              const created =
                userEvents.newProposal.findIndex(
                  event => event.proposalId === proposal.id
                ) > -1;

              const proposerVotedDown =
                daoStore
                  .getVotesOfProposal(proposal.id)
                  .findIndex(
                    vote =>
                      vote.voter === proposal.proposer && isVoteNo(vote.vote)
                  ) > -1;

              return (
                <StyledTableRow
                  onClick={() =>
                    history.push(`/${networkName}/proposal/${proposal.id}`)
                  }
                  key={`row-${i}`}
                >
                  <DataCell
                    weight="800"
                    wrapText="true"
                    fontSize="inherit"
                    align="left"
                  >
                    <Link
                      to={`/${networkName}/proposal/${proposal.id}`}
                      component={UnstyledAnchor}
                    >
                      {created && (
                        <FiFeather
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                          title="You created"
                        />
                      )}
                      {voted && (
                        <FiCheckCircle
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                          title="You voted"
                        />
                      )}
                      {staked && (
                        <FiCheckSquare
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                          title="You staked"
                        />
                      )}

                      {proposerVotedDown && (
                        <FiAlertTriangle
                          style={{ minWidth: '15px', margin: '0px 2px' }}
                          title="The proposer downvoted this proposal. It may be incorrect."
                        />
                      )}

                      {proposal.title.length > 0 ? proposal.title : proposal.id}
                    </Link>
                  </DataCell>
                  <DataCell>
                    {daoStore.daoCache.schemes[proposal.scheme].name}
                  </DataCell>
                  <DataCell>
                    <span>
                      {proposal.status} <br />
                      {timeToBoost !== '' ? (
                        <small>
                          Boost {timeToBoost} <br />
                        </small>
                      ) : (
                        <span></span>
                      )}
                      {timeToFinish !== '' ? (
                        <small>Finish {timeToFinish} </small>
                      ) : (
                        <span></span>
                      )}
                      {proposal.pendingAction === PendingAction.Execute ||
                      proposal.pendingAction === PendingAction.Finish ? (
                        <small> Pending Finish Execution </small>
                      ) : (
                        <span></span>
                      )}
                    </span>
                  </DataCell>
                  <DataCell>
                    <Positive>
                      {positiveStake.toString()} {votingMachineTokenName}{' '}
                    </Positive>
                    <Separator>|</Separator>
                    <Negative>
                      {negativeStake.toString()} {votingMachineTokenName}
                    </Negative>
                  </DataCell>
                  <DataCell>
                    <Positive>{positiveVotesPercentage} </Positive>
                    <Separator>|</Separator>
                    <Negative>{negativeVotesPercentage}</Negative>
                  </DataCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </TableProposal>
      )}
    </ProposalsWrapper>
  );
});

export default ProposalsPage;
