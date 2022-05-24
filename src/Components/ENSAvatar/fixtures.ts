import { ENSAvatarProps } from './types';

export const withAvatarNFT: ENSAvatarProps = {
  address: '0x0b17cf48420400e1D71F8231d4a8e43B3566BB5B',
};

export const withoutAvatarNFT: ENSAvatarProps = {
  address: '0x519b70055af55A007110B4Ff99b0eA33071c720a',
};

export const customSize: ENSAvatarProps = {
  ...withAvatarNFT,
  size: 100,
};
