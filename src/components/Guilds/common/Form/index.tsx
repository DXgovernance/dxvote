import styled from 'styled-components';

export const InputText = styled.input`
  border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  margin: 0.2rem;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  :hover:enabled {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }

  :active:enabled {
    border: 0.1rem solid ${({ theme }) => theme.colors.muted};
  }

  width: 300px;
`;
