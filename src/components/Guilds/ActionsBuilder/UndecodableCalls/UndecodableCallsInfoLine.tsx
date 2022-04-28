import styled, { useTheme } from 'styled-components';
import { FiAlertCircle } from 'react-icons/fi';
import { Segment } from '../SupportedActions/common/infoLine';

const SegmentRed = styled(Segment)`
  color: ${({ theme }) => theme.colors.red};
`;

const UndecodableCallInfoLine: React.FC = () => {
  const theme = useTheme();
  return (
    <>
      <Segment>
        <FiAlertCircle size={16} color={theme.colors.red} />
      </Segment>
      <SegmentRed>Unknown Action</SegmentRed>
    </>
  );
};

export default UndecodableCallInfoLine;
