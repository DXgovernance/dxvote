import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { useLocation } from 'react-router-dom';
import Address from '../components/common/Address';

const UserInfoWrapper = styled.div`
  background: white;
  padding: 0px 10px;
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
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <h2>User: <Address size="long" address={userAddress}/></h2>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
          <ActiveButton route="/?view=schemes">Schemes</ActiveButton>
          <ActiveButton route="/?view=proposals">Proposals</ActiveButton>
          <ActiveButton route="/?view=dao">DAO</ActiveButton>
          </div>
        </div>
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
