import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useMemo } from 'react';
import { FiArrowRight, FiNavigation } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';
import useENS from 'hooks/Guilds/ether-swr/ens/useENS';

const ERC20TransferInfoLine: React.FC<ActionViewProps> = ({
  decodedCall,
  compact,
}) => {
  const parsedData = useMemo(() => {
    if (!decodedCall) return null;

    return {
      tokenAddress: decodedCall.to,
      amount: BigNumber.from(decodedCall.args._value),
      source: decodedCall.from,
      destination: decodedCall.args._to as string,
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
      <Segment>
        <FiNavigation size={16} />
      </Segment>
      <Segment>
        {!compact && 'Transfer'} {roundedBalance} {tokenInfo?.symbol}
      </Segment>
      <Segment>
        <FiArrowRight />
      </Segment>
      <Segment>
        <ENSAvatar address={parsedData?.destination} size={compact ? 14 : 24} />
      </Segment>
      <Segment>
        {parsedData?.destination
          ? ensName || shortenAddress(parsedData?.destination, compact ? 2 : 4)
          : ''}
      </Segment>
    </>
  );
};

export default ERC20TransferInfoLine;
