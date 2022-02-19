import React from 'react';
import styled, { css } from 'styled-components';

export const ActionTypes = {
  for: 'for',
  against: 'against',
};

const getActionLabel = type => {
  return {
    [ActionTypes.for]: 'For',
    [ActionTypes.against]: 'Against',
  }[type];
};

interface ProposalActionTagProps {
  type: string | 'for' | 'against';
  label?: string;
}
const variantStyles = type =>
  ({
    [ActionTypes.for]: css`
      color: ${({ theme }) => theme.blue};
      border-color: ${({ theme }) => theme.blue};
    `,
    [ActionTypes.against]: css`
      color: ${({ theme }) => theme.red};
      border-color: ${({ theme }) => theme.red};
    `,
  }[type]);

const Tag = styled.span<ProposalActionTagProps>`
  margin: 0;
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  ${({ type }) => variantStyles(type)}
`;

export const ProposalActionTag: React.FC<ProposalActionTagProps> = ({
  type,
  label,
}) => {
  if (!Object.values(ActionTypes).includes(type)) return null;
  return <Tag type={type}>{label ? label : getActionLabel(type)}</Tag>;
};
