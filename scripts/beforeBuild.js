const fs = require('fs');

if (!fs.existsSync('./src/configs/localhost')) {
  fs.mkdirSync('./src/configs/localhost');
}

fs.writeFileSync(
  './src/configs/localhost/config.json',
  JSON.stringify(
    {
      cache: {
        fromBlock: 0,
        toBlock: 1,
        ipfsHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      contracts: {
        fromBlock: 1,
        avatar: '0x0000000000000000000000000000000000000000',
        reputation: '0x0000000000000000000000000000000000000000',
        token: '0x0000000000000000000000000000000000000000',
        controller: '0x0000000000000000000000000000000000000000',
        permissionRegistry: '0x0000000000000000000000000000000000000000',
        schemes: {},
        utils: {
          multicall: '0x0000000000000000000000000000000000000000',
          dxDaoNFT: '0x0000000000000000000000000000000000000000',
          dxdVestingFactory: '0x0000000000000000000000000000000000000000',
        },
        votingMachines: {},
      },
      recommendedCalls: [],
      proposalTemplates: [],
      proposalTypes: [
        {
          id: 'custom',
          title: 'Custom',
        },
      ],
      contributionLevels: [
        {
          id: '1',
          dxd: 2000,
          stable: 4000,
          rep: 0.1667,
        },
        {
          id: '2',
          dxd: 3000,
          stable: 5000,
          rep: 0.1667,
        },
        {
          id: '3',
          dxd: 4000,
          stable: 6000,
          rep: 0.1667,
        },
        {
          id: '4',
          dxd: 5000,
          stable: 7000,
          rep: 0.1667,
        },
        {
          id: '5',
          dxd: 6000,
          stable: 8000,
          rep: 0.1667,
        },
      ],
      tokens: [],
    },
    null,
    2
  )
);
