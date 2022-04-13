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
import { useERC20Info } from 'hooks/Guilds/ether-swr/erc20/useERC20Info';
import { useGuildConfig } from 'hooks/Guilds/ether-swr/guild/useGuildConfig';
import { useParams } from 'react-router-dom';

const StyledMintIcon = styled(StyledIcon)`
  margin: 0;
`;

interface REPMintState {
  guildAddress: string;
  toAddress: string;
  amount: BigNumber;
}

const REPMintInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
  const { guild_id: guildId } =
    useParams<{ chain_name?: string; guild_id?: string }>();
  const { data } = useGuildConfig(guildId);
  const { data: tokenData } = useERC20Info(data?.token);
  const totalSupply = useBigNumberToNumber(tokenData?.totalSupply, 18);

  const parsedData = useMemo<REPMintState>(() => {
    if (!decodedCall) return null;
    return {
      guildAddress: decodedCall.to,
      toAddress: decodedCall.args.to,
      amount: decodedCall.args.amount,
    };
  }, [decodedCall]);
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
