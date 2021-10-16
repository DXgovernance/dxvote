// Externals
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

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
    context: { configStore, coingeckoService, daoStore, daoService },
  } = useContext();

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
      const proposalData = {
        to,
        data,
        value,
        titleText,
        descriptionHash: contentHash.fromIpfs(ipfsHash),
      };

      console.debug('[PROPOSAL]', scheme.address, proposalData);

      daoService
        .createProposal(scheme.address, scheme.type, proposalData)
        .on(TXEvents.TX_HASH, hash => {
          console.debug('[TX_SUBMITTED]', hash);
        })
        .on(TXEvents.RECEIPT, hash => {})
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
              onClick={() => history.push(`../submit/ `)}
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
