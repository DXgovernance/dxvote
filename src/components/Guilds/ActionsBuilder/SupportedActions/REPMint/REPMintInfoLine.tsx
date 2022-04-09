import Avatar from 'components/Guilds/Avatar';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useMemo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import styled from 'styled-components';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

const REPMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
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
  const { ensName, imageUrl } = useENSAvatar(
    parsedData?.destination,
    MAINNET_ID
  );

  return (
    <>
      <Segment>
        <StyledMintIcon src={Mint} />
      </Segment>
      <Segment>Mint {roundedBalance}</Segment>
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
      <Segment>
        {ensName || parsedData?.destination
          ? shortenAddress(parsedData?.destination)
          : ''}
      </Segment>
    </>
  );
};

export default REPMintInfoLine;
