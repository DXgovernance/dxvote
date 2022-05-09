import CallDetails from './CallDetails';
import { getInfoLineView, getSummaryView } from './SupportedActions';
import UndecodableCallDetails from './UndecodableCalls/UndecodableCallDetails';
import UndecodableCallInfoLine from './UndecodableCalls/UndecodableCallsInfoLine';
import EditButton from './common/EditButton';
import Grip from './common/Grip';
import { Call, DecodedAction } from './types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDecodedCall } from 'hooks/Guilds/contracts/useDecodedCall';
import { Button } from 'old-components/Guilds/common/Button';
import { CardWrapper, Header } from 'old-components/Guilds/common/Card';
import { Box } from 'old-components/Guilds/common/Layout';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styled, { css } from 'styled-components';

const CardWrapperWithMargin = styled(CardWrapper)`
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  margin-top: 0.8rem;
  border: 1px solid;
  border-color: ${({ dragging, theme }) =>
    dragging ? theme.colors.text : theme.colors.muted};
  z-index: ${({ dragging }) => (dragging ? 999 : 'initial')};
  box-shadow: ${({ dragging }) =>
    dragging ? '0px 4px 8px 0px rgba(0, 0, 0, 0.2)' : 'none'};
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
  height: 1.4rem;
  width: 1.4rem;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.muted};
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

const GripWithMargin = styled(Grip)`
  margin-right: 1rem;
`;

const EditButtonWithMargin = styled(EditButton)`
  margin-right: 0.625rem;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface ActionViewProps {
  call?: Call;
  decodedAction?: DecodedAction;
  isEditable?: boolean;
  onEdit?: (updatedCall: DecodedAction) => void;
}

const ActionRow: React.FC<ActionViewProps> = ({
  call,
  decodedAction,
  isEditable,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: decodedAction?.id, disabled: !isEditable });

  const { decodedCall: decodedCallFromCall } = useDecodedCall(call);

  const decodedCall = decodedCallFromCall || decodedAction?.decodedCall;

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Get renderable components for the action
  const InfoLine = getInfoLineView(decodedCall?.callType);
  const ActionSummary = getSummaryView(decodedCall?.callType);

  const dndStyles = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <CardWrapperWithMargin
      dragging={isEditable && isDragging}
      ref={setNodeRef}
      style={dndStyles}
      {...attributes}
    >
      <CardHeader>
        <CardLabel>
          {isEditable && <GripWithMargin {...listeners} />}

          {InfoLine && (
            <InfoLine
              decodedCall={decodedCall}
              approveSpendTokens={decodedAction.approval}
            />
          )}
          {!decodedCall && <UndecodableCallInfoLine />}
        </CardLabel>
        <CardActions>
          {isEditable && <EditButtonWithMargin>Edit</EditButtonWithMargin>}
          <ChevronIcon onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <FiChevronUp height={16} />
            ) : (
              <FiChevronDown height={16} />
            )}
          </ChevronIcon>
        </CardActions>
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
              <ActionSummary decodedCall={decodedCall} />
            </DetailWrapper>
          )}

          {(!ActionSummary || activeTab === 1) && (
            <DetailWrapper>
              {decodedCall ? (
                <CallDetails
                  decodedCall={decodedCall}
                  approveSpendTokens={decodedAction.approval}
                />
              ) : (
                <UndecodableCallDetails call={call} />
              )}
            </DetailWrapper>
          )}
        </>
      )}
    </CardWrapperWithMargin>
  );
};

export default ActionRow;
