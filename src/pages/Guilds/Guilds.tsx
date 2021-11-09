import React from 'react';
import styled from 'styled-components';
import { Button, IconButton } from '../../components/Guilds/common/Button';
import { Box } from '../../components/Guilds/common/Layout';
import icon from '../../assets/images/dxdao-icon.svg';
import Sidebar from '../../components/Guilds/Sidebar';

const PageContainer = styled(Box)`
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
`;

const GuildsPage: React.FC = () => {
  return (
    <PageContainer>
      <Sidebar />
      <div>
        <Button>Test</Button>
        <Button disabled>Test</Button>

        <IconButton iconLeft iconRight>
          <img
            src={icon}
            alt={'Icon'}
            style={{
              height: '1.1rem',
              width: '1.1rem',
            }}
          />
          Test
          <img
            src={icon}
            alt={'Icon'}
            style={{
              height: '1.1rem',
              width: '1.1rem',
            }}
          />
        </IconButton>
      </div>
    </PageContainer>
  );
};

export default GuildsPage;
