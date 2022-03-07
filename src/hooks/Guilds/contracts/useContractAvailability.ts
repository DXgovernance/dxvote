import { useContext, useEffect, useState } from 'react';
import { MultichainContext } from 'contexts/MultichainProvider';

interface ContractAvailability {
  [chainId: number]: boolean;
}

export default function useContractAvailability(
  contractId: string
): ContractAvailability | null {
  const { providers: multichainProviders } = useContext(MultichainContext);
  const [availability, setAvailability] = useState<ContractAvailability>({});

  useEffect(() => {
    if (!contractId || !multichainProviders) {
      setAvailability({});
      return;
    }

    async function getAvailability() {
      let providers = Object.entries(multichainProviders);

      providers.forEach(async ([chainId, provider]) => {
        provider
          .getCode(contractId)
          .then(code => code !== '0x')
          .then(result => {
            setAvailability(prev => ({
              ...prev,
              [chainId]: result,
            }));
          })
          .catch(() => {
            setAvailability(prev => ({
              ...prev,
              [chainId]: false,
            }));
          });
      });
    }

    getAvailability();
  }, [contractId, multichainProviders]);

  return availability;
}
