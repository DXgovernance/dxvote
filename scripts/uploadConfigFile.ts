const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
  let defaultCacheFile = {};
  let data;
  const networkNames = process.env.REACT_APP_ETH_NETWORKS.split(',');
  for (let i = 0; i < networkNames.length; i++) {
    data = new FormData();
    data.append(
      'file',
      fs.createReadStream('./src/configs/' + networkNames[i] + '/config.json')
    );
    data.append(
      'pinataMetadata',
      JSON.stringify({
        name: `DXvote Config`,
        keyvalues: {
          type: 'dxvote-config',
        },
      })
    );
    await axios
      .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
        maxBodyLength: Number(Infinity),
        headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY,
        },
      })
      .then(function (response) {
        defaultCacheFile[networkNames[i]] = response.data.IpfsHash;
        console.debug(
          `IPFS hash for dxvote ${networkNames[i]} config: ${response.data.IpfsHash}`
        );
      })
      .catch(function (error) {
        console.error(error);
      });
  }
  
  fs.writeFileSync(
    './defaultCacheFile.json',
    JSON.stringify(defaultCacheFile, null, 2),
    { encoding: 'utf8', flag: 'w' }
  );
  
  console.log('Default cache file:', defaultCacheFile);
  
  data = new FormData();
  data.append(
    'file',
    fs.createReadStream('./defaultCacheFile.json')
  );
  data.append(
    'pinataMetadata',
    JSON.stringify({
      name: `DXvote Default Cache`,
      keyvalues: {
        type: 'dxvote-cache',
      },
    })
  );
  await axios
    .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Number(Infinity),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY,
      },
    })
    .then(function (response) {
      console.debug(
        `Default cache file ipfs hash: ${response.data.IpfsHash}`
      );
    })
    .catch(function (error) {
      console.error(error);
    });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
