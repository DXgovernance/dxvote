import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { Button } from '../components/common/Button';
import Question from '../components/common/Question';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import Box from '../components/common/Box';
import { useActiveWeb3React } from 'provider/providerHooks';
import { injected } from 'provider/connectors';

const Row = styled.div`
  flex-direction: row;
  flex: auto;
  display: flex;
  padding-top: 15px;
  justify-content: space-around;
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

const Dropdown = styled.select`
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

const ConfigPage = observer(() => {
  const {
    context: {
      configStore,
      pinataService,
      etherscanService,
      infuraService,
      alchemyService,
      customRpcService,
    },
  } = useContext();
  const { connector } = useActiveWeb3React();

  const [etherscanApiStatus, setEtherscanApiStatus] = React.useState(
    etherscanService.auth
  );
  const [pinataKeyStatus, setPinataKeyStatus] = React.useState(
    pinataService.auth
  );
  const [infuraKeyStatus, setInfuraKeyStatus] = React.useState(
    infuraService.auth
  );
  const [alchemyKeyStatus, setAlchemyKeyStatus] = React.useState(
    alchemyService.auth
  );
  const [customRpcUrlStatus, setCustomRpcUrlStatus] = React.useState(
    customRpcService.auth
  );

  const [localConfig, setLocalConfig] = React.useState(
    configStore.getLocalConfig()
  );
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  function onApiKeyValueChange(value, key) {
    localConfig[key] = value;
    setLocalConfig(localConfig);
    forceUpdate();
  }

  function saveConfig() {
    configStore.setLocalConfig(localConfig);
  }

  async function testApis() {
    await pinataService.isAuthenticated();
    await etherscanService.isAuthenticated();
    await infuraService.isAuthenticated();
    await alchemyService.isAuthenticated();
    await customRpcService.isAuthenticated();
    setPinataKeyStatus(pinataService.auth);
    setEtherscanApiStatus(etherscanService.auth);
    setInfuraKeyStatus(infuraService.auth);
    setAlchemyKeyStatus(alchemyService.auth);
    setCustomRpcUrlStatus(customRpcService.auth);
  }

  async function pinDXvoteHashes() {
    pinataService.updatePinList();
  }

  async function clearCache() {
    localStorage.clear();
    caches.delete(`dxvote-cache`);
  }

  return (
    <Box style={{ alignItems: 'center' }}>
      <h2>
        API Keys <Question question="8" />
      </h2>
      <Row style={{ maxWidth: '500px' }}>
        <span style={{ width: '80px', height: '34px', padding: '10px 0px' }}>
          Etherscan:
        </span>
        <InputBox
          type="text"
          serviceName="etherscan"
          onChange={event =>
            onApiKeyValueChange(event.target.value, 'etherscan')
          }
          value={localConfig.etherscan}
          style={{ width: '100%' }}
        ></InputBox>
        <span style={{ height: '34px', padding: '10px 0px' }}>
          {etherscanApiStatus ? <FiCheckCircle /> : <FiX />}
        </span>
      </Row>
      <Row style={{ maxWidth: '500px' }}>
        <span style={{ width: '80px', height: '34px', padding: '10px 0px' }}>
          Pinata:
        </span>
        <InputBox
          type="text"
          serviceName="pinata"
          onChange={event => onApiKeyValueChange(event.target.value, 'pinata')}
          value={localConfig.pinata}
          style={{ width: '100%' }}
        ></InputBox>
        <span style={{ height: '34px', padding: '10px 0px' }}>
          {pinataKeyStatus ? <FiCheckCircle /> : <FiX />}
        </span>
      </Row>

      {connector != injected && (
        <>
          <Row style={{ maxWidth: '500px' }}>
            <span
              style={{ width: '80px', height: '34px', padding: '10px 0px' }}
            >
              RPC:
            </span>
            <Dropdown
              onChange={event =>
                onApiKeyValueChange(event.target.value, 'rpcType')
              }
              value={localConfig.rpcType}
              style={{ width: '100%' }}
            >
              <option value="">Default</option>
              <option value="infura">Infura</option>
              <option value="alchemy">Alchemy</option>
              <option value="custom">Custom</option>
            </Dropdown>
          </Row>

          {localConfig.rpcType === 'infura' && (
            <Row style={{ maxWidth: '500px' }}>
              <span
                style={{ width: '80px', height: '34px', padding: '10px 0px' }}
              >
                Infura:
              </span>
              <InputBox
                type="text"
                serviceName="infura"
                onChange={event =>
                  onApiKeyValueChange(event.target.value, 'infura')
                }
                value={localConfig.infura}
                style={{ width: '100%' }}
              ></InputBox>
              <span style={{ height: '34px', padding: '10px 0px' }}>
                {infuraKeyStatus ? <FiCheckCircle /> : <FiX />}
              </span>
            </Row>
          )}
          {localConfig.rpcType === 'alchemy' && (
            <Row style={{ maxWidth: '500px' }}>
              <span
                style={{ width: '80px', height: '34px', padding: '10px 0px' }}
              >
                Alchemy:
              </span>
              <InputBox
                type="text"
                serviceName="alchemy"
                onChange={event =>
                  onApiKeyValueChange(event.target.value, 'alchemy')
                }
                value={localConfig.alchemy}
                style={{ width: '100%' }}
              ></InputBox>
              <span style={{ height: '34px', padding: '10px 0px' }}>
                {alchemyKeyStatus ? <FiCheckCircle /> : <FiX />}
              </span>
            </Row>
          )}
          {localConfig.rpcType === 'custom' && (
            <Row style={{ maxWidth: '500px' }}>
              <span
                style={{ width: '80px', height: '34px', padding: '10px 0px' }}
              >
                RPC URL:
              </span>
              <InputBox
                type="text"
                serviceName="customRpcUrl"
                onChange={event =>
                  onApiKeyValueChange(event.target.value, 'customRpcUrl')
                }
                value={localConfig.customRpcUrl}
                style={{ width: '100%' }}
              ></InputBox>
              <span style={{ height: '34px', padding: '10px 0px' }}>
                {customRpcUrlStatus ? <FiCheckCircle /> : <FiX />}
              </span>
            </Row>
          )}
        </>
      )}
      <Row style={{ maxWidth: '500px' }}>
        <span style={{ height: '34px', padding: '10px 10px' }}>
          Pin DXdao hashes on start
        </span>
        <InputBox
          type="checkbox"
          checked={localConfig.pinOnStart}
          onChange={event =>
            onApiKeyValueChange(event.target.checked, 'pinOnStart')
          }
          style={{ width: '20px' }}
        ></InputBox>
      </Row>
      <Row style={{ maxWidth: '500px' }}>
        <Button onClick={saveConfig}>Save</Button>
        <Button onClick={testApis}>Test Apis</Button>
        <Button onClick={clearCache}>Clear Cache</Button>
        <Button onClick={pinDXvoteHashes}>Pin DXVote Hashes</Button>
      </Row>
    </Box>
  );
});

export default ConfigPage;
