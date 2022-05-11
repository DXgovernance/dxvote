import { ReactComponent as Mint } from '../../../assets/images/mint.svg';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import { SupportedAction } from '../ActionsBuilder/types';
import StyledIcon from '../common/SVG';
import {
  ActionsButton,
  ButtonDetail,
  ButtonLabel,
  SectionTitle,
  SectionWrapper,
  Wrapper,
} from './styles';
import { useWeb3React } from '@web3-react/core';
import { useTypedParams } from 'Modules/Guilds/Hooks/useTypedParams';
import useGuildImplementationTypeConfig from 'hooks/Guilds/guild/useGuildImplementationType';
import React from 'react';
import {
  RichContractData,
  useRichContractRegistry,
} from 'hooks/Guilds/contracts/useRichContractRegistry';

interface ContractsListProps {
  onSelect: (contract: RichContractData) => void;
  onSupportedActionSelect: (actionType: SupportedAction) => void;
}

const ContractsList: React.FC<ContractsListProps> = ({
  onSelect,
  onSupportedActionSelect,
}) => {
  const { chainId } = useWeb3React();
  const { contracts } = useRichContractRegistry(chainId);
  const { guildId: guildAddress } = useTypedParams();
  const { isRepGuild } = useGuildImplementationTypeConfig(guildAddress);
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
        {isRepGuild ? (
          <ActionsButton
            onClick={() => onSupportedActionSelect(SupportedAction.REP_MINT)}
          >
            <ButtonLabel>
              <StyledIcon src={Mint} />
              Mint REP
            </ButtonLabel>
          </ActionsButton>
        ) : null}
      </SectionWrapper>
      <SectionWrapper>
        <SectionTitle>External Contracts</SectionTitle>
        {contracts?.map(contract => (
          <ActionsButton
            key={contract.title}
            onClick={() => onSelect(contract)}
          >
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
