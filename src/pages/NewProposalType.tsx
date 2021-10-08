// Externals
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import { useContext } from '../contexts';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const ProposalType = styled.div`
  width: 10%;
  min-width: 100px;
  height: 100px;
  box-shadow: 0px 0px 15px 11px #3a58fd47;
  margin: 5%;
  padding: 10px;
  cursor: pointer;
  transition-duration: 1s;
  :hover {
    box-shadow: 0px 0px 20px 15px #3a57fd66;
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
    options.push(
      <ProposalType onClick={() => history.push(type.id)}>
        {type.title}
      </ProposalType>
    );
  });

  return <Wrapper>{options}</Wrapper>;
});
