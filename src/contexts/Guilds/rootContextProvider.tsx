import React from 'react';

import { FilterProvider, ProposalsProvider } from '.';
import { GuildConfigProvider } from './config';

export const GuildsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <GuildConfigProvider>
      <FilterProvider>
        <ProposalsProvider>{children}</ProposalsProvider>
      </FilterProvider>
    </GuildConfigProvider>
  );
};
