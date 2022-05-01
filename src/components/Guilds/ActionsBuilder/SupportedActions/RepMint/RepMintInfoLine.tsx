import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { FiArrowRight } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import styled from 'styled-components';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useTotalSupply } from 'hooks/Guilds/guild/useTotalSupply';
import { useTokenData } from 'hooks/Guilds/guild/useTokenData';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

const RepMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const { parsedData } = useTotalSupply({ decodedCall });
  const { tokenData } = useTokenData();

  const totalSupply = useBigNumberToNumber(tokenData?.totalSupply, 18);

  const { ensName, imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);

  const roundedRepAmount = useBigNumberToNumber(parsedData?.amount, 16, 3);
  const roundedRepPercent = roundedRepAmount / totalSupply;

  return (
    <>
      <Segment>
        <StyledMintIcon src={Mint} />
      </Segment>
      <Segment>Mint {roundedRepPercent} %</Segment>
      <Segment>
        <FiArrowRight />
      </Segment>
      <Segment>
        <Avatar defaultSeed={parsedData?.toAddress} src={imageUrl} size={24} />
      </Segment>
      <Segment>{ensName || shortenAddress(parsedData?.toAddress)}</Segment>
    </>
  );
};

export default RepMintInfoLine;
