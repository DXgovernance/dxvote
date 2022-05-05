import React from 'react';
import { ReactComponent as Vector } from '../../../assets/images/vector.svg';
import { ReactComponent as Mint } from '../../../assets/images/mint.svg';
import StyledIcon from '../common/SVG';
import {
  RichContractData,
  useRichContractData,
} from 'hooks/Guilds/contracts/useRichContractData';
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
import { useParams } from 'react-router-dom';

interface ContractsListProps {
  onSelect: (contract: RichContractData) => void;
  onSupportedActionSelect: (actionType: SupportedAction) => void;
}

const ContractsList: React.FC<ContractsListProps> = ({
  onSelect,
  onSupportedActionSelect,
}) => {
  const { chainId } = useWeb3React();
  const { contracts } = useRichContractData(chainId);
  const { guild_id: guildAddress } =
    useParams<{ chain_name?: string; guild_id?: string }>();
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
