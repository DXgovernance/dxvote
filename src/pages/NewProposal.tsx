import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import ActiveButton from '../components/common/ActiveButton';
import Question from '../components/common/Question';
import Box from '../components/common/Box';
import MDEditor, { commands } from '@uiw/react-md-editor';
import contentHash from 'content-hash';
import { NETWORK_ASSET_SYMBOL } from '../provider/connectors';

import {
  ZERO_ADDRESS,
  ANY_ADDRESS,
  sleep,
  bnum,
  normalizeBalance,
  TXEvents
} from '../utils';

const NewProposalFormWrapper = styled(Box)`
    width: cacl(100% -40px);
    display: flex;
    padding: 10px 10px;
    justify-content: center;
    flex-direction: column;
`;

const PlaceHolders = styled.div`
    width: calc(100% - 1px);
    display: flex;
    align-items: center;
    font-size: 20px;
    padding-bottom: 0px;
`

const TitleInput = styled.div`
    width: calc(100% - 1px);
    display: flex;
    justify-content: left;
    flex-direction: row;
    margin-bottom: 10px;

    input {
      margin-top: 5px;
      width: 100%;
      height: 32px;
      margin-top: 5px;
      border-radius: 3px;
      border: 1px solid gray;
      padding: 0px 5px;
    }
    
    select {
      margin-left: 5px;
      background-color: white;
      min-width: 150px;
      height: 34px;
      margin-top: 5px;
      border-radius: 3px;
      border: 1px solid gray;
    }
`;

const TextActions = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    flex-direction: column;
    margin: 10px 0px;
    line-height: 30px;
    
`;

const CallRow = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    flex-direction: row;
    margin-bottom: 10px;
    
    span {
      text-align: center;
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 18px;
      padding: 10px 10px;
    }
`;

const RemoveButton = styled.div`
    background-color: grey;
    border: 1px solid black;
    border-radius: 10px;
    color: white;
    height: 25px;
    letter-spacing: 1px;
    font-weight: 500;
    line-height: 25px;
    text-align: center;
    cursor: pointer;
    width: max-content;
    padding: 0px 5px;
    margin: 5px;
`;

const TextInput = styled.input`
  width: ${(props) => props.width || '25%'};
  height: 34px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
`;

const SelectInput = styled.select`
  width: ${(props) => props.width || '25%'};
  height: 38px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
  background-color: #FFF;
`;

