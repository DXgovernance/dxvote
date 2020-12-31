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
    padding: 10px 20px;
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
      const daoInfo = daoStore.daoInfo;
      const quickWalletScheme = daoStore.schemes[configStore.getQuickWalletSchemeAddress()];
      return (
        <DaoInformationWrapper>
          <h3>Total Rep: {library.utils.fromWei(daoInfo.totalRep.toString())}</h3>
          <h3>DAO Address: {daoInfo.address}</h3>
          <h3>DAO ETH Balance: {library.utils.fromWei(daoInfo.ethBalance.toString())} ETH</h3>
          <h3>QuickWallet Address: {quickWalletScheme.address}</h3>
          <h3>QuickWallet ETH Balance: {library.utils.fromWei(quickWalletScheme.ethBalance.toString())} ETH</h3>
        </DaoInformationWrapper>
      );
    }
});

export default DaiInformation;
