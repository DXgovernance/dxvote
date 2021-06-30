import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import { ZERO_ADDRESS, ANY_ADDRESS, ANY_FUNC_SIGNATURE, ERC20_TRANSFER_SIGNATURE, sleep } from '../utils/helpers';
import ActiveButton from '../components/common/ActiveButton';
import Question from '../components/common/Question';
import Box from '../components/common/Box';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useHistory } from "react-router-dom";
import contentHash from 'content-hash';
import ProposalTemplates from '../config/proposalTemplates';
import { TXEvents } from '../enums';

const NewProposalFormWrapper = styled(Box)`
    width: cacl(100% -40px);
    display: flex;
    padding: 10px 10px;
    justify-content: center;
    flex-direction: column;
`;

const SchemeInput = styled.div`
    width: 100%;
    display: flex;
    justify-content: left;
    flex-direction: row;
    margin-bottom: 10px;
    
    label {
      text-align: center;
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 18px;
      padding: 10px 10px;
    }

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

const AddButton = styled.div`
    background-color: var(--blue-text);
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

const CallInput = styled.input`
  width: ${(props) => props.width || '25%'};
  max-width: 500px;
  height: 34px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
`;

const SelectEditable = styled.div`

  position:relative;
  background-color:white;
  border:solid grey 1px; 
  width:120px;
  height:18px;

  select {
    position:absolute; top:0px; left:0px; font-size:14px; border:none; width:120px; margin:0;
  }
  input {
    position:absolute; top:0px; left:0px; width:100px; padding:1px; font-size:12px; border:none;
  }
  select:focus, .select-editable input:focus {
    outline:none;
  }
`

