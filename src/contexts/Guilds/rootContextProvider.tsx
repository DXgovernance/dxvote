import React from 'react';
import { FilterProvider, ProposalsProvider } from '.';

export const GuildsContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <FilterProvider>
      <ProposalsProvider>{children}</ProposalsProvider>
    </FilterProvider>
  );
};
