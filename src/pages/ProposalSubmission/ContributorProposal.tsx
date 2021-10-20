// Externals
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import contentHash from 'content-hash';
import moment from 'moment';

import { LevelSelect } from '../../components/LevelSelect';
import { Button } from '../../components/common/Button';
import { useContext } from '../../contexts';
import { Modal } from '../../components/Modal';
import {
  TXEvents,
  formatNumberValue,
  denormalizeBalance,
  bnum,
} from '../../utils';
import Toggle from 'components/Toggle';

const VerticalLayout = styled.div`
  display: flex;
  width: 100%;
  height: 79vh;
  flex-direction: column;
  flex-wrap: wrap;
`;

const ModalContent = styled.div`
  ${({ theme }) => theme.flexColumnWrap}
  margin: 16px 0px;
  padding: 0 50px;
  background-color: ${({ theme }) => theme.backgroundColor};
  text-align: center;
`;

const NavigationBar = styled.div`
  display: flex;
  width: 100%;
  height: 10vh;
`;

const BackToProposals = styled.div`
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Center = styled.div`
  margin: 5% 0;
  text-align: center;
  width: 60%;
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Spacer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const Values = styled.div`
  margin: 5% 0;
`;
const Value = styled.h2`
  font-size: xx-large;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  font-size: xx-large;
`;

const WarningText = styled.p`
  color: red;
  font-size: smaller;
`;

const TextInput = styled.input`
  width: 280px;
  height: 50px;
  border: 0;
  border-bottom: 1px solid #10161a33;
  margin-right: 5px;
  font-size: xx-large;
  text-align: center;
`;

