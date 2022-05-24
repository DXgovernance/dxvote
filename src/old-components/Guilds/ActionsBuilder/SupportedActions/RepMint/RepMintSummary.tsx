import { FiArrowRight } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import StyledIcon from 'old-components/Guilds/common/SVG';
import styled from 'styled-components';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import { useTotalSupply } from 'hooks/Guilds/guild/useTotalSupply';
import { useTokenData } from 'hooks/Guilds/guild/useTokenData';
import ENSAvatar from 'Components/ENSAvatar/ENSAvatar';
import useENS from 'hooks/Guilds/ether-swr/ens/useENS';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

const RepMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const { parsedData } = useTotalSupply({ decodedCall });
  const { tokenData } = useTokenData();

  const totalSupply = useBigNumberToNumber(tokenData?.totalSupply, 18);

  const { name: ensName } = useENS(parsedData?.toAddress, MAINNET_ID);

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
        <ENSAvatar address={parsedData?.toAddress} />
      </Segment>
      <Segment>{ensName || shortenAddress(parsedData?.toAddress)}</Segment>
    </>
  );
};

export default RepMintInfoLine;
