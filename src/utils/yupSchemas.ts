import * as Yup from 'yup';

export const ContributionRewardFormSchema = Yup.object().shape({
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

export const SchemeRegistrarFormSchema = Yup.object().shape({
  register: Yup.string().required('required'),
  schemeAddress: Yup.string().required('required'),
  parametersHash: Yup.string().test('empty', 'required', value => value !== ''),
  permissions: Yup.string().test('empty', 'required', value => value !== ''),
});

export const CallFormScheme = Yup.object().shape({
  value: Yup.string()
    .test('empty', 'Value is required', value => value !== '')
    .test('min', 'Value should be at least 0.', value => parseFloat(value) >= 0)
    .test(
      'max',
      'Be aware, Value is in ETH',
      value => parseFloat(value) < 9999
    ),
});
