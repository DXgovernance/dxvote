import React from 'react';
import { Button, IconButton } from '../../components/Guilds/common/Button';
import icon from '../../assets/images/dxdao-icon.svg';

const GuildsPage: React.FC = () => {
  return (
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
  );
};

export default GuildsPage;
