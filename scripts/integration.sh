
# SECRET_WORDS="dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao dxdao"
export PRIVATE_KEY=0x0054b824c2083e7db09f36edb2ab24eb31f8276fa6cd62e30b42e3a185b37179
export PASSWORD="TestMetaMask"
export NETWORK_NAME=localhost
# export METAMASK_VERSION="latest"
# export NETWORK_NAME="localhost"
# export RPC_URL=http://127.0.0.1:8545/
# export CHAIN_ID=1337
# export IS_TESTNET=true

synpress run --configFile synpress.json --browser chrome --noExit
# synpress run --env configFile=development --browser chrome --noExit
# yarn run env-linux && synpress run --env configFile=development --browser chrome --noExit