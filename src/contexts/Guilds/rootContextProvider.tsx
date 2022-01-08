import React from 'react';

import {
  FilterProvider,
  ProposalsProvider,
  GuildConfigProvider,
  GuildServiceProvider,
} from '.';

export const GuildsContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <GuildServiceProvider>
      <GuildConfigProvider>
        <FilterProvider>
          <ProposalsProvider>{children}</ProposalsProvider>
        </FilterProvider>
      </GuildConfigProvider>
    </GuildServiceProvider>
  );
};
