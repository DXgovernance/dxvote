import { useState } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { useContext } from '../../contexts';
import { bnum, normalizeBalance, ZERO_ADDRESS } from '../../utils';

interface RepDisplayProps {
  rep: BigNumber;
  timestamp?: number;
  atBlock?: number;
}

const HoverHighlight = styled.span`
  &:hover {
    color: var(--blue-onHover);
  }
`;

const RepDisplay: React.FC<RepDisplayProps> = ({ rep, atBlock, timestamp }) => {
  const {
    context: { daoStore },
  } = useContext();

  const [isHovering, setIsHovering] = useState(false);
  const repNormalized = normalizeBalance(rep).toString();
  const repPercent = bnum(rep)
    .times(100)
    .div(daoStore.getRepAt(ZERO_ADDRESS, atBlock).totalSupply)
    .toFixed(4)
    .toString();

  return (
    <HoverHighlight
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {isHovering ? `${repPercent}%` : repNormalized} REP{' '}
      {isHovering &&
        timestamp &&
        `as of ${moment.unix(timestamp).format('Do MMM YYYY')}`}
    </HoverHighlight>
  );
};

export default RepDisplay;
