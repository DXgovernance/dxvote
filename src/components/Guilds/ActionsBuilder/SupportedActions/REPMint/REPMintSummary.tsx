import Avatar from 'components/Guilds/Avatar';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { DetailCell, DetailHeader, DetailRow } from '../common/summary';
import { useTotalSupply } from 'hooks/Guilds/guild/useTotalSupply';
import { useTokenData } from 'hooks/Guilds/guild/useTokenData';
const REPMintSummary: React.FC<ActionViewProps> = ({ decodedCall }) => {

  const { parsedData } = useTotalSupply({ decodedCall })
  const { tokenData } = useTokenData()
  const { ensName, imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);

  const roundedRepAmount = useBigNumberToNumber(parsedData?.amount, 18, 3);

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
        <DetailCell>
          {roundedRepAmount} {tokenData?.name}
        </DetailCell>
      </DetailRow>
    </>
  );
};

export default REPMintSummary;
