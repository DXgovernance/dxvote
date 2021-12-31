import { useState, useEffect } from 'react';
import moment from 'moment';
import UserVestingInfoModal from '../../UserVestingInfoModal';
import useContract from '../../../hooks/useContract';
import { useContext } from '../../../contexts';
import { formatBalance, bnum } from '../../../utils';
import ERC20Json from '../../../contracts/ERC20.json';
import { TitleRow, ListRow } from '../styled';

interface VestingContractsSectionProps {
  userAddress: string;
}

const VestingContractsSection: React.FC<VestingContractsSectionProps> = ({
  userAddress,
}) => {
  const {
    context: { daoStore, configStore },
  } = useContext();
  const userVestingContracts = daoStore.getUserVestingContracts(userAddress);
  const [isVestingInfoModalOpen, setIsVestingInfoModalOpen] = useState(false);
  const [selectedModalVestingContract, setSelectedModalVestingContract] =
    useState(null);
  const [tokenVestingContracts, setTokenVestingContracts] = useState([]);
  const [loading, setLoading] = useState(false);

  const DXD = useContract(
    configStore.getTokensOfNetwork().find(token => token.symbol === 'DXD')
      .address,
    ERC20Json.abi
  );

  const handleListItemClick = contract => {
    if (contract.address) {
      setSelectedModalVestingContract(contract);
      setIsVestingInfoModalOpen(true);
    }
  };

  const handleDismiss = () => {
    setSelectedModalVestingContract(null);
    setIsVestingInfoModalOpen(false);
  };

  const updateUserVestingContracts = () => {
    const contracts = Promise.all(
      userVestingContracts.map(async contract => {
        try {
          const balance = await DXD?.balanceOf(contract.address);
          return {
            ...contract,
            value: bnum(balance),
          };
        } catch (e) {
          return {
            ...contract,
            value: bnum('0'),
          };
        }
      })
    );
    setLoading(true);
    contracts.then(setTokenVestingContracts).then(() => setLoading(false));
  };

  useEffect(updateUserVestingContracts, [userAddress]); // eslint-disable-line

  return (
    <>
      <TitleRow>
        <h2>Vesting Contracts</h2>
      </TitleRow>

      {tokenVestingContracts.length ? (
        tokenVestingContracts.map((contract, i, arr) => {
          return (
            <ListRow
              clickable
              key={contract.address}
              borderBottom={i < arr.length - 1}
              onClick={() => handleListItemClick(contract)}
            >
              <span>
                {contract.address} / Cliff:{' '}
                {moment.unix(Number(contract.cliff)).format('LL')}/ Value:{' '}
                {formatBalance(contract.value)} DXD
              </span>
            </ListRow>
          );
        })
      ) : (
        <ListRow>
          {' '}
          {loading
            ? 'Loading contracts ...'
            : `- No Vesting Contracts found for ${userAddress} -`}{' '}
        </ListRow>
      )}
      <UserVestingInfoModal
        contract={selectedModalVestingContract}
        isOpen={isVestingInfoModalOpen}
        onDismiss={handleDismiss}
        updateContracts={updateUserVestingContracts}
      />
    </>
  );
};

export default VestingContractsSection;
