import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { FormElementProps } from './common';

const UnstyledInput = styled.input`
  border: none;
  background: none;
  background-color: transparent;
  box-shadow: none;
  width: 100%;
  box-sizing: border-box;
  outline: none;
`;

const InputWrapper = styled.div<{ isInvalid?: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;

  border: 1px solid
    ${({ theme, isInvalid }) =>
      isInvalid ? theme.colors.red : theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  background-color: transparent;

  input {
    color: ${({ theme, isInvalid }) =>
      isInvalid ? theme.colors.red : theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.body};
    font-weight: ${({ theme }) => theme.fontWeights.regular};

    &::placeholder {
      color: ${({ theme }) => theme.colors.proposalText.grey};
    }
  }

  :hover {
    outline: 1px solid
      ${({ theme, isInvalid }) =>
        isInvalid ? theme.colors.red : theme.colors.text};
  }

  :focus {
    outline: 2px solid
      ${({ theme, isInvalid }) =>
        isInvalid ? theme.colors.red : theme.colors.text};
  }
`;

const IconContainer = styled.div<{ right?: boolean }>`
  margin-${({ right }) => (right ? 'left' : 'right')}: 0.3rem;
`;

export interface InputProps<T>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>,
    FormElementProps<T> {
  icon?: React.ReactElement;
  iconRight?: React.ReactElement;
}

const Input: React.FC<InputProps<any>> = ({
  icon = null,
  iconRight = null,
  isInvalid,
  ...rest
}) => {
  return (
    <InputWrapper isInvalid={isInvalid}>
      <IconContainer>{icon}</IconContainer>
      <UnstyledInput {...rest} />
      <IconContainer right>{iconRight}</IconContainer>
    </InputWrapper>
  );
};

export default Input;
