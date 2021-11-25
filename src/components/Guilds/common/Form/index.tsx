import styled from 'styled-components';

export const InputText = styled.input`
  border: 0.1rem solid #000;
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  margin: 0.2rem;
  background-color: #fff;

  :hover:enabled {
    background-color: #000;
    color: #fff;
  }

  :active:enabled {
    border: 0.1rem solid #ccc;
  }

  width: 300px;
`;
