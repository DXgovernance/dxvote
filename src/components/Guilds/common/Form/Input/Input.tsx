import React, { InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

const baseInputStyles = css`
  border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  :hover:enabled {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }

  :active:enabled {
    border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  }
  width: -webkit-fill-available;
`;

const InputWrapper = styled.div`
  ${baseInputStyles}
  display: flex;
  :hover {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
    & > input {
      background-color: ${({ theme }) => theme.colors.text};
      color: ${({ theme }) => theme.colors.background};
    }
  }
  :active:enabled {
    border: 0.1rem solid ${({ theme }) => theme.colors.muted};
    & > input {
      border: 0.1rem solid ${({ theme }) => theme.colors.muted};
    }
  }
`;

const InputBase = styled.input`
  border: none;
  width: 100%;
  &:focus,
  &:active,
  &:hover {
    outline: none;
    border: none;
  }
  margin-left: 12px;
  padding: 0;
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
