const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function uploadFileToPinata(filePath, name, keyValue) {
  let data = new FormData();
  data.append('file', fs.createReadStream(filePath));
  data.append(
    'pinataMetadata',
    JSON.stringify({
      name: name,
      keyvalues: {
        type: keyValue,
      },
    })
  );
  return await axios
    .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: Number(Infinity),
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET_KEY,
      },
    })
    .then(function (response) {
      console.debug(`${name} hash: ${response.data.IpfsHash}`);
      return response.data.IpfsHash;
    })
    .catch(function (error) {
      console.error(error);
    });
}

// DefaultCacheFile[ network ] => ConfigFile => CacheFile
async function main() {
  let defaultCacheFile = {};
  const networkNames = [
    'mainnet',
    'xdai',
    'arbitrum',
    'rinkeby',
    'arbitrumTestnet',
  ];

  // Update the cache and config for each network
  for (let i = 0; i < networkNames.length; i++) {
    const networkCacheHash = await uploadFileToPinata(
      `./cache/${networkNames[i]}.json`,
      `DXvote ${networkNames[i]} Cache`,
      `dxvote-${networkNames[i]}-cache`
    );
    const networkConfigHash = await uploadFileToPinata(
      `./src/configs/${networkNames[i]}/config.json`,
      `DXvote ${networkNames[i]} Config`,
      `dxvote-${networkNames[i]}-config`
    );
    defaultCacheFile[networkNames[i]] = networkConfigHash;
  }

  fs.writeFileSync(
    './defaultCacheFile.json',
    JSON.stringify(defaultCacheFile, null, 2),
    { encoding: 'utf8', flag: 'w' }
  );

  // Update the default cache file
  console.log('Default cache file:', defaultCacheFile);
  await uploadFileToPinata(
    './defaultCacheFile.json',
    'DXvote Default Cache',
    'dxvote-cache'
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
