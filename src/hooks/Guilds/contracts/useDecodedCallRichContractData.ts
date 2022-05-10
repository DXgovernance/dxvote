import { DecodedCall } from 'components/Guilds/ActionsBuilder/types';
import { useMemo } from 'react';
import { RichContractFunction } from './useRichContractData';

const useDecodedCallRichContractData = (decodedCall: DecodedCall) => {
  const contractData = decodedCall.richData;

  // Find the rich contract data for the decoded call function.
  const functionData: RichContractFunction = useMemo(() => {
    if (!decodedCall || !decodedCall.richData) return null;

    const decodedFnName = decodedCall.function.name;
    const decodedFnParams = decodedCall.function.inputs
      .map(input => input.type)
      .join(',');

    return decodedCall.richData.functions.find(fn => {
      const nameMatch = fn.functionName === decodedFnName;
      const paramsMatch =
        fn.params.map(param => param.type).join(',') === decodedFnParams;

      return nameMatch && paramsMatch;
    });
  }, [decodedCall]);

  return {
    contractData,
    functionData,
  };
};

export default useDecodedCallRichContractData;
