import { CardWrapper, Header } from 'components/Guilds/common/Card';
import { Box } from 'components/Guilds/common/Layout';
import styled from 'styled-components';

export const EditorWrapper = styled(CardWrapper)`
  margin: 0.8rem 0;
`;

export const HeaderWrapper = styled(Header)`
  display: flex;
  align-items: center;
  margin: 0.875rem;
`;

export const IconWrapper = styled.span`
  display: flex;
  margin-right: 0.875rem;
`;

export const TitleWrapper = styled(Box)`
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

export const DetailWrapper = styled(Box)`
  color: ${({ theme }) => theme.colors.proposalText.grey};
  padding: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.initial};
`;

export const FooterWrapper = styled(DetailWrapper)`
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem 1.25rem;
`;
