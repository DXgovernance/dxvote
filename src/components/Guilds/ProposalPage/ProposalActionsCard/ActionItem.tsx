import { useState } from 'react';
import { FaChevronCircleDown, FaChevronCircleUp } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';
import styled from 'styled-components';
import dxIcon from '../../../../assets/images/dxdao-icon.svg';
import { ButtonIcon, IconButton } from '../../common/Button';
import { Box } from '../../common/Layout';
import ActionDetails from './ActionDetails';

const ProposalActionItem = styled(Box)`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};

  &:last-child {
    border-bottom: none;
  }
`;

const ProposalActionRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  align-items: center;
`;

const ProposalActionTitle = styled(Box)`
  display: flex;
  align-items: center;
  span {
    font-size: 14px;
  }
  color: ${({ theme }) => theme.colors.text};
`;

const FiArrowRightSpaced = styled(FiArrowRight)`
  padding: 0 0.5rem;
`;

const ActionDetailsRow = styled(Box)`
  margin-top: 1.5rem;
  margin-bottom: 1rem;
`;

const ActionItem = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ProposalActionItem>
      <ProposalActionRow onClick={() => setIsOpen(!isOpen)}>
        <ProposalActionTitle>
          <span>Issue 0.001% REP (1 REP)</span> <FiArrowRightSpaced />
          <IconButton variant="minimal" iconLeft>
            <ButtonIcon src={dxIcon} alt={'Icon'} />
            geronimo.eth
          </IconButton>
        </ProposalActionTitle>
        {isOpen ? <FaChevronCircleUp /> : <FaChevronCircleDown />}
      </ProposalActionRow>
      {isOpen && (
        <ActionDetailsRow>
          <ActionDetails />
        </ActionDetailsRow>
      )}
    </ProposalActionItem>
  );
};

export default ActionItem;
