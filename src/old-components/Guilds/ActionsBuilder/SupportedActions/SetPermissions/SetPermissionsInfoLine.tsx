import { useMemo } from 'react';
import { ActionViewProps } from '..';
import { Segment } from '../common/infoLine';
import Avatar from 'old-components/Guilds/Avatar';
import { FiArrowRight, FiNavigation } from 'react-icons/fi';
import useENSAvatar from 'hooks/Guilds/ether-swr/ens/useENSAvatar';
import { MAINNET_ID, shortenAddress } from 'utils';
import { ParsedDataInterface } from './types';

// TODO: What is the most logical way to present the information? Is more information needed?

const SetPermissionsInfoLine: React.FC<ActionViewProps> = ({ decodedCall }) => {
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

  const { ensName, imageUrl } = useENSAvatar(parsedData?.to, MAINNET_ID);

  return (
    <>
      <Segment>
        <FiNavigation size={16} />
      </Segment>
      <Segment>Permission</Segment>
      <Segment>
        <FiArrowRight />
      </Segment>
      <Segment>
        <Avatar defaultSeed={parsedData?.to} src={imageUrl} size={24} />
      </Segment>
      <Segment>
        {ensName || parsedData?.to ? shortenAddress(parsedData?.to) : ''}
      </Segment>
    </>
  );
};

export default SetPermissionsInfoLine;
