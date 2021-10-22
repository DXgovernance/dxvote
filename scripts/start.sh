#!/usr/bin/env bash
# Copy dxdao contracts addresses in live networks
# cp node_modules/dxdao-contracts/.contracts.json src/config/contracts.json

export REACT_APP_GIT_SHA=`git rev-parse --short HEAD`
SKIP_PREFLIGHT_CHECK=true FORCE_COLOR=true  npx react-scripts start | cat
