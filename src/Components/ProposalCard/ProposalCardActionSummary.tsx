import { Box } from 'old-components/Guilds/common/Layout';
import { Loading } from 'old-components/Guilds/common/Loading';
import { isDesktop } from 'react-device-detect';
import { FiArrowRight } from 'react-icons/fi';
import styled from 'styled-components';

interface ProposalCardActionSummaryProps {
  isLoading?: boolean;
}

const IconDetailWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const BorderedIconDetailWrapper = styled(IconDetailWrapper)`
  border: 1px solid ${({ theme }) => theme.colors.border.initial};
  border-radius: 1rem;
  padding: 0.25rem 0.8rem;
  flex: none;
  display: flex;
`;

const Detail = styled(Box)`
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const Icon = styled.img<{
  spaceLeft?: boolean;
  spaceRight?: boolean;
  bordered: boolean;
}>`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.spaceLeft && `margin-left: 0.5rem;`}
  ${props => props.spaceRight && `margin-right: 0.5rem;`}

  ${props =>
    props.bordered &&
    `
    border: 1px solid #000;
    border-radius: 50%;
  `}
`;

const ProposalCardActionSummary: React.FC<ProposalCardActionSummaryProps> = ({
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Loading
        style={{ margin: 0 }}
        loading
        text
        skeletonProps={{ width: '200px' }}
      />
    );
  }
  return (
    <BorderedIconDetailWrapper>
      <Detail>150 ETH</Detail>
      {isDesktop && (
        <>
          <Icon as="div" spaceLeft spaceRight>
            <FiArrowRight />
          </Icon>{' '}
          <Detail>geronimo.eth</Detail>
        </>
      )}
    </BorderedIconDetailWrapper>
  );
};

export default ProposalCardActionSummary;
