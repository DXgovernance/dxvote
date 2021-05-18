#!/usr/bin/env bash
# Copy dxdao contracts addresses in live networks
cp node_modules/dxdao-contracts/.contracts.json src/config/contracts.json

SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true  npx react-app-rewired start | cat
