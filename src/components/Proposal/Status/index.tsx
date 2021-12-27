import moment from 'moment';
import Countdown from 'react-countdown';
import { FiPlayCircle } from 'react-icons/fi';
import { useContext } from 'contexts';

import { useLocation } from 'react-router-dom';

import { bnum, isWalletScheme, PendingAction } from 'utils';
import { Question } from 'components/common';

import { SpaceAroundRow, ActionButton } from '../styles';

const Status = () => {
  const {
    context: { daoStore, configStore, providerStore, daoService },
  } = useContext();

  //State
  const networkContracts = configStore.getNetworkContracts();
  // We should get the ID in another way
  const proposalId = useLocation().pathname.split('/')[3];
  const proposal = daoStore.getProposal(proposalId);
  const { account } = providerStore.getActiveWeb3React();
  const scheme = daoStore.getScheme(proposal.scheme);

  const executionTimeoutTime = isWalletScheme(scheme)
    ? proposal.submittedTime.plus(scheme.maxSecondsForExecution)
    : bnum(0);

  const executePendingAction = function (pendingAction) {
    switch (pendingAction) {
      case 4:
        daoService.redeemContributionReward(
          networkContracts.daostack.contributionRewardRedeemer,
          scheme.address,
          scheme.votingMachine,
          proposalId,
          proposal.to[0]
        );
        break;
      case 5:
        daoService.executeMulticall(scheme.address, proposalId);
        break;
      default:
        daoService.execute(proposalId);
        break;
    }
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
      <SpaceAroundRow style={{ margin: '0px 10px', flexDirection: 'column' }}>
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
      </SpaceAroundRow>
      {account && pendingAction > 0 && (
        <SpaceAroundRow
          style={{ flexDirection: 'column', alignItems: 'center' }}
        >
          <ActionButton
            color="blue"
            onClick={() => executePendingAction(pendingAction)}
          >
            <FiPlayCircle /> {PendingAction[pendingAction]}{' '}
          </ActionButton>
        </SpaceAroundRow>
      )}
    </>
  );
};

export default Status;
