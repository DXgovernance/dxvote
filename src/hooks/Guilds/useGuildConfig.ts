import React from 'react';
import { GuildConfigContext, ConfigContext } from '../../contexts/Guilds';

export const useGuildConfig = () =>
  React.useContext<ConfigContext>(GuildConfigContext);
