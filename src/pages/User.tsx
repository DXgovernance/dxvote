import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import { useLocation } from 'react-router-dom';
import Address from '../components/common/Address';

const UserInfoWrapper = styled.div`
    width: 100%;
    background: white;
    padding: 20px 20px;
    font-weight: 400;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const UserPage = observer(() => {
    const {
        root: { daoStore, blockchainStore },
    } = useStores();
    const userAddress = useLocation().pathname.split("/")[2];
    const userEvents = daoStore.getUserEvents(userAddress);
    const userInfo = daoStore.getUser(userAddress);

    return (
      <UserInfoWrapper>
        <h2>User <Address size="long" address={userAddress}/></h2>
        <h3>REP: {userInfo.repPercentage.toFixed(2)} %</h3>
        <h2> History </h2>
        {userEvents.history.map((historyEvent, i) => {
          return(
          <div key={"userHistoryEvent"+i}>
            <span> {historyEvent.text} </span> 
            {i < userEvents.history.length - 1 ? <hr/> : <div/>}
          </div>);
        })}
      </UserInfoWrapper>
    );
});

export default UserPage;
