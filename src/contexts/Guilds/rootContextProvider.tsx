import React from 'react';
import { FilterProvider } from '.';

export const GuildsContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <FilterProvider>{children}</FilterProvider>;
};