const NewProposalPage = observer(() => {
    let history = useHistory();

    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService, pinataService, blockchainStore },
    } = useStores();
    
    if (configStore.getActiveChainName() == 'mainnet')
      history.push('/')
    
    const { active, account } = providerStore.getActiveWeb3React();
    
    const schemes = daoStore.getAllSchemes();
    const networkConfig = configStore.getNetworkConfig();
    const schemeInLocalStorage = localStorage.getItem('dxvote-newProposal-scheme');
    console.log(schemeInLocalStorage)
    const defaultSchemeToUse = schemeInLocalStorage
      ? schemes.findIndex((scheme) => scheme.address == schemeInLocalStorage)
      : schemes.findIndex((scheme) => scheme.name == "MasterWalletScheme");

    const [schemeToUse, setSchemeToUse] =
      React.useState(defaultSchemeToUse > -1 ? schemes[defaultSchemeToUse] : schemes[0]);
    const [titleText, setTitleText] = React.useState(localStorage.getItem('dxvote-newProposal-title'));
    const [ipfsHash, setIpfsHash] = React.useState("");
    const [descriptionText, setDescriptionText] = React.useState(localStorage.getItem('dxvote-newProposal-description'));
    const [calls, setCalls] = React.useState(
      localStorage.getItem('dxvote-newProposal-calls') ? 
        JSON.parse(localStorage.getItem('dxvote-newProposal-calls'))
      : []
    );
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);

    const [submitionState, setSubmitionState] = React.useState(0);
    // 0 = Proposal Description not uploaded
    // 1 = Uploading proposal description
    // 2 = Proposal description uploaded
    // 3 = Submiting new proposal tx
    // 4 = Proposal submited
    
    if (ProposalTemplates[0].name != "Custom")
      ProposalTemplates.unshift({name: "Custom", title: "", description: "" });

    const uploadToIPFS = async function() {
      setSubmitionState(1);
      const hash = await ipfsService.add(descriptionText);
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
        if (ipfsContent == descriptionText)
          uploaded = true;
        await sleep(1000);
      }

      setSubmitionState(2);
    }
    
    const createProposal = async function() {
      console.debug('[RAW PROPOSAL]', schemeToUse, calls, titleText, ipfsHash);
      setSubmitionState(3);

      const { library } = providerStore.getActiveWeb3React();
      
      try {
        const callToController = (schemeToUse.controllerAddress == networkConfig.controller);
        
        const to = calls.map((call) => {
          return callToController ? networkConfig.controller : call.to;
        });

        const data = calls.map((call) => {
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
            
            if (call.functionParams.length > 0) {
              const parameters = (call.functionName.length > 0 && call.functionParams.length > 0)
                ? call.functionName.substring(
                  call.functionName.indexOf("(") + 1, call.functionName.lastIndexOf(")")).split(",")
                : [];
              callDataFunctionParamsEncoded = parameters.length > 0 ? library.eth.abi.encodeParameters(
                  parameters,
                  call.functionParams
                ).substring(2)
                : "";
            }
            callData = callDataFunctionSignature + callDataFunctionParamsEncoded;
          } else {
            callData = call.data;
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

        const value = calls.map((call) => {
          return callToController ? "0"
          : call.callType === "simple" ? library.utils.toWei(call.value).toString()
            : call.value
        });
        
        console.debug('[PROPOSAL]', schemeToUse.address, to, data, value, titleText, contentHash.fromIpfs(ipfsHash))
        daoStore.createProposal(schemeToUse.address, to, data, value, titleText, contentHash.fromIpfs(ipfsHash))
          .on(TXEvents.TX_HASH, (hash) => {
            console.debug("[TX_SUBMITTED]", hash);
            // setSubmitionState(4);
          })
          .on(TXEvents.RECEIPT, (hash) => {
            console.debug("[TX_RECEIPT]", hash);
            setSubmitionState(4);
          })
          .on(TXEvents.TX_ERROR, (txerror) => {
              console.error("[TX_ERROR]", txerror);
              setSubmitionState(-1);
          })
          .on(TXEvents.INVARIANT, (error) => {
              console.error("[ERROR]", error);
              setSubmitionState(-1);
          });
      } catch (error) {
        console.error('[PROPOSAL_ERROR]', error);
        setSubmitionState(-1);
      }
      
    }
    
    function onDescriptionChange(newValue) {
      if (submitionState < 1) {
        setDescriptionText(newValue);
        localStorage.setItem('dxvote-newProposal-description', newValue);
      }
    }
    
    function onTitleChange(newValue) {
      setTitleText(newValue.target.value);
      localStorage.setItem('dxvote-newProposal-title', newValue.target.value);
    }
    
    let callToAny = false;
    let callAnyFunction = false;
    let allowedToCall = [];
    
    if (schemeToUse.controllerAddress == networkConfig.controller) {
      allowedToCall.push({ value: networkConfig.controller, name: `DXController ${networkConfig.controller}` });
    }
    // TO DO: Check that the permission regsitry is allowed, we assume it is
    allowedToCall.push({ value: networkConfig.permissionRegistry, name: `PermissionRegistry ${networkConfig.permissionRegistry}` });
    
    // Add ERC20 tokens
    if (networkConfig.tokens)
      Object.keys(networkConfig.tokens).map((tokenAddress) => {
        allowedToCall.push({
          value: tokenAddress,
          name: `${networkConfig.tokens[tokenAddress].name} ${tokenAddress}`
        });
      });
      
    function setCallsInState(calls) {
      localStorage.setItem('dxvote-newProposal-calls', JSON.stringify(calls));
      setCalls(calls);
      forceUpdate();
    }

    function addCall() {
      calls.push({
        callType: "simple",
        allowedFunctions: [],
        to: "",
        data: "",
        functionName: "",
        functionParams: [],
        value: ""
      })
      setCallsInState(calls);
    };
    
    function removeCall(proposalIndex) {
      calls.splice(proposalIndex, 1);
      setCallsInState(calls);
    };
    
    function changeCallType(proposalIndex) {
      calls[proposalIndex] = {
        callType: calls[proposalIndex].callType === "simple" ? "advanced" : "simple",
        allowedFunctions: [],
        to: "",
        data: "",
        functionName: "",
        functionParams: [],
        value: ""
      }
      setCallsInState(calls);
    };
    
    function onToSelectChange(callIndex, event) {
      const toAddress = event.target.value;

      calls[callIndex].to = toAddress;
      
      if (toAddress && toAddress.length > 0) {
        calls[callIndex].allowedFunctions = [];
        if (toAddress == networkConfig.controller) {
          calls[callIndex].allowedFunctions.push({
            value: "mintReputation(uint256,address,address)",
            params: "uint256 _amount, address _to, address _avatar"
          });
          calls[callIndex].allowedFunctions.push({
            value: "burnReputation(uint256,address,address)",
            params: "uint256 _amount, address _from, address _avatar"
          });
          calls[callIndex].allowedFunctions.push({
            value: "registerScheme(address,bytes32,bytes4,address)",
            params: "address _scheme, bytes32 _paramsHash, bytes4 _permissions, address _avatar"
          });
          calls[callIndex].allowedFunctions.push({
            value: "unregisterScheme(address,address)",
            params: "address _scheme, address _avatar"
          });
          calls[callIndex].allowedFunctions.push({
            value: "genericCall(address,bytes,addres,uint256)",
            params: "address _contract, bytes calldata _data, Avatar _avatar, uint256 _value"
          });
        } else if (toAddress == networkConfig.permissionRegistry) {
          if (schemeToUse.controllerAddress == networkConfig.controller) {
            calls[callIndex].allowedFunctions.push({
              value: "setTimeDelay(uint256)",
              params: "uint256 newTimeDelay"
            });
            calls[callIndex].allowedFunctions.push({
              value: "setAdminPermission(address,address,address,bytes4,uint256,bool)",
              params: "address asset, address from, address to, bytes4 functionSignature, uint256 valueAllowed, bool allowed"
            });
          } else {
            calls[callIndex].allowedFunctions.push({
              value: "setPermission(address,address,bytes4,uint256,bool)",
              params: "address asset, address to, bytes4 functionSignature, uint256 valueAllowed, bool allowed"
            });
          }
        } else if ((toAddress == networkConfig.votingMachineToken) || networkConfig.tokens[toAddress]) {
          calls[callIndex].allowedFunctions.push({ value: "transfer(address,uint256)", params: `address to ,uint256 value` });
          calls[callIndex].allowedFunctions.push({ value: "approve(address,uint256)", params: `address to,uint256 value` });
          calls[callIndex].allowedFunctions.push({ value: "transferFrom(address,address,uint256)", params: `address from ,address to,uint256 value` });
        } else {
          schemeToUse.callPermissions.map((callPermission) => {
            if (callPermission.fromTime > 0)
              if ((callPermission.asset == ZERO_ADDRESS) && (callPermission.to == toAddress)){
                if (callPermission.functionSignature == ANY_FUNC_SIGNATURE)
                  callAnyFunction = true;
                else
                  calls[callIndex].allowedFunctions.push({ value: callPermission.functionSignature, params: callPermission.functionSignature });
              } else if (callPermission.asset == toAddress) {
                calls[callIndex].allowedFunctions.push({ value: "transfer(address,uint256)", params: `address to ,uint256 value` });
                calls[callIndex].allowedFunctions.push({ value: "approve(address,uint256)", params: `address to,uint256 value` });
                calls[callIndex].allowedFunctions.push({ value: "transferFrom(address,address,uint256)", params: `address from ,address to,uint256 value` });
              }
          });
        }
      }
      setCallsInState(calls);
    }
    
    function onFunctionSelectChange(callIndex, functionSelected, params) {
      calls[callIndex].functionName = functionSelected.target.value;
      calls[callIndex].functionParams = params.split(",");
      setCallsInState(calls);
    }
    
    function onFunctionParamsChange(callIndex, event, paramIndex) {
      calls[callIndex].functionParams[paramIndex] = event.target.value;
      setCallsInState(calls);
    }
    
    function onValueChange(callIndex, event) {
      calls[callIndex].value = event.target.value;
      setCallsInState(calls);
    }
    
    function onCallDataChange(callIndex, event) {
      calls[callIndex].data = event.target.value;
      setCallsInState(calls);
    }
    
    function onSchemeChange(event) {
      setSchemeToUse(schemes[event.target.value]);
      localStorage.setItem('dxvote-newProposal-scheme', schemes[event.target.value].address);
      calls.splice(0, calls.length);
      setCallsInState(calls);
    }
    
    function onProposalTemplate(event) {
      if (ProposalTemplates[event.target.value].name != 'Custom') {
        setTitleText(ProposalTemplates[event.target.value].title);
        setDescriptionText(ProposalTemplates[event.target.value].description);
        calls.splice(0, calls.length);
        setCallsInState(calls);
      }
    }
    schemeToUse.callPermissions.map((callPermission) => {
      if (callPermission.fromTime > 0)
        if (callPermission.asset == ZERO_ADDRESS) {
          if (callPermission.to == ANY_ADDRESS){
            callToAny = true;
            allowedToCall.push({ value: "", name: "Custom" });
            if (callPermission.functionSignature == ANY_FUNC_SIGNATURE)
              callAnyFunction = true;
          }
          else {
            if (allowedToCall.findIndex((allowedPermission) => allowedPermission.value == callPermission.to) < 0)
              allowedToCall.push({ value: callPermission.to, name: callPermission.to });
          }
        } else {
          if (allowedToCall.findIndex((allowedPermission) => allowedPermission.value == callPermission.asset) < 0)
            allowedToCall.push({ value: callPermission.asset, name: `ERC20 ${callPermission.asset}` });
        }
    });
    
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
                return <option key={scheme.address} value={i}>{scheme.name}</option>
              })}
            </select>
            <select name="proposalTemplate" id="proposalTemplateSelector" onChange={onProposalTemplate}>
              {ProposalTemplates.map((template, i) =>{
                return <option key={"proposalTemplate"+i} value={i}>{template.name}</option>
              })}
            </select>
          </TitleInput>
        </div>
        {(submitionState < 1) ?
          <MDEditor
            value={descriptionText}
            disabled={submitionState > 0}
            onChange={onDescriptionChange}
            preview="edit"
            height="300"
            minheights="300"
            maxheights="1000"
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
        {schemeToUse.controllerAddress == networkConfig.controller ?
          <h2>Calls executed from the avatar <Question question="9"/></h2>
          :<h2>Calls executed from the scheme <Question question="9"/></h2>
        }
        {calls.map((call, i) => 
          <CallRow key={"call"+i}>
            <span>#{i}</span>

            <CallInput
              list="allowedCalls"
              value={calls[i].to}
              onChange={(value) => {onToSelectChange(i, value)}}
              width="20%"
            />
            <datalist id="allowedCalls">
              {allowedToCall.map((allowedCall, allowedCallIndex) =>{
                return (
                  <option key={"toCall"+allowedCallIndex} value={allowedCall.value}>
                    {allowedCall.name}
                  </option>
                );
              })}
            </datalist>
            
            <div style={{display: "flex", width: call.callType === "simple" ? "60%" : "50%"}}>
              <CallInput
                list="allowedFunctions"
                value={calls[i].functionName}
                onChange={(event) => {
                  const selectedFunction = calls[i].allowedFunctions.find((allowedFunc) => allowedFunc.value == event.target.value);
                  onFunctionSelectChange(
                    i,
                    event,
                    selectedFunction ? selectedFunction.params : ""
                  )
                }}
                width="40%"
              />
              <datalist id="allowedFunctions">
                {calls[i].allowedFunctions.map((allowedFunc, allowedFuncIndex) =>{
                  return (
                    <option key={"functionToCall"+allowedFuncIndex} value={allowedFunc.value}/>
                  );
                })}
              </datalist>
          
              { call.callType === "advanced" ?
                <CallInput 
                  type="text"
                  onChange={(value) => onFunctionParamsChange(i, value, 0)}
                  value={calls[i].functionParams}
                  placeholder="functions values separated with commas"
                  width="100%"
                />
              :
                <div style={{display: "flex", width: "60%", flexDirection: "column", paddingRight: "10px"}}>
                  {calls[i].functionParams.map((funcParam, funcParamIndex) => {
                    if (funcParam == " address _avatar" || funcParam == " Avatar _avatar" ) {
                      calls[i].functionParams[funcParamIndex] = networkConfig.avatar;
                    } else {
                      return (
                        <CallInput 
                          key={"functionParam"+funcParamIndex}
                          type="text"
                          onChange={(value) => onFunctionParamsChange(i, value, funcParamIndex)}
                          value={calls[i].functionParams[funcParamIndex]}
                          placeholder={funcParam}
                          width="100%"
                          style={{marginTop: funcParamIndex > 0 ? "5px": "0px"}}
                        />
                      );
                    }
                  })}
                </div>
              }
            </div>
            
            <CallInput
              type="text"
              onChange={(value) => onValueChange(i, value)}
              value={calls[i].value}
              width="10%"
              placeholder={calls[i].callType === "advanced" ? "WEI" : "ETH"}
            />
            
            <RemoveButton onClick={() => {removeCall(i)}}>X</RemoveButton>
            <RemoveButton onClick={() => {changeCallType(i)}}> {calls[i].callType === "advanced" ? "Simple" : "Advanced"} </RemoveButton>
          </CallRow>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
          <ActiveButton onClick={addCall}>Add Call</ActiveButton>
        </div>
        
        {
          (submitionState < 0) ?
            <TextActions>
              <span>
                ERROR
              </span>
            </TextActions>
          : (submitionState > 1) ?
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
            :
              <ActiveButton route="/">Back to Proposals</ActiveButton>
          }
        </div>
        
      </NewProposalFormWrapper>
    );
});

export default NewProposalPage;
