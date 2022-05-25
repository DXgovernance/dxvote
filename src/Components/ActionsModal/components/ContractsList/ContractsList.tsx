import { useWeb3React } from '@web3-react/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as Mint } from 'assets/images/mint.svg';
import { ReactComponent as Vector } from 'assets/images/vector.svg';
import { SupportedAction } from 'old-components/Guilds/ActionsBuilder/types';
import StyledIcon from 'old-components/Guilds/common/SVG';
import {
  ActionsButton,
  ButtonDetail,
  ButtonLabel,
  SectionTitle,
  SectionWrapper,
  Wrapper,
} from '../../ActionsModal.styled';
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
  const { t } = useTranslation();
  const { chainId } = useWeb3React();
  const { contracts } = useRichContractRegistry(chainId);
  const { guildId: guildAddress } = useTypedParams();
  const { isRepGuild } = useGuildImplementationTypeConfig(guildAddress);
  return (
    <Wrapper data-testid="actions-modal-contract-list">
      <SectionWrapper>
        <SectionTitle>{t('core')}</SectionTitle>
        <ActionsButton
          data-testid="supported-action-erc20transfer"
          onClick={() =>
            onSupportedActionSelect(SupportedAction.ERC20_TRANSFER)
          }
        >
          <ButtonLabel>
            <StyledIcon src={Vector} />
            {t('guilds.createProposal.transferAndMint')}
          </ButtonLabel>
        </ActionsButton>
        {isRepGuild ? (
          <ActionsButton
            onClick={() => onSupportedActionSelect(SupportedAction.REP_MINT)}
          >
            <ButtonLabel>
              <StyledIcon src={Mint} />
              {t('guilds.createProposal.mintRep')}
            </ButtonLabel>
          </ActionsButton>
        ) : null}
      </SectionWrapper>
      <SectionWrapper>
        <SectionTitle>
          {t('guilds.createProposal.externalContracts')}
        </SectionTitle>
        {contracts?.map(contract => (
          <ActionsButton
            key={contract.title}
            onClick={() => onSelect(contract)}
          >
            <ButtonLabel>{contract.title}</ButtonLabel>
            <ButtonDetail>
              {contract.functions?.length}{' '}
              {t('actions', {
                count: contract.functions.length,
              })}
            </ButtonDetail>
          </ActionsButton>
        ))}
      </SectionWrapper>
    </Wrapper>
  );
};

export default ContractsList;
