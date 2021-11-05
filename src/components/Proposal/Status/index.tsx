import moment from 'moment';
import Countdown from 'react-countdown';
import { FiPlayCircle, FiFastForward } from 'react-icons/fi';
import { useContext } from 'contexts';

import { useLocation } from 'react-router-dom';

import { bnum } from 'utils';
import { Question } from 'components/common';

import { SidebarRow, ActionButton } from '../styles';

const Status = () => {
  const {
    context: { daoStore, configStore, providerStore, daoService },
  } = useContext();

  //State
  const networkContracts = configStore.getNetworkContracts();
  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];
  console.log('Proposal ID in Vote: ', proposalId);
  const proposal = daoStore.getProposal(proposalId);
  const { account } = providerStore.getActiveWeb3React();
  const scheme = daoStore.getScheme(proposal.scheme);

  const executionTimeoutTime =
    scheme.type === 'WalletScheme'
      ? proposal.submittedTime.plus(scheme.maxSecondsForExecution)
      : bnum(0);

  const executeProposal = function () {
    daoService.execute(proposalId);
  };

  const redeemBeneficiary = function () {
    daoService.redeemContributionReward(
      networkContracts.daostack.contributionRewardRedeemer,
      scheme.address,
      scheme.votingMachine,
      proposalId,
      proposal.to[0]
    );
  };

  const executeMulticall = function () {
    daoService.executeMulticall(scheme.address, proposalId);
  };
  const votingMachineUsed = daoStore.getVotingMachineOfProposal(proposalId);

  const { status, boostTime, finishTime, pendingAction } =
    daoStore.getProposalStatus(proposalId);

  const autoBoost =
    networkContracts.votingMachines.dxd &&
    networkContracts.votingMachines.dxd.address === votingMachineUsed;

  return (
    <>
      <h2 style={{ margin: '10px 0px 0px 0px', textAlign: 'center' }}>
        {status} <Question question="3" />
      </h2>
      <SidebarRow style={{ margin: '0px 10px', flexDirection: 'column' }}>
        {boostTime.toNumber() > moment().unix() && (
          <span className="timeText">
            Boost in <Countdown date={boostTime.toNumber() * 1000} />{' '}
          </span>
        )}
        {finishTime.toNumber() > moment().unix() && (
          <span className="timeText">
            Finish in{' '}
            <Countdown
              autoStart={pendingAction === 1 && !autoBoost ? false : true}
              date={finishTime.toNumber() * 1000}
            />
            {pendingAction === 1 && !autoBoost && ' after boost'}
          </span>
        )}
        {status === 'Pending Execution' && executionTimeoutTime.toNumber() > 0 && (
          <span className="timeText">
            {' '}
            Execution timeout in{' '}
            <Countdown date={executionTimeoutTime.toNumber() * 1000} />{' '}
          </span>
        )}
      </SidebarRow>
      {account && (
        <SidebarRow style={{ flexDirection: 'column', alignItems: 'center' }}>
          {pendingAction === 1 ? (
            <ActionButton color="blue" onClick={executeProposal}>
              <FiFastForward /> Boost{' '}
            </ActionButton>
          ) : pendingAction === 2 ? (
            <ActionButton color="blue" onClick={executeProposal}>
              <FiPlayCircle /> Execute{' '}
            </ActionButton>
          ) : pendingAction === 3 ? (
            <ActionButton color="blue" onClick={executeProposal}>
              <FiPlayCircle /> Finish{' '}
            </ActionButton>
          ) : pendingAction === 4 ? (
            <ActionButton color="blue" onClick={redeemBeneficiary}>
              <FiPlayCircle /> Redeem 4 Beneficiary{' '}
            </ActionButton>
          ) : (
            pendingAction === 5 && (
              <ActionButton color="blue" onClick={executeMulticall}>
                <FiPlayCircle /> Execute Multicall{' '}
              </ActionButton>
            )
          )}
        </SidebarRow>
      )}
    </>
  );
};

export default Status;
