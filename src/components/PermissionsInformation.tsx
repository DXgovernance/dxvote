import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { FiX } from "react-icons/fi";

import { NETWORK_ASSET_SYMBOL } from '../provider/connectors';
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE, timestampToDate, bnum } from '../utils';

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
    width: ${(props) => props.width};
    text-align: ${(props) => props.align};
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
    justify-content: ${(props) => props.align};;
    color: ${(props) => props.color};
    width: ${(props) => props.width};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const PermissionsInformation = observer(() => {
    const {
        context: { daoStore, configStore },
    } = useContext();

    const schemes = daoStore.getAllSchemes();
    const rawPermissions = daoStore.getCache().callPermissions;
    const networkContracts = configStore.getNetworkContracts();
    const tokens = configStore.getTokensOfNetwork();
    let addressesNames = {};

    addressesNames[ZERO_ADDRESS] = NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];
    addressesNames[ANY_ADDRESS] = "Avatar";
    addressesNames[networkContracts.avatar] = "Avatar";
    addressesNames[networkContracts.controller] = "Controller";
    if (networkContracts.votingMachines.dxd)
      addressesNames[networkContracts.votingMachines.dxd.address] = "DXDVotingMachine";
    
    schemes.map((scheme) => {
      addressesNames[scheme.address] = scheme.name;
    })
    tokens.map((token) => {
      addressesNames[token.address] = token.name;
    })

    const permissions = [];
    
    for (const assetAddress in rawPermissions) {
      for (const fromAddress in rawPermissions[assetAddress]) {
        for (const toAddress in rawPermissions[assetAddress][fromAddress]) {
          for (const functionSignature in rawPermissions[assetAddress][fromAddress][toAddress]) {
            const value = rawPermissions[assetAddress][fromAddress][toAddress][functionSignature].value.toString();
            permissions.push({
              asset: addressesNames[assetAddress] || assetAddress,
              from: addressesNames[fromAddress] || fromAddress,
              to: addressesNames[toAddress] || toAddress,
              functionSignature: functionSignature == ANY_FUNC_SIGNATURE ? "Any Function" : functionSignature,
              value: value == "115792089237316195423570985008687907853269984665640564039457584007913129639935" ? "ANY Value" : value,
              fromTime: rawPermissions[assetAddress][fromAddress][toAddress][functionSignature].fromTime
            });
          }
        }
      }
    }
      
    return (
      <PermissionsInfoWrapper>
        <TableHeaderWrapper>
          <TableHeader width="10%" align="left"> Asset </TableHeader>
          <TableHeader width="25%" align="left"> From </TableHeader>
          <TableHeader width="25%" align="left"> To </TableHeader>
          <TableHeader width="10%" align="center"> Function </TableHeader>
          <TableHeader width="10%" align="left"> Value </TableHeader>
          <TableHeader width="20%" align="center"> From Time </TableHeader>
        </TableHeaderWrapper>
        <TableRowsWrapper>
        {permissions.map((permission, i) => {
          return (
            <TableRow key={`permission${i}`}>
              <TableCell width="10%" align="left">{permission.asset}</TableCell>
              <TableCell width="25%" align="left">{permission.from}</TableCell>
              <TableCell width="25%" align="left">{permission.to}</TableCell>
              <TableCell width="10%" align="center">{permission.functionSignature}</TableCell>
              <TableCell width="10%" align="left">{permission.value}</TableCell>
              <TableCell width="20%" align="center">
              { (permission.fromTime == 0) ? <FiX/> : timestampToDate(bnum(permission.fromTime)) }
              </TableCell>
            </TableRow>
          );
        })}
        </TableRowsWrapper>
      </PermissionsInfoWrapper>
    );
});

export default PermissionsInformation;
