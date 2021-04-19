import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import { useLocation } from 'react-router-dom';
import Address from '../components/common/Address';

const UserPage = () => {
    const {
        root: { daoService, providerStore },
    } = useStores();
    const { library } = providerStore.getActiveWeb3React();
    const userAddress = useLocation().pathname.split("/")[2];
    const [userActions, setUserActions] = React.useState('loading');
    const [userBalances, setUserBalances] = React.useState('loading');
    
    daoService.getUserBalances(userAddress).then((balances) => {
      setUserBalances(balances)
    });
    // if (userActions === 'loading')
    //   daoService.getUserEvents(userAddress).then((userEvents) => {
    //     let newUserActions = [];
    //     for (var i = 0; i < userEvents.stakes.length; i++) {
    //       newUserActions.push({
    //         blockNumber: userEvents.stakes[i].blockNumber,
    //         proposalId: userEvents.stakes[i].returnValues._proposalId,
    //         text: "Stake "+library.utils.fromWei(userEvents.stakes[i].returnValues._amount)+" DXD for "+ (userEvents.stakes[i].returnValues._vote == 1 ? 'YES' : 'NO') +" on proposal "+userEvents.stakes[i].returnValues._proposalId
    //       })
    //     }
    //     for (var i = 0; i < userEvents.votes.length; i++) {
    //       newUserActions.push({
    //         blockNumber: userEvents.votes[i].blockNumber,
    //         proposalId: userEvents.votes[i].returnValues._proposalId,
    //         text: "Vote "+library.utils.fromWei(userEvents.stakes[i].returnValues._amount)+" REP for "+ (userEvents.stakes[i].returnValues._vote == 1 ? 'YES' : 'NO') +" on proposal "+userEvents.stakes[i].returnValues._proposalId
    //       })
    //     }
    //     for (var i = 0; i < userEvents.proposals.length; i++) {
    //       newUserActions.push({
    //         blockNumber: userEvents.proposals[i].blockNumber,
    //         proposalId: userEvents.proposals[i].returnValues._proposalId,
    //         text: "Proposal created "+userEvents.proposals[i].returnValues._proposalId
    //       })
    //     }
    //     setUserActions(newUserActions)
    //   });
    
    const loading = (userActions === 'loading') || !userBalances.rep || !userBalances.dxd;

    return (
      <div>
        <h2>User <Address size="long" address={userAddress}/></h2>
        <hr></hr>
        {loading ?
          <center>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Fetching user information...
            </div>
          </center>
        : <div>
            <h3>{library.utils.fromWei(userBalances.rep.toString())} REP | {library.utils.fromWei(userBalances.dxd.toString())} DXD</h3>
            <hr></hr>
            {userActions.map((userAction, i) => {
              return <h3 key={"userAction"+i}>{userAction.text}</h3>
            })}
          </div>
        }
        
      </div>
    );
};

export default UserPage;
