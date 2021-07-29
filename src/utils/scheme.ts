import { bnum } from './helpers';

export const decodeSchemeParameters = function(rawParameters) {
  return {
    queuedVoteRequiredPercentage: bnum(rawParameters.queuedVoteRequiredPercentage.toString()),
    queuedVotePeriodLimit: bnum(rawParameters.queuedVotePeriodLimit.toString()),
    boostedVotePeriodLimit: bnum(rawParameters.boostedVotePeriodLimit.toString()),
    preBoostedVotePeriodLimit: bnum(rawParameters.preBoostedVotePeriodLimit.toString()),
    thresholdConst: bnum(rawParameters.thresholdConst.toString()),
    limitExponentValue: bnum(rawParameters.limitExponentValue.toString()),
    quietEndingPeriod: bnum(rawParameters.quietEndingPeriod.toString()),
    proposingRepReward: bnum(rawParameters.proposingRepReward.toString()),
    votersReputationLossRatio: bnum(rawParameters.votersReputationLossRatio.toString()),
    minimumDaoBounty: bnum(rawParameters.minimumDaoBounty.toString()),
    daoBountyConst: bnum(rawParameters.daoBountyConst.toString()),
    activationTime: bnum(rawParameters.activationTime.toString())
  };
}
