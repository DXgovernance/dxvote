import styled, { css } from 'styled-components';
import { Box } from '../common/Layout';

const Status = styled.div`
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

const Pill = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  border-radius: 1.5rem;
  padding: ${props => (props.padded ? '0.5rem 0.8rem' : '0')};
  color: ${props =>
    props.filled ? props.theme.colors.background : props.theme.colors.text};
  background-color: ${props =>
    props.filled ? props.theme.colors.text : 'transparent'};
  border: 1px solid ${({ theme }) => theme.colors.text};
`;

const DetailText = styled(Box)`
  padding-right: 0.2rem;

  @media only screen and (min-width: 768px) {
    padding-right: 0.5rem;
  }
`;

interface ProposalStatusProps {
  status: string;
  detail: string;
  bordered?: boolean;
}

const ProposalStatus: React.FC<ProposalStatusProps> = ({
  bordered,
  status,
  detail,
}) => {
  return (
    <Status bordered={bordered}>
      <DetailText>{detail}</DetailText>
      <Pill filled padded>
        {status}
      </Pill>
    </Status>
  );
};

export default ProposalStatus;
