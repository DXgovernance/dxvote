import styled from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  border: 0.1rem solid #000;
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  margin: 0.2rem;
  background-color: #fff;
  text-align: center;
  cursor: pointer;
  font-size: 0.95rem;
  text-weight: 500;

  :hover:enabled {
    background-color: #000;
    color: #fff;
  }

  :active:enabled {
    border: 0.1rem solid #ccc;
  }

  :disabled {
    color: initial;
    opacity: 0.4;
    cursor: auto;
  }
`;