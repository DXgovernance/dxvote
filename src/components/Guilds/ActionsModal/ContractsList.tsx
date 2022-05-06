import React from 'react';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import { ReactComponent as Mint } from '../../../assets/images/mint.svg';
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
import useGuildImplementationTypeConfig from 'hooks/Guilds/guild/useGuildImplementationType';
import { useTypedParams } from 'stories/Modules/Guilds/Hooks/useTypedParams';

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
