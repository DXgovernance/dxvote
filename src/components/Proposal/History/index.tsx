import { Title, BlockchainLink, Box } from '../../common';
import styled from 'styled-components';

const ProposalHistoryEvent = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 0px;
  border-bottom: 1px var(--medium-gray);
  &:last-of-type {
    border-bottom: none;
  }
`;

const HistoryEventText = styled.span`
  display: flex;
  margin-right: 5px;
  > * {
    margin-right: 5px;
  }
`;

const ProposalInfoBox = styled(Box)`
  max-width: 900px;
  overflow-wrap: anywhere;
  padding: 20px 15px 10px 15px;
  justify-content: flex-start;
  overflow: auto;
`;

const renderEvents = ({ text, textParams }) => {
  let componentsList = [];
  if (text.length === 1 && textParams.length === 0)
    componentsList.push(<span>{text[0]}</span>);
  else {
    componentsList = text.map((phrase, key) => {
      let components = [];
      components.push(<span>{phrase}</span>);
      if (textParams[key])
        components.push(
          <BlockchainLink text={textParams[0]} toCopy={false} size="short" />
        );
      return components;
    });
  }
  return componentsList;
};

const History = ({ proposalEvents }) => (
  <ProposalInfoBox style={{ marginTop: '15px' }}>
    <Title noMargins> History </Title>
    {proposalEvents.history.map((historyEvent, i) => (
      <ProposalHistoryEvent key={'proposalHistoryEvent' + i}>
        <HistoryEventText>{renderEvents(historyEvent)}</HistoryEventText>
        <BlockchainLink
          type="transaction"
          size="short"
          text={historyEvent.event.tx}
          onlyIcon
        />
        {i < proposalEvents.history.length - 1 && <hr />}
      </ProposalHistoryEvent>
    ))}
  </ProposalInfoBox>
);

export default History;
