import React from 'react';
import styled from 'styled-components';

export const GlobalNotificationWrapper = styled.div<{
  type?: 'INFO' | 'ERROR';
}>`
  width: 100%;
  background-color: ${({ type }) => (type === 'ERROR' ? '#f44336' : '#4caf50')};
  padding: 1rem;
  text-align: center;
  color: #fff;
  font-weight: 500;
`;

interface GlobalNotificationProps {
  visible: boolean;
  message: string;
  type: 'INFO' | 'ERROR';
}

const GlobalNotification: React.FC<GlobalNotificationProps> = ({
  visible,
  message,
  type,
}) => {
  if (!visible) return null;

  return (
    <GlobalNotificationWrapper type={type}>{message}</GlobalNotificationWrapper>
  );
};

export default GlobalNotification;
