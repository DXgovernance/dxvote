import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import BlockchainLink from '../components/common/BlockchainLink';

const GovernanceInfoWrapper = styled.div`
    background: white;
    padding: 0px 10px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    color: var(--dark-text-gray);
`;

const GovernanceTableHeaderActions = styled.div`
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

const GovernanceTableHeaderWrapper = styled.div`
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

const GovernanceInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();
    const daoInfo = daoStore.getDaoInfo();

    return (
      <GovernanceInfoWrapper>
        <h2>Total REP: {parseFloat(Number(library.utils.fromWei(daoInfo.totalRep.toString())).toFixed(4))}</h2>
        <GovernanceTableHeaderWrapper>
            <TableHeader width="25%" align="center"> Address </TableHeader>
            <TableHeader width="25%" align="center"> Proposals Created </TableHeader>
            <TableHeader width="25%" align="center"> Voted </TableHeader>
            <TableHeader width="25%" align="center"> Staked </TableHeader>
        </GovernanceTableHeaderWrapper>
        <TableRowsWrapper>

        </TableRowsWrapper>
      </GovernanceInfoWrapper>
    );
});

export default GovernanceInformation;
