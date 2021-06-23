import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { useLocation } from 'react-router-dom';
import BlockchainLink from '../components/common/BlockchainLink';
import { Box } from '../theme';

const UserPage = observer(() => {
    const {
        root: { daoStore, blockchainStore },
    } = useStores();
    const userAddress = useLocation().pathname.split("/")[2];
    const userEvents = daoStore.getUserEvents(userAddress);
    const userInfo = daoStore.getUser(userAddress);

    return (
      <Box style={{padding: "10px 20px"}}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <h2 style={{ display: "flex", alignItems:"center"}}>
            User: <BlockchainLink size="long" text={userAddress} toCopy/>
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
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
      </Box>
    );
});

export default UserPage;
