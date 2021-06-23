import styled, { keyframes } from 'styled-components';
import { darken } from 'polished';


export const Link = styled.a.attrs({
    target: '_blank',
    rel: 'noopener noreferrer',
})`
    text-decoration: none;
    cursor: pointer;
    color: var(--turquois-text);

    :focus {
        outline: none;
        text-decoration: underline;
    }

    :active {
        text-decoration: none;
    }
`;

export const Box = styled.div
`
  border: 1px solid #E1E3E7;
  padding: 10px 0px;
  background: white;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.borderStyle};
`
