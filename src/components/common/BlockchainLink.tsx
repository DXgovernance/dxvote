import styled from 'styled-components';
import Copy from './Copy';
import {
  getBlockchainLink,
  getERC20Token,
  getDxVoteContract,
  toAddressStub,
  isAddress,
} from 'utils';
import { useContext } from '../../contexts';
import { FiExternalLink } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useRpcUrls } from 'provider/providerHooks';

const AddressLink = styled.div`
  display: flex;
  flex-direction: row;
  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 0.7;
    }
  }
`;

const Icon = styled.img`
  width: 15px;
  height: 15px;
`;

export const BlockchainLink = ({
  text,
  size = 'default',
  type = 'default',
  toCopy = false,
  onlyIcon = false,
  onlyText = false,
}) => {
  const {
    context: { configStore, ensService },
  } = useContext();

  const rpcUrls = useRpcUrls();

  const networkName = configStore.getActiveChainName();
  const [ensName, setENSName] = useState('');
  const erc20Token = getERC20Token(text);
  const dxVoteContract = getDxVoteContract(text);

  useEffect(() => {
    async function getENS() {
      const response = await ensService.resolveENSName(text);
      setENSName(response);
    }
    getENS();
  }, [text, rpcUrls]);

  let formatedAddress;
  if (!ensName && !dxVoteContract && !erc20Token) {
    if (onlyIcon) formatedAddress = <FiExternalLink />;
    else formatedAddress = toAddressStub(text, size);
  }

  /*
  If the address is an ens domain show the ens domain name with a link to the blockchain explorer address and option to copy the address.
  If the address is an ERC20 token registered in the config show the token symbol instead with links to the token explorer, and the option to copy the token address.
  If the address is an known dxvote contract (avatar,controller, etc) domain show the contract name with a link to the blockchain explorer address and option to copy the address.
  else show formatted address
  */
  const Address = () => (
    <>
      {ensName}
      {!ensName && erc20Token && <Icon src={erc20Token.logoURI} />}
      {!ensName && dxVoteContract && dxVoteContract?.contract}
      {formatedAddress}
    </>
  );

  return (
    <AddressLink>
      {!onlyText ? (
        <a
          href={getBlockchainLink(
            text,
            networkName,
            isAddress(text) ? 'address' : type
          )}
          target="_blank"
          rel="noreferrer"
        >
          <Address />
        </a>
      ) : (
        <div>
          <Address />
        </div>
      )}
      {toCopy ? <Copy toCopy={text} /> : null}
    </AddressLink>
  );
};

export default BlockchainLink;
