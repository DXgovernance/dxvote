import styled from 'styled-components';

export const NotificationHeading = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

export const NotificationDetail = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes.label};
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0.3rem;

  a {
    text-decoration: initial;
    color: initial;
  }
`;
