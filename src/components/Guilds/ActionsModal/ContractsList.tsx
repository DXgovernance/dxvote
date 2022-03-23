import React from 'react';
import styled from 'styled-components';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { Button } from '../common/Button';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import StyledIcon from '../common/SVG';
import {
  RegistryContract,
  useContractRegistry,
} from 'hooks/Guilds/contracts/useContractRegistry';
import { useWeb3React } from '@web3-react/core';
import { SupportedAction } from '../ActionsBuilder/types';

const CoreWrapper = styled(Flex)`
  width: 100%;
  margin-bottom: 16px;
`;

const ExternalWrapper = styled(Flex)`
  width: 100%;
`;

const Wrapper = styled(Flex)`
  width: 100%;
  margin: 24px auto;
`;

const ActionsButton = styled(Button).attrs(() => ({
  variant: 'secondary',
}))`
  width: 90%;
  height: 40px;
  margin: 6px 0;
  flex-direction: row;
  justify-content: left;
  &:active,
  &:focus {
    border: 2px solid ${({ theme }) => theme.colors.text};
  }
`;

const WrapperText = styled(ContainerText).attrs(() => ({
  variant: 'bold',
}))`
  justify-content: left;
  flex-direction: row;
  width: 85%;
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ButtonText = styled(ContainerText).attrs(() => ({
  variant: 'medium',
}))`
  justify-content: space-between;
  flex-direction: row;
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ExternalButton = styled(ActionsButton).attrs(() => ({
  variant: 'secondary',
}))`
  justify-content: space-between;
`;

interface ContractsListProps {
  onSelect: (contract: RegistryContract) => void;
  onSupportedActionSelect: (actionType: SupportedAction) => void;
}

const ContractsList: React.FC<ContractsListProps> = ({
  onSelect,
  onSupportedActionSelect,
}) => {
  const { chainId } = useWeb3React();
  const { contracts } = useContractRegistry(chainId);

  return (
    <Wrapper>
      <CoreWrapper>
        <WrapperText>Core</WrapperText>
        <ActionsButton
          onClick={() =>
            onSupportedActionSelect(SupportedAction.ERC20_TRANSFER)
          }
        >
          <StyledIcon src={Vector} />
          Transfer & Mint
        </ActionsButton>
      </CoreWrapper>
      <ExternalWrapper>
        <WrapperText>External Contracts</WrapperText>
        {contracts?.map(contract => (
          <ExternalButton onClick={() => onSelect(contract)}>
            {contract.title}
            <ButtonText>
              {contract.functions?.length}{' '}
              {contract.functions?.length > 1 ? 'Actions' : 'Action'}
            </ButtonText>
          </ExternalButton>
        ))}
      </ExternalWrapper>
    </Wrapper>
  );
};

export default ContractsList;
