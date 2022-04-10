import Avatar from 'components/Guilds/Avatar';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { useMemo } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import { ReactComponent as Mint } from '../../../../../assets/images/mint.svg';
import StyledIcon from 'components/Guilds/common/SVG';
import styled from 'styled-components';
import { BigNumber } from 'ethers';
import useBigNumberToNumber from 'hooks/Guilds/conversions/useBigNumberToNumber';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

interface REPMintState {
  guildAddress: string;
  toAddress: string;
  amount: BigNumber;
}

const REPMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const parsedData = useMemo<REPMintState>(() => {
    if (!decodedCall) return null;
    return {
      guildAddress: decodedCall.to,
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
  }, [decodedCall]);
  const { ensName, imageUrl } = useENSAvatar(parsedData?.toAddress, MAINNET_ID);

  const roundedRepAmount = useBigNumberToNumber(parsedData?.amount, 1, 2) * 10;

  return (
    <>
      <Segment>
        <StyledMintIcon src={Mint} />
      </Segment>
      <Segment>Mint {roundedRepAmount} %</Segment>
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
