import styled from 'styled-components';
import { useContext } from 'contexts';
import { observer } from 'mobx-react';
import { Row, Box, Button } from '../components/common';
import React from 'react';
import { FiCheckCircle, FiDownload, FiUpload, FiX } from 'react-icons/fi';
import { NETWORKS, toCamelCaseString } from 'utils';
import PulsingIcon from 'components/common/LoadingIcon';
import Copy from '../components/common/Copy';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const FormLabel = styled.label`
  padding: 10px 0px;
`;

const InputBox = styled.input`
  background-color: white;
  border: 1px solid var(--medium-gray);
  border-radius: 4px;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  padding: 0px 10px;
  margin: 5px;
`;

const FormContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
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

const RowAlignedLeft = styled(Row)`
  justify-content: start;
`;

const CopyButton = styled(Button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  a {
    color: inherit;
    text-decoration: none;
    margin-right: 0;
    :hover,
    :active,
    :focus {
      text-decoration: none;
      color: ${({ theme }) => theme.white};
    }
  }
`;

const CachePage = observer(() => {
  // Set html title to cache to differentiate from dxvote dapp
  document.title = 'Cache';

  const {
    context: { cacheService, configStore, notificationStore, ipfsService },
  } = useContext();

  const [updateProposalTitles, setUpdateProposalTitles] = React.useState(false);
  const [buildingCacheState, setBuildingCacheState] = React.useState(0);
  const [updatedCacheHash, setUpdatedCacheHash] = React.useState({
    proposalTitles: {},
    configHashes: {},
    configs: {},
    caches: {},
  });
  const [resetCache, setResetCache] = React.useState({
    mainnet: false,
    rinkeby: false,
    xdai: false,
    arbitrum: false,
    arbitrumTestnet: false,
  });
  const [localConfig, setLocalConfig] = React.useState(
    configStore.getLocalConfig()
  );
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  async function resetCacheOptions() {
    configStore.resetLocalConfig();
    setLocalConfig(configStore.getLocalConfig());
    setBuildingCacheState(0);
    setResetCache({
      mainnet: false,
      rinkeby: false,
      xdai: false,
      arbitrum: false,
      arbitrumTestnet: false,
    });
    setUpdatedCacheHash({
      proposalTitles: {},
      configHashes: {},
      configs: {},
      caches: {},
    });
    setUpdateProposalTitles(false);
  }

  async function uploadToIPFS(content) {
    ipfsService.upload(content);
  }

  async function runCacheScript() {
    setBuildingCacheState(1);
    const updatedCache = await cacheService.getUpdatedCacheConfig(
      {
        1: {
          rpcUrl: localConfig.mainnet_rpcURL,
          toBlock: localConfig.mainnet_toBlock,
          reset: resetCache.mainnet,
        },
        4: {
          rpcUrl: localConfig.rinkeby_rpcURL,
          toBlock: localConfig.rinkeby_toBlock,
          reset: resetCache.rinkeby,
        },
        100: {
          rpcUrl: localConfig.xdai_rpcURL,
          toBlock: localConfig.xdai_toBlock,
          reset: resetCache.xdai,
        },
        42161: {
          rpcUrl: localConfig.arbitrum_rpcURL,
          toBlock: localConfig.arbitrum_toBlock,
          reset: resetCache.arbitrum,
        },
        421611: {
          rpcUrl: localConfig.arbitrumTestnet_rpcURL,
          toBlock: localConfig.arbitrumTestnet_toBlock,
          reset: resetCache.arbitrumTestnet,
        },
      },
      updateProposalTitles
    );
    console.log('[Updated Cache]', updatedCache);
    setUpdatedCacheHash(updatedCache);
    setBuildingCacheState(2);
    forceUpdate();
  }

  function onApiKeyValueChange(value, key) {
    localConfig[key] = value;
    setLocalConfig(localConfig);
    configStore.setLocalConfig(localConfig);
    forceUpdate();
  }

  function downloadAll() {
    var zip = new JSZip();

    var cache = zip.folder('cache');

    var configs = zip.folder('configs');
    zip.file(
      'default.json',
      JSON.stringify(
        {
          mainnet: updatedCacheHash.configHashes['mainnet'],
          xdai: updatedCacheHash.configHashes['xdai'],
          arbitrum: updatedCacheHash.configHashes['arbitrum'],
          rinkeby: updatedCacheHash.configHashes['rinkeby'],
          arbitrumTestnet: updatedCacheHash.configHashes['arbitrumTestnet'],
        },
        null,
        2
      )
    );
    zip.file(
      'proposalTitles.json',
      JSON.stringify(updatedCacheHash.proposalTitles, null, 2)
    );

    NETWORKS.map((network, i) => {
      cache.file(
        network.name + '.json',
        JSON.stringify(updatedCacheHash.caches[network.name], null, 2)
      );
      const configFolder = configs.folder(network.name);
      configFolder.file(
        'config.json',
        JSON.stringify(updatedCacheHash.configs[network.name], null, 2)
      );
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'dxvote-cache.zip');
    });
  }

  if (window.location.hash.length > 7) {
    const searchParams = new URLSearchParams(window.location.hash.substring(7));
    setUpdateProposalTitles(searchParams.get('proposalTitles') ? true : false);
    NETWORKS.map((network, i) => {
      const networkName = network.name;
      if (searchParams.get(networkName + '_toBlock'))
        localConfig[networkName + '_toBlock'] = searchParams.get(
          networkName + '_toBlock'
        );
      if (searchParams.get(networkName + '_targetHash'))
        localConfig[networkName + '_targetHash'] = searchParams.get(
          networkName + '_targetHash'
        );
      if (searchParams.get(networkName + '_reset')) {
        resetCache[networkName] = true;
      }
    });
    setLocalConfig(localConfig);
    setResetCache(resetCache);
    configStore.setLocalConfig(localConfig);
    window.location.assign(window.location.origin + '/#cache');
    forceUpdate();
  }

  function getOptionsLink(): string {
    let optionsLinkUrl =
      window.location.origin + '/' + window.location.hash + '?';
    if (updateProposalTitles)
      optionsLinkUrl = optionsLinkUrl = 'proposalTitles=1&';
    NETWORKS.map((network, i) => {
      const networkName = network.name;
      if (localConfig[networkName + '_toBlock'])
        optionsLinkUrl =
          optionsLinkUrl +
          networkName +
          '_toBlock=' +
          localConfig[networkName + '_toBlock'] +
          '&';
      if (localConfig[networkName + '_targetHash'])
        optionsLinkUrl =
          optionsLinkUrl +
          networkName +
          '_targetHash=' +
          localConfig[networkName + '_targetHash'] +
          '&';
      if (resetCache[networkName])
        optionsLinkUrl = optionsLinkUrl + networkName + '_reset=1&';
    });
    optionsLinkUrl = optionsLinkUrl.slice(0, -1);
    return optionsLinkUrl;
  }

  return buildingCacheState === 1 ? (
    <LoadingBox>
      <div className="loader">
        {' '}
        <PulsingIcon size={80} inactive={false} />
        <LoadingProgressText>
          {notificationStore.globalMessage}
        </LoadingProgressText>
      </div>
    </LoadingBox>
  ) : (
    <Box>
      <FormContainer>
        {NETWORKS.map((network, i) => {
          const networkName = network.name;
          return (
            networkName !== 'localhost' && (
              <div key={`networkOptions${i}`}>
                <RowAlignedLeft>
                  {' '}
                  <strong>{toCamelCaseString(networkName)}</strong>{' '}
                </RowAlignedLeft>
                <RowAlignedLeft>
                  <FormLabel>Block:</FormLabel>
                  <InputBox
                    type="text"
                    onChange={event =>
                      onApiKeyValueChange(
                        event.target.value,
                        networkName + '_toBlock'
                      )
                    }
                    value={localConfig[networkName + '_toBlock']}
                    style={{ width: '100px' }}
                  ></InputBox>
                  <FormLabel>RPC:</FormLabel>
                  <InputBox
                    type="text"
                    onChange={event =>
                      onApiKeyValueChange(
                        event.target.value,
                        networkName + '_rpcURL'
                      )
                    }
                    value={localConfig[networkName + '_rpcURL']}
                    style={{ width: '100%' }}
                  ></InputBox>
                  <FormLabel>Reset</FormLabel>
                  <InputBox
                    type="checkbox"
                    checked={resetCache[networkName]}
                    onChange={() => {
                      resetCache[networkName] = !resetCache[networkName];
                      setResetCache(resetCache);
                      forceUpdate();
                    }}
                  ></InputBox>
                </RowAlignedLeft>
                <RowAlignedLeft>
                  <FormLabel>Target Config Hash:</FormLabel>
                  <InputBox
                    type="text"
                    onChange={event =>
                      onApiKeyValueChange(
                        event.target.value,
                        networkName + '_targetHash'
                      )
                    }
                    value={localConfig[networkName + '_targetHash']}
                    style={{ width: '400px' }}
                  ></InputBox>
                  {updatedCacheHash.configs[networkName] && (
                    <div>
                      <Button
                        onClick={() =>
                          uploadToIPFS(
                            JSON.stringify(
                              updatedCacheHash.configs[networkName],
                              null,
                              2
                            )
                          )
                        }
                      >
                        <FiUpload></FiUpload> Config
                      </Button>
                      <Button
                        onClick={() =>
                          uploadToIPFS(
                            JSON.stringify(
                              updatedCacheHash.caches[networkName],
                              null,
                              2
                            )
                          )
                        }
                      >
                        <FiUpload></FiUpload> Cache
                      </Button>
                    </div>
                  )}
                </RowAlignedLeft>
                {updatedCacheHash.configs[networkName] && (
                  <RowAlignedLeft>
                    Received Config Hash:{' '}
                    {updatedCacheHash.configHashes[networkName]}
                    {'  '}
                    <FormLabel>
                      {updatedCacheHash.configHashes[networkName] ==
                      localConfig[networkName + '_targetHash'] ? (
                        <FiCheckCircle />
                      ) : (
                        <FiX />
                      )}
                    </FormLabel>
                  </RowAlignedLeft>
                )}
              </div>
            )
          );
        })}
      </FormContainer>
      <Row style={{ justifyContent: 'left' }}>
        <FormLabel>Update Proposal Titles</FormLabel>
        <InputBox
          type="checkbox"
          checked={updateProposalTitles}
          onChange={() => setUpdateProposalTitles(!updateProposalTitles)}
        ></InputBox>
      </Row>
      {buildingCacheState === 2 && (
        <Row>
          <Button onClick={downloadAll}>
            {' '}
            <FiDownload></FiDownload> Download All
          </Button>
        </Row>
      )}
      <Row>
        <Button onClick={runCacheScript}>Build Cache</Button>
        <Button onClick={resetCacheOptions}>Reset Options</Button>
        <CopyButton>
          <Copy toCopy={getOptionsLink()}>Build Link</Copy>
        </CopyButton>
      </Row>
    </Box>
  );
});

export default CachePage;
