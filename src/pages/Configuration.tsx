import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { FiCheckCircle, FiX } from "react-icons/fi";

const ConfigWrapper = styled.div`
  background: white;
  padding: 15px 20px;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const Row = styled.div`
  flex-direction: row;
  flex: auto;
  display: flex;
  padding-top: 15px;
  justify-content: space-around;
`

const InputBox = styled.input`
  background-color: white;
  border: 1px solid #536DFE;
  border-radius: 4px;
  color: #536DFE;
  height: 34px;
  letter-spacing: 1px;
  font-weight: 500;
  line-height: 32px;
  text-align: left;
  cursor: pointer;
  width: max-content;
  padding: 0px 10px;
  margin: 5px;
  font-family: var(--roboto);
`;
const DaiInformation = observer(() => {
    const {
        root: { providerStore, configStore, blockchainStore, pinataService, etherscanService },
    } = useStores();
    const { active: providerActive } = providerStore.getActiveWeb3React();
    const loading = !blockchainStore.initialLoadComplete;
    
    const [etherscanApiStatus, setEtherscanApiStatus] = React.useState(etherscanService.auth);
    const [pinataKeyStatus, setPinataKeyStatus] = React.useState(pinataService.auth);

    const [apiKeys, setApiKeys] = React.useState(configStore.getApiKeys());
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    function onApiKeyValueChange(event, key) {
      apiKeys[key] = event.target.value;
      setApiKeys(apiKeys)
      forceUpdate();
    }
    
    function saveApiKeys() {
      configStore.setApiKey('etherscan', apiKeys.etherscan);
      configStore.setApiKey('pinata', apiKeys.pinata);
    }
    
    async function testApis() {
      await pinataService.isAuthenticated();
      await etherscanService.isAuthenticated();
      setPinataKeyStatus(pinataService.auth);  
      setEtherscanApiStatus(etherscanService.auth);
    }
  
    return (
      <ConfigWrapper>
        <h2>API Keys</h2>
        <Row style={{maxWidth: "300px"}}>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>Etherscan:</span>
          <InputBox
            type="text"
            serviceName="etherscan"
            onChange={(event) => onApiKeyValueChange(event, "etherscan")}
            value={apiKeys.etherscan}
            style={{width: "50%"}}
          ></InputBox>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>
            {etherscanApiStatus ? <FiCheckCircle/> : <FiX/>}
          </span>
        </Row>
        <Row style={{maxWidth: "300px"}}>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>Pinata:</span>
          <InputBox
            type="text"
            serviceName="pinata"
            onChange={(event) => onApiKeyValueChange(event, "pinata")}
            value={apiKeys.pinata}
            style={{width: "50%"}}
          ></InputBox>
          <span style={{width: "80px", height: "34px", padding:"10px 0px"}}>
            {pinataKeyStatus ? <FiCheckCircle/> : <FiX/>}
          </span>
        </Row>
        <Row style={{maxWidth: "300px"}}>
          <ActiveButton onClick={saveApiKeys}>Save</ActiveButton>
          <ActiveButton onClick={testApis}>Test Apis</ActiveButton>
        </Row>
      </ConfigWrapper>
    );
});

export default DaiInformation;
