import React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useStores } from '../contexts/storesContext';
import ActiveButton from '../components/common/ActiveButton';
import { Link } from 'react-router-dom';
import { bnum } from '../utils/helpers';
import MDEditor, { commands } from '@uiw/react-md-editor';

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

const DescriptionInput = styled.div`
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
    
    textarea {
      max-height: 150px;
      width: 100%;
      height: 150px;
      max-height: 800px;
      margin-top: 5px;
      border-radius: 5px;
      border: 1px solid gray;
    }
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

const source = `
## MarkdownPreview

> todo: React component preview markdown text.
`;

const NewProposalForm = observer(() => {
    const {
        root: { providerStore, daoStore, configStore, daoService, ipfsService },
    } = useStores();
    
    const providerActive = providerStore.getActiveWeb3React().active;
        
    const createProposal = async function() {
      const descriptionHash = await ipfsService.add(`# ${titleText} \n ${descriptionText}`)
      
      const { library } = providerStore.getActiveWeb3React();
      
      const to = calls.map((call) => {
        return (scheme == 'masterWallet') ? configStore.getControllerAddress() : call.to
      });
      
      const data = calls.map((call, i) => {
        let encodedData = "0x0";
        
        if (call.functionName.length > 0 && call.functionParams > 0) {
          const parameters = call.callType == "decoded" 
            ? call.functionName.substring(
              call.functionName.indexOf("(") + 1, call.functionName.lastIndexOf(")")).split(",")
            : [];
          
          encodedData = call.callType == "decoded" ? 
            library.eth.abi.encodeFunctionSignature(call.functionName) + 
            library.eth.abi.encodeParameters(parameters, call.functionParams.split(",")).substring(2)
          : call.data
        }
                
        return (scheme == 'masterWallet') ? daoService.encodeControllerGenericCall(
          call.to,
          encodedData,
          call.callType == "decoded" ? library.utils.toWei(call.value).toString()
          : call.value
        ) : encodedData
      });
      
      const value = calls.map((call) => {
        return (scheme == 'masterWallet') ? "0"
        : call.callType == "decoded" ? library.utils.toWei(call.value).toString()
          : call.value
      });
      console.log(to, data, value, titleText, calls)
      daoStore.createProposal( 
        (scheme == 'masterWallet') 
          ? configStore.getSchemeAddress('masterWallet') : configStore.getSchemeAddress('quickWallet'),
        to, data, value, titleText, descriptionHash
      );
      
    }

    const [scheme, setScheme] = React.useState("masterWallet");
    const [titleText, setTitleText] = React.useState("");
    const [descriptionText, setDescriptionText] = React.useState("");
    const [calls, setCalls] = React.useState([{
      to: "",
      callType: "decoded",
      data: "",
      functionName: "",
      functionParams: "",
      value: ""
    }]);
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    function onTitleChange(newValue) { setTitleText(newValue.target.value) }
    function onDescriptionChange(newValue) { setDescriptionText(newValue.target.value) }

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
        callType: calls[proposalIndex].callType == "encoded" ? "decoded" : "encoded",
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
      const proposalIndex = event.target.attributes.proposalIndex.value;
      const proposalField = event.target.attributes.proposalField.value;
      calls[proposalIndex][proposalField] = event.target.value;
      setCalls(calls)
      forceUpdate();
    }

    if (!providerActive) {
      return (
          <NewProposalFormWrapper>
            <div className="loader">
            <img alt="bolt" src={require('assets/images/bolt.svg')} />
                <br/>
                Connect to submit a proposal
            </div>
          </NewProposalFormWrapper>
      )
    } else {
      return (
        <NewProposalFormWrapper>
          <SchemeInput>
            <label for="scheme">Choose a Scheme:</label>
            <select name="scheme" id="schemeSelector" onChange={setScheme}>
              <option value="masterWallet">Master Wallet Scheme</option>
              <option value="quickWallet">Quick Wallet Scheme</option>
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
            minHeights="300"
            maxHeights="1000"
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
          <CallRow>
            <span style={{paddingBottom: "0px", width: "20%"}}>To</span>
            <span style={{paddingBottom: "0px", width: "40%"}}>Data</span>
            <span style={{paddingBottom: "0px", width: "10%"}}>Value</span>
          </CallRow>
          {calls.map((call, i) => 
            <CallRow>
              <span>Call #{i} </span>
              <input
                type="text"
                proposalIndex={i}
                proposalField="to"
                onChange={onCallValueChange}
                value={calls[i].to}
                style={{width: "20%"}}
                placeholder="0x..."
              ></input>
              { calls[i].callType == "encoded" ?
                <input 
                  type="text"
                  proposalIndex={i}
                  proposalField="data"
                  onChange={onCallValueChange}
                  value={calls[i].data}
                  placeholder="0x..."
                  style={{width: "40%"}}
                ></input>
                : <input 
                  type="text"
                  proposalIndex={i}
                  proposalField="functionName"
                  onChange={onCallValueChange}
                  value={calls[i].functionName}
                  placeholder="functionName(string,bool,uint256[])"
                  style={{width: "20%"}}
                >
                </input>
              }
              { calls[i].callType == "decoded" ?
                <input 
                  type="text"
                  proposalIndex={i}
                  proposalField="functionParams"
                  onChange={onCallValueChange}
                  value={calls[i].functionParams}
                  placeholder="functions values separated with commas"
                  style={{width: "20%"}}
                ></input>
                : <div/>
              }
              <input
                type="text"
                proposalIndex={i}
                proposalField="value"
                onChange={onCallValueChange}
                value={calls[i].value}
                style={{width: "10%"}}
                placeholder={calls[i].callType == "decoded" ? "ETH" : "WEI"}
              ></input>
              {i > 0 ? <RemoveButton onClick={() => {removeCall(i)}}>X</RemoveButton> : <div/>}
              {i == calls.length - 1 ? <AddButton onClick={addCall}>+</AddButton> : <div/>}
              <RemoveButton onClick={() => {changeCallType(i)}}> {calls[i].callType == "decoded" ? "Advanced" : "Simple"} </RemoveButton>
            </CallRow>
          )}
          <ActiveButton onClick={createProposal}>Submit Proposal</ActiveButton>
        </NewProposalFormWrapper>
      );
    }
});

export default NewProposalForm;
