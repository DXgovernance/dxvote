import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Option } from '../Option';

interface ProposalActionTagProps {
  option: Option;
}

const Tag = styled.span<ProposalActionTagProps>`
  margin: 0;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ color }) => color};
  border-color: ${({ color }) => color};
`;

export const ProposalOptionTag: React.FC<ProposalActionTagProps> = ({
  option,
}) => {
  const theme = useTheme();
  return <Tag color={theme?.colors?.votes?.[option.index]}>{option.label}</Tag>;
};
