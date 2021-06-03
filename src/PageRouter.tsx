import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from './contexts/storesContext';
import { FiZapOff, FiZap } from "react-icons/fi";
import { useLocation } from 'react-router-dom';

const PageRouterWrapper = styled.div`
  border: 1px solid var(--medium-gray);
  margin-top: 20px;
  padding-top: 10px;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;

 .loader {
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    color: var(--medium-gray);
    padding: 25px 0px;
      
    .svg {
      height: 30px;
      width: 30px;
      margin-bottom: 10px;
    }
  }
`
const PageRouter = observer(({ children }) => {
    
    const {
        root: { providerStore, blockchainStore, configStore, ipfsService, etherscanService, pinataService },
    } = useStores();
    let needsLoading = true;
    
    const { pathname } = useLocation();
    const noLoading = ['/faq', '/config'];
    
    // Start or auth services
    ipfsService.start();
    etherscanService.isAuthenticated();
    pinataService.isAuthenticated();

    const { active: providerActive } = providerStore.getActiveWeb3React();
    if (!providerActive)
      return (
        <PageRouterWrapper>
          <div className="loader"> <FiZapOff/> <br/> Connect to metamask </div>
        </PageRouterWrapper>
      );
    else if (!blockchainStore.initialLoadComplete && noLoading.indexOf(pathname) < 0)
      return (
        <PageRouterWrapper>
          <div className="loader"> <FiZap/> <br/> Loading.. </div>
        </PageRouterWrapper>
      );
    else {
      if (configStore.getLocalConfig().pinOnStart)
        pinataService.updatePinList();
      return <PageRouterWrapper> {children} </PageRouterWrapper>;
    }
});

export default PageRouter;
