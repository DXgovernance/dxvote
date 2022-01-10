import React from 'react';
import { FilterProvider, ProposalsProvider, GuildConfigProvider } from '.';

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
