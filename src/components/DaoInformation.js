import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link } from 'react-router-dom';
import moment from 'moment';

const DaoInfoWrapper = styled.div`
    width: 100%;
    background: white;
    padding: 10px 0px;
    border: 1px solid var(--medium-gray);
    margin-top: 24px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    
    .loader {
      text-align: center;
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 18px;
      color: #BDBDBD;
      padding: 44px 0px;
      
      img {
        margin-bottom: 10px;
      }
    }
    
    h3 {
      color: var(--dark-text-gray);
      margin: 5px 10px;
      font-size: 18px;
    }
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
    width: ${(props) => props.width || '25%'};
    text-align: ${(props) => props.align};
`;

const TableRowsWrapper = styled.div`
    overflow-y: scroll;
    /* height: 260px; */
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
    a {
        text-decoration: none;
        width: 100%;

        &:hover{
            color: var(--turquois-text-onHover);
        }
    }
    color: ${(props) => props.color};
    width: ${(props) => props.width || '25%'}
    text-align: ${(props) => props.align};
    font-weight: ${(props) => props.weight};
    white-space: ${(props) => props.wrapText ? 'nowrap' : 'inherit'};
    overflow: ${(props) => props.wrapText ? 'hidden' : 'inherit'};
    text-overflow: ${(props) => props.wrapText ? 'ellipsis' : 'inherit'};
`;

const DaoInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();

    const loading = (
      !blockchainStore.initialLoadComplete
    );
  
    if (!providerActive) {
      return (
          <DaoInfoWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view dao information
            </div>
          </DaoInfoWrapper>
      )
    } else if (loading) {
      return (
          <DaoInfoWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Getting DAO information
            </div>
          </DaoInfoWrapper>
      )
    } else {
      const daoInfo = daoStore.getDaoInfo();
      const assets = [{
        name: "ETH", amount: parseFloat(Number(library.utils.fromWei(daoInfo.ethBalance.toString())).toFixed(4)), usdValue: "..."
      }];
      return (    
        <DaoInfoWrapper>
          <h3>Address: {daoInfo.address}</h3>
          <h3>Total REP: {parseFloat(Number(library.utils.fromWei(daoInfo.totalRep.toString())).toFixed(4))}</h3>
          <AssetsTableHeaderActions>
            <span>Dao Funds</span>
          </AssetsTableHeaderActions>
          <AssetsTableHeaderWrapper>
              <TableHeader width="40%" align="left"> Asset </TableHeader>
              <TableHeader width="30%" align="center"> Amount </TableHeader>
              <TableHeader width="30%" align="center"> USD Value </TableHeader>
          </AssetsTableHeaderWrapper>
          <TableRowsWrapper>
          {assets.map((asset, i) => {
            if (asset) {
              return (
                <TableRow>
                  <TableCell width="40%" align="left" weight='500' wrapText="true">
                    {asset.name}
                  </TableCell>
                  <TableCell width="30%" align="center"> 
                    {asset.amount}
                  </TableCell>
                  <TableCell width="30%" align="center"> 
                    {asset.usdValue}
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
    }
});

export default DaoInformation;
