import styled from 'styled-components';
import { observer } from 'mobx-react';
import { FiX } from 'react-icons/fi';

import {
  Table,
  TableRow,
  DataCell,
  TableBody,
  HeaderCell,
  TableHeader,
} from './common';

import { useContext } from '../contexts';
import { NETWORK_ASSET_SYMBOL } from '../utils';
import {
  ANY_ADDRESS,
  ZERO_ADDRESS,
  ANY_FUNC_SIGNATURE,
  ERC20_APPROVE_SIGNATURE,
  ERC20_TRANSFER_SIGNATURE,
  bnum,
  timestampToDate,
} from '../utils';

const PermissionsTable = styled(Table)`
  grid-template-columns: 10% 20% 20% 20% 10% 20%;
`;

const PermissionsInformation = observer(() => {
  const {
    context: { daoStore, configStore, providerStore },
  } = useContext();

  const web3 = providerStore.getActiveWeb3React().library;
  const schemes = daoStore.getAllSchemes();
  const rawPermissions = daoStore.daoCache.callPermissions;
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
  for (const votingMachineAddress in networkContracts.votingMachines) {
    addressesNames[votingMachineAddress] =
      networkContracts.votingMachines[votingMachineAddress].type;
  }

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
  recommendedCalls.forEach(recommendedCall => {
    functionNames[
      web3.eth.abi.encodeFunctionSignature(recommendedCall.functionName)
    ] = recommendedCall.functionName;
  });
  schemes.forEach(scheme => {
    addressesNames[scheme.address] = scheme.name;
  });
  tokens.forEach(token => {
    addressesNames[token.address] = token.symbol;
  });

  const permissions = [];

  for (const assetAddress in rawPermissions) {
    for (const fromAddress in rawPermissions[assetAddress]) {
      for (const toAddress in rawPermissions[assetAddress][fromAddress]) {
        for (const functionSignature in rawPermissions[assetAddress][
          fromAddress
        ][toAddress]) {
          const value =
            rawPermissions[assetAddress][fromAddress][toAddress][
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
    <PermissionsTable>
      <TableHeader>
        <HeaderCell>Asset</HeaderCell>
        <HeaderCell>From</HeaderCell>
        <HeaderCell>To</HeaderCell>
        <HeaderCell>Function</HeaderCell>
        <HeaderCell>Value</HeaderCell>
        <HeaderCell>From Time</HeaderCell>
      </TableHeader>
      <TableBody>
        {permissions.map((permission, i) => (
          <TableRow key={`permission${i}`}>
            <DataCell>{permission.asset}</DataCell>
            <DataCell>{permission.from}</DataCell>
            <DataCell>{permission.to}</DataCell>
            <DataCell>
              {functionNames[permission.functionSignature] ||
                permission.functionSignature}
            </DataCell>
            <DataCell>{permission.value}</DataCell>
            <DataCell>
              {permission.fromTime === 0 ? (
                <FiX />
              ) : (
                timestampToDate(bnum(permission.fromTime))
              )}
            </DataCell>
          </TableRow>
        ))}
      </TableBody>
    </PermissionsTable>
  );
});

export default PermissionsInformation;
