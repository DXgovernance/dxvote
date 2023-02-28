import RootContext from '../contexts';
import axios from 'axios';
import contentHash from 'content-hash';

export default class PinataService {
  context: RootContext;
  auth: Boolean = false;

  constructor(context: RootContext) {
    this.context = context;
  }
  defaultApiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZTNlZjUzNi0wZWQ5LTQ4YzAtOTFlYS1kNzUwYjk0Nzk4ZDMiLCJlbWFpbCI6Im1lQHJvc3NuZWlsc29uLmRldiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4Y2Q1OGJkZDk3NWVlYTI4MGU5MSIsInNjb3BlZEtleVNlY3JldCI6ImYzNGJmNWFjYzVhZDdlZTViYmYwNmQwNjJmOGNmMGJmZTA0OWZmMGRkZjNmMzNlNTllN2FjODZiNDlhYWI3YWYiLCJpYXQiOjE2NzI4NzE2MzN9.5cgGI2sg4Lw9tSaKhT6-ZT4r7UedJ1U_Jif28jkXlUg';

  async updatePinList() {
    if (this.context.configStore.getLocalConfig().pinata) {
      const pinList = await this.getPinList();
      const ipfsHashes = this.context.daoStore.daoCache.ipfsHashes;
      const alreadyPinned = pinList.data.rows;
      for (let i = 0; i < ipfsHashes.length; i++) {
        if (
          alreadyPinned.indexOf(
            pinned => alreadyPinned.ipfs_pin_hash === ipfsHashes[i].hash
          ) < 0
        ) {
          console.debug('[PINATA] Pinning:', ipfsHashes[i].hash);
        } else {
          console.debug('[PINATA] Alpready pinned:', ipfsHashes[i].hash);
        }
      }
    }
  }

  async isAuthenticated() {
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    try {
      const auth = await axios({
        method: 'GET',
        url: 'https://api.pinata.cloud/data/testAuthentication',
        headers: {
          Authorization: `Bearer ${
            pinataApiKey ? pinataApiKey : this.defaultApiKey
          }`,
          Accept: 'Accept: text/plain',
        },
      });
      this.auth = auth.status === 200;
    } catch (error) {
      this.auth = false;
    }
  }

  async pin(hashToPin: String, jsonToPin?: any) {
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    if (jsonToPin) {
      console.log('json pin');
      console.log(
        await axios({
          method: 'POST',
          url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
          data: {
            pinataOptions: {
              cidVersion: 0,
            },
            pinataMetadata: {
              name: `DXdao ${this.context.configStore.getActiveChainName()} DescriptionHash ${contentHash.fromIpfs(
                hashToPin
              )}`,
              keyValues: { type: 'proposal' },
            },
            pinataContent: jsonToPin,
          },
          headers: {
            Authorization: `Bearer ${
              pinataApiKey ? pinataApiKey : this.defaultApiKey
            }`,
            Accept: 'Accept: text/plain',
          },
        })
      );
    }
    return axios({
      method: 'POST',
      url: 'https://api.pinata.cloud/pinning/pinByHash',
      data: {
        hashToPin,
        pinataMetadata: {
          name: `DXdao ${this.context.configStore.getActiveChainName()} DescriptionHash ${contentHash.fromIpfs(
            hashToPin
          )}`,
          keyValues: { type: 'proposal' },
        },
      },
      headers: {
        Authorization: `Bearer ${
          pinataApiKey ? pinataApiKey : this.defaultApiKey
        }`,
        Accept: 'Accept: text/plain',
      },
    });
  }

  async getPinList() {
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
    return axios({
      method: 'GET',
      url: `https://api.pinata.cloud/data/pinList?pageLimit=1000&metadata[name]=DXdao ${this.context.configStore.getActiveChainName()}`,
      headers: {
        Authorization: `Bearer ${
          pinataApiKey ? pinataApiKey : this.defaultApiKey
        }`,
        Accept: 'Accept: text/plain',
      },
    });
  }
}
