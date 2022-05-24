import styled from 'styled-components';
import React from 'react';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from '../Primitives/Avatar';
import { Loading } from 'Components/Primitives/Loading';
import { ENSAvatarProps } from './types';

const ENSAvatarContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  line-height: 0;
`;

const ENSAvatar: React.FC<ENSAvatarProps> = ({ address, size = 24 }) => {
  const { imageUrl } = useENSAvatar(address, 1);

  return (
    <ENSAvatarContainer>
      {address ? (
        <Avatar src={imageUrl} defaultSeed={address} size={size} />
      ) : (
        <Loading
          loading
          text
          skeletonProps={{
            circle: true,
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
      )}
    </ENSAvatarContainer>
  );
};

export default ENSAvatar;
