#!/usr/bin/env bash

# Get record key from env
# export $(grep -v '^#' .env | xargs)
# RECORD_KEY="${CYPRESS_RECORD_KEY}"

export SECRET_WORDS="cream core pear sure dinner indoor citizen divorce sudden captain subject remember"
export PASSWORD="TestMetaMask"
export NETWORK_NAME=localhost
export RPC_URL=http://127.0.0.1:8545/
export CHAIN_ID=1337
export IS_TESTNET=true
export CYPRESS_SKIP_RESOURCES_WAIT=true
export FAIL_ON_ERROR=0

# export SKIP_METAMASK_INSTALL=false
# export SKIP_METAMASK_SETUP=false

synpress run --configFile ./cypress/config/development.json
# TODO: Include monitoring  with record key like: synpress run --configFile synpress.json --record --key $RECORD_KEY