import { useReducer, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { useContext } from '../../contexts';
import { Box, Question, LinkButton } from '../../components/common';
import MDEditor, { commands } from '@uiw/react-md-editor';
import contentHash from 'content-hash';

import {
  NETWORK_ASSET_SYMBOL,
  ZERO_ADDRESS,
  ANY_ADDRESS,
  ZERO_HASH,
  bnum,
  denormalizeBalance,
  encodePermission,
  TXEvents,
  isWalletScheme,
} from '../../utils';
import { LinkedButtons } from 'components/LinkedButtons';
import DiscourseImporter from '../../components/DiscourseImporter';
import { Calls } from 'components/ProposalSubmission/Calls';
import { Preview } from '../../components/ProposalSubmission/Preview';
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

  const networkName = configStore.getActiveChainName();
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

  const [submitionState, setSubmissionState] = useState(0);
  // 0 = Proposal Description not uploaded
  // 1 = Uploading proposal description
  // 2 = Proposal description uploaded
  // 3 = Submiting new proposal tx
  // 4 = Proposal creation tx submited
  // 5 = Proposal creation tx receipt received

  const [errorMessage, setErrorMessage] = useState('');

  const { assetLimits: transferLimits, recommendedCalls } =
    daoStore.getSchemeRecommendedCalls(schemeToUse.address);

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

  const callPermissions = daoStore.daoCache.callPermissions;
  if (
    isWalletScheme(schemeToUse) &&
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

  console.debug(
    '[PERMISSIONS]',
    schemeToUse,
    transferLimits,
    recommendedCalls,
    allowedToCall
  );

  const uploadToIPFS = async function () {
    if (titleText.length < 10) {
      setErrorMessage('Title has to be at mimimum 10 characters length');
    } else if (descriptionText.length === 0) {
      setErrorMessage('Description has to be at mimimum 100 characters length');
    } else {
      setSubmissionState(1);
      setErrorMessage('');

      setIpfsHash(
        await ipfsService.uploadProposalMetadata(
          titleText,
          descriptionText,
          ['dxvote'],
          pinataService
        )
      );

      setSubmissionState(2);
    }
  };

  const createProposal = async function () {
    console.debug('[RAW PROPOSAL]', titleText, ipfsHash, calls);
    setSubmissionState(3);

    const { library } = providerStore.getActiveWeb3React();

    let to = [],
      data = [],
      value = [];
    try {
      if (schemeToUse.type !== 'ContributionReward') {
        const callToController =
          schemeToUse.controllerAddress === networkContracts.controller;

        to = calls.map(call => {
          return isWalletScheme(schemeToUse) && callToController
            ? networkContracts.controller
            : call.to;
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
          if (
            isWalletScheme(schemeToUse) &&
            callToController &&
            call.to !== networkContracts.controller
          ) {
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
          setSubmissionState(4);
          setErrorMessage('');
        })
        .on(TXEvents.RECEIPT, hash => {
          console.debug('[TX_RECEIPT]', hash);
          setSubmissionState(5);
        })
        .on(TXEvents.TX_ERROR, txerror => {
          console.error('[TX_ERROR]', txerror);
          setSubmissionState(2);
          setErrorMessage((txerror as Error).message);
        })
        .on(TXEvents.INVARIANT, error => {
          console.error('[ERROR]', error);
          setSubmissionState(2);
          setErrorMessage((error as Error).message);
        })
        .catch(error => {
          console.error('[ERROR]', error);
          setSubmissionState(2);
          setErrorMessage((error as Error).message);
        });
    } catch (error) {
      console.error('[PROPOSAL_ERROR]', error);
      setSubmissionState(2);
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
      callType: isWalletScheme(schemeToUse) ? 'simple' : 'advanced',
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
    contributionRewardCalls[key] = value;
    setContributionRewardCallsInState(contributionRewardCalls);
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
                isWalletScheme(scheme) ||
                scheme.type === 'ContributionReward' ||
                scheme.type === 'GenericMulticall' ||
                scheme.type === 'SchemeRegistrar'
              )
                return (
                  <option key={scheme.address} value={i}>
                    {scheme.name} ({scheme.address.substring(0, 6)})
                  </option>
                );
              else return null;
            })}
          </select>
        </TitleInput>
      </div>

      <DiscourseImporter onImport={onDescriptionChange} />

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
          previewOptions={{
            skipHtml: true,
            escapeHtml: true,
          }}
        />
      ) : (
        <div />
      )}
      <h2>Description Preview</h2>
      <Preview descriptionText={descriptionText} schemeToUse={schemeToUse} />

      <Calls
        schemeToUse={schemeToUse}
        onContributionRewardValueChange={onContributionRewardValueChange}
        contributionRewardCalls={contributionRewardCalls}
        onSchemeRegistrarValueChange={onSchemeRegistrarValueChange}
        schemeRegistrarProposalValues={schemeRegistrarProposalValues}
        calls={calls}
        onToSelectChange={onToSelectChange}
        allowedToCall={allowedToCall}
        onFunctionSelectChange={onFunctionSelectChange}
        onFunctionParamsChange={onFunctionParamsChange}
        addCall={addCall}
        onValueChange={onValueChange}
        networkAssetSymbol={networkAssetSymbol}
        removeCall={removeCall}
        changeCallType={changeCallType}
      />

      {errorMessage.length > 0 ? (
        <TextActions>
          <span>{errorMessage}</span>
        </TextActions>
      ) : (
        <div />
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
          <LinkButton route={`/${networkName}/proposals`}>
            Back to Proposals
          </LinkButton>
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
