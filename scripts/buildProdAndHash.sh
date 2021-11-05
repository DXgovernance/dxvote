#!/usr/bin/env bash
rm -rf build
export REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9)
export SKIP_PREFLIGHT_CHECK=true
yarn react-scripts build
ipfs add build -r -n
