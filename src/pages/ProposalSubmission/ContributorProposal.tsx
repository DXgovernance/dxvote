// Externals
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import contentHash from 'content-hash';

import { LevelSelect } from '../../components/LevelSelect';
import { Button } from '../../components/common/Button';
import { useContext } from '../../contexts';
import { TXEvents } from '../../utils';

const VerticalLayout = styled.div`
  display: flex;
  width: 100%;
  height: 79vh;
  flex-direction: column;
  flex-wrap: wrap;
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
    },
  } = useContext();
  const { library, account } = providerStore.getActiveWeb3React();

  const history = useHistory();
  const [selectedLevel, setSelectedLevel] = useState(-1);
  const [dxdAth, setDxdAth] = useState(null);

  const proposalType = configStore
    .getProposalTypes()
    .find(type => type.id === 'contributor');

  const scheme = daoStore
    .getAllSchemes()
    .find(scheme => scheme.name === proposalType.scheme);
  console.log({ scheme });

  const levels = configStore.getContributorLevels();

  const contracts = configStore.getNetworkContracts();

  const getDXD = async () => {
    const dxdData = await coingeckoService.getDxdData();
    console.log({ dxdData });
    setDxdAth(dxdData['market_data'].ath.usd);
  };
  useEffect(() => {
    getDXD();
  }, []);

  const submitProposal = () => {
    try {
      const repFunctionEncoded = library.eth.abi.encodeFunctionSignature(
        'mintReputation(uint256,address,address)'
      );
      // Work out rep calculation
      const repParamsEncoded = library.eth.abi
        .encodeParameters(
          ['uint256', 'address', 'address'],
          ['2', account, contracts.avatar]
        )
        .substring(2);

      const repCallData = repFunctionEncoded + repParamsEncoded;

      // const transferFunctionEncoded = library.eth.abi.encodeFunctionSignature(
      //   'transfer(address,uint256)'
      // );

      // const transferParamsEncoded = library.eth.abi
      //   .encodeParameters(
      //     ['address', 'uint256'],
      //     [account, '2']
      //   )
      //   .substring(2);

      // const transferCallData =
      // transferFunctionEncoded + transferParamsEncoded;

      const proposalData = {
        to: [contracts.controller],
        data: [repCallData],
        value: ['0'],
        title: 'Test contributor stuff',
        descriptionHash: contentHash.fromIpfs(
          localStorage.getItem('dxvote-newProposal-hash')
        ),
      };

      console.debug('[PROPOSAL]', scheme.address, proposalData);
      // "0xeaf994b200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000b17cf48420400e1d71f8231d4a8e43b3566bb5b0000000000000000000000001a639b50d807ce7e61dc9eeb091e6cea8ecb1595"
      // "0xeaf994b200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000b17cf48420400e1d71f8231d4a8e43b3566bb5b0000000000000000000000001a639b50d807ce7e61dc9eeb091e6cea8ecb1595"
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
  console.log(submitProposal);
  // ["0xb05d148c6A9d9C0eb3fE0A091a68d6DeDac63f3b"]
  // ["0xeaf994b200000000000000000000000000000000000000000000000000000000000f423f0000000000000000000000000b17cf48420400e1d71f8231d4a8e43b3566bb5b0000000000000000000000000b17cf48420400e1d71f8231d4a8e43b3566bb5b"]
  // ["0"]

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
    </VerticalLayout>
  );
});
