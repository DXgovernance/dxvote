import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import BlockchainLink from '../components/common/BlockchainLink';
import { bnum } from '../utils/helpers';

const FinanceInfoWrapper = styled.div`
    background: white;
    padding: 0px 10px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    color: var(--dark-text-gray);
`;

const FinanceTableHeaderWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--light-text-gray);
    padding: 20px 40px 8px 24px;
    font-size: 14px;
    text-align: center;
`;

const TableHeader = styled.div`
    width: ${(props) => props.width};
    text-align: ${(props) => props.align};
`;

const TableRowsWrapper = styled.div`
    overflow-y: scroll;
`;

const TableRow = styled.div`
    font-size: 16px;
    line-height: 18px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid var(--line-gray);
    padding: 16px 24px;
    color: var(--dark-text-gray);
    text-align: right;
    cursor: pointer;
`;

const TableCell = styled.div`
    color: ${(props) => props.color};
    width: ${(props) => props.width};
    text-align: ${(props) => props.align};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const FinanceInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();

    const daoInfo = daoStore.getDaoInfo();
    const networkConfig = configStore.getNetworkConfig();
    let assets = [{
      name: "ETH", amount: bnum(daoInfo.ethBalance).div(10**18).toFixed(2)
    }];
    Object.keys(daoStore.tokenBalances).map((tokenAddress) => {
      assets.push({
        name: networkConfig.tokens[tokenAddress].name,
        amount: bnum(daoStore.tokenBalances[tokenAddress])
          .div(10**networkConfig.tokens[tokenAddress].decimals).toFixed(2)
      })
    })
    
    return (
      <FinanceInfoWrapper>
        <h2 style={{ display: "flex", justifyContent: "center"}}>DAO <BlockchainLink size="long" text={daoInfo.address} toCopy/></h2>
        <FinanceTableHeaderWrapper>
            <TableHeader width="50%" align="center"> Asset </TableHeader>
            <TableHeader width="50%" align="center"> Balance </TableHeader>
        </FinanceTableHeaderWrapper>
        <TableRowsWrapper>
        {assets.map((asset, i) => {
          if (asset) {
            return (
              <TableRow key={`asset${i}`}>
                <TableCell width="50%" align="center" weight='500'>
                  {asset.name}
                </TableCell>
                <TableCell width="50%" align="center"> 
                  {asset.amount}
                </TableCell>
              </TableRow>);
            } else {
              return <div/>
            }
          }
        )}
        </TableRowsWrapper>
      </FinanceInfoWrapper>
    );
});

export default FinanceInformation;
