import { RichContractData } from 'hooks/Guilds/contracts/useRichContractRegistry';
import {
  ActionsButton,
  ButtonDetail,
  ButtonLabel,
  SectionTitle,
  SectionWrapper,
  Wrapper,
} from './styles';
interface ContractActionsListProps {
  contract: RichContractData;
  onSelect: (functionName: string) => void;
}

const ContractActionsList: React.FC<ContractActionsListProps> = ({
  contract,
  onSelect,
}) => {
  return (
    <Wrapper>
      <SectionWrapper>
        <SectionTitle>
          {contract.functions.length}{' '}
          {contract.functions.length >= 2 ? 'Actions' : 'Action'}
        </SectionTitle>
        {contract.functions.map(contractFunction => (
          <ActionsButton
            vertical
            onClick={() => onSelect(contractFunction.functionName)}
          >
            <ButtonLabel>{contractFunction.title}</ButtonLabel>
            <ButtonDetail vertical>
              {contractFunction.functionName}(
              {contractFunction.params.reduce(
                (acc, cur, i) =>
                  acc.concat(
                    cur.type,
                    i === contractFunction.params.length - 1 ? '' : ', '
                  ),
                ''
              )}
              )
            </ButtonDetail>
          </ActionsButton>
        ))}
      </SectionWrapper>
    </Wrapper>
  );
};

export default ContractActionsList;
