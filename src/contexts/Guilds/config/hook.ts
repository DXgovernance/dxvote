import React from 'react';
import { GuildConfigContext, ConfigContext } from './context';

export const useGuildConfig = () =>
  React.useContext<ConfigContext>(GuildConfigContext);
