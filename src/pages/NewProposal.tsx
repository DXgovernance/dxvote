import { useReducer, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../contexts';
import { Box, Question, Button } from '../components/common';
import MDEditor, { commands } from '@uiw/react-md-editor';
import contentHash from 'content-hash';
import * as Yup from 'yup';

import {
  NETWORK_ASSET_SYMBOL,
  ZERO_ADDRESS,
  ANY_ADDRESS,
  ZERO_HASH,
  sleep,
  bnum,
  normalizeBalance,
  denormalizeBalance,
  encodePermission,
  TXEvents,
} from '../utils';
import { LinkedButtons } from 'components/LinkedButtons';

let ContributionRewardSchema = Yup.object().shape({
  beneficiary: Yup.string().required(),
  repChange: Yup.string()
    .test('empty', 'Rep Change is required', value => value !== '')
    .test(
      'min',
      'REP Change should be at least 0.',
      value => parseInt(value) >= 0
    )
    .test('max', 'Max REP is 10', value => parseInt(value) < 10),
  ethValue: Yup.string()
    .test('empty', 'ETH Value is required', value => value !== '')
    .test(
      'min',
      'ETH Value should be at least 0.',
      value => parseFloat(value) >= 0
    ),
  externalToken: Yup.string().required(),
  tokenValue: Yup.string()
    .test('empty', 'Token Value is required', value => value !== '')
    .test(
      'min',
      'Token Value should be at least 0.',
      value => parseFloat(value) >= 0
    )
    .test(
      'max',
      'Be aware are Token Value is in ETH',
      value => parseFloat(value) < 9999
    ),
});

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
`;

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
  width: ${props => props.width || '25%'};
  height: 34px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
`;

const SelectInput = styled.select`
  width: ${props => props.width || '25%'};
  height: 38px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
  background-color: #fff;
`;

const FormattedForm = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;

  > label {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  ${TextInput} {
    width: 90%;
  }
`;
const InputErrorMessage = styled.div`
  align-self: flex-start;
  margin-left: 8px;
  font-size: 11px;
  margin-top: 4px;
  color: ${({ theme }) => theme.forms.error};
`;

const NewProposalPage = observer(() => {
  const {
    context: {
      providerStore,
      daoStore,
      configStore,
      daoService,
      ipfsService,
      pinataService,
    },
  } = useContext();

  const networkTokens = configStore.getTokensOfNetwork();
  const schemes = daoStore.getAllSchemes();
  const networkContracts = configStore.getNetworkContracts();
  const schemeInLocalStorage = localStorage.getItem(
    'dxvote-newProposal-scheme'
  );
  const networkAssetSymbol =
    NETWORK_ASSET_SYMBOL[configStore.getActiveChainName()];

  const defaultSchemeToUse = schemeInLocalStorage
    ? schemes.findIndex(scheme => scheme.address === schemeInLocalStorage)
    : schemes.findIndex(scheme => scheme.name === 'MasterWalletScheme');

  const [schemeToUse, setSchemeToUse] = useState(
    defaultSchemeToUse > -1 ? schemes[defaultSchemeToUse] : schemes[0]
  );
  const [titleText, setTitleText] = useState(
    localStorage.getItem('dxvote-newProposal-title') || ''
  );
  const [ipfsHash, setIpfsHash] = useState('');
  const [descriptionText, setDescriptionText] = useState(
    localStorage.getItem('dxvote-newProposal-description') || ''
  );

  let callsInStorage = [];
  try {
    if (localStorage.getItem('dxvote-newProposal-calls')) {
      callsInStorage = JSON.parse(
        localStorage.getItem('dxvote-newProposal-calls')
      );
      if (callsInStorage.length > 0 && !callsInStorage[0].dataValues)
        callsInStorage = callsInStorage.map(callInStorage =>
          Object.assign(callInStorage, {
            dataValues: new Array(callInStorage.functionParams.length),
          })
        );
    }
  } catch (error) {
    callsInStorage = [];
  }
  const [calls, setCalls] = useState(callsInStorage);

  const [contributionRewardCalls, setContributionRewardCalls] = useState({
    beneficiary: 'ZERO_ADDRESS',
    repChange: '0',
    ethValue: '0',
    externalToken: ZERO_ADDRESS,
    tokenValue: '0',
  });

  const [schemeRegistrarProposalValues, setSchemeRegistrarProposalValues] =
    useState({
      register: true,
      schemeAddress: ZERO_ADDRESS,
      parametersHash: ZERO_HASH,
      permissions: encodePermission({
        canGenericCall: false,
        canUpgrade: false,
        canChangeConstraints: false,
        canRegisterSchemes: false,
      }),
    });

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [submitionState, setSubmitionState] = useState(0);
  // 0 = Proposal Description not uploaded
  // 1 = Uploading proposal description
  // 2 = Proposal description uploaded
  // 3 = Submiting new proposal tx
  // 4 = Proposal creation tx submited
  // 5 = Proposal creation tx receipt received

  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageUI, setErrorMessageUI] = useState<any | undefined>({});
  const proposalTemplates = configStore.getProposalTemplates();

  const { assetLimits: transferLimits, recommendedCalls } =
    daoStore.getSchemeRecommendedCalls(schemeToUse.address);
  console.debug('[PERMISSIONS]', schemeToUse, transferLimits, recommendedCalls);

  let allowedToCall = [];

  recommendedCalls.map(recommendedCall => {
    if (
      recommendedCall.fromTime > 0 &&
      allowedToCall.findIndex(
        allowedPermission => allowedPermission.value === recommendedCall.to
      ) < 0
    ) {
      allowedToCall.push({
        value: recommendedCall.to,
        name: recommendedCall.toName,
      });
    }
  });

  const callPermissions = daoStore.getCache().callPermissions;
  if (
    schemeToUse.type === 'WalletScheme' &&
    callPermissions[ZERO_ADDRESS] &&
    callPermissions[ZERO_ADDRESS][
      schemeToUse.controllerAddress === networkContracts.controller
        ? networkContracts.avatar
        : schemeToUse.address
    ] &&
    callPermissions[ZERO_ADDRESS][
      schemeToUse.controllerAddress === networkContracts.controller
        ? networkContracts.avatar
        : schemeToUse.address
    ][ANY_ADDRESS]
  )
    allowedToCall.push({ value: ANY_ADDRESS, name: 'Custom' });

  const uploadToIPFS = async function () {
    if (titleText.length < 10) {
      setErrorMessage('Title has to be at mimimum 10 characters length');
    } else if (descriptionText.length === 0) {
      setErrorMessage('Description has to be at mimimum 100 characters length');
    } else {
      setSubmitionState(1);
      setErrorMessage('');
      console.log(schemeToUse.type);
      const bodyTextToUpload = JSON.stringify({
        description: descriptionText,
        title: titleText,
        tags: ['dxvote'],
        url: '',
      });

      const hash = await ipfsService.add(bodyTextToUpload);
      setIpfsHash(hash);

      if (pinataService.auth) {
        const pinataPin = await pinataService.pin(hash);
        console.debug('[PINATA PIN]', pinataPin.data);
      }
      const ipfsPin = await ipfsService.pin(hash);
      console.debug('[IPFS PIN]', ipfsPin);

      let uploaded = false;
      while (!uploaded) {
        const ipfsContent = await ipfsService.getContent(hash);
        console.debug('[IPFS CONTENT]', ipfsContent);
        if (ipfsContent === bodyTextToUpload) uploaded = true;
        await sleep(1000);
      }

      setSubmitionState(2);
    }
  };

  const createProposal = async function () {
    console.debug('[RAW PROPOSAL]', titleText, ipfsHash, calls);
    setSubmitionState(3);

    const { library } = providerStore.getActiveWeb3React();

    let to = [],
      data = [],
      value = [];
    try {
      if (schemeToUse.type !== 'ContributionReward') {
        const callToController =
          schemeToUse.controllerAddress === networkContracts.controller;

        to = calls.map(call => {
          return callToController ? networkContracts.controller : call.to;
        });

        data = calls.map(call => {
          if (call.to === '') return '';

          let callData;

          if (call.callType === 'simple') {
            let callDataFunctionSignature = '0x0';
            let callDataFunctionParamsEncoded = '';

            if (call.functionName.length === 0) {
              callDataFunctionSignature = '0x0';
            } else {
              callDataFunctionSignature =
                library.eth.abi.encodeFunctionSignature(call.functionName);
            }

            if (call.dataValues.length > 0) {
              call.functionParams.map((functionParam, i) => {
                if (functionParam.type.indexOf('[]') > 0) {
                  call.dataValues[i] = call.dataValues[i]
                    .slice(1, -1)
                    .split(',');
                }
                if (functionParam.type === 'bool') {
                  call.dataValues[i] = call.dataValues[i] === 'true';
                }
              });
              callDataFunctionParamsEncoded =
                call.functionParams.length > 0
                  ? library.eth.abi
                      .encodeParameters(
                        call.functionParams.map(
                          functionParam => functionParam.type
                        ),
                        call.dataValues
                      )
                      .substring(2)
                  : '';
            }
            callData =
              callDataFunctionSignature + callDataFunctionParamsEncoded;
          } else {
            callData = call.dataValues[0];
          }
          if (callToController && call.to !== networkContracts.controller) {
            return daoService.encodeControllerGenericCall(
              call.to,
              callData,
              call.callType === 'simple'
                ? library.utils.toWei(call.value).toString()
                : call.value
            );
          } else {
            return callData;
          }
        });

        value = calls.map(call => {
          return callToController
            ? '0'
            : call.callType === 'simple'
            ? library.utils.toWei(call.value).toString()
            : call.value;
        });
      }

      const proposalData =
        schemeToUse.type === 'ContributionReward'
          ? {
              beneficiary: contributionRewardCalls.beneficiary,
              reputationChange: denormalizeBalance(
                bnum(contributionRewardCalls.repChange)
              ).toString(),
              ethValue: denormalizeBalance(
                bnum(contributionRewardCalls.ethValue)
              ).toString(),
              externalToken: contributionRewardCalls.externalToken,
              tokenValue: contributionRewardCalls.tokenValue,
              descriptionHash: contentHash.fromIpfs(ipfsHash),
            }
          : schemeToUse.type === 'SchemeRegistrar'
          ? {
              register: schemeRegistrarProposalValues.register,
              schemeAddress: schemeRegistrarProposalValues.schemeAddress,
              parametersHash: schemeRegistrarProposalValues.parametersHash,
              permissions: schemeRegistrarProposalValues.permissions,
              descriptionHash: contentHash.fromIpfs(ipfsHash),
            }
          : {
              to,
              data,
              value,
              titleText,
              descriptionHash: contentHash.fromIpfs(ipfsHash),
            };

      console.debug('[PROPOSAL]', schemeToUse.address, proposalData);

      daoService
        .createProposal(schemeToUse.address, schemeToUse.type, proposalData)
        .on(TXEvents.TX_HASH, hash => {
          console.debug('[TX_SUBMITTED]', hash);
          setSubmitionState(4);
          setErrorMessage('');
        })
        .on(TXEvents.RECEIPT, hash => {
          console.debug('[TX_RECEIPT]', hash);
          setSubmitionState(5);
        })
        .on(TXEvents.TX_ERROR, txerror => {
          console.error('[TX_ERROR]', txerror);
          setSubmitionState(2);
          setErrorMessage((txerror as Error).message);
        })
        .on(TXEvents.INVARIANT, error => {
          console.error('[ERROR]', error);
          setSubmitionState(2);
          setErrorMessage((error as Error).message);
        })
        .catch(error => {
          console.error('[ERROR]', error);
          setSubmitionState(2);
          setErrorMessage((error as Error).message);
        });
    } catch (error) {
      console.error('[PROPOSAL_ERROR]', error);
      setSubmitionState(2);
      setErrorMessage((error as Error).message);
    }
  };

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

  function setSchemeRegistrarValueInState(_schemeRegistrarProposalValues) {
    setSchemeRegistrarProposalValues(_schemeRegistrarProposalValues);
    forceUpdate();
  }

  function addCall() {
    calls.push({
      callType: schemeToUse.type === 'WalletScheme' ? 'simple' : 'advanced',
      allowedFunctions: [],
      to: '',
      data: '',
      functionName: '',
      functionParams: [],
      dataValues: [],
      value: '',
    });
    setCallsInState(calls);
  }

  function removeCall(proposalIndex) {
    calls.splice(proposalIndex, 1);
    setCallsInState(calls);
  }

  function changeCallType(callIndex) {
    calls[callIndex] = {
      callType: calls[callIndex].callType === 'simple' ? 'advanced' : 'simple',
      allowedFunctions: [],
      to: '',
      data: '',
      functionName: '',
      functionParams: [],
      dataValues: [],
      value: '',
    };
    setCallsInState(calls);
  }

  function onToSelectChange(callIndex, toAddress) {
    if (toAddress === ANY_ADDRESS) {
      changeCallType(callIndex);
    } else {
      calls[callIndex].to = toAddress;
      calls[callIndex].allowedFunctions = [];
      calls[callIndex].functionName = '';
      calls[callIndex].functionParams = [];
      calls[callIndex].dataValues = [];
      calls[callIndex].value = '0';
      recommendedCalls.map(recommendedCall => {
        if (recommendedCall.to === toAddress && recommendedCall.fromTime > 0) {
          calls[callIndex].allowedFunctions.push(recommendedCall);
        }
      });
      if (calls[callIndex].allowedFunctions.length > 0) {
        calls[callIndex].functionName =
          calls[callIndex].allowedFunctions[0].functionName;
        calls[callIndex].functionParams =
          calls[callIndex].allowedFunctions[0].params;
        calls[callIndex].dataValues = new Array(
          calls[callIndex].allowedFunctions[0].params.length
        );
      }
      onFunctionSelectChange(
        callIndex,
        calls[callIndex].functionName,
        calls[callIndex].functionParams
      );
    }
  }

  function onFunctionSelectChange(callIndex, functionName, params) {
    calls[callIndex].functionName = functionName;

    if (calls[callIndex].callType === 'simple') {
      calls[callIndex].functionParams = params;
      calls[callIndex].dataValues = [];
      calls[callIndex].dataValues = params.map(() => {
        return '';
      });
      calls[callIndex].value = '0';
    } else {
      calls[callIndex].functionParams = [];
      calls[callIndex].dataValues = [''];
      calls[callIndex].value = '0';
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
    setErrorMessageUI(null);
    contributionRewardCalls[key] = value;

    try {
      ContributionRewardSchema.validateSync(contributionRewardCalls);
      setErrorMessageUI(null);
      setContributionRewardCallsInState(contributionRewardCalls);
    } catch (error) {
      setErrorMessageUI(error);
    }
  }

  function onSchemeRegistrarValueChange(key, value) {
    schemeRegistrarProposalValues[key] = value;
    setSchemeRegistrarValueInState(schemeRegistrarProposalValues);
  }

  function onSchemeChange(event) {
    setSchemeToUse(schemes[event.target.value]);
    localStorage.setItem(
      'dxvote-newProposal-scheme',
      schemes[event.target.value].address
    );
    calls.splice(0, calls.length);
    setContributionRewardCalls({
      beneficiary: '',
      repChange: '0',
      ethValue: '0',
      externalToken: ZERO_ADDRESS,
      tokenValue: '0',
    });
    setCallsInState(calls);
  }

  function onProposalTemplate(event) {
    const selectedTemplate = proposalTemplates[event.target.value];
    if (selectedTemplate.name !== 'Custom') {
      setTitleText(selectedTemplate.title);
      setDescriptionText(selectedTemplate.description);
      calls.splice(0, calls.length);
      if (selectedTemplate.calls) {
        selectedTemplate.calls.forEach((call, index) => {
          addCall();
          onToSelectChange(index, call.to);
          const selectedFunction = calls[index].allowedFunctions.find(
            allowedFunction => {
              return allowedFunction.functionName === call.functionName;
            }
          );
          onFunctionSelectChange(
            index,
            call.functionName,
            selectedFunction.params
          );
          calls[index].dataValues = call.params;
        });
      }

      setCallsInState(calls);
    }
  }
  return (
    <NewProposalFormWrapper>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <PlaceHolders>
          <span style={{ width: '100%' }}>Title</span>
          <span style={{ minWidth: '150px' }}>
            Scheme <Question question="2" />
          </span>
          <span style={{ minWidth: '150px' }}>Template</span>
        </PlaceHolders>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TitleInput>
          <input
            type="text"
            placeholder="Proposal Title"
            onChange={onTitleChange}
            value={titleText}
          />
          <select
            name="scheme"
            id="schemeSelector"
            onChange={onSchemeChange}
            defaultValue={defaultSchemeToUse}
          >
            {schemes.map((scheme, i) => {
              if (
                scheme.type === 'WalletScheme' ||
                scheme.type === 'ContributionReward' ||
                scheme.type === 'GenericMulticall' ||
                scheme.type === 'SchemeRegistrar'
              )
                return (
                  <option key={scheme.address} value={i}>
                    {scheme.name}
                  </option>
                );
              else return null;
            })}
          </select>
          <select
            name="proposalTemplate"
            id="proposalTemplateSelector"
            onChange={onProposalTemplate}
          >
            {proposalTemplates.map((template, i) => {
              return (
                <option key={'proposalTemplate' + i} value={i}>
                  {template.name}
                </option>
              );
            })}
          </select>
        </TitleInput>
      </div>
      {submitionState < 1 ? (
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
      ) : (
        <div />
      )}
      <h2>Description Preview</h2>
      <MDEditor.Markdown
        source={descriptionText}
        style={{
          backgroundColor: 'white',
          borderRadius: '5px',
          border: '1px solid gray',
          padding: '20px 10px',
        }}
      />
      {schemeToUse.type === 'ContributionReward' ||
      schemeToUse.type === 'GenericMulticall' ||
      schemeToUse.type === 'SchemeRegistrar' ||
      (schemeToUse.type === 'WalletScheme' &&
        schemeToUse.controllerAddress === networkContracts.controller) ? (
        <h2>
          Calls executed from the avatar <Question question="9" />
        </h2>
      ) : (
        <h2>
          Calls executed from the scheme <Question question="9" />
        </h2>
      )}
      {Object.keys(transferLimits).map(assetAddress => {
        if (assetAddress === ZERO_ADDRESS)
          return (
            <h3>
              Transfer limit of{' '}
              {normalizeBalance(transferLimits[assetAddress]).toString()}{' '}
              {networkAssetSymbol}
            </h3>
          );
        else {
          const token = networkTokens.find(
            networkToken => networkToken.address === assetAddress
          );
          if (token)
            return (
              <h3>
                Transfer limit of{' '}
                {normalizeBalance(
                  transferLimits[assetAddress],
                  token.decimals
                ).toString()}{' '}
                {token.symbol}
              </h3>
            );
          else
            return (
              <h3>
                Transfer limit {transferLimits[assetAddress].toString()} of
                asset {assetAddress}
              </h3>
            );
        }
      })}

      {schemeToUse.type === 'ContributionReward' ? (
        // If scheme to use is Contribution Reward display a different form with less fields
        <div>
          <CallRow>
            <FormattedForm>
              <label>
                <span>Beneficiary Account</span>

                <TextInput
                  type="text"
                  onChange={event =>
                    onContributionRewardValueChange(
                      'beneficiary',
                      event.target.value
                    )
                  }
                  value={contributionRewardCalls.beneficiary}
                  width="50%"
                />
                {errorMessageUI && errorMessageUI.path === 'beneficiary' && (
                  <InputErrorMessage>
                    {errorMessageUI.errors[0]}
                  </InputErrorMessage>
                )}
              </label>
              <label>
                <span>REP Change</span>
                <TextInput
                  type="text"
                  onChange={event =>
                    onContributionRewardValueChange(
                      'repChange',
                      event.target.value
                    )
                  }
                  value={contributionRewardCalls.repChange}
                  width="50%"
                />

                {errorMessageUI && errorMessageUI.path === 'repChange' && (
                  <InputErrorMessage>
                    {errorMessageUI.errors[0]}
                  </InputErrorMessage>
                )}
              </label>

              <label>
                <span>{networkAssetSymbol} Value</span>
                <TextInput
                  type="text"
                  onChange={event =>
                    onContributionRewardValueChange(
                      'ethValue',
                      event.target.value
                    )
                  }
                  value={contributionRewardCalls.ethValue}
                  width="50%"
                />

                {errorMessageUI && errorMessageUI.path === 'ethValue' && (
                  <InputErrorMessage>
                    {errorMessageUI.errors[0]}
                  </InputErrorMessage>
                )}
              </label>

              <label>
                <span>Address of Token</span>
                <TextInput
                  aria-invalid="true"
                  aria-describedby="error"
                  type="text"
                  onChange={event =>
                    onContributionRewardValueChange(
                      'externalToken',
                      event.target.value
                    )
                  }
                  value={contributionRewardCalls.externalToken}
                  width="50%"
                />

                {errorMessageUI && errorMessageUI.path === 'externalToken' && (
                  <InputErrorMessage>
                    {errorMessageUI.errors[0]}
                  </InputErrorMessage>
                )}
              </label>
              <label>
                <span>Token Amount (in ETH)</span>
                <TextInput
                  type="text"
                  onChange={event =>
                    onContributionRewardValueChange(
                      'tokenValue',
                      event.target.value
                    )
                  }
                  value={contributionRewardCalls.tokenValue}
                  width="50%"
                />
                {errorMessageUI && errorMessageUI.path === 'tokenValue' && (
                  <InputErrorMessage>
                    {errorMessageUI.errors[0]}
                  </InputErrorMessage>
                )}
              </label>
            </FormattedForm>
          </CallRow>
        </div>
      ) : schemeToUse.type === 'SchemeRegistrar' ? (
        // If scheme to use is SchemeRegistrar display a different form with less fields
        <div>
          <CallRow>
            <span style={{ width: '20%', fontSize: '13px' }}>
              Rergister Scheme
            </span>
            <span style={{ width: '20%', fontSize: '13px' }}>
              Scheme Address
            </span>
            <span style={{ width: '40%', fontSize: '13px' }}>
              {' '}
              Parameters Hash{' '}
            </span>
            <span style={{ width: '20%', fontSize: '13px' }}>Permissions</span>
          </CallRow>
          <CallRow>
            <TextInput
              type="checkbox"
              onChange={event =>
                onSchemeRegistrarValueChange('register', event.target.checked)
              }
              checked={schemeRegistrarProposalValues.register}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={event =>
                onSchemeRegistrarValueChange(
                  'schemeAddress',
                  event.target.value
                )
              }
              value={schemeRegistrarProposalValues.schemeAddress}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={event =>
                onSchemeRegistrarValueChange(
                  'parametersHash',
                  event.target.value
                )
              }
              value={schemeRegistrarProposalValues.parametersHash}
              width="50%"
            />
            <TextInput
              type="text"
              onChange={event =>
                onSchemeRegistrarValueChange('permissions', event.target.value)
              }
              value={schemeRegistrarProposalValues.permissions}
              width="50%"
            />
          </CallRow>
        </div>
      ) : (
        // If the scheme is GenericMulticall allow only advanced encoded calls
        // At last if the scheme used is a Wallet Scheme type allow a complete edition of the calls :)
        <div>
          {calls.map((call, i) => (
            <CallRow key={'call' + i}>
              <span>#{i}</span>

              {schemeToUse.type === 'WalletScheme' &&
              call.callType === 'simple' ? (
                <SelectInput
                  value={calls[i].to}
                  onChange={e => {
                    onToSelectChange(i, e.target.value);
                  }}
                  width={'20%'}
                >
                  {allowedToCall.map((allowedCall, allowedCallIndex) => {
                    return (
                      <option
                        key={'toCall' + allowedCallIndex}
                        value={allowedCall.value || ''}
                      >
                        {allowedCall.name}
                      </option>
                    );
                  })}
                </SelectInput>
              ) : (
                schemeToUse.type !== 'ContributionReward' && (
                  <TextInput
                    onChange={e => {
                      onToSelectChange(i, e.target.value);
                    }}
                    width={'20%'}
                  />
                )
              )}

              {call.callType === 'simple' ? (
                <div
                  style={{
                    display: 'flex',
                    width: call.callType === 'simple' ? '60%' : '50%',
                  }}
                >
                  <SelectInput
                    value={calls[i].functionName || ''}
                    onChange={event => {
                      const selectedFunction = calls[i].allowedFunctions.find(
                        allowedFunction => {
                          return (
                            allowedFunction.functionName === event.target.value
                          );
                        }
                      );
                      onFunctionSelectChange(
                        i,
                        event.target.value,
                        selectedFunction ? selectedFunction.params : ''
                      );
                    }}
                    width="40%"
                  >
                    {calls[i].allowedFunctions.map(
                      (allowedFunc, allowedFuncIndex) => {
                        return (
                          <option
                            key={'functionToCall' + allowedFuncIndex}
                            value={allowedFunc.functionName || ''}
                          >
                            {allowedFunc.functionName}
                          </option>
                        );
                      }
                    )}
                  </SelectInput>

                  <div
                    style={{
                      display: 'flex',
                      width: '100%',
                      flexDirection: 'column',
                      paddingRight: '10px',
                    }}
                  >
                    {calls[i].functionParams.length === 0 ? (
                      <TextInput
                        key={'functionParam00'}
                        disabled
                        type="text"
                        placeholder="Select address to call and function"
                        width="100%"
                        style={{ marginTop: '0px' }}
                      />
                    ) : (
                      calls[i].functionParams.map(
                        (funcParam, funcParamIndex) => {
                          return (
                            <TextInput
                              key={'functionParam' + funcParamIndex}
                              type="text"
                              onChange={value =>
                                onFunctionParamsChange(i, value, funcParamIndex)
                              }
                              value={calls[i].dataValues[funcParamIndex] || ''}
                              placeholder={funcParam.name}
                              width="100%"
                              style={{
                                marginTop: funcParamIndex > 0 ? '5px' : '0px',
                              }}
                            />
                          );
                        }
                      )
                    )}
                  </div>
                </div>
              ) : (
                <TextInput
                  type="text"
                  onChange={value => onFunctionParamsChange(i, value, 0)}
                  value={calls[i].dataValues[0] || ''}
                  placeholder="0x..."
                  width="100%"
                />
              )}

              <TextInput
                type="text"
                onChange={value => onValueChange(i, value)}
                value={calls[i].value || ''}
                width="10%"
                placeholder={
                  calls[i].callType === 'advanced'
                    ? 'WEI'
                    : { networkAssetSymbol }
                }
              />

              <RemoveButton
                onClick={() => {
                  removeCall(i);
                }}
              >
                X
              </RemoveButton>
              {schemeToUse.type === 'WalletScheme' ? (
                <RemoveButton
                  onClick={() => {
                    changeCallType(i);
                  }}
                >
                  {calls[i].callType === 'advanced' ? 'Simple' : 'Advanced'}
                </RemoveButton>
              ) : (
                <div />
              )}
            </CallRow>
          ))}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button onClick={addCall}>Add Call</Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <TextActions>
          <span>{errorMessage}</span>
        </TextActions>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          margin: '40px 10px',
        }}
      >
        {!(submitionState === 5) ? (
          <LinkedButtons
            buttons={[
              {
                title: `Upload to IPFS`,
                id: 0,
                loadingId: 1,
                onClick: uploadToIPFS,
              },
              {
                title: `Submit Proposal`,
                id: 2,
                loadingId: 3,
                typeSubmit: true,
                onClick: createProposal,
              },
            ]}
            active={submitionState}
          />
        ) : (
          <Button route="/">Back to Proposals</Button>
        )}
        {submitionState > 1 ? (
          <TextActions>
            <span>
              Uploaded to IPFS:
              <a
                href={`https://ipfs.io/ipfs/${ipfsHash}`}
                target="_blank"
                rel="noreferrer"
              >
                https://ipfs.io/ipfs/{ipfsHash}
              </a>
              <br />
              Check before submitting proposal
            </span>
          </TextActions>
        ) : (
          <div />
        )}
      </div>
    </NewProposalFormWrapper>
  );
});

export default NewProposalPage;
