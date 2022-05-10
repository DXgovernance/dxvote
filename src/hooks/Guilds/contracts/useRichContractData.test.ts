import { renderHook } from '@testing-library/react-hooks';
import {
  IPFSRichContractData,
  useRichContractData,
} from './useRichContractData';

const mockChainId = 1337;
const contractAddress = '0x0000000000000000000000000000000000000001';
const mockRichContractData: IPFSRichContractData[] = [
  {
    title: 'RichDataMockContract',
    tags: [],
    networks: { [mockChainId]: contractAddress },
    functions: [],
  },
];

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    chainId: mockChainId,
  }),
}));

jest.mock('hooks/Guilds/ipfs/useIPFSFile', () => ({
  __esModule: true,
  default: () => ({
    data: mockRichContractData,
  }),
}));

describe('useRichContractData', () => {
  it('should return correct contract data', async () => {
    const { result } = renderHook(() => useRichContractData());

    expect(result.current.contracts).not.toBe(null);
    expect(result.current.contracts.length).toBe(1);
    expect(result.current.contracts[0].contractAddress).toBe(contractAddress);
  });
});
