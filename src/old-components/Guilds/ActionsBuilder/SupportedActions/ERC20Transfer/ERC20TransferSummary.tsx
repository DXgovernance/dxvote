import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import Avatar from 'Components/Primitives/Avatar';
import { useMemo } from 'react';
import { MAINNET_ID, shortenAddress } from 'utils';

const ERC20TransferSummary: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const parsedData = useMemo(() => {
    if (!decodedCall) return null;

    return {
      tokenAddress: decodedCall.to,
      amount: BigNumber.from(decodedCall.args._value),
      source: decodedCall.from,
      destination: decodedCall.args._to,
    };
  }, [decodedCall]);

  const { data: tokenInfo } = useERC20Info(parsedData?.tokenAddress);
  const roundedBalance = useBigNumberToNumber(
    parsedData?.amount,
    tokenInfo?.decimals,
    4
  );
  const { ensName, imageUrl } = useENSAvatar(
    parsedData?.destination,
    MAINNET_ID
  );

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
              defaultSeed={parsedData?.destination}
              src={imageUrl}
              size={24}
            />
          </Segment>
          <Segment>
            {ensName || shortenAddress(parsedData?.destination)}
          </Segment>
        </DetailCell>
        <DetailCell>
          {roundedBalance} {tokenInfo?.symbol}
        </DetailCell>
      </DetailRow>
    </>
  );
};

export default ERC20TransferSummary;