const NewProposalPage = observer(() => {
    const {
        context: { providerStore, daoStore, configStore, daoService, ipfsService, pinataService },
    } = useContext();
    
    const networkTokens = configStore.getTokensOfNetwork()
    const schemes = daoStore.getAllSchemes();
    const networkConfig = configStore.getNetworkConfig();
    const schemeInLocalStorage = localStorage.getItem('dxvote-newProposal-scheme');
    const networkAssetSymbol = NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];

    const defaultSchemeToUse = schemeInLocalStorage
      ? schemes.findIndex((scheme) => scheme.address == schemeInLocalStorage)
      : schemes.findIndex((scheme) => scheme.name == "MasterWalletScheme");

    const [schemeToUse, setSchemeToUse] =
      React.useState(defaultSchemeToUse > -1 ? schemes[defaultSchemeToUse] : schemes[0]);
    const [titleText, setTitleText] = React.useState(localStorage.getItem('dxvote-newProposal-title') || "");
    const [ipfsHash, setIpfsHash] = React.useState("");
    const [descriptionText, setDescriptionText] = React.useState(localStorage.getItem('dxvote-newProposal-description') || "");

    let callsInStorage = [];
    try {
      if (localStorage.getItem('dxvote-newProposal-calls')) {
        callsInStorage = JSON.parse(localStorage.getItem('dxvote-newProposal-calls'));
        if (callsInStorage.length > 0 && !callsInStorage[0].dataValues)
        callsInStorage = callsInStorage
          .map((callInStorage) => Object.assign(callInStorage, {dataValues: new Array(callInStorage.functionParams.length)}))
      }
    } catch (error) {
      callsInStorage = [];
    }
    const [calls, setCalls] = React.useState(callsInStorage);
    
    const [contributionRewardCalls, setContributionRewardCalls] = React.useState({
      beneficiary: "ZERO_ADDRESS",
      repChange: "0",
      ethValue: "0",
      externalToken: ZERO_ADDRESS,
      tokenValue: "0"
    });
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const [submitionState, setSubmitionState] = React.useState(0);
    // 0 = Proposal Description not uploaded
    // 1 = Uploading proposal description
    // 2 = Proposal description uploaded
    // 3 = Submiting new proposal tx
    // 4 = Proposal creation tx submited
    // 5 = Proposal creation tx receipt received
    
    const [errorMessage, setErrorMessage] = React.useState("");
    const proposalTemplates = configStore.getProposalTemplates();
    if (proposalTemplates[0].name != "Custom")
      proposalTemplates.unshift({name: "Custom", title: "", description: "" });

    const {
      assetLimits: transferLimits, recommendedCalls
    } = daoStore.getSchemeRecommendedCalls(schemeToUse.address);
    console.debug("[PERMISSIONS]",schemeToUse, transferLimits, recommendedCalls)
    
    let allowedToCall = [];
    
    recommendedCalls.map((recommendedCall) => {
      if((recommendedCall.fromTime > 0)
        && (allowedToCall.findIndex((allowedPermission) => allowedPermission.value == recommendedCall.to) < 0)
      ) {
        allowedToCall.push({ value: recommendedCall.to, name: recommendedCall.toName });
      }
    });
    
    const callPermissions = daoStore.getCache().callPermissions;
    if (schemeToUse.type == "WalletScheme"
      && callPermissions[ZERO_ADDRESS]
      && callPermissions[ZERO_ADDRESS]
      [schemeToUse.controllerAddress == networkConfig.controller ? networkConfig.avatar : schemeToUse.address]
      && callPermissions[ZERO_ADDRESS]
      [schemeToUse.controllerAddress == networkConfig.controller ? networkConfig.avatar : schemeToUse.address]
      [ANY_ADDRESS]
    )
      allowedToCall.push({ value: ANY_ADDRESS, name: "Custom" });

    const uploadToIPFS = async function() {
      if (titleText.length < 10) {
        setErrorMessage("Title has to be at mimimum 10 characters length");
      } else if (descriptionText.length == 0) {
        setErrorMessage("Description has to be at mimimum 100 characters length");
      } else {
        setSubmitionState(1);
        setErrorMessage("");
        console.log(schemeToUse.type)
        const bodyTextToUpload = (schemeToUse.type == "WalletScheme")
          ? descriptionText
          : JSON.stringify({
              description: descriptionText,
              title: titleText,
              tags: ["dxvote"],
              url: ""
            });
          
        const hash = await ipfsService.add(bodyTextToUpload);
        setIpfsHash(hash);
        
        if (pinataService.auth) {
          const pinataPin = await pinataService.pin(hash);
          console.debug('[PINATA PIN]', pinataPin.data)
        }
        const ipfsPin = await ipfsService.pin(hash);
        console.debug('[IPFS PIN]', ipfsPin)
        
        let uploaded = false;
        while (!uploaded) {
          const ipfsContent = await ipfsService.getContent(hash);
          console.debug('[IPFS CONTENT]', ipfsContent);
          if (ipfsContent == bodyTextToUpload)
            uploaded = true;
          await sleep(1000);
        }

        setSubmitionState(2);
      }
    }
    
    const createProposal = async function() {
      console.debug('[RAW PROPOSAL]', titleText, ipfsHash, calls);
      setSubmitionState(3);

      const { library } = providerStore.getActiveWeb3React();
      
      let to = [], data = [], value = [];
      try {
        
        if ((schemeToUse.type != "ContributionReward")) {
          const callToController = (schemeToUse.controllerAddress == networkConfig.controller);
          
          to = calls.map((call) => {
            return callToController ? networkConfig.controller : call.to;
          });

          data = calls.map((call) => {
            if (call.to == "")
              return "";
            
            let callData;
            
            if (call.callType == "simple") {
              let callDataFunctionSignature = "0x0";
              let callDataFunctionParamsEncoded = "";
              
              if (call.functionName.length == 0) {
                callDataFunctionSignature = "0x0";
              } else {
                callDataFunctionSignature = library.eth.abi.encodeFunctionSignature(call.functionName)
              }
              
              if (call.dataValues.length > 0) {
                callDataFunctionParamsEncoded = call.functionParams.length > 0 ? library.eth.abi.encodeParameters(
                    call.functionParams.map((functionParam) => functionParam.type),
                    call.dataValues
                  ).substring(2)
                  : "";
              }
              callData = callDataFunctionSignature + callDataFunctionParamsEncoded;
            } else {
              callData = call.dataValues[0];
            }
            if (callToController && call.to != networkConfig.controller) {
              return daoService.encodeControllerGenericCall(
                call.to,
                callData,
                call.callType === "simple" ? library.utils.toWei(call.value).toString()
                : call.value
              )
            } else {
              return callData;
            }
          });

          value = calls.map((call) => {
            return callToController ? "0"
            : call.callType === "simple" ? library.utils.toWei(call.value).toString()
              : call.value
          });
        }
        
        const proposalData = (schemeToUse.type == "ContributionReward")
        ? {
          beneficiary: contributionRewardCalls.beneficiary,
          reputationChange: normalizeBalance(bnum(contributionRewardCalls.repChange)).toString(),
          ethValue: contributionRewardCalls.ethValue,
          externalToken: contributionRewardCalls.externalToken,
          tokenValue: contributionRewardCalls.tokenValue,
          descriptionHash: contentHash.fromIpfs(ipfsHash)
        } : {
          to, data, value, titleText, descriptionHash: contentHash.fromIpfs(ipfsHash) 
        };
      
        console.debug('[PROPOSAL]', schemeToUse.address, proposalData);
      
        daoService.createProposal(
          schemeToUse.address,
          schemeToUse.type,
          proposalData,
        ).on(TXEvents.TX_HASH, (hash) => {
            console.debug("[TX_SUBMITTED]", hash);
            setSubmitionState(4);
            setErrorMessage("");
          })
          .on(TXEvents.RECEIPT, (hash) => {
            console.debug("[TX_RECEIPT]", hash);
            setSubmitionState(5);
          })
          .on(TXEvents.TX_ERROR, (txerror) => {
            console.error("[TX_ERROR]", txerror);
            setSubmitionState(2);
            setErrorMessage(txerror.message);
          })
          .on(TXEvents.INVARIANT, (error) => {
            console.error("[ERROR]", error);
            setSubmitionState(2);
            setErrorMessage(error.message);
          })
          .catch((error) => {
            console.error("[ERROR]", error);
            setSubmitionState(2);
            setErrorMessage(error.message);
          });
      } catch (error) {
        console.error('[PROPOSAL_ERROR]', error);
        setSubmitionState(2);
        setErrorMessage(error.message);
      }
      
    }
    
    function onDescriptionChange(newValue) {
      if (submitionState < 1) {
        setDescriptionText(newValue);
        localStorage.setItem('dxvote-newProposal-description', newValue);
      }
    }
    
    function onTitleChange(newValue) {
      if (submitionState < 1) {
        setTitleText(newValue.target.value);
        localStorage.setItem('dxvote-newProposal-title', newValue.target.value);
      }
    }
    
    function setCallsInState(calls) {
      localStorage.setItem('dxvote-newProposal-calls', JSON.stringify(calls));
      setCalls(calls);
      forceUpdate();
    }
    
    function setContributionRewardCallsInState(contributionRewardCalls) {
      setContributionRewardCalls(contributionRewardCalls);
      forceUpdate();
    }

    function addCall() {
      calls.push({
        callType: schemeToUse.type == "WalletScheme" ? "simple" : "advanced",
        allowedFunctions: [],
        to: "",
        data: "",
        functionName: "",
        functionParams: [],
        dataValues: [],
        value: ""
      })
      setCallsInState(calls);
    };
    
    function removeCall(proposalIndex) {
      calls.splice(proposalIndex, 1);
      setCallsInState(calls);
    };
    
    function changeCallType(callIndex) {
      calls[callIndex] = {
        callType: calls[callIndex].callType === "simple" ? "advanced" : "simple",
        allowedFunctions: [],
        to: "",
        data: "",
        functionName: "",
        functionParams: [],
        dataValues: [],
        value: ""
      }
      setCallsInState(calls);
    };
    
    function onToSelectChange(callIndex, event) {
      const toAddress = event.target.value;

      if (toAddress == ANY_ADDRESS) {
        changeCallType(callIndex);
      } else {
        calls[callIndex].to = toAddress;
        calls[callIndex].allowedFunctions = [];
        calls[callIndex].functionName = "";
        calls[callIndex].functionParams = [];
        calls[callIndex].dataValues = [];
        calls[callIndex].value = "0";
        recommendedCalls.map((recommendedCall) => {
          if (recommendedCall.to == toAddress && recommendedCall.fromTime > 0){
            calls[callIndex].allowedFunctions.push(recommendedCall);
          }
        });
        if (calls[callIndex].allowedFunctions.length > 0){
          calls[callIndex].functionName = calls[callIndex].allowedFunctions[0].functionName;
          calls[callIndex].functionParams = calls[callIndex].allowedFunctions[0].params;
          calls[callIndex].dataValues = new Array(calls[callIndex].allowedFunctions[0].params.length);
        }

        setCallsInState(calls);
      }
    }
    
    function onFunctionSelectChange(callIndex, functionName, params) {
      calls[callIndex].functionName = functionName;

      if (calls[callIndex].callType == "simple"){
        calls[callIndex].functionParams = params;
        calls[callIndex].dataValues = [];
        calls[callIndex].dataValues = params.map(() => {return ""});
        calls[callIndex].value = "0";
      } else {
        calls[callIndex].functionParams = [];
        calls[callIndex].dataValues = [""];
        calls[callIndex].value = "0";
      }
        
      setCallsInState(calls);
    }
    
    function onFunctionParamsChange(callIndex, event, paramIndex) {
      calls[callIndex].dataValues[paramIndex] = event.target.value;
      setCallsInState(calls);
    }
    
    function onValueChange(callIndex, event) {
      calls[callIndex].value = event.target.value;
      setCallsInState(calls);
    }
    
    function onContributionRewardValueChange(key, value) {
      contributionRewardCalls[key] = value;
      setContributionRewardCallsInState(contributionRewardCalls);
    }
    
    function onSchemeChange(event) {
      setSchemeToUse(schemes[event.target.value]);
      localStorage.setItem('dxvote-newProposal-scheme', schemes[event.target.value].address);
      calls.splice(0, calls.length);
      setContributionRewardCalls({
        beneficiary: "",
        repChange: "0",
        ethValue: "0",
        externalToken: ZERO_ADDRESS,
        tokenValue: "0"
      })
      setCallsInState(calls);
    }
    
    function onProposalTemplate(event) {
      if (proposalTemplates[event.target.value].name != 'Custom') {
        setTitleText(proposalTemplates[event.target.value].title);
        setDescriptionText(proposalTemplates[event.target.value].description);
        calls.splice(0, calls.length);
        setCallsInState(calls);
      }
    }

    return (
      <NewProposalFormWrapper>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
          <PlaceHolders>
            <span style={{width: "100%"}}>Title</span>
            <span style={{minWidth: "150px"}}>Scheme <Question question="2"/></span>
            <span style={{minWidth: "150px"}}>Template</span>
          </PlaceHolders>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <TitleInput>
            <input type="text" placeholder="Proposal Title" onChange={onTitleChange} value={titleText}/>
            <select name="scheme" id="schemeSelector" onChange={onSchemeChange} defaultValue={defaultSchemeToUse}>
              {schemes.map((scheme, i) =>{
                if (scheme.type == "WalletScheme" || scheme.type == "ContributionReward" ||scheme.type == "GenericMulticall")
                  return <option key={scheme.address} value={i}>{scheme.name}</option>
                else
                  return null;
              })}
            </select>
            <select name="proposalTemplate" id="proposalTemplateSelector" onChange={onProposalTemplate}>
              {proposalTemplates.map((template, i) =>{
                return <option key={"proposalTemplate"+i} value={i}>{template.name}</option>
              })}
            </select>
          </TitleInput>
        </div>
        {(submitionState < 1) ?
          <MDEditor
            value={descriptionText}
            onChange={onDescriptionChange}
            preview="edit"
            height="300"
            minHeight={300}
            maxHeight={1000}
            commands={[
              commands.bold,
              commands.italic,
              commands.strikethrough,
              commands.hr,
              commands.title,
              commands.divider,
              commands.link,
              commands.quote,
              commands.code,
              commands.image,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.checkedListCommand,
            ]}
          />
          : <div/>
        }
        <h2>Description Preview</h2>
        <MDEditor.Markdown source={descriptionText} style={{
          backgroundColor: "white",
          borderRadius: "5px",
          border: "1px solid gray",
          padding: "20px 10px"
        }} />
        {(schemeToUse.type == "ContributionReward" || schemeToUse.type == "GenericMulticall")
          || (schemeToUse.type == "WalletScheme" && schemeToUse.controllerAddress == networkConfig.controller)
          ? <h2>Calls executed from the avatar <Question question="9"/></h2>
          : <h2>Calls executed from the scheme <Question question="9"/></h2>
        }
        {Object.keys(transferLimits).map((assetAddress) => {
          if (assetAddress == ZERO_ADDRESS)
            return <h3>Transfer limit of {normalizeBalance(transferLimits[assetAddress]).toString()} {networkAssetSymbol}</h3>;
          else {
            const token = networkTokens.find(networkToken => networkToken.address == assetAddress);
            if (token)
              return <h3>Transfer limit of {normalizeBalance(transferLimits[assetAddress], token.decimals).toString()} {token.symbol}</h3>;
            else
              return <h3>Transfer limit {transferLimits[assetAddress].toString()} of asset {assetAddress}</h3>;
          }
        })}
      
        {(schemeToUse.type == "ContributionReward")
        ? 
        // If scheme to use is Contribution Reward display a different form with less fields
        <div>
          <CallRow>
            <span style={{width: "20%", fontSize:"13px"}}>Beneficiary Account</span>
            <span style={{width: "20%", fontSize:"13px"}}>REP Change</span>
            <span style={{width: "20%", fontSize:"13px"}}>{networkAssetSymbol} Value (in WEI)</span>
            <span style={{width: "20%", fontSize:"13px"}}>Address of Token</span>
            <span style={{width: "20%", fontSize:"13px"}}>Token Amount (in WEI)</span>
          </CallRow>
          <CallRow>
            <TextInput
              type="text"
              onChange={(event) => onContributionRewardValueChange("beneficiary", event.target.value)}
              value={contributionRewardCalls.beneficiary}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={(event) => onContributionRewardValueChange("repChange", event.target.value)}
              value={contributionRewardCalls.repChange}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={(event) => onContributionRewardValueChange("ethValue", event.target.value)}
              value={contributionRewardCalls.ethValue}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={(event) => onContributionRewardValueChange("externalToken", event.target.value)}
              value={contributionRewardCalls.externalToken}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={(event) => onContributionRewardValueChange("tokenValue", event.target.value)}
              value={contributionRewardCalls.tokenValue}
              width="50%"
            />
          </CallRow>
        </div>
        
        : 
        // If the scheme is GenericMulticall allow only advanced encoded calls
        // At last if the scheme used is a Wallet Scheme type allow a complete edition of the calls :)
          <div>
            {calls.map((call, i) => 
              <CallRow key={"call"+i}>
                <span>#{i}</span>

                {((schemeToUse.type == "WalletScheme") && (call.callType === "simple")) ?
                  <SelectInput
                    value={calls[i].to || ""}
                    onChange={(value) => {onToSelectChange(i, value)}}
                    width={"20%"}
                  >
                  {allowedToCall.map((allowedCall, allowedCallIndex) =>{
                    return (
                      <option key={"toCall"+allowedCallIndex} value={allowedCall.value || ""}>
                        {allowedCall.name}
                      </option>
                    );
                  })}
                  </SelectInput>
                  : (schemeToUse.type != "ContributionReward") &&
                  <TextInput
                    value={calls[i].to || ""}
                    onChange={(value) => {onToSelectChange(i, value)}}
                    width={"20%"}
                  />
                }
                
                { call.callType === "simple" ?
                  
                  <div style={{display: "flex", width: call.callType === "simple" ? "60%" : "50%"}}>
                    <SelectInput
                      value={calls[i].functionName || ""}
                      onChange={(event) => {
                        const selectedFunction = calls[i].allowedFunctions.find((allowedFunction) => {
                          return allowedFunction.functionName == event.target.value
                        });
                        onFunctionSelectChange(
                          i,
                          event.target.value,
                          selectedFunction ? selectedFunction.params : ""
                        )
                      }}
                      width="40%"
                    >
                      {calls[i].allowedFunctions.map((allowedFunc, allowedFuncIndex) =>{
                        return (
                          <option key={"functionToCall"+allowedFuncIndex} value={allowedFunc.functionName || ""}>
                            {allowedFunc.functionName}
                          </option>
                        );
                      })}
                    </SelectInput>
                    
                    <div style={{display: "flex", width: "100%", flexDirection: "column", paddingRight: "10px"}}>
                      {calls[i].functionParams.length == 0 ?
                        <TextInput 
                          key={"functionParam00"}
                          disabled
                          type="text"
                          placeholder="Select address to call and function"
                          width="100%"
                          style={{marginTop: "0px"}}
                        />
                      : calls[i].functionParams.map((funcParam, funcParamIndex) => {
                        return (
                          <TextInput 
                            key={"functionParam"+funcParamIndex}
                            type="text"
                            onChange={(value) => onFunctionParamsChange(i, value, funcParamIndex)}
                            value={calls[i].dataValues[funcParamIndex] || ""}
                            placeholder={funcParam.name}
                            width="100%"
                            style={{marginTop: funcParamIndex > 0 ? "5px": "0px"}}
                          />
                        );
                        
                      })}
                    </div>
                  </div>
                :
                  <TextInput 
                    type="text"
                    onChange={(value) => onFunctionParamsChange(i, value, 0)}
                    value={calls[i].dataValues[0] || ""}
                    placeholder="0x..."
                    width="100%"
                  />
                }
                
                <TextInput
                  type="text"
                  onChange={(value) => onValueChange(i, value)}
                  value={calls[i].value || ""}
                  width="10%"
                  placeholder={calls[i].callType === "advanced" ? "WEI" : {networkAssetSymbol}}
                />
                
                <RemoveButton onClick={() => {removeCall(i)}}>X</RemoveButton>
                { schemeToUse.type == "WalletScheme"
                  ? <RemoveButton onClick={() => {changeCallType(i)}}>
                    {calls[i].callType === "advanced" ? "Simple" : "Advanced"}
                    </RemoveButton>
                  : <div/>
                }
              </CallRow>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
              <ActiveButton onClick={addCall}>Add Call</ActiveButton>
            </div>
            
          </div>
        }
        
        {
          (errorMessage.length > 0) ?
            <TextActions>
              <span>
                {errorMessage}
              </span>
            </TextActions>
          : <div/>
        }
        { (submitionState > 1) ?
            <TextActions>
              <span>
                Uploaded to IPFS:
                  <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank">https://ipfs.io/ipfs/{ipfsHash}</a>
                <br/>
                Check before submitting proposal
              </span>
            </TextActions>
          : <div/>
        }
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
          {
            (submitionState == 0) ?
              <ActiveButton onClick={uploadToIPFS}> Upload to IPFS </ActiveButton>
            : (submitionState == 1) ?
              <ActiveButton> Uploading descritpion to IPFS.. </ActiveButton>
            : (submitionState == 2) ?
              <ActiveButton onClick={createProposal}>Submit Proposal</ActiveButton>
            : (submitionState == 3) ?
              <ActiveButton>Submiting TX...</ActiveButton>
            : (submitionState == 4) ?
              <ActiveButton>Waiting for TX...</ActiveButton>
            :
              <ActiveButton route="/">Back to Proposals</ActiveButton>
          }
        </div>
        
      </NewProposalFormWrapper>
    );
});

export default NewProposalPage;
