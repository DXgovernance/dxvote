import React, { InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

const baseInputStyles = css`
  border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  margin-right: 1rem;
  ::placeholder {
    color: ${({ theme }) => theme.colors.proposalText.lightGrey};
  }
  :hover:enabled {
    color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  :active:enabled {
    border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  }
  width: -webkit-fill-available;

  :focus:enabled {
    outline: none;
    border-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const InputWrapper = styled.div`
  ${baseInputStyles}
  display: flex;
  width: 100%;
  &:hover, 
  &:focus {
    border: 0.1rem solid ${({ theme }) => theme.colors.text};
  }
`;

const InputBase = styled.input`
  border: none;
  &:focus,
  &:active,
  &:hover {
    outline: none;
    border: none;
    color: ${({ theme }) => theme.colors.text};
  }
  margin-left: 12px;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BaseInput = styled.input`
  ${baseInputStyles}
`;

const InputText = styled(BaseInput)`
  width: 300px;
  margin: 0.2rem;
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement;
}

const Input: React.FC<InputProps> = ({ icon = null, ...rest }) => {
  return !!icon ? (
    <InputWrapper>
      {icon}
      <InputBase {...rest} />
    </InputWrapper>
  ) : (
    <BaseInput {...rest} />
  );
};

export { BaseInput, InputText, Input };