export const ContributorProposalPage = observer(() => {
  const {
    context: {
      configStore,
      coingeckoService,
      daoStore,
      daoService,
      providerStore,
      ipfsService,
      pinataService,
    },
  } = useContext();
  const { library, account } = providerStore.getActiveWeb3React();

  const history = useHistory();
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [dxdAth, setDxdAth] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [dxdAmount, setDxdAmount] = useState(null);
  const [repReward, setRepReward] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [percentage, setPercentage] = useState(null);
  const [trialPeriod, setTrialPeriod] = useState(false);
  const [discount, setDiscount] = useState(1);

  const proposalType = configStore
    .getProposalTypes()
    .find(type => type.id === 'contributor');

  const scheme = daoStore
    .getAllSchemes()
    .find(scheme => scheme.name === proposalType.scheme);

  const levels = configStore.getContributorLevels();

  const contracts = configStore.getNetworkContracts();
  const tokens = configStore.getTokensOfNetwork();

  const getDXD = async () => {
    const dxdData = await coingeckoService.getDxdData();
    setDxdAth(dxdData['market_data'].ath.usd);
  };

  useEffect(() => {
    getDXD();
  }, []);

  useEffect(() => {
    setDiscount(
      (percentage ? parseFloat(percentage) / 100 : 1) * (trialPeriod ? 0.8 : 1)
    );
  }, [trialPeriod, percentage]);

  useEffect(() => {
    if (confirm) {
      const { userRep, totalSupply } = daoStore.getRepEventsOfUser(
        account,
        providerStore.getCurrentBlockNumber()
      );

      setDxdAmount(
        denormalizeBalance(
          bnum((levels[selectedLevel]?.dxd / dxdAth) * discount)
        ).toString()
      );

      let currentRepReward = formatNumberValue(
        totalSupply.times(0.001667).times(trialPeriod ? 0.8 : 1),
        0
      );

      if (periodEnd) {
        userRep.reverse().forEach(repEvent => {
          const loweLimit = moment().subtract(1.8, 'months').unix();
          const upperLimit = moment().subtract(2.2, 'months').unix();
          if (
            repEvent.timestamp < loweLimit &&
            repEvent.timestamp > upperLimit
          ) {
            currentRepReward = formatNumberValue(
              repEvent.amount.times(trialPeriod ? 0.8 : 1),
              0
            );
            console.debug('Matched previous REP amount');
          }
        });
      }

      setRepReward(currentRepReward);
    }
  }, [confirm]);

  const submitProposal = async () => {
    try {
      const hash = await ipfsService.uploadProposalMetadata(
        localStorage.getItem('dxvote-newProposal-title'),
        localStorage.getItem('dxvote-newProposal-description'),
        [`Level ${selectedLevel}`, 'Contributor Proposal'],
        pinataService
      );

      // Encode rep mint call
      const repFunctionEncoded = library.eth.abi.encodeFunctionSignature(
        'mintReputation(uint256,address,address)'
      );

      const repParamsEncoded = library.eth.abi
        .encodeParameters(
          ['uint256', 'address', 'address'],
          [repReward, account, contracts.avatar]
        )
        .substring(2);

      const repCallData = repFunctionEncoded + repParamsEncoded;
      console.log({ repCallData });
      // Encode DXD approval
      const dxdApprovalFunctionEncoded =
        library.eth.abi.encodeFunctionSignature('approve(address,uint256)');

      const dxdApprovalParamsEncoded = library.eth.abi
        .encodeParameters(
          ['address', 'uint256'],
          [contracts.utils.dxdVestingFactory, dxdAmount]
        )
        .substring(2);

      const dxdApprovalCallData =
        dxdApprovalFunctionEncoded + dxdApprovalParamsEncoded;

      // Encode vesting contract call
      const vestingFunctionEncoded = library.eth.abi.encodeFunctionSignature(
        'create(address, uint256, uint256, uint256, uint256)'
      );

      const vestingParamsEncoded = library.eth.abi
        .encodeParameters(
          ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
          [
            account,
            moment().unix(),
            moment.duration(1, 'years').asSeconds(),
            moment.duration(2, 'years').asSeconds(),
            dxdAmount,
          ]
        )
        .substring(2);

      const vestingCallData = vestingFunctionEncoded + vestingParamsEncoded;

      // Need additional token transfer on anything other than xdai
      const proposalData = {
        to: [
          account,
          tokens.find(token => token.name === 'DXdao').address,
          contracts.utils.dxdVestingFactory,
        ],
        data: ['0x0', dxdApprovalCallData, vestingCallData],
        // Make native token use level value
        value: [
          denormalizeBalance(bnum(levels[selectedLevel]?.stable * discount)),
          0,
          0,
        ],
        titleText: 'Test contributor stuff',
        descriptionHash: contentHash.fromIpfs(hash),
      };

      console.debug('[PROPOSAL]', scheme.address, proposalData);

      daoService
        .createProposal(scheme.address, scheme.type, proposalData)
        .on(TXEvents.TX_HASH, hash => {
          console.debug('[TX_SUBMITTED]', hash);
        })
        .on(TXEvents.TX_ERROR, txerror => {
          console.error('[TX_ERROR]', txerror);
        })
        .on(TXEvents.INVARIANT, error => {
          console.error('[ERROR]', error);
        })
        .catch(error => {
          console.error('[ERROR]', error);
        });
    } catch (error) {
      console.error('[PROPOSAL_ERROR]', error);
    }
  };

  const header = <div>Submit worker proposal</div>;

  return (
    <VerticalLayout>
      <NavigationBar>
        <BackToProposals
          onClick={() => history.push('../metadata/contributor')}
        >
          {`< Back`}
        </BackToProposals>
        {!advanced ? (
          <Center>
            <div>
              Select Level
              <LevelSelect
                numberOfLevels={levels.length}
                selected={selectedLevel}
                onSelect={index => {
                  console.log({ index });
                  setSelectedLevel(index);
                }}
              />
            </div>
            {selectedLevel >= 0 ? (
              <Values>
                <Value>${levels[selectedLevel]?.stable * discount}</Value>
                <Value>
                  {dxdAth
                    ? (
                        (levels[selectedLevel]?.dxd / dxdAth) *
                        discount
                      ).toFixed(2)
                    : 'Loading ...'}{' '}
                  DXD
                </Value>

                <Value>
                  {levels[selectedLevel]?.rep * (trialPeriod ? 0.8 : 1)}% REP
                </Value>
                <Toggle
                  onToggle={() => {
                    setPeriodEnd(!periodEnd);
                  }}
                  state={periodEnd}
                  optionOne={'Period 1/2'}
                  optionTwo={'Period 2/2'}
                />
              </Values>
            ) : null}
            <ButtonsWrapper>
              <Button
                disabled={selectedLevel < 0}
                onClick={() => setConfirm(true)}
              >
                Submit Proposal
              </Button>
            </ButtonsWrapper>
          </Center>
        ) : (
          <Center>
            <InputWrapper>
              <TextInput
                type="text"
                placeholder="Time commitment"
                onChange={event => setPercentage(event.target.value)}
                value={percentage}
              />
              %
            </InputWrapper>
            <Toggle
              onToggle={() => {
                setTrialPeriod(!trialPeriod);
              }}
              state={trialPeriod}
              optionOne={'Full worker'}
              optionTwo={'Trial period'}
            />
            <ButtonsWrapper>
              <Button onClick={() => setAdvanced(false)}>Save</Button>
            </ButtonsWrapper>
          </Center>
        )}

        <Spacer>
          <Button onClick={() => setAdvanced(!advanced)}>More options</Button>
        </Spacer>
      </NavigationBar>

      <Modal
        header={header}
        isOpen={confirm}
        onDismiss={() => setConfirm(false)}
        onCancel={() => setConfirm(false)}
        onConfirm={() => submitProposal()}
      >
        <ModalContent>
          <b>Payment:</b>
          <Values>${levels[selectedLevel]?.stable * discount}</Values>
          <Values>
            {((levels[selectedLevel]?.dxd / dxdAth) * discount).toFixed(2)} DXD
            vested for 2 years and 1 year cliff
          </Values>
          <Values>
            {levels[selectedLevel]?.rep * (trialPeriod ? 0.8 : 1)}% -{' '}
            {repReward} REP
          </Values>
          <WarningText>
            {periodEnd
              ? 'If this is the second half of your payment then there is a chance DXD ATH changed and double check REP amount is accurate. If something is wrong please override the automatic values.'
              : null}
          </WarningText>
        </ModalContent>
      </Modal>
    </VerticalLayout>
  );
});
