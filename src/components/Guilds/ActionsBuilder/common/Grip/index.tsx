import styled from 'styled-components';
import { FaGripVertical } from 'react-icons/fa';

const Grip = styled(FaGripVertical)`
  cursor: grabbing;
  color: ${({ theme }) => theme.colors.proposalText.lightGrey};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default Grip;
