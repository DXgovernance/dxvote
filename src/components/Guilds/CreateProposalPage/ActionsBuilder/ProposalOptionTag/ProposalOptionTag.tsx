import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Option } from '../Option';

interface ProposalActionTagProps {
  option: Option;
}

const Tag = styled.span<ProposalActionTagProps>`
  margin: 0;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ color }) => color};
  border-color: ${({ color }) => color};
`;

export const ProposalOptionTag: React.FC<ProposalActionTagProps> = ({
  option,
}) => {
  const theme = useTheme();
  return <Tag color={theme?.colors?.votes?.[option.index]}>{option.label}</Tag>;
};
