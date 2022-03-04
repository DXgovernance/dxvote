import styled, { css } from 'styled-components';
import { Box } from 'components/Guilds/common/Layout';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
} from 'react-icons/fi';
import { useState } from 'react';
import Avatar from 'components/Guilds/Avatar';
import { shortenAddress } from 'utils';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';

// TODO: This is using DXvote's recommendedCalls interface for now
export interface Action {
  asset: string;
  from: string;
  to: string;
  toName: string;
  functionName: string;
  params: {
    type: string;
    name: string;
    defaultValue: string;
    decimals?: number;
    isRep?: boolean;
  }[];
  decodeText: string;
}

const CardWrapperWithMargin = styled(CardWrapper)`
  margin-top: 0.8rem;
`

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

const Segment = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const MetadataTag = styled.span`
  padding: 0.125rem 0.375rem;
  background-color: ${({ theme }) => theme.colors.muted};
  border-radius: 0.5rem;
`;

interface ActionViewProps {
  action: Action;
}

const ActionView: React.FC<ActionViewProps> = ({ action }) => {
  const [expanded, setExpanded] = useState(false);
  const { ensName, imageUrl } = useENSAvatar(action?.to, DEFAULT_ETH_CHAIN_ID);

  return (
    <CardWrapperWithMargin>
      <CardHeader>
        <CardLabel>
          <Segment>
            <FiPlus size={16} />
          </Segment>
          <Segment>{action?.decodeText}</Segment>
          <Segment>
            <FiArrowRight />
          </Segment>
          <Segment>
            <Avatar defaultSeed={action?.to} src={imageUrl} size={24} />
          </Segment>
          <Segment>{ensName || shortenAddress(action?.to)}</Segment>
          <Segment>
            <MetadataTag>5.54%</MetadataTag>
          </Segment>
        </CardLabel>
        <ChevronIcon onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <FiChevronUp height={16} />
          ) : (
            <FiChevronDown height={16} />
          )}
        </ChevronIcon>
      </CardHeader>
    </CardWrapperWithMargin>
  );
};

export default ActionView;
