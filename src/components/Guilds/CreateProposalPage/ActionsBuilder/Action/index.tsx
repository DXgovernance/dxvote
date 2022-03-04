import styled, { css, useTheme } from 'styled-components';
import { Box } from 'components/Guilds/common/Layout';
import { CardWrapper, Header } from 'components/Guilds/common/Card';
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiPlus,
} from 'react-icons/fi';
import { useState } from 'react';
import Avatar from 'components/Guilds/Avatar';
import { shortenAddress } from 'utils';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { DEFAULT_ETH_CHAIN_ID } from 'provider/connectors';
import { Button } from 'components/Guilds/common/Button';
import UnstyledLink from 'components/Guilds/common/UnstyledLink';

// TODO: Update this
export interface Action {
  from: string;
  to: string;
  functionName: string;
  params: {
    type: string;
    name: string;
    value: string;
    isDecodable?: boolean;
    externalLink?: string;
  }[];
  decodeText: string;
}

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

const Segment = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const MetadataTag = styled.span`
  padding: 0.125rem 0.375rem;
  background-color: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
`;

const DetailWrapper = styled(Box)`
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

const DetailRow = styled(Box)`
  display: flex;
  margin-top: 0.75rem;
  justify-content: space-between;
  align-items: center;
`;

const DetailCell = styled(Box)`
  display: flex;
  align-items: center;
`;

const DetailHeader = styled(DetailRow)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  font-size: 0.75rem;
  margin-top: 0;
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

const ParamTag = styled(MetadataTag)`
  border-radius: ${({ theme }) => theme.radii.pill};
  margin: 0 0.25rem;
  color: ${({ color }) => color};
`;

const ParamTitleRow = styled(DetailRow)`
  margin-bottom: 0.75rem;
`;

const ParamTitleTag = styled(MetadataTag)`
  display: inline-block;
  padding: 0.375rem 0.5rem;
  color: ${({ color }) => color};
`;

const ActionParamRow = styled(Box)`
  margin-bottom: 1.5rem;
`;

const ParamDetail = styled(Box)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  overflow-wrap: break-word;
`;

interface ActionViewProps {
  action: Action;
}

const ActionView: React.FC<ActionViewProps> = ({ action }) => {
  const [expanded, setExpanded] = useState(false);
  const { ensName, imageUrl } = useENSAvatar(action?.to, DEFAULT_ETH_CHAIN_ID);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

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

      {expanded && (
        <>
          <DetailWrapper>
            <TabButton
              variant="secondary"
              active={activeTab === 0}
              onClick={() => setActiveTab(0)}
            >
              Default
            </TabButton>
            <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>
              Function Calls
            </TabButton>
          </DetailWrapper>

          {activeTab === 0 && (
            <DetailWrapper>
              <DetailHeader>
                <DetailCell>Receiver</DetailCell>
                <DetailCell>Amount</DetailCell>
              </DetailHeader>

              <DetailRow>
                <DetailCell>
                  <Segment>
                    <Avatar defaultSeed={action?.to} src={imageUrl} size={24} />
                  </Segment>
                  <Segment>{ensName || shortenAddress(action?.to)}</Segment>
                </DetailCell>
                <DetailCell>1200.00 REP</DetailCell>
              </DetailRow>
            </DetailWrapper>
          )}

          {activeTab === 1 && (
            <DetailWrapper>
              <ActionParamRow>
                <Box>
                  {action?.functionName}(
                  {action?.params?.map((param, index, params) => (
                    <span key={index}>
                      <ParamTag
                        key={index}
                        color={theme?.colors?.params?.[index]}
                      >
                        {param?.type}
                      </ParamTag>
                      {index < params.length - 1 && <span> , </span>}
                    </span>
                  ))}
                  )
                </Box>
              </ActionParamRow>

              {action?.params?.map((param, index, params) => (
                <ActionParamRow key={index}>
                  <ParamTitleRow>
                    <ParamTitleTag color={theme?.colors?.params?.[index]}>
                      {param?.name} <em>({param?.type})</em>
                    </ParamTitleTag>
                    {param?.type === 'bytes' && (
                      <Button variant="secondary">Decode</Button>
                    )}
                  </ParamTitleRow>

                  {param?.type === 'address' ? (
                    <UnstyledLink href="#">
                      <ParamDetail>
                        {param?.value} <FiExternalLink size={16} />
                      </ParamDetail>
                    </UnstyledLink>
                  ) : (
                    <ParamDetail>{param?.value}</ParamDetail>
                  )}
                </ActionParamRow>
              ))}
            </DetailWrapper>
          )}
        </>
      )}
    </CardWrapperWithMargin>
  );
};

export default ActionView;
