import Avatar from 'components/Guilds/Avatar';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useMemo } from 'react';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';

interface REPMintState {
  toAddress: string;
  amount: BigNumber;
}

const REPMintSummary: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const parsedData = useMemo<REPMintState>(() => {
    if (!decodedCall) return null;
    return {
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
  }, [decodedCall]);

  const { ensName, imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);

  const roundedRepAmount = useBigNumberToNumber(parsedData?.amount, 1, 3) * 10;

  return (
    <>
      <DetailHeader>
        <DetailCell>Receiver</DetailCell>
        <DetailCell>Amount</DetailCell>
      </DetailHeader>

      <DetailRow>
        <DetailCell>
          <Segment>
            <Avatar
              defaultSeed={parsedData?.toAddress}
              src={imageUrl}
              size={24}
            />
          </Segment>
          <Segment>{ensName || shortenAddress(parsedData?.toAddress)}</Segment>
        </DetailCell>
        <DetailCell>{roundedRepAmount} REP</DetailCell>
      </DetailRow>
    </>
  );
};

export default REPMintSummary;
