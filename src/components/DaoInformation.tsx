import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import Address from '../components/common/Address';

const DaoInfoWrapper = styled.div`
    background: white;
    padding: 0px 10px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    color: var(--dark-text-gray);
`;

const AssetsTableHeaderActions = styled.div`
    padding: 0px 10px 10px 10px;
    color: var(--dark-text-gray);
    border-bottom: 1px solid var(--line-gray);
    font-weight: 500;
    font-size: 18px;
    letter-spacing: 1px;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    
    span {
      font-size: 20px;
      padding: 10px 5px 5px 5px;
    }
`;

const AssetsTableHeaderWrapper = styled.div`
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

const DaoInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();

    const daoInfo = daoStore.getDaoInfo();
    const networkConfig = configStore.getNetworkConfig();
    let assets = [{
      name: "ETH", amount: parseFloat(Number(library.utils.fromWei(daoInfo.ethBalance.toString())).toFixed(4))
    },{
      name: "DXD", amount: parseFloat(Number(library.utils.fromWei(daoInfo.dxdBalance.toString())).toFixed(4))
    }];
    Object.keys(daoStore.tokenBalances).map((tokenAddress) => {
      assets.push({
        name: networkConfig.tokens[tokenAddress].name,
        amount: parseFloat(Number(library.utils.fromWei(daoStore.tokenBalances[tokenAddress].toString())).toFixed(4))
      })
    })
    
    return (
      <DaoInfoWrapper>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <h2>Address: <Address size="long" address={daoInfo.address}/></h2>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
          <ActiveButton route="/?view=schemes">Schemes</ActiveButton>
          <ActiveButton route="/?view=proposals">Proposals</ActiveButton>
          </div>
        </div>
        <h3>Total REP: {parseFloat(Number(library.utils.fromWei(daoInfo.totalRep.toString())).toFixed(4))}</h3>
        <AssetsTableHeaderActions>
          <span>Dao Funds</span>
        </AssetsTableHeaderActions>
        <AssetsTableHeaderWrapper>
            <TableHeader width="50%" align="center"> Asset </TableHeader>
            <TableHeader width="50%" align="center"> Amount </TableHeader>
        </AssetsTableHeaderWrapper>
        <TableRowsWrapper>
        {assets.map((asset, i) => {
          if (asset) {
            return (
              <TableRow key={`asset${i}`}>
                <TableCell width="50%" align="center" weight='500' wrapText="true">
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
      </DaoInfoWrapper>
    );
});

export default DaoInformation;
