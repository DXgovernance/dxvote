import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useHistory } from "react-router-dom";
import boltIcon from "assets/images/bolt.svg"
import contentHash from 'content-hash';

const NewProposalFormWrapper = styled.div`
  width: cacl(100% -40px);
  background: white;
  padding: 10px 0px;
  border: 1px solid var(--medium-gray);
  margin-top: 24px;
  font-weight: 400;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  
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
    
    select {
      background-color: white;
      max-width: 500px;
      width: 100%;
      height: 30px;
      margin-top: 5px;
      border-radius: 3px;
      border: 1px solid gray;
    }
`;

const TitleInput = styled.div`
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
    
    input {
      max-width: 500px;
      width: 100%;
      height: 25px;
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
    
    input {
      max-width: 500px;
      width: 100px;
      height: 25px;
      margin-top: 5px;
      border-radius: 3px;
      border: 1px solid gray;
      margin-right: 5px;
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

const NewProposalForm = observer(() => {
    let history = useHistory();

    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService, pinataService },
    } = useStores();
    
    const providerActive = providerStore.getActiveWeb3React().active;
    
    const schemes = daoStore.getAllSchemes();

    const [schemeAddress, setSchemeAddress] = React.useState(schemes[0].address);
    const [titleText, setTitleText] = React.useState("");
    const [ipfsHash, setIpfsHash] = React.useState("");
    const [uploadToPinata, setUploadToPInata] = React.useState(false);
    const [descriptionText, setDescriptionText] = React.useState("");
    const [calls, setCalls] = React.useState([]);
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    const uploadToIPFS = async function() {
      setIpfsHash((await ipfsService.add(descriptionText)).toString())
      console.log(ipfsHash)
    }
    
    const pinToPinata = async function() {
      const pinataUpload = await pinataService.pin(ipfsHash)
      if (pinataUpload.data.status == "prechecking")
        setUploadToPInata(true);
    }
    
    const createProposal = async function() {
      
      const { library } = providerStore.getActiveWeb3React();
      
      const callToController = (daoStore.getScheme(schemeAddress).controllerAddress == configStore.getNetworkConfig().controller);
      const to = calls.map((call) => {
        return callToController ? configStore.getNetworkConfig().controller : call.to;
      });
      
      const data = calls.map((call) => {
        console.log(call)
        if (call.to == "")
          return "";
        const parameters = (call.callType === "decoded" && (call.functionName.length > 0 && call.functionParams.length > 0))
          ? call.functionName.substring(
            call.functionName.indexOf("(") + 1, call.functionName.lastIndexOf(")")).split(",")
          : [];  
        
        const encodedData = call.callType === "decoded" && call.functionName.length > 0 ? 
        library.eth.abi.encodeFunctionSignature(call.functionName) + 
        library.eth.abi.encodeParameters(parameters, call.functionParams.split(",")).substring(2)
        : "0x0"
        
        return callToController ? daoService.encodeControllerGenericCall(
          call.to,
          encodedData,
          call.callType === "decoded" ? library.utils.toWei(call.value).toString()
          : call.value
        ) : encodedData
      });

      const value = calls.map((call) => {
        return callToController ? "0"
        : call.callType === "decoded" ? library.utils.toWei(call.value).toString()
          : call.value
      });
      console.log(schemeAddress, to, data, value, titleText, contentHash.fromIpfs(ipfsHash))
      daoStore.createProposal(schemeAddress, to, data, value, titleText, contentHash.fromIpfs(ipfsHash));
      
      history.push("/");
      
    }
    
    function onTitleChange(newValue) { setTitleText(newValue.target.value) }

    function addCall() {
      calls.push({
        callType: "decoded",
        to: "",
        data: "",
        functionName: "",
        functionParams: "",
        value: ""
      })
      setCalls(calls);
      forceUpdate()
    };
    
    function removeCall(proposalIndex) {
      calls.splice(proposalIndex, 1);
      setCalls(calls)
      forceUpdate();
    };
    
    function changeCallType(proposalIndex) {
      calls[proposalIndex] = {
        callType: calls[proposalIndex].callType === "encoded" ? "decoded" : "encoded",
        to: "",
        data: "",
        functionName: "",
        functionParams: "",
        value: ""
      }
      setCalls(calls)
      forceUpdate();
    };
    
    function onCallValueChange(event) {
      const proposalindex = event.target.attributes.proposalindex.value;
      const proposalfield = event.target.attributes.proposalfield.value;
      calls[proposalindex][proposalfield] = event.target.value;
      setCalls(calls)
      forceUpdate();
    }
    
    function onSchemeChange(event) {
      setSchemeAddress(event.target.value)
    }

    if (!providerActive) {
      return (
          <NewProposalFormWrapper>
            <div className="loader">
            <img alt="bolt" src={boltIcon} />
                <br/>
                Connect to submit a proposal
            </div>
          </NewProposalFormWrapper>
      )
    } else {
      return (
        <NewProposalFormWrapper>
          <SchemeInput>
            <label>Choose a Scheme:</label>
            <select name="scheme" id="schemeSelector" onChange={onSchemeChange}>
            {schemes.map((scheme) =>{
              return <option key={scheme.address} value={scheme.address}>{scheme.name}</option>
            })}
            </select>
          </SchemeInput>
          <TitleInput>
            <span>Title:</span>
            <input type="text" onChange={onTitleChange} value={titleText}>
            </input>
          </TitleInput>
          <MDEditor
            value={descriptionText}
            onChange={setDescriptionText}
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
          <h2>Description Preview:</h2>
          <MDEditor.Markdown source={`# ${titleText} \n ${descriptionText}`} style={{
            backgroundColor: "white",
            borderRadius: "5px",
            border: "1px solid gray",
            padding: "20px 10px"
          }} />
          <br/>
          {calls.map((call, i) => 
            <CallRow key={"call"+i}>
              <span>Call #{i} </span>
              <input
                type="text"
                data-proposalindex={i}
                data-proposalfield="to"
                onChange={onCallValueChange}
                value={call.to}
                style={{width: "20%"}}
                placeholder="0x..."
              ></input>
              { call.callType === "encoded" ?
                <input 
                  type="text"
                  data-proposalindex={i}
                  data-proposalfield="data"
                  onChange={onCallValueChange}
                  value={call.data}
                  placeholder="0x..."
                  style={{width: "40%"}}
                ></input>
                : <input 
                  type="text"
                  data-proposalindex={i}
                  data-proposalfield="functionName"
                  onChange={onCallValueChange}
                  value={calls[i].functionName}
                  placeholder="functionName(string,bool,uint256[])"
                  style={{width: "20%"}}
                >
                </input>
              }
              { calls[i].callType === "decoded" ?
                <input 
                  type="text"
                  data-proposalindex={i}
                  data-proposalfield="functionParams"
                  onChange={onCallValueChange}
                  value={calls[i].functionParams}
                  placeholder="functions values separated with commas"
                  style={{width: "20%"}}
                ></input>
                : <div/>
              }
              <input
                type="text"
                data-proposalindex={i}
                data-proposalfield="value"
                onChange={onCallValueChange}
                value={calls[i].value}
                style={{width: "10%"}}
                placeholder={calls[i].callType === "decoded" ? "ETH" : "WEI"}
              ></input>
              <RemoveButton onClick={() => {removeCall(i)}}>X</RemoveButton>
              <RemoveButton onClick={() => {changeCallType(i)}}> {calls[i].callType === "decoded" ? "Advanced" : "Simple"} </RemoveButton>
            </CallRow>
          )}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <ActiveButton onClick={addCall}>Add Call</ActiveButton>
          </div>
          <TextActions>
            {ipfsHash.length > 0 ?
              <span>{`Description Document IPFS Hash: ${ipfsHash}`}</span>
              : <div/>
            }
            {ipfsHash.length > 0 && !pinataService.auth ?
              <span>
                <strong>It is not recommended to submit a proposal with unpinned description.</strong><br/>
                Add a Pinata API key in the configuration section or share your IPFS hash to be pinned by the community. 
                </span>
              : <div/>
            }
            {uploadToPinata ?
              <span>
                Uploaded to pinata:
                  <a href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} target="_blank">https://gateway.pinata.cloud/ipfs/{ipfsHash}</a>
                <br/>
                Check before submitting proposal
              </span>
              : <div/>
            }
          </TextActions>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <ActiveButton onClick={
              ipfsHash.length === 0 ? uploadToIPFS
              : (pinataService.auth && !uploadToPinata) ? pinToPinata
              : createProposal
            }>{
              ipfsHash.length === 0 ? "Upload to IPFS"
              : (pinataService.auth && !uploadToPinata) ? "Pin To Pinata"
              : "Submit Proposal"
            }</ActiveButton>
          </div>
          
        </NewProposalFormWrapper>
      );
    }
});

export default NewProposalForm;
