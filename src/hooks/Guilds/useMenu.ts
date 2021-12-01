import { useState } from 'react';

// This hooks controls the filter for the menus.
export const useMenu = ({ initialStatuses = [], initialSchemas = [] }) => {
  const [filterStatus, setFilterStatus] = useState(initialStatuses);
  const [filterScheme, setFilterScheme] = useState(initialSchemas);

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
    //Status
    onToggleStatus: value =>
      onToggleFilter(value, filterStatus, setFilterStatus),
    isStatusSelected: value => filterStatus.indexOf(value) > -1,
    countStatusSelected: filterStatus.length,

    //Schema
    onToggleScheme: value =>
      onToggleFilter(value, filterScheme, setFilterScheme),
    isSchemeSelected: value => filterScheme.indexOf(value) > -1,
    countSchemeSelected: filterScheme.length,

    totalFilters: filterStatus.length + filterScheme.length,
  };
};
