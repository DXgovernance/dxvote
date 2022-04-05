import styled, { css } from 'styled-components';
import { Box } from 'components/Guilds/common/Layout';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';
import { Button } from 'components/Guilds/common/Button';
import { useDecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';
import { getInfoLineView, getSummaryView } from '../SupportedActions';
import CallDetails from '../CallDetails';
import { Call } from '../types';

const CardWrapperWithMargin = styled(CardWrapper)`
  margin-top: 0.8rem;
`;

const CardHeader = styled(Header)`
  padding: 0.875rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardLabel = styled(Box)`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ChevronIcon = styled.span`
  cursor: pointer;
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.proposalText.grey};
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  ${({ active }) =>
    active &&
    css`
      border-color: ${({ theme }) => theme.colors.border.hover};
    `}
`;

const DetailWrapper = styled(Box)`
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const TabButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text};

  ${({ active }) =>
    active &&
    css`
      border: 2px solid ${({ theme }) => theme.colors.text};
    `}
`;

interface ActionViewProps {
  call: Call;
}

const ActionView: React.FC<ActionViewProps> = ({ call }) => {
  const { decodedCall } = useDecodedCall(call);

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Get renderable components for the action
  const InfoLine = getInfoLineView(decodedCall?.callType);
  const ActionSummary = getSummaryView(decodedCall?.callType);

  return (
    <CardWrapperWithMargin>
      <CardHeader>
        <CardLabel>
          {InfoLine && <InfoLine call={call} decodedCall={decodedCall} />}
        </CardLabel>
        <ChevronIcon onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <FiChevronUp height={16} />
          ) : (
            <FiChevronDown height={16} />
          )}
        </ChevronIcon>
      </CardHeader>

      {expanded && (
        <>
          {ActionSummary && (
            <DetailWrapper>
              <TabButton
                variant="secondary"
                active={activeTab === 0}
                onClick={() => setActiveTab(0)}
              >
                Default
              </TabButton>
              <TabButton
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
              >
                Function Calls
              </TabButton>
            </DetailWrapper>
          )}

          {ActionSummary && activeTab === 0 && (
            <DetailWrapper>
              <ActionSummary call={call} decodedCall={decodedCall} />
            </DetailWrapper>
          )}

          {(!ActionSummary || activeTab === 1) && (
            <DetailWrapper>
              <CallDetails call={call} decodedCall={decodedCall} />
            </DetailWrapper>
          )}
        </>
      )}
    </CardWrapperWithMargin>
  );
};

export default ActionView;
