import { useRef, useState } from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { FiChevronDown } from 'react-icons/fi';
import { FiArrowLeft } from 'react-icons/fi';

import {
  DropdownMenu,
  DropdownContent,
  DropdownHeader,
} from '../common/DropdownMenu';
import { IconButton, Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';
import { useTransactionModal } from '../Web3Modals/TransactionModal';
import { useERC20 } from '../../../hooks/Guilds/contracts/useContract';
import { ZERO_ADDRESS } from '../../../utils';
import { BigNumber } from 'ethers';

const Icon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const UserActionButton = styled(IconButton)`
  border-radius: 10px;
  flex: 1;
  width: 100%;
`;

const MemberContainer = styled.div`
  padding: 20px;
`;

const ContentItem = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 14px;
  padding-bottom: 8px;
`;

const LockButton = styled(Button)`
  margin-top: 12px;
  width: 100%;
`;

export const MemberActions = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { createTransaction } = useTransactionModal();

  // Temporary code to test transactions provider
  const contract = useERC20('0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c');

  const lockDXD = async () => {
    // Sends a hardcoded transaction to test transactions provider
    createTransaction(`Approve token for ${ZERO_ADDRESS}`, async () =>
      contract.approve(ZERO_ADDRESS, BigNumber.from(1))
    );
  };

  const memberMenuRef = useRef(null);
  useDetectBlur(memberMenuRef, () => setShowMenu(false));
  return (
    <DropdownMenu ref={memberMenuRef}>
      <UserActionButton iconLeft onClick={() => setShowMenu(!showMenu)}>
        <Icon src={dxIcon} alt={'Icon'} />
        <span>geronimo.eth</span>
        <FiChevronDown />
      </UserActionButton>
      <DropdownContent fullScreenMobile={true} show={showMenu}>
        {isMobile && (
          <DropdownHeader noTopPadding onClick={() => setShowMenu(false)}>
            <FiArrowLeft /> <span>Membership</span>
          </DropdownHeader>
        )}
        <MemberContainer>
          <ContentItem>
            Voting Power <span>3.54%</span>
          </ContentItem>
          <ContentItem>
            Locked <span>3.54%</span>
          </ContentItem>
          <ContentItem>
            Unlocked in <span>542 days</span>
          </ContentItem>
          <LockButton onClick={() => lockDXD()}> Lock DXD</LockButton>
        </MemberContainer>
      </DropdownContent>
    </DropdownMenu>
  );
};
