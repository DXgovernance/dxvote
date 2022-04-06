import React from 'react';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import StyledIcon from '../common/SVG';
import {
  RegistryContract,
  useContractRegistry,
} from 'hooks/Guilds/contracts/useContractRegistry';
import { useWeb3React } from '@web3-react/core';
import { SupportedAction } from '../ActionsBuilder/types';
import {
  ActionsButton,
  ButtonDetail,
  ButtonLabel,
  SectionTitle,
  SectionWrapper,
  Wrapper,
} from './styles';

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
      <SectionWrapper>
        <SectionTitle>Core</SectionTitle>
        <ActionsButton
          onClick={() =>
            onSupportedActionSelect(SupportedAction.ERC20_TRANSFER)
          }
        >
          <ButtonLabel>
            <StyledIcon src={Vector} />
            Transfer & Mint
          </ButtonLabel>
        </ActionsButton>
      </SectionWrapper>
      <SectionWrapper>
        <SectionTitle>External Contracts</SectionTitle>
        {contracts?.map(contract => (
          <ActionsButton onClick={() => onSelect(contract)}>
            <ButtonLabel>{contract.title}</ButtonLabel>
            <ButtonDetail>
              {contract.functions?.length}{' '}
              {contract.functions?.length > 1 ? 'Actions' : 'Action'}
            </ButtonDetail>
          </ActionsButton>
        ))}
      </SectionWrapper>
    </Wrapper>
  );
};

export default ContractsList;
