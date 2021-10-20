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
import { Modal } from '../Modal';
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
  padding: 0;
  width: 100%;
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
  text-align: center;
  font-weight: 200;
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

  const proposalType = configStore
    .getProposalTypes()
    .find(type => type.id === 'contributor');

  const scheme = daoStore
    .getAllSchemes()
    .find(scheme => scheme.name === proposalType.scheme);
  console.log({ scheme });

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

  const submitProposal = async () => {
    try {
      const hash = await ipfsService.uploadProposalMetadata(
        localStorage.getItem('dxvote-newProposal-title'),
        localStorage.getItem('dxvote-newProposal-description'),
        [`Level ${selectedLevel}`, 'Contributor Proposal'],
        pinataService
      );

      const { userRep, totalSupply } = daoStore.getRepEventsOfUser(
        account,
        providerStore.getCurrentBlockNumber()
      );

      const dxdAmount = denormalizeBalance(
        bnum(levels[selectedLevel]?.dxd / dxdAth)
      ).toString();

      let currentRepReward = formatNumberValue(totalSupply.times(0.001667), 0);

      if (periodEnd) {
        userRep.reverse().forEach(repEvent => {
          const loweLimit = moment().subtract(1.8, 'months').unix();
          const upperLimit = moment().subtract(2.2, 'months').unix();
          if (
            repEvent.timestamp < loweLimit &&
            repEvent.timestamp > upperLimit
          ) {
            currentRepReward = formatNumberValue(repEvent.amount, 0);
            console.debug('Matched previous REP amount');
          }
        });
      }

      console.log({ currentRepReward });

      // Encode rep mint call
      const repFunctionEncoded = library.eth.abi.encodeFunctionSignature(
        'mintReputation(uint256,address,address)'
      );

      const repParamsEncoded = library.eth.abi
        .encodeParameters(
          ['uint256', 'address', 'address'],
          [currentRepReward, account, contracts.avatar]
        )
        .substring(2);

      const repCallData = repFunctionEncoded + repParamsEncoded;

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

      const proposalData = {
        to: [
          contracts.controller,
          account,
          tokens.find(token => token.name === 'DXdao').address,
          contracts.utils.dxdVestingFactory,
        ],
        data: [repCallData, '0x0', dxdApprovalCallData, vestingCallData],
        // Make native token use level value
        value: [0, 2, 0, 0],
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
              <Value>${levels[selectedLevel]?.stable}</Value>
              <Value>
                {(levels[selectedLevel]?.dxd / dxdAth).toFixed(2)} DXD
              </Value>

              <Value>{levels[selectedLevel]?.rep}% REP</Value>
              <Toggle
                onToggle={() => {
                  setPeriodEnd(!periodEnd);
                }}
                state={periodEnd}
                optionOne={'First part'}
                optionTwo={'Second part'}
              />
            </Values>
          ) : null}
          <ButtonsWrapper>
            <Button
              disabled={selectedLevel < 0}
              onClick={() => submitProposal()}
            >
              Submit Proposal
            </Button>
          </ButtonsWrapper>
        </Center>
        <Spacer />
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
          <div></div>
        </ModalContent>
      </Modal>
    </VerticalLayout>
  );
});
