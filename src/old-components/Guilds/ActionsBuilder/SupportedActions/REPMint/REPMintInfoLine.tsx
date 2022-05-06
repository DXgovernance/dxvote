import { ActionViewProps } from '..';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import { Segment } from '../common/infoLine';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useTokenData } from 'hooks/Guilds/guild/useTokenData';
import { useTotalSupply } from 'hooks/Guilds/guild/useTotalSupply';
import Avatar from 'old-components/Guilds/Avatar';
import StyledIcon from 'old-components/Guilds/common/SVG';
import { FiArrowRight } from 'react-icons/fi';
import styled from 'styled-components';
import { MAINNET_ID, shortenAddress } from 'utils';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

const REPMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
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

export default REPMintInfoLine;
