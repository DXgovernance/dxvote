#!/usr/bin/env bash
rm -rf build
export REACT_APP_ETH_NETWORKS="mainnet,xdai,arbitrum,rinkeby,arbitrumTestnet"
export REACT_APP_KEY_ALCHEMY_API_KEY="7i7fiiOx1b7bGmgWY_oI9twyQBCsuXKC"
export REACT_APP_GIT_SHA=$(echo $(git rev-parse  HEAD) | cut -c1-9)
export SKIP_PREFLIGHT_CHECK=true
export REACT_APP_VERSION="1.0.3"
yarn react-scripts build
ipfs add build -r -n
