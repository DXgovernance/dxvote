import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';

const UnstyledInput = styled.input`
  border: none;
  background: none;
  background-color: transparent;
  box-shadow: none;
  width: 100%;
  box-sizing: border-box;
  outline: none;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;

  border: 1px solid ${({ theme }) => theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  background-color: transparent;

  input {
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.body};
    font-weight: ${({ theme }) => theme.fontWeights.regular};

    &::placeholder {
      color: ${({ theme }) => theme.colors.proposalText.grey};
    }
  }

  :hover {
    outline: 1px solid ${({ theme }) => theme.colors.text};
  }

  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.text};
  }
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement;
  iconRight?: React.ReactElement;
}

const Input: React.FC<InputProps> = ({
  icon = null,
  iconRight = null,
  ...rest
}) => {
  return (
    <InputWrapper>
      {icon}
      <UnstyledInput {...rest} />
      {iconRight}
    </InputWrapper>
  );
};

export default Input;
