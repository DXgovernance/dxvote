import { useState } from 'react';

// This hooks controls the filter for the menus.
export const useMenu = ({
  initialStates = [],
  initialTypes = [],
  initialCurrencies = [],
}) => {
  const [filterState, setFilterState] = useState(initialStates);
  const [filterType, setFilterType] = useState(initialTypes);
  const [filterCurrency, setFilterCurrency] = useState(initialCurrencies);

  // abstract function to toggle given value, state, and setSate params.
  const onToggleFilter = (value, stateToUse, setStateToUse) => {
    let actualState = new Array(...stateToUse);

    if (actualState.find(elem => elem === value)) {
      //if the menuItem is selected already, filter out.
      setStateToUse(actualState.filter(elem => elem !== value));
    } else {
      //else lets push this menuItem in the selected ones.
      actualState.push(value);
      setStateToUse(actualState);
    }
  };

  return {
    //State
    onToggleState: value => onToggleFilter(value, filterState, setFilterState),
    onResetState: () => setFilterState([]),
    isStateSelected: value => filterState.indexOf(value) > -1,
    countStateSelected: filterState.length,

    //Type
    onToggleType: value => onToggleFilter(value, filterType, setFilterType),
    onResetType: () => setFilterType([]),
    isTypeSelected: value => filterType.indexOf(value) > -1,
    countTypeSelected: filterType.length,

    //Currency
    onToggleCurrency: value =>
      onToggleFilter(value, filterCurrency, setFilterCurrency),
    onResetCurrency: () => setFilterCurrency([]),
    isCurrencySelected: value => filterCurrency.indexOf(value) > -1,
    countCurrencySelected: filterCurrency.length,

    totalFilters:
      filterState.length + filterType.length + filterCurrency.length,
  };
};
