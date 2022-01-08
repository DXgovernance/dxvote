import React from 'react';
import {
  FilterProvider,
  ProposalsProvider,
  GuildConfigProvider,
  GuildServiceProvider,
} from '.';

export const GuildsContextProvider: React.FC<{
  children: React.ReactNode;
  guildAddress: string;
}> = ({ children, guildAddress }) => {
  return (
    <GuildServiceProvider>
      <GuildConfigProvider guildAddress={guildAddress}>
        <FilterProvider>
          <ProposalsProvider>{children}</ProposalsProvider>
        </FilterProvider>
      </GuildConfigProvider>
    </GuildServiceProvider>
  );
};
