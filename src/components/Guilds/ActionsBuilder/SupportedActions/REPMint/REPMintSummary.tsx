import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
// import { useMemo } from 'react';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';
import { useWeb3React } from '@web3-react/core';

const REPMintSummary: React.FC<ActionViewProps> = ({ decodedCall }) => {
  // const parsedData = useMemo(() => {
  //   if (!decodedCall) return null;

  //   return {
  //     tokenAddress: decodedCall.to,
  //     amount: BigNumber.from(decodedCall.args._value),
  //     source: decodedCall.from,
  //     destination: decodedCall.args._to,
  //   };
  // }, [decodedCall]);

  const { account: userAddress } = useWeb3React();
  const { ensName, imageUrl } = useENSAvatar(userAddress, MAINNET_ID);

  return (
    <>
      <DetailHeader>
        <DetailCell>Receiver</DetailCell>
        <DetailCell>Amount</DetailCell>
      </DetailHeader>

      <DetailRow>
        <DetailCell>
          <Segment>
            <Avatar defaultSeed={userAddress} src={imageUrl} size={24} />
          </Segment>
          <Segment>{ensName || shortenAddress(userAddress)}</Segment>
        </DetailCell>
        <DetailCell>100 REP</DetailCell>
      </DetailRow>
    </>
  );
};

export default REPMintSummary;
