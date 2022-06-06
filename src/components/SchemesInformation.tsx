import styled from 'styled-components';
import { observer } from 'mobx-react';
import { bnum, encodePermission, isWalletScheme, ZERO_ADDRESS } from '../utils';
import moment from 'moment';
import { useContext } from '../contexts';
import {
  BlockchainLink,
  Question,
  Table,
  TableRow,
  DataCell,
  TableBody,
  TableHeader,
  HeaderCell,
} from '../components/common';

const ProposalTable = styled(Table)`
  grid-template-columns: minmax(auto, 15%) minmax(auto, 45%) minmax(auto, 20%) minmax(
      auto,
      25%
    );
`;

const SchemesInformation = observer(() => {
  const {
    context: { providerStore, daoStore },
  } = useContext();
  const { library } = providerStore.getActiveWeb3React();

  const schemes = daoStore.getAllSchemes();
  return (
    <ProposalTable>
      <TableHeader>
        <HeaderCell>Name</HeaderCell>
        <HeaderCell>
          Configuration <Question question="9" />
        </HeaderCell>
        <HeaderCell>
          Permissions <Question question="9" />
        </HeaderCell>
        <HeaderCell>
          <span>Boosted</span> - <span>Active</span> - <span>Total</span>
        </HeaderCell>
      </TableHeader>
      <TableBody>
        {schemes.map(scheme => {
          const schemeProposals = daoStore.filterProposals({
            scheme: scheme.address,
          });
          const votingMachineParameters = daoStore.getVotingMachineOfScheme(
            scheme.address
          ).params;
          if (votingMachineParameters)
            return (
              <TableRow>
                <DataCell>
                  {scheme.name}
                  <br />
                  <small>{scheme.type}</small>
                  <br />
                  <BlockchainLink size="short" text={scheme.address} toCopy />
                </DataCell>
                <DataCell>
                  <small>Params Hash: {scheme.paramsHash}</small>
                  <br />
                  <small>
                    Do Avatar Generic Calls:{' '}
                    {scheme.controllerAddress !== ZERO_ADDRESS ? 'YES' : 'NO'}
                  </small>
                  <br />
                  <small>
                    Queued Proposal Period:{' '}
                    {moment
                      .duration(
                        votingMachineParameters.queuedVotePeriodLimit.toString(),
                        'seconds'
                      )
                      .humanize()}
                  </small>
                  <br />
                  <small>
                    Boosted Proposal Period:{' '}
                    {moment
                      .duration(
                        votingMachineParameters.boostedVotePeriodLimit.toString(),
                        'seconds'
                      )
                      .humanize()}
                  </small>
                  <br />
                  <small>
                    PreBoosted Proposal Period:{' '}
                    {moment
                      .duration(
                        votingMachineParameters.preBoostedVotePeriodLimit.toString(),
                        'seconds'
                      )
                      .humanize()}
                  </small>
                  <br />
                  <small>
                    Quiet Ending Period:{' '}
                    {moment
                      .duration(
                        votingMachineParameters.quietEndingPeriod.toString(),
                        'seconds'
                      )
                      .humanize()}
                  </small>
                  <br />
                  {isWalletScheme(scheme) ? (
                    <small>
                      Max time for execution:{' '}
                      {moment
                        .duration(
                          scheme.maxSecondsForExecution.toString(),
                          'seconds'
                        )
                        .humanize()}
                      <br />
                    </small>
                  ) : (
                    <div />
                  )}
                  {isWalletScheme(scheme) ? (
                    <small>
                      Max REP % to change in proposal:{' '}
                      {scheme.maxRepPercentageChange.toString()} %<br />
                    </small>
                  ) : (
                    <div />
                  )}
                  {isWalletScheme(scheme) ? (
                    <small>
                      Required Percentage for boosted approval:{' '}
                      {bnum(scheme.boostedVoteRequiredPercentage)
                        .div('100')
                        .toString()}{' '}
                      %<br />
                    </small>
                  ) : (
                    <div />
                  )}
                  <small>
                    Rep Proposing Reward:{' '}
                    {Number(
                      library.utils.fromWei(
                        votingMachineParameters.proposingRepReward.toString()
                      )
                    ).toFixed(2)}{' '}
                    REP
                  </small>
                  <br />
                  <small>
                    Reputation Loss Ratio:{' '}
                    {votingMachineParameters.votersReputationLossRatio.toString()}{' '}
                    %
                  </small>
                  <br />
                  <small>
                    Minimum Dao Boost:{' '}
                    {Number(
                      library.utils.fromWei(
                        votingMachineParameters.minimumDaoBounty.toString()
                      )
                    ).toFixed(2)}{' '}
                    DXD
                  </small>
                  <br />
                  <small>
                    Proposal Boost Bounty Const:{' '}
                    {votingMachineParameters.daoBountyConst.toString()}
                  </small>
                  <br />
                  <small>
                    Boost Threshold Constant:{' '}
                    {votingMachineParameters.thresholdConst
                      .div(10 ** 12)
                      .toString()}
                  </small>
                  <br />
                  <small>
                    Boost Limit Exponent Value:{' '}
                    {votingMachineParameters.limitExponentValue.toString()}
                  </small>
                </DataCell>
                <DataCell>
                  <strong>Controller Permissions</strong>
                  <br />
                  <small>Raw: {encodePermission(scheme.permissions)}</small>
                  <br />
                  <small>
                    {scheme.permissions.canGenericCall ? 'Can' : 'Cant'} make
                    generic call
                  </small>
                  <br />
                  <small>
                    {scheme.permissions.canUpgrade ? 'Can' : 'Cant'} upgrade
                    controller
                  </small>
                  <br />
                  <small>
                    {scheme.permissions.canChangeConstraints ? 'Can' : 'Cant'}{' '}
                    change constraints
                  </small>
                  <br />
                  <small>
                    {scheme.permissions.canRegisterSchemes ? 'Can' : 'Cant'}{' '}
                    register schemes
                  </small>
                </DataCell>
                <DataCell>
                  <span>{scheme.boostedProposals}</span>-
                  <span>
                    {
                      schemeProposals.filter(proposal => {
                        return proposal.stateInVotingMachine > 2;
                      }).length
                    }
                  </span>
                  -
                  <span>
                    {scheme.proposalIds ? scheme.proposalIds.length : 0}
                  </span>
                </DataCell>
              </TableRow>
            );
          else return <></>;
        })}
      </TableBody>
    </ProposalTable>
  );
});

export default SchemesInformation;
