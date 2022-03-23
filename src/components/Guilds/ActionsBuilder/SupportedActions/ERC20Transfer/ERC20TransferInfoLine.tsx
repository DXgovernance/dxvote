import Avatar from 'components/Guilds/Avatar';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useMemo } from 'react';
import { FiArrowRight, FiNavigation } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';

const ERC20TransferInfoLine: React.FC<ActionViewProps> = ({
  call,
  decodedCall,
}) => {
  const parsedData = useMemo(() => {
    if (!call || !decodedCall) return null;

    return {
      tokenAddress: call.to,
      amount: BigNumber.from(decodedCall.args._value),
      source: call.from,
      destination: decodedCall.args._to as string,
    };
  }, [call, decodedCall]);

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
      <Segment>
        <FiNavigation size={16} />
      </Segment>
      <Segment>
        Transfer {roundedBalance} {tokenInfo?.symbol}
      </Segment>
      <Segment>
        <FiArrowRight />
      </Segment>
      <Segment>
        <Avatar
          defaultSeed={parsedData?.destination}
          src={imageUrl}
          size={24}
        />
      </Segment>
      <Segment>{ensName || shortenAddress(parsedData?.destination)}</Segment>
    </>
  );
};

export default ERC20TransferInfoLine;
