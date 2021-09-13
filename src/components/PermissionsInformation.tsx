import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { FiX } from 'react-icons/fi';

import { NETWORK_ASSET_SYMBOL } from '../utils';
import {
  ZERO_ADDRESS,
  ERC20_TRANSFER_SIGNATURE,
  ERC20_APPROVE_SIGNATURE,
  ANY_ADDRESS,
  ANY_FUNC_SIGNATURE,
  timestampToDate,
  bnum,
} from '../utils';

const PermissionsInfoWrapper = styled.div`
  background: white;
  padding: 0px 10px;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  color: var(--dark-text-gray);
  flex-wrap: wrap;
`;

const TableHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  color: var(--light-text-gray);
  padding: 20px 0px 8px 0px;
  font-size: 14px;
  text-align: center;
`;

const TableHeader = styled.div`
  width: ${props => props.width};
  text-align: ${props => props.align};
`;

const TableRowsWrapper = styled.div`
  width: 100%;
  overflow-y: scroll;
`;

const TableRow = styled.div`
  font-size: 16px;
  line-height: 18px;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  justify-content: space-between;
  border-bottom: 1px solid var(--line-gray);
  color: var(--dark-text-gray);
  text-align: right;
  cursor: pointer;
  padding: 5px 0px;
`;

const TableCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 5px;
  justify-content: ${props => props.align};
  color: ${props => props.color};
  width: ${props => props.width};
  font-weight: ${props => props.weight};
  white-space: ${props => (props.wrapText ? 'nowrap' : 'inherit')};
  overflow: ${props => (props.wrapText ? 'hidden' : 'inherit')};
  text-overflow: ${props => (props.wrapText ? 'ellipsis' : 'inherit')};
`;

const PermissionsInformation = observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();

  const web3 = providerStore.getActiveWeb3React().library;
  const schemes = daoStore.getAllSchemes();
  const rawPermissions = daoStore.getCache().callPermissions;
  const networkContracts = configStore.getNetworkContracts();
  const tokens = configStore.getTokensOfNetwork();
  const recommendedCalls = configStore.getRecommendedCalls();
  let addressesNames = {};
  let functionNames = {};
  addressesNames[ZERO_ADDRESS] =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];
  addressesNames[ANY_ADDRESS] = 'Any Address';
  addressesNames[networkContracts.avatar] = 'Avatar';
  addressesNames[networkContracts.controller] = 'Controller';
  if (networkContracts.votingMachines.dxd)
    addressesNames[networkContracts.votingMachines.dxd.address] =
      'DXDVotingMachine';

  functionNames[
    web3.eth.abi.encodeFunctionSignature('mintTokens(uint256,address,address)')
  ] = 'mintTokens(uint256,address,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature('unregisterSelf(address)')
  ] = 'unregisterSelf(address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature(
      'addGlobalConstraint(address,bytes32,address)'
    )
  ] = 'addGlobalConstraint(address,bytes32,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature(
      'removeGlobalConstraint(address,address)'
    )
  ] = 'removeGlobalConstraint(address,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature('upgradeController(address,address)')
  ] = 'upgradeController(address,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature('sendEther(uint256,address,address)')
  ] = 'sendEther(uint256,address,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature(
      'externalTokenTransfer(address,address,uint256,address)'
    )
  ] = 'externalTokenTransfer(address,address,uint256,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature(
      'externalTokenTransferFrom(address,address,address,uint256,address)'
    )
  ] = 'externalTokenTransferFrom(address,address,address,uint256,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature(
      'externalTokenApproval(address,address,uint256,address)'
    )
  ] = 'externalTokenApproval(address,address,uint256,address)';
  functionNames[
    web3.eth.abi.encodeFunctionSignature('metaData(string,address)')
  ] = 'metaData(string,address)';

  functionNames[ERC20_TRANSFER_SIGNATURE] = 'ERC20 Transfer';
  functionNames[ERC20_APPROVE_SIGNATURE] = 'ERC20 Approve';
  recommendedCalls.map(recommendedCall => {
    functionNames[
      web3.eth.abi.encodeFunctionSignature(recommendedCall.functionName)
    ] = recommendedCall.functionName;
  });
  schemes.map(scheme => {
    addressesNames[scheme.address] = scheme.name;
  });
  tokens.map(token => {
    addressesNames[token.address] = token.symbol;
  });

  const permissions = [];

  for (const assetAddress in rawPermissions) {
    for (const fromAddress in rawPermissions[assetAddress]) {
      for (const toAddress in rawPermissions[assetAddress][fromAddress]) {
        for (const functionSignature in rawPermissions[assetAddress][
          fromAddress
        ][toAddress]) {
          const value = rawPermissions[assetAddress][fromAddress][toAddress][
            functionSignature
          ].value.toString();
          permissions.push({
            asset: addressesNames[assetAddress] || assetAddress,
            from: addressesNames[fromAddress] || fromAddress,
            to: addressesNames[toAddress] || toAddress,
            functionSignature:
              functionSignature === ANY_FUNC_SIGNATURE
                ? 'Any Function'
                : functionSignature,
            value:
              value ===
              '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                ? 'ANY Value'
                : value,
            fromTime:
              rawPermissions[assetAddress][fromAddress][toAddress][
                functionSignature
              ].fromTime,
          });
        }
      }
    }
  }

  return (
    <PermissionsInfoWrapper>
      <TableHeaderWrapper>
        <TableHeader width="10%" align="left">
          {' '}
          Asset{' '}
        </TableHeader>
        <TableHeader width="20%" align="left">
          {' '}
          From{' '}
        </TableHeader>
        <TableHeader width="20%" align="left">
          {' '}
          To{' '}
        </TableHeader>
        <TableHeader width="20%" align="left">
          {' '}
          Function{' '}
        </TableHeader>
        <TableHeader width="10%" align="left">
          {' '}
          Value{' '}
        </TableHeader>
        <TableHeader width="20%" align="center">
          {' '}
          From Time{' '}
        </TableHeader>
      </TableHeaderWrapper>
      <TableRowsWrapper>
        {permissions.map((permission, i) => {
          return (
            <TableRow key={`permission${i}`}>
              <TableCell width="10%" align="left">
                {permission.asset}
              </TableCell>
              <TableCell width="20%" align="left">
                {permission.from}
              </TableCell>
              <TableCell width="20%" align="left">
                {permission.to}
              </TableCell>
              <TableCell width="20%" align="left">
                {functionNames[permission.functionSignature] ||
                  permission.functionSignature}
              </TableCell>
              <TableCell width="10%" align="left">
                {permission.value}
              </TableCell>
              <TableCell width="20%" align="center">
                {permission.fromTime === 0 ? (
                  <FiX />
                ) : (
                  timestampToDate(bnum(permission.fromTime))
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableRowsWrapper>
    </PermissionsInfoWrapper>
  );
});

export default PermissionsInformation;
