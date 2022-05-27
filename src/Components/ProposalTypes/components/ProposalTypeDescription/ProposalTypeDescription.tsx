import { useTranslation } from 'react-i18next';

import {
  Container,
  PaddingWrapper,
  StyledProposalDescription,
} from '../../ProposalTypes.styled';
import { ContainerText } from 'Components/Primitives/Layout/Text';
import { ProposalTypeDescriptionProps } from '../../types';

const ProposalTypeDescription: React.FC<ProposalTypeDescriptionProps> = ({
  description,
  title,
  onChainAction,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <PaddingWrapper>
        <StyledProposalDescription>
          <ContainerText variant="bold" color="#fff">
            {title}
          </ContainerText>
          <ContainerText variant="medium" color="#BDC0C7">
            {description}
          </ContainerText>
          <ContainerText variant="medium" color="#BDC0C7">
            {t(onChainAction ? 'onchainAction' : 'noOnchainAction')}
          </ContainerText>
        </StyledProposalDescription>
      </PaddingWrapper>
    </Container>
  );
};

export default ProposalTypeDescription;
