import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';

const Button = styled.div`
    background-color: ${(props) => props.color || '#536DFE'};
    border-radius: 4px;
    color: white;
    height: 34px;
    letter-spacing: 1px;
    font-weight: 500;
    line-height: 34px;
    text-align: center;
    cursor: pointer;
    width: max-content;
    padding: 0px 10px;
    margin: 5px;
`;

const ButtonWithRouter = withRouter(
  ({ option, route, history, location, children, color }) => {
    return (
      <Button color={color} onClick={() => { history.push(route)}} >
        {children}
      </Button>
    );
  }
);
const ActiveButton = ({ children, onClick, route, color }) => {
    if (route) {
      return <ButtonWithRouter color={color} route={route}>{children}</ButtonWithRouter>
    } else {
      return <Button color={color} onClick={onClick}>{children}</Button>;
    }
};

export default ActiveButton;
