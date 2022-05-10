import { Button } from 'old-components/Guilds/common/Button';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';

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
