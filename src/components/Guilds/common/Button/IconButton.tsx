import styled from 'styled-components';
import { Button } from '.';

type IconButtonProps = {
  iconLeft?: boolean;
  iconRight?: boolean;
};

export const IconButton = styled(Button) <IconButtonProps>`
  svg,
  img {
    ${props => props.iconLeft && `margin-right: .4rem; `}
    ${props => props.iconRight && `margin-left: .2rem;`}
  },
  button {
    ${props => props.iconLeft && `padding: .25rem 0.6rem; border-color: #555;`};
`;

export const ButtonIcon = styled.img`
  height: 1.6rem;
  width: 1.6rem;
`;
