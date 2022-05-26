import { useContext } from './contexts';
import PulsingIcon from './old-components/common/LoadingIcon';
import { GlobalLoadingState } from './stores/NotificationStore';
import { useWeb3React } from '@web3-react/core';
import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styled from 'styled-components';

const PageRouterWrapper = styled.div`
  margin-top: 20px;
  flex: 1;
`;

const LoadingBox = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;

  .loader {
    text-align: center;
    font-weight: 500;
    font-size: 20px;
    line-height: 18px;
    color: var(--dark-text-gray);
    padding: 25px 0px;

    svg {
      margin-bottom: 10px;
    }
  }
`;

const LoadingProgressText = styled.div`
  font-size: 14px;
  margin-top: 8px;
`;

const PageRouter = observer(({ children }) => {
  const {
    context: {
      notificationStore,
      configStore,
      etherscanService,
      pinataService,
      coingeckoService,
    },
  } = useContext();

  const history = useHistory();
  const location = useLocation();
  const noLoading = ['/faq', '/config', '/forum', '/cache'];
  const networkName = configStore.getActiveChainName();
  const { active: providerActive } = useWeb3React();

  useEffect(() => {
    if (location.pathname === '/' && networkName) {
      history.push(`/${networkName}/proposals`);
    }
  }, [networkName]);

  // Start or auth services
  pinataService.isAuthenticated();
  etherscanService.isAuthenticated(networkName);

  if (noLoading.indexOf(location.pathname) > -1) {
    return <PageRouterWrapper>{children}</PageRouterWrapper>;
  } else if (!providerActive) {
    return (
      <PageRouterWrapper>
        <LoadingBox>
          <div className="loader">
            <PulsingIcon size={80} inactive={true} />
            <div>Connect to a network to continue.</div>
          </div>
        </LoadingBox>
      </PageRouterWrapper>
    );
  } else {
    if (
      !notificationStore.firstLoadComplete ||
      notificationStore.globalLoadingState === GlobalLoadingState.ERROR
    ) {
      const hasError =
        notificationStore.globalLoadingState === GlobalLoadingState.ERROR;
      return (
        <PageRouterWrapper>
          <LoadingBox>
            <div className="loader">
              {' '}
              <PulsingIcon size={80} inactive={hasError} />
              <div>{hasError ? 'Oops! Something broke.' : 'Loading'}</div>
              <LoadingProgressText>
                {notificationStore.globalMessage}
              </LoadingProgressText>
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
