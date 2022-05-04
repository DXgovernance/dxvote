import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { BigNumber, utils } from 'ethers';
import { render } from '../../../../../utils/tests';
import { DecodedCall } from '../../types';
import { Mint } from './RepMintEditor';
import ERC20SnapshotRep from '../../../../../contracts/ERC20SnapshotRep.json';
import { SupportedAction } from '../../types';

const ERC20SnapshotRepContract = new utils.Interface(ERC20SnapshotRep.abi);
const mockBigNumber = BigNumber.from(0);

const decodedCallMock: DecodedCall = {
  from: '0x0000000000000000000000000000000000000000',
  callType: SupportedAction.REP_MINT,
  function: ERC20SnapshotRepContract.getFunction('mint'),
  to: '',
  value: BigNumber.from(0),
  args: {
    to: '',
    amount: BigNumber.from(0),
  },
};

jest.mock('hooks/Guilds/guild/useTotalSupply', () => ({
  useTotalSupply: () => ({
    parsedData: {
      toAddress: '0x0000000000000000000000000000000000000000',
      amount: mockBigNumber,
    },
  }),
}));

jest.mock('hooks/Guilds/guild/useTokenData', () => ({
  useTokenData: () => ({
    tokenData: {
      symbol: 'REP',
      decimals: 18,
      name: 'Reputation',
      address: '0x0000000000000000000000000000000000000000',
      totalSupply: mockBigNumber,
    },
  }),
}));

jest.mock('hooks/Guilds/ether-swr/ens/useENSAvatar', () => ({
  __esModule: true,
  default: () => ({
    avatarUri: 'test',
    imageUrl: 'test',
    ensName: 'test.eth',
  }),
}));

describe('RepMintEditor', () => {
  beforeAll(() => {
    render(<Mint decodedCall={decodedCallMock} updateCall={jest.fn()} />);
  });
  it('renders', () => {
    expect(screen.getByText('Recipient')).toBeInTheDocument();
    expect(screen.getByText('Reputation in %')).toBeInTheDocument();
    expect(screen.getByText('Reputation Amount')).toBeInTheDocument();
  });
});
