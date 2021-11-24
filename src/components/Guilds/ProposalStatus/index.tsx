import styled from 'styled-components';
import { Box } from '../common/Layout';

const Pill = styled(Box)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 1.5rem;
  padding: ${props => (props.padded ? '0.5rem 0.8rem' : '0')};
  color: ${props => (props.filled ? '#fff' : '#000')};
  background-color: ${props => (props.filled ? '#000' : 'transparent')};
  border: 1px solid ${props => (props.bordered ? '#000' : 'transparent')};
`;

const DetailText = styled(Box)`
    padding: 0.5rem;
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
    <Pill bordered={bordered}>
      <DetailText>{detail}</DetailText>
      <Pill filled padded>
        {status}
      </Pill>
    </Pill>
  );
};

export default ProposalStatus;
