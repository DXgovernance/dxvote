import styled from 'styled-components';

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
const TextInput = styled.input`
  width: ${props => props.width || '25%'};
  height: 34px;
  border-radius: 3px;
  border: 1px solid gray;
  margin-right: 5px;
`;
export const SchemeRegistrarCall = ({
  schemeRegistrarProposalValues,
  onSchemeRegistrarValueChange,
}) => (
  <div>
    <CallRow>
      <span style={{ width: '20%', fontSize: '13px' }}>Rergister Scheme</span>
      <span style={{ width: '20%', fontSize: '13px' }}>Scheme Address</span>
      <span style={{ width: '40%', fontSize: '13px' }}> Parameters Hash </span>
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
          onSchemeRegistrarValueChange('schemeAddress', event.target.value)
        }
        value={schemeRegistrarProposalValues.schemeAddress}
        width="50%"
      />
      <TextInput
        type="text"
        onChange={event =>
          onSchemeRegistrarValueChange('parametersHash', event.target.value)
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
);
