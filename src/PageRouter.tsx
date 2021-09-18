import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from './contexts';
import { FiZapOff, FiZap } from 'react-icons/fi';
import { useLocation, useHistory } from 'react-router-dom';
import Box from './components/common/Box';

const PageRouterWrapper = styled.div`
  margin-top: 20px;
`;

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
`;

const PageRouter = observer(({ children }) => {
  const {
    context: {
      providerStore,
      blockchainStore,
      configStore,
      ipfsService,
      etherscanService,
      pinataService,
      coingeckoService,
      infuraService,
      alchemyService,
      customRpcService,
    },
  } = useContext();

  const history = useHistory();
  const location = useLocation();
  const noLoading = ['/faq', '/config', '/forum'];

  // Start or auth services
  ipfsService.start();
  etherscanService.isAuthenticated();
  pinataService.isAuthenticated();
  alchemyService.isAuthenticated();
  infuraService.isAuthenticated();
  customRpcService.isAuthenticated();

  const { active: providerActive } = providerStore.getActiveWeb3React();

  if (noLoading.indexOf(location.pathname) > -1) {
    return <PageRouterWrapper> {children} </PageRouterWrapper>;
  } else if (!providerActive)
    return (
      <PageRouterWrapper>
        <LoadingBox>
          <div className="loader">
            {' '}
            <FiZapOff /> <br /> Connect to your wallet{' '}
          </div>
        </LoadingBox>
      </PageRouterWrapper>
    );
  else {
    const networkName = configStore.getActiveChainName();
    if (location.pathname === '/') {
      history.push(`/${networkName}/proposals`);
    }

    if (
      location.pathname.split('/')[1] &&
      location.pathname.split('/')[1] !== networkName
    ) {
      history.push(`/${networkName}/proposals`);
    }

    if (!blockchainStore.initialLoadComplete) {
      return (
        <PageRouterWrapper>
          <LoadingBox>
            <div className="loader">
              {' '}
              <FiZap /> <br /> Loading..{' '}
            </div>
          </LoadingBox>
        </PageRouterWrapper>
      );
    } else {
      coingeckoService.loadPrices();
      if (configStore.getLocalConfig().pinOnStart)
        pinataService.updatePinList();
      return <PageRouterWrapper> {children} </PageRouterWrapper>;
    }
  }
});

export default PageRouter;
