import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from './contexts/storesContext';
import { FiZapOff, FiZap } from "react-icons/fi";
import { useLocation } from 'react-router-dom';
import Box from './components/common/Box';

const PageRouterWrapper = styled.div`
  margin-top: 20px;
`

const LoadingBox = styled(Box)`
  
 .loader {
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    color: var(--dark-text-gray);
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
        root: { providerStore, blockchainStore, configStore, ipfsService, etherscanService, pinataService, coingeckoService },
    } = useStores();
    let needsLoading = true;
    
    const { pathname } = useLocation();
    const noLoading = ['/faq', '/config', '/forum'];
    
    // Start or auth services
    ipfsService.start();
    etherscanService.isAuthenticated();
    pinataService.isAuthenticated();
    coingeckoService.loadPrices();

    const { active: providerActive } = providerStore.getActiveWeb3React();
    if (!providerActive)
      return (
        <PageRouterWrapper>
          <LoadingBox>
            <div className="loader"> <FiZapOff/> <br/> Connect to metamask </div>
          </LoadingBox>
        </PageRouterWrapper>
      );
    else if (!blockchainStore.initialLoadComplete && noLoading.indexOf(pathname) < 0)
      return (
        <PageRouterWrapper>
          <LoadingBox>
            <div className="loader"> <FiZap/> <br/> Loading.. </div>
          </LoadingBox>
        </PageRouterWrapper>
      );
    else {
      if (configStore.getLocalConfig().pinOnStart)
        pinataService.updatePinList();
      return <PageRouterWrapper> {children} </PageRouterWrapper>;
    }
});

export default PageRouter;
