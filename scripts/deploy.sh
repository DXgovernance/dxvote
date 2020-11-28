#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

npx truffle version
npx truffle compile --network rinkeby
node scripts/deployContracts.js -- --network rinkeby
