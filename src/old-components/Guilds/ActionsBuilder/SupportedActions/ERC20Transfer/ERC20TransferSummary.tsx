import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useMemo } from 'react';
import { MAINNET_ID, shortenAddress } from 'utils';
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';
import useENS from 'hooks/Guilds/ether-swr/ens/useENS';

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
  const { name: ensName } = useENS(parsedData?.destination, MAINNET_ID);

  return (
    <>
      <DetailHeader>
        <DetailCell>Receiver</DetailCell>
        <DetailCell>Amount</DetailCell>
      </DetailHeader>

      <DetailRow>
        <DetailCell>
          <Segment>
            <ENSAvatar address={parsedData?.destination} />
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
