import styled from 'styled-components';
import { Button } from '.';

type IconButtonProps = {
  iconLeft?: boolean;
  iconRight?: boolean;
};

export const IconButton = styled(Button)<IconButtonProps>`
  svg,
  img {
    ${props => props.iconLeft && `margin-right: 0.2rem;`}
    ${props => props.iconRight && `margin-left: 0.2rem;`}
  }
`;
