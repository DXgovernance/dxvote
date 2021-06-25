import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import Question from '../components/common/Question';
import { FiCheckCircle, FiX } from "react-icons/fi";
import Box from '../components/common/Box';

const Row = styled.div`
  flex-direction: row;
  flex: auto;
  display: flex;
  padding-top: 15px;
  justify-content: space-around;
`

const InputBox = styled.input`
  background-color: white;
  border: 1px solid var(--medium-gray );
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
        root: { providerStore, configStore, blockchainStore, pinataService, etherscanService },
    } = useStores();
    const { active: providerActive } = providerStore.getActiveWeb3React();
    const loading = !blockchainStore.initialLoadComplete;
    
    const [etherscanApiStatus, setEtherscanApiStatus] = React.useState(etherscanService.auth);
    const [pinataKeyStatus, setPinataKeyStatus] = React.useState(pinataService.auth);

    const [localConfig, setLocalConfig] = React.useState(configStore.getLocalConfig());
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    function onApiKeyValueChange(value, key) {
      localConfig[key] = value;
      setLocalConfig(localConfig)
      forceUpdate();
    }
    
    function saveConfig() {
      configStore.setLocalConfig(localConfig);
    }
    
    async function testApis() {
      await pinataService.isAuthenticated();
      await etherscanService.isAuthenticated();
      setPinataKeyStatus(pinataService.auth);  
      setEtherscanApiStatus(etherscanService.auth);
    }
    
    async function pinDXvoteHashes() {
      pinataService.updatePinList();
    }
  
    return (
      <Box style={{alignItems: "center"}}>
        <h2>API Keys <Question question="8"/></h2>
        <Row style={{maxWidth: "500px"}}>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>Etherscan:</span>
          <InputBox
            type="text"
            serviceName="etherscan"
            onChange={(event) => onApiKeyValueChange(event.target.value, "etherscan")}
            value={localConfig.etherscan}
            style={{width: "100%"}}
          ></InputBox>
          <span style={{ height: "34px", padding:"10px 0px"}}>
            {etherscanApiStatus ? <FiCheckCircle/> : <FiX/>}
          </span>
        </Row>
        <Row style={{maxWidth: "500px"}}>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>Pinata:</span>
          <InputBox
            type="text"
            serviceName="pinata"
            onChange={(event) => onApiKeyValueChange(event.target.value, "pinata")}
            value={localConfig.pinata}
            style={{width: "100%"}}
          ></InputBox>
          <span style={{ height: "34px", padding:"10px 0px"}}>
            {pinataKeyStatus ? <FiCheckCircle/> : <FiX/>}
          </span>
        </Row>
        <Row style={{maxWidth: "500px"}}>
          <span style={{height: "34px", padding:"10px 10px"}}>Pin DXdao hashes on start</span>
          <InputBox
            type="checkbox"
            checked={localConfig.pinOnStart}
            onChange={(event) => onApiKeyValueChange(event.target.checked, "pinOnStart")}
            style={{width: "20px"}}
          ></InputBox>
        </Row>
        <Row style={{maxWidth: "500px"}}>
          <ActiveButton onClick={saveConfig}>Save</ActiveButton>
          <ActiveButton onClick={testApis}>Test Apis</ActiveButton>
          <ActiveButton onClick={pinDXvoteHashes}>Pin Dxvote Hashes</ActiveButton>
        </Row>
      </Box>
    );
});

export default ConfigPage;
