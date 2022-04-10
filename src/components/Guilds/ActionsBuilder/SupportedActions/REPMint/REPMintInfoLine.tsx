import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
// import { useMemo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

const REPMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const { account: userAddress } = useWeb3React();
  const { ensName, imageUrl } = useENSAvatar(userAddress, MAINNET_ID);
  // const parsedData = useMemo(() => {
  //   if (!decodedCall) return null;

  //   return {
  //     tokenAddress: decodedCall.to,
  //     amount: BigNumber.from(decodedCall.args._value),
  //     source: decodedCall.from,
  //     destination: decodedCall.args._to as string,
  //   };
  // }, [decodedCall]);

  return (
    <>
      <Segment>
        <StyledMintIcon src={Mint} />
      </Segment>
      <Segment>Mint {''}</Segment>
      <Segment>
        <FiArrowRight />
      </Segment>
      <Segment>
        <Avatar defaultSeed={userAddress} src={imageUrl} size={24} />
      </Segment>
      <Segment>{ensName || shortenAddress(userAddress)}</Segment>
    </>
  );
};

export default REPMintInfoLine;
