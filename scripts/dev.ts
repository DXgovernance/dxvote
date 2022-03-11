const hre = require('hardhat');

async function main() {
  await hre.run("deploy-dxvote-develop");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
