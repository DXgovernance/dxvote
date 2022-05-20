import { useContext } from '../contexts';
import { Row, Box, Question, Button } from '../old-components/common';
import { observer } from 'mobx-react';
import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import styled from 'styled-components';

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

const FormContainer = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ConfigPage = observer(() => {
  const {
    context: {
      configStore,
      pinataService,
      etherscanService,
      infuraService,
      poktService,
      alchemyService,
      customRpcService,
    },
  } = useContext();
  const networkName = configStore.getActiveChainName();

  const [etherscanApiStatus, setEtherscanApiStatus] = React.useState(
    etherscanService.auth
  );
  const [pinataKeyStatus, setPinataKeyStatus] = React.useState(
    pinataService.auth
  );
  const [infuraKeyStatus, setInfuraKeyStatus] = React.useState(
    infuraService.auth
  );
  const [poktStatus, setPoktStatus] = React.useState(poktService.auth);
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
    await etherscanService.isAuthenticated(networkName);
    await infuraService.isAuthenticated();
    await poktService.isAuthenticated();
    await alchemyService.isAuthenticated();
    await customRpcService.isAuthenticated();
    setPinataKeyStatus(pinataService.auth);
    setEtherscanApiStatus(etherscanService.auth);
    setInfuraKeyStatus(infuraService.auth);
    setPoktStatus(poktService.auth);
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
    <Box centered>
      <h2>
        API Keys <Question question="8" />
      </h2>
      <FormContainer>
        <Row>
          <FormLabel>Etherscan:</FormLabel>
          <InputBox
            type="text"
            onChange={event =>
              onApiKeyValueChange(event.target.value, 'etherscan')
            }
            value={localConfig.etherscan}
          ></InputBox>
          <FormLabel>
            {etherscanApiStatus ? <FiCheckCircle /> : <FiX />}
          </FormLabel>
        </Row>
        <Row>
          <FormLabel>Pinata:</FormLabel>
          <InputBox
            type="text"
            onChange={event =>
              onApiKeyValueChange(event.target.value, 'pinata')
            }
            value={localConfig.pinata}
          ></InputBox>
          <FormLabel>{pinataKeyStatus ? <FiCheckCircle /> : <FiX />}</FormLabel>
        </Row>

        <Row>
          <FormLabel>RPC:</FormLabel>
          <Dropdown
            onChange={event =>
              onApiKeyValueChange(event.target.value, 'rpcType')
            }
            value={localConfig.rpcType}
          >
            <option value="">Default</option>
            <option value="pokt">Pokt</option>
            <option value="infura">Infura</option>
            <option value="alchemy">Alchemy</option>
            <option value="custom">Custom</option>
          </Dropdown>
        </Row>

        {localConfig.rpcType === 'pokt' && (
          <Row>
            <FormLabel>Pokt:</FormLabel>
            <InputBox
              type="text"
              onChange={event =>
                onApiKeyValueChange(event.target.value, 'pokt')
              }
              value={localConfig.pokt}
            ></InputBox>
            <FormLabel>{poktStatus ? <FiCheckCircle /> : <FiX />}</FormLabel>
          </Row>
        )}
        {localConfig.rpcType === 'infura' && (
          <Row>
            <FormLabel>Infura:</FormLabel>
            <InputBox
              type="text"
              onChange={event =>
                onApiKeyValueChange(event.target.value, 'infura')
              }
              value={localConfig.infura}
            ></InputBox>
            <FormLabel>
              {infuraKeyStatus ? <FiCheckCircle /> : <FiX />}
            </FormLabel>
          </Row>
        )}
        {localConfig.rpcType === 'alchemy' && (
          <Row>
            <FormLabel>Alchemy:</FormLabel>
            <InputBox
              type="text"
              onChange={event =>
                onApiKeyValueChange(event.target.value, 'alchemy')
              }
              value={localConfig.alchemy}
            ></InputBox>
            <FormLabel>
              {alchemyKeyStatus ? <FiCheckCircle /> : <FiX />}
            </FormLabel>
          </Row>
        )}
        {localConfig.rpcType === 'custom' && (
          <Row>
            <FormLabel>RPC URL:</FormLabel>
            <InputBox
              type="text"
              onChange={event =>
                onApiKeyValueChange(event.target.value, 'customRpcUrl')
              }
              value={localConfig.customRpcUrl}
            ></InputBox>
            <FormLabel>
              {customRpcUrlStatus ? <FiCheckCircle /> : <FiX />}
            </FormLabel>
          </Row>
        )}
      </FormContainer>
      <Row>
        <FormLabel>Pin DXdao hashes on start</FormLabel>
        <InputBox
          type="checkbox"
          checked={localConfig.pinOnStart}
          onChange={event =>
            onApiKeyValueChange(event.target.checked, 'pinOnStart')
          }
        ></InputBox>
      </Row>
      <Row>
        <Button onClick={saveConfig}>Save</Button>
        <Button onClick={testApis}>Test Apis</Button>
        <Button onClick={clearCache}>Clear Cache</Button>
        <Button onClick={pinDXvoteHashes}>Pin DXVote Hashes</Button>
      </Row>
    </Box>
  );
});

export default ConfigPage;
