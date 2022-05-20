import { renderHook } from '@testing-library/react-hooks';
import { BigNumber } from 'ethers';
import { SupportedAction } from 'old-components/Guilds/ActionsBuilder/types';
import { ZERO_ADDRESS, ZERO_HASH } from 'utils';
import { useDecodedCall } from './useDecodedCall';
import { lookUpContractWithSourcify } from 'utils/sourcify';

const mockChainId = 123456;
const contractAddress = '0x0000000000000000000000000000000000000001';
const erc20TransferData =
  '0xa9059cbb000000000000000000000000f960cec172d9ea3c0233d1caaceace4b597cbccf0000000000000000000000000000000000000000000000000000000077359400';

jest.mock('@web3-react/core', () => ({
  useWeb3React: () => ({
    chainId: mockChainId,
  }),
}));

jest.mock('./useRichContractRegistry', () => ({
  useRichContractRegistry: () => ({
    contracts: [],
  }),
}));

describe('useDecodedCall', () => {
  it('should return the decoded call', async () => {
    const { result, waitFor } = renderHook(() =>
      useDecodedCall({
        data: erc20TransferData,
        from: ZERO_ADDRESS,
        to: contractAddress,
        value: BigNumber.from(0),
      })
    );
    await waitFor(
      () => {
        expect(result.current.decodedCall).not.toBe(null);
        expect(result.current.contract).not.toBe(null);
        expect(result.current.decodedCall.from).toEqual(ZERO_ADDRESS);
        expect(result.current.decodedCall.to).toEqual(contractAddress);
        expect(result.current.decodedCall.value).toEqual(BigNumber.from(0));
        expect(result.current.decodedCall.callType).toEqual(
          SupportedAction.ERC20_TRANSFER
        );
        expect(result.current.decodedCall.function).not.toBe(null);
        expect(result.current.decodedCall.function.name).toBe('transfer');
      },
      { timeout: 10000 }
    );
  });

  it('Should return null when no call is available', async () => {
    const { result, waitFor } = renderHook(() => useDecodedCall(null));
    await waitFor(
      () => {
        expect(result.current.decodedCall).toBe(null);
        expect(result.current.contract).toBe(null);
      },
      { timeout: 10000 }
    );
  });

  it('Should return null if unable to decode a call', async () => {
    const { result, waitFor } = renderHook(() =>
      useDecodedCall({
        data: ZERO_HASH,
        from: ZERO_ADDRESS,
        to: ZERO_ADDRESS,
        value: BigNumber.from(0),
      })
    );
    await waitFor(
      () => {
        expect(result.current.decodedCall).toBe(null);
        expect(result.current.contract).toBe(null);
      },
      { timeout: 10000 }
    );
  });
});

describe('lookUpContractWithSourcify', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return null if no contract is found', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    const decodedCall = await lookUpContractWithSourcify({
      chainId: 1,
      address: '0x0000000000000000000000000000000000000001',
    });
    expect(decodedCall).toBeNull();
  });
  it('should return a contract if found', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            files: [
              {
                name: 'metadata.json',
                content: JSON.stringify({ output: { abi: [{}] } }),
              },
            ],
          }),
        ok: true,
      })
    ) as jest.Mock;
    const decodedCall = await lookUpContractWithSourcify({
      chainId: 1,
      address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // random verified contract
    });
    expect(decodedCall).toBeTruthy();
  });
});
