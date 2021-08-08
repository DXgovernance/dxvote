import styled from 'styled-components';
import Copy from './Copy';
import { getBlockchainLink } from '../../utils';
import { useContext } from '../../contexts';
import { FiExternalLink } from "react-icons/fi";

const AddressLink = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  a {
    padding: 2px 5px;
    font-family: var(--roboto);
    line-height: 17px;
    letter-spacing: 0.2px;
    text-decoration: none;
    color: inherit;
  }
`;

const BlockchainLink = ({ text, size = 'default', type = 'default', toCopy = false, onlyIcon = false}) => {
  
    const {
        context: { configStore },
    } = useContext();
    
    const networkName = configStore.getActiveChainName();

    function formarText(toFormat) {
        const start = toFormat.slice(0, 6);
        const end = toFormat.slice(-4);

        switch (size) {
          case "short":
            return `${start}..`;
          case "long":
            return toFormat;
          default:
            return `${start}...${end}`;
        }
    }

    return (
        <AddressLink>
          <a href={getBlockchainLink(text, networkName, type)} target="_blank">{ onlyIcon ? <FiExternalLink/> : formarText(text)}</a>
          {toCopy ? <Copy toCopy={text} /> : <div/> }
        </AddressLink>
    );
};

export default BlockchainLink;
