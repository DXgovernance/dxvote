const path = require('path');
const fs = require('fs');
const sha256 = require('crypto-js/sha256');

function main() {
  const paths = {
    ERC20Guild:
      '../artifacts/dxdao-contracts/contracts/erc20guild/ERC20Guild.sol/ERC20Guild.json',
    SnapshotRepERC20Guild:
      '../artifacts/dxdao-contracts/contracts/erc20guild/implementations/SnapshotRepERC20Guild.sol/SnapshotRepERC20Guild.json',
    DXDGuild:
      '../artifacts/dxdao-contracts/contracts/erc20guild/implementations/DXDGuild.sol/DXDGuild.json',
    //TODO: add other contracts here (IERC20Guild)
  };

  const data = Object.entries(paths).reduce((acc, [type, path]) => {
    try {
      const json = require(path);
      return [
        ...acc,
        {
          type,
          bytecode: sha256(json.deployedBytecode).toString(),
        },
      ];
    } catch (e) {
      console.error(
        `[updateDeployedBytecodes.js] File was not found: ${path}. Skipping ${type} \n`,
        e
      );
      return acc;
    }
  }, []);

  fs.writeFileSync(
    path.resolve(__dirname, '../src/bytecodes/config.json'),
    JSON.stringify(data, null, 2)
  );
}

main();
