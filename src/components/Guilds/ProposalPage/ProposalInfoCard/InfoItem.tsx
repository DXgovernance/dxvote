import { FiExternalLink } from 'react-icons/fi';
import styled from 'styled-components';
import { Box } from '../../common/Layout';

const InfoItemWrapper = styled(Box)`
  display: flex;
`;

const InfoItemIcon = styled(Box)`
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.text};
  display: flex;
  justify-content: center;
  align-items: center;

  svg,
  img {
    height: 1rem;
  }
`;

const InfoItemContent = styled(Box)`
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

const InfoItemText = styled(Box)`
  margin-left: 1rem;
  width: 100%;
  font-weight: 600;
`;

const InfoItemTitle = styled(Box)`
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
`;

const InfoItemDescription = styled(Box)`
  font-size: 0.75rem;
`;

const InfoItemLink = styled.a`
  height: 2rem;
  width: 2rem;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface InfoItemProps {
  title: string;
  description: string;
  icon: JSX.Element;
  link?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  title,
  description,
  link,
  icon,
}) => {
  return (
    <InfoItemWrapper>
      <InfoItemIcon>{icon}</InfoItemIcon>
      <InfoItemContent>
        <InfoItemText>
          <InfoItemTitle>{title}</InfoItemTitle>
          <InfoItemDescription>{description}</InfoItemDescription>
        </InfoItemText>
        {link && (
          <InfoItemLink href={link}>
            <FiExternalLink />
          </InfoItemLink>
        )}
      </InfoItemContent>
    </InfoItemWrapper>
  );
};

export default InfoItem;
