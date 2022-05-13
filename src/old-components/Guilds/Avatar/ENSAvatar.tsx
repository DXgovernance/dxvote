import styled from 'styled-components';
import React from 'react';
import useENSAvatar from '../../../hooks/Guilds/ether-swr/ens/useENSAvatar';
import Avatar from '.';
import { Loading } from 'Components/Primitives/Loading';

const ENSAvatarContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  line-height: 0;
`;

interface ENSAvatarProps {
  address?: string;
  size?: number;
}

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
