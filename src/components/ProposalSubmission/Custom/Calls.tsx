import { ContributionRewardCall } from './ContributionRewardCall';
import { SchemeRegistrarCall } from './SchemeRegistarCall';
import styled from 'styled-components';
import { Button } from 'components/common';
import Toggle from 'components/Toggle';

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
export const Calls = ({
  schemeToUse,
  onContributionRewardValueChange,
  contributionRewardCalls,
  onSchemeRegistrarValueChange,
  schemeRegistrarProposalValues,
  calls,
  onToSelectChange,
  allowedToCall,
  onFunctionSelectChange,
  onFunctionParamsChange,
  addCall,
  onValueChange,
  networkAssetSymbol,
  removeCall,
  changeCallType,
}) => {
  return (
    <>
      {schemeToUse.type === 'ContributionReward' ? (
        // If scheme to use is Contribution Reward display a different form with less fields
        <ContributionRewardCall
          onContributionRewardValueChange={onContributionRewardValueChange}
          contributionRewardCalls={contributionRewardCalls}
        />
      ) : schemeToUse.type === 'SchemeRegistrar' ? (
        // If scheme to use is SchemeRegistrar display a different form with less fields
        <SchemeRegistrarCall
          onSchemeRegistrarValueChange={onSchemeRegistrarValueChange}
          schemeRegistrarProposalValues={schemeRegistrarProposalValues}
        />
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
                <div style={{
                  padding: '0px 5px 0px 10px',
                  marginTop: '-10px',
                }}>
                  <Toggle
                    onToggle={() => {
                      changeCallType(i);
                    }}
                    width={80}
                    height={35}
                    state={calls[i].callType === 'advanced'}
                    optionOne={'Simple'}
                    optionTwo={'Advanced'} />
                </div>
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
    </>
  );
};
