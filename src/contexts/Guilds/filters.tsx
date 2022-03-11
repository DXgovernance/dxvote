import { createContext, useContext } from 'react';
import { useMenu } from '../../hooks/Guilds/useMenu';

const FilterContext = createContext(null);

export const FilterProvider = ({
  initialStates = [],
  initialTypes = [],
  initialCurrencies = [],
  children,
}) => {
  return (
    <FilterContext.Provider
      value={useMenu({ initialStates, initialTypes, initialCurrencies })}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
