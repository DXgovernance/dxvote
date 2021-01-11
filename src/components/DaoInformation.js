import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link } from 'react-router-dom';

const DaoInformationWrapper = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin-top: 24px;
  padding: 15px 20px;
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
`;


const DaoInformationBox = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin: auto;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: fit-content;
  
  h3 {
    margin: 5px 0px;
  }
`;

const Row = styled.div`
  flex-direction: row;
  flex: auto;
  display: flex;
  padding-top: 15px;
  justify-content: space-around;
`
const DaiInformation = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();

    const loading = (
      !blockchainStore.initialLoadComplete
    );
  
    if (!providerActive) {
      return (
          <DaoInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view proposals
            </div>
          </DaoInformationWrapper>
      )
    } else if (loading) {
      return (
          <DaoInformationWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Getting DAO information
            </div>
          </DaoInformationWrapper>
      )
    } else {
      const daoInfo = daoStore.getDaoInfo();
      const quickWalletScheme = daoStore.getShortchemeInfo(configStore.getQuickWalletSchemeAddress());
      const masterWalletBalance = Number(library.utils.fromWei(daoInfo.ethBalance.toString())).toFixed(2);
      const quickWalletBalance = Number(library.utils.fromWei(quickWalletScheme.ethBalance.toString())).toFixed(2);
      return (
        <DaoInformationWrapper>
          <DaoInformationBox>
            <h3>DXdao Avatar</h3>
            <h3><small>{daoInfo.address}</small></h3>
            <h3>DAO ETH Balance: {Number(masterWalletBalance)} ETH</h3>
            <h3>Total Rep: {Number(library.utils.fromWei(daoInfo.totalRep.toString())).toFixed(2)}</h3>
          </DaoInformationBox>
          <Row>
            <DaoInformationBox>
              <h3>Master Scheme</h3>
              <h3><small>{daoInfo.address}</small></h3>
              <h3>Master Scheme ETH Balance: {masterWalletBalance} ETH</h3>
              <h3><small>Slow & Safe</small></h3>
              <h3><small>Make calls from DXdao Avatar</small></h3>
            </DaoInformationBox>
            <DaoInformationBox>
              <h3>Quick Scheme</h3>
              <h3><small>{quickWalletScheme.address}</small></h3>
              <h3>Quick Scheme ETH Balance: {quickWalletBalance} ETH</h3>
              <h3><small>Quick & Flexible</small></h3>
              <h3><small>Make calls from Quick Scheme</small></h3>
            </DaoInformationBox>
          </Row>
          </DaoInformationWrapper>
      );
    }
});

export default DaiInformation;
