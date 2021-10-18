#!/usr/bin/env bash
# Copy dxdao contracts addresses in live networks
# cp node_modules/dxdao-contracts/.contracts.json src/config/contracts.json

# Pick git commit
COMMIT=$(git rev-parse --short HEAD)

SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true REACT_APP_DXVOTE_COMMIT="$COMMIT" npx react-app-rewired start | cat
