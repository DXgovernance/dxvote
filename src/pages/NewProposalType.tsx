// Externals
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import { useContext } from '../contexts';
import { Box } from '../components/common';

const VerticalLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
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

const Title = styled.h2`
  text-align: center;
  font-weight: 200;
`;

const Spacer = styled.div`
  flex: 1;
  text-align: center;
  font-weight: 200;
`;

const OptionsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const ProposalType = styled(Box)`
  width: 10%;
  min-width: 120px;
  height: 100px;
  margin: 5%;
  padding: 10px;
  cursor: pointer;
  text-align: center;
  color: var(--dark-text-gray);
  padding: 5px 10px;
  font-weight: 500;
  font-size: 24px;
  transition-duration: 0.5s;
  :hover {
    box-shadow: 0px 0px 15px 10px rgba(14, 0, 135, 0.1);
    transform: scale(1.05);
  }
`;

export const NewProposalTypePage = observer(() => {
  const {
    context: { configStore },
  } = useContext();
  const history = useHistory();
  const [proposalTypes, setProposalTypes] = useState([]);

  const options = [];

  useEffect(() => {
    setProposalTypes(configStore.getProposalTypes());
  }, []);

  proposalTypes.forEach(type => {
    const path =
      type.id === 'custom' ? `submit/${type.id}` : `metadata/${type.id}`;
    options.push(
      <ProposalType onClick={() => history.push(path)}>
        {type.title}
      </ProposalType>
    );
  });

  return (
    <VerticalLayout>
      <NavigationBar>
        <BackToProposals onClick={() => history.push('../proposals')}>
          {`< Back `}
        </BackToProposals>
        <Title>Choose Proposal Type</Title>
        <Spacer />
      </NavigationBar>
      <OptionsWrapper>{options}</OptionsWrapper>
    </VerticalLayout>
  );
});
