import moment from 'moment';

export const encodeRepMint = (library, repAmount, to, avatar) => {
  const repFunctionEncoded = library.eth.abi.encodeFunctionSignature(
    'mintReputation(uint256,address,address)'
  );

  const repParamsEncoded = library.eth.abi
    .encodeParameters(
      ['uint256', 'address', 'address'],
      [repAmount, to, avatar]
    )
    .substring(2);

  return repFunctionEncoded + repParamsEncoded;
};

export const encodeErc20Approval = (library, to, amount) => {
  const dxdApprovalFunctionEncoded = library.eth.abi.encodeFunctionSignature(
    'approve(address,uint256)'
  );

  const dxdApprovalParamsEncoded = library.eth.abi
    .encodeParameters(['address', 'uint256'], [to, amount])
    .substring(2);

  return dxdApprovalFunctionEncoded + dxdApprovalParamsEncoded;
};

export const encodeDxdVestingCreate = (library, to, dxdAmount) => {
  const vestingFunctionEncoded = library.eth.abi.encodeFunctionSignature(
    'create(address,uint256,uint256,uint256,uint256)'
  );

  const vestingParamsEncoded = library.eth.abi
    .encodeParameters(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [
        to,
        moment().unix(),
        moment.duration(1, 'years').asSeconds(),
        moment.duration(2, 'years').asSeconds(),
        dxdAmount,
      ]
    )
    .substring(2);

  return vestingFunctionEncoded + vestingParamsEncoded;
};
