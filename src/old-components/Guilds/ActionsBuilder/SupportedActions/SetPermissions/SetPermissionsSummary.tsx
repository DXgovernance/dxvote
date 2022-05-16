import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';
import Avatar from 'old-components/Guilds/Avatar';
import { ParsedDataInterface } from './types';
import { useMemo } from 'react';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID, shortenAddress } from 'utils';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';

// TODO: What is the best way to display the information?

const SetPermissionsSummary: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const parsedData = useMemo<ParsedDataInterface>(() => {
    if (!decodedCall) return null;
    const { asset, to, functionSignature, valueAllowed, allowance } =
      decodedCall.args;
    return {
      asset,
      to,
      functionSignature,
      valueAllowed,
      allowance,
    };
  }, [decodedCall]);

  const { data: tokenInfo } = useERC20Info(parsedData?.asset);
  const roundedBalance = useBigNumberToNumber(
    parsedData?.valueAllowed,
    tokenInfo?.decimals,
    4
  );

  const { ensName, imageUrl } = useENSAvatar(parsedData?.to, MAINNET_ID);

  return (
    <>
      <DetailHeader>
        <DetailCell>Receiver</DetailCell>
        <DetailCell>Amount</DetailCell>
      </DetailHeader>

      <DetailRow>
        <DetailCell>
          <Segment>
            <Avatar defaultSeed={parsedData?.to} src={imageUrl} size={24} />
          </Segment>
          <Segment>{ensName || shortenAddress(parsedData?.to)}</Segment>
        </DetailCell>
        <DetailCell>
          {roundedBalance} {tokenInfo?.symbol}
        </DetailCell>
      </DetailRow>
    </>
  );
};

export default SetPermissionsSummary;
