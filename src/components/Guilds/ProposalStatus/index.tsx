import styled from 'styled-components';
import { Box } from '../common/Layout';
const Status = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
`;

const Pill = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 1.5rem;
  padding: ${props => (props.padded ? '0.5rem 0.8rem' : '0')};
  color: ${props => (props.filled ? props.theme.colors.background : props.theme.colors.text)};
  background-color: ${props => (props.filled ? props.theme.colors.text : 'transparent')};
  border: 1px solid ${props => (props.bordered ? props.theme.colors.text : 'transparent')};
`;

const DetailText = styled(Box)`
  padding: 0.2rem;
  @media only screen and (min-width: 768px) {
    padding: 0.5rem;
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
