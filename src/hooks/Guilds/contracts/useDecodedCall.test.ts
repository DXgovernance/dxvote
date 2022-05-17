import { lookUpContractWithSourcify } from './useDecodedCall';

describe('useDecodedCall', () => {
  it('should return null if no contract is found', async () => {
    const decodedCall = await lookUpContractWithSourcify({
      chainId: 1,
      address: '0x0000000000000000000000000000000000000001',
    });
    expect(decodedCall).toBeNull();
  });
  it('should return a contract if found', async () => {
    const decodedCall = await lookUpContractWithSourcify({
      chainId: 1,
      address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // random verified contract
    });
    expect(decodedCall).toBeTruthy();
  });
});
