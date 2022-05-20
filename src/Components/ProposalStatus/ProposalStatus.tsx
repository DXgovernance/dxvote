import styled, { css } from 'styled-components';
import { Box } from 'Components/Primitives/Layout';
import { Loading } from 'Components/Primitives/Loading';
import { ProposalState } from 'Components/Types';
import { ProposalStatusProps } from './types';

const ProposalStatusWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
`;

const Status = styled.div<{ bordered?: boolean }>`
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  ${({ bordered }) =>
    bordered &&
    css`
      border: 1px solid ${({ theme }) => theme.colors.text};
      border-radius: ${({ theme }) => theme.radii.pill};
      padding-left: 0.5rem;
    `}
`;

const ProposalStatusDetail = styled(Box)<{ statusDetail?: ProposalState }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem;
  border-radius: 15px;
  border: 1px solid
    ${props =>
      props.statusDetail === ProposalState.Failed ? '#D500F9' : '#1DE9B6'};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${props =>
    props.statusDetail === ProposalState.Failed ? '#D500F9' : '#1DE9B6'};
  padding: 0.25rem 0.4rem;
`;

const DetailText = styled(Box)`
padding: 0 0.2rem;

@media only screen and (min-width: 768px) {
  padding - right: 0.5rem;
}
`;

const ProposalStatus: React.FC<ProposalStatusProps> = ({
  endTime,
  status,
  bordered,
  hideTime,
  timeDetail,
}) => {
  return (
    <ProposalStatusWrapper>
      <Status test-id="proposal-status" bordered={hideTime ? false : bordered}>
        {!hideTime && (
          <DetailText>
            {timeDetail ? (
              <span title={endTime?.format('MMMM Do, YYYY - h:mm a')}>
                {timeDetail}
              </span>
            ) : (
              <Loading
                test-id="skeleton"
                loading
                text
                skeletonProps={{ width: '50px' }}
              />
            )}
          </DetailText>
        )}
        {status ? (
          <ProposalStatusDetail statusDetail={status}>
            {' '}
            {status}
          </ProposalStatusDetail>
        ) : (
          <Loading
            test-id="skeleton"
            loading
            text
            skeletonProps={{ width: '50px' }}
          />
        )}
      </Status>
    </ProposalStatusWrapper>
  );
};

export default ProposalStatus;
