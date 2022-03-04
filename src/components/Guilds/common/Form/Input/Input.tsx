import React, { InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { FiX } from 'react-icons/fi';

const baseInputStyles = css`
  border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
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
  width: ${({ width }) => (width ? width : '100%')};
  &:hover,
  &:focus {
    border: 0.1rem solid ${({ theme }) => theme.colors.text};
  }
`;

const InputBase = styled.input`
  display: flex;
  border: none;
  width: 100%;
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

const CloseIcon = styled(FiX)`
  color: ${({ theme }) => theme.colors.text};
  height: 1.5rem;
  width: 1.5rem;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`;

const IconWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '24px')};
    width: ${({ size }) => (size ? size + 'px' : '24px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactElement | string;
  size?: number;
  cross?: boolean;
}

const Input: React.FC<InputProps> = ({
  icon = null,
  cross,
  size,
  width,
  ...rest
}) => {
  console.log(typeof icon);

  return !!icon ? (
    <InputWrapper width={width}>
      <IconWrapper size={size}>
        {icon == typeof 'React.ReactElement' ? (
          icon
        ) : (
          <img src={icon as string} alt={'Icon'} />
        )}
      </IconWrapper>
      <InputBase {...rest} />
      {cross && <CloseIcon />}
    </InputWrapper>
  ) : (
    <InputWrapper width={width}>
      <InputBase {...rest} />
      {cross && <CloseIcon />}
    </InputWrapper>
  );
};

export { BaseInput, InputText, Input };
