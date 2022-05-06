import { FiExternalLink } from 'react-icons/fi';
import styled, { css } from 'styled-components';
import { Box } from '../../common/Layout';

const InfoItemWrapper = styled(Box)`
  display: flex;
  flex: 1;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.proposalText.grey};
  margin-bottom: 1.25rem;

  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;

      :hover {
        color: ${({ theme }) => theme.colors.text};
      }
    `}
`;

const InfoItemText = styled(Box)`
  width: 100%;
`;

const InfoItemTitle = styled(Box)`
  margin-bottom: 0.4rem;
  font-weight: 600;
`;

const InfoItemDescription = styled(Box)`
  font-size: 0.75rem;
`;

const InfoItemLink = styled.a`
  height: 2rem;
  width: 2rem;
  color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface InfoItemProps {
  title: string;
  description: string;
  link?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ title, description, link }) => {
  return (
    <InfoItemWrapper clickable={link}>
      <InfoItemText>
        <InfoItemTitle>{title}</InfoItemTitle>
        <InfoItemDescription>{description}</InfoItemDescription>
      </InfoItemText>
      {link && (
        <InfoItemLink href={link}>
          <FiExternalLink />
        </InfoItemLink>
      )}
    </InfoItemWrapper>
  );
};

export default InfoItem;
