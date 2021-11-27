import { createContext, useContext } from 'react';
import { useMenu } from '../../hooks/Guilds/useMenu';

const FilterContext = createContext(null);

export const FilterProvider = ({
  initialStatuses = [],
  initialSchemas = [],
  children,
}) => {
  return (
    <FilterContext.Provider
      value={useMenu({ initialSchemas, initialStatuses })}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
