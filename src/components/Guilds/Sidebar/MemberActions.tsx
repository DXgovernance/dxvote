import { useRef, useState } from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { useWeb3React } from '@web3-react/core';
import { FiArrowLeft } from 'react-icons/fi';
import { useParams } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownContent,
  DropdownHeader,
} from '../common/DropdownMenu';
import { IconButton, Button } from '../common/Button';
import dxIcon from '../../../assets/images/dxdao-icon.svg';

import { useDetectBlur } from 'hooks/Guilds/useDetectBlur';
import { useERC20 } from '../../../hooks/Guilds/contracts/useContract';
import { ZERO_ADDRESS } from '../../../utils';
import { BigNumber } from 'ethers';
import { useTransactions } from '../../../contexts/Guilds';
import { useVotingPowerOf } from '../../../hooks/Guilds/ether-swr/useVotingPowerOf';

const Icon = styled.img`
  height: 1.1rem;
  width: 1.1rem;
`;

const UserActionButton = styled(IconButton)`
  border-radius: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  & > div:first-child {
    display: flex;
  }
`;

const VotingPower = styled.div`
  background-color: #000;
  color: #fff;
  border-radius: 32px;
  padding: 2px 8px;
  font-weight: 500;
  font-size: 14px;
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
  const { createTransaction } = useTransactions();
  const { guild_id: contractAddress } = useParams<{ guild_id?: string }>();
  const { account: userAddress } = useWeb3React();
  // TODO: Parse votingPower value to represent in percentage
  const { data: votingPower } = useVotingPowerOf({
    contractAddress,
    userAddress,
  });

  // Temporary code to test transactions provider
  const contract = useERC20('0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c');

  const lockDXD = async () => {
    // Sends a hardcoded transaction to test transactions provider
    createTransaction(`Approve token`, async () =>
      contract.approve(ZERO_ADDRESS, BigNumber.from(1))
    );
  };

  const memberMenuRef = useRef(null);
  useDetectBlur(memberMenuRef, () => setShowMenu(false));
  return (
    <DropdownMenu ref={memberMenuRef}>
      <UserActionButton iconLeft onClick={() => setShowMenu(!showMenu)}>
        <div>
          <Icon src={dxIcon} alt={'Icon'} />
          <span>geronimo.eth</span>
        </div>
        <VotingPower>{votingPower?.toString() ?? 0}%</VotingPower>
      </UserActionButton>
      <DropdownContent fullScreenMobile={true} show={showMenu}>
        {isMobile && (
          <DropdownHeader noTopPadding onClick={() => setShowMenu(false)}>
            <FiArrowLeft /> <span>Membership</span>
          </DropdownHeader>
        )}
        <MemberContainer>
          <ContentItem>
            Voting Power <span>{votingPower?.toString() ?? 0}%</span>
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
