import styled from 'styled-components';

export const Segment = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

export const MetadataTag = styled.span`
  padding: 0.125rem 0.375rem;
  background-color: ${({ theme }) => theme.colors.muted};
  border-radius: ${({ theme }) => theme.radii.curved};
`;
