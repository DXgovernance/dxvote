import styled from 'styled-components';
import { Flex } from '../common/Layout';
import { ContainerText } from '../common/Layout/Text';
import { Button } from '../common/Button';
import { RegistryContract } from 'hooks/Guilds/contracts/useContractRegistry';

const Wrapper = styled(Flex)`
  margin: 16px auto;
`;
const WrapperText = styled(ContainerText).attrs(() => ({
  variant: 'bold',
}))`
  justify-content: left;
  flex-direction: row;
  width: 85%;
  margin: 8px auto;
  color: ${({ theme }) => theme.colors.proposalText.grey};
`;

const ExternalWrapper = styled(Flex)`
  width: 100%;
  margin: 8px auto;
`;

const ButtonText = styled(ContainerText).attrs(() => ({
  variant: 'medium',
}))`
  justify-content: space-between;
  flex-direction: row;
`;

const ActionsButton = styled(Button)`
  width: 90%;
  margin: 6px 0;
  flex-direction: column;
  justify-content: left;
  border-radius: 10px;
  &:active,
  &:focus {
    border: 2px solid ${({ theme }) => theme.colors.text};
  }
`;

interface ContractActionsListProps {
  contract: RegistryContract;
  onSelect: (functionName: string) => void;
}

const ContractActionsList: React.FC<ContractActionsListProps> = ({
  contract,
  onSelect,
}) => {
  return (
    <Wrapper>
      <ExternalWrapper>
        <WrapperText>6 Actions</WrapperText>
        {contract.functions.map(contractFunction => (
          <ActionsButton
            variant="secondary"
            onClick={() => onSelect(contractFunction.functionName)}
          >
            {contractFunction.title}
            <ButtonText>{contractFunction.functionName}</ButtonText>
          </ActionsButton>
        ))}
      </ExternalWrapper>
    </Wrapper>
  );
};

export default ContractActionsList;
