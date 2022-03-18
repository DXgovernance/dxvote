#!/usr/bin/env bash
node scripts/beforeBuild.js
yarn hardhat compile
export REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9)
export REACT_APP_VERSION=$npm_package_version
export SKIP_PREFLIGHT_CHECK=true
yarn react-app-rewired --max_old_space_size=4096 build
