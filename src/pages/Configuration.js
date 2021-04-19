import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link, useLocation } from 'react-router-dom';
import moment from 'moment';

const ConfigWrapper = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin-top: 24px;
  padding: 15px 20px;
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


const ConfigBox = styled.div`
  background: white;
  border: 1px solid var(--medium-gray);
  margin: auto;
  padding: 5px 10px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: fit-content;
  
  h3 {
    margin: 5px 0px;
  }
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
        root: { providerStore, configStore, blockchainStore },
    } = useStores();
    const { active: providerActive, library } = providerStore.getActiveWeb3React();
    const loading = !blockchainStore.initialLoadComplete;

    const [apiKeys, setApiKeys] = React.useState(configStore.getApiKeys() || {});
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
  
    if (!providerActive) {
      return (
          <ConfigWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to view scheme information
            </div>
          </ConfigWrapper>
      )
    } else if (loading) {
      return (
          <ConfigWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Getting Config information
            </div>
          </ConfigWrapper>
      )
    } else {
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
          </Row>
          <Row style={{maxWidth: "300px"}}>
            <ActiveButton onClick={saveApiKeys}>Save</ActiveButton>
          </Row>
        </ConfigWrapper>
      );
    }
});

export default DaiInformation;
