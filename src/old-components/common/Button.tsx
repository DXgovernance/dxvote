import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';

export const Button = styled.button<{ width?: number | string }>`
  background-color: ${({ theme }) => theme.activeButtonBackground};
  border-radius: 4px;
  color: white;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  width: ${props => (props.width ? props.width : 'max-content')};
  padding: 0px 10px;
  margin: 5px;
  border: 0px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  :disabled {
    opacity: 0.4;
    cursor: auto;
  }
`;

interface LinkButtonProps {
  route: string;
  children: React.ReactNode;
}

// Using `any` type as workaround to https://github.com/microsoft/TypeScript/issues/42873
export const LinkButton: any = withRouter(
  ({
    route,
    history,
    children,
    ...rest
  }: LinkButtonProps & RouteComponentProps) => {
    return (
      <Button
        onClick={() => {
          history.push(route);
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);
