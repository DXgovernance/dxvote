const path = require('path');
const fs = require('fs');

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
          bytecode: json.deployedBytecode,
        },
      ];
    } catch (e) {
      console.error(
        `[updateDeployedBytecodes.js] Didn't find file: ${path}. Skipping ${type}`
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
