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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MTJmMzIwZC1iOTA1LTQwOTgtYmViZC1jMjMwNzhlNDNmM2MiLCJlbWFpbCI6ImZsdWlkZHJvcDU2NDgyM0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlfSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYmFhMjllYjUxZWYzZWQyMDY4MWEiLCJzY29wZWRLZXlTZWNyZXQiOiI0OTIyYzQ2MThhYWZlNzZmNzhiNWQzNzU0NzY4MjBiNTk1MWM5MjdkZjFiNzY3ZGI3OWUzMGY5OTI3MDBmYTc5IiwiaWF0IjoxNjUyMTg4MjAyfQ.c8CpCVxvdknULzW6dJALyWgHD_DMq5167Nlb1KkXNRI';

  async updatePinList() {
    // const pinList = await this.getPinList();
    const ipfsHashes = this.context.daoStore.daoCache.ipfsHashes;
    // const alreadyPinned = pinList.data.rows;
    for (let i = 0; i < ipfsHashes.length; i++) {
      // if (alreadyPinned.indexOf(pinned => alreadyPinned.ipfs_pin_hash === ipfsHashes[i].hash) < 0) {
      //   console.debug('[PINATA] Pinning:', ipfsHashes[i].hash);
      // } else {
      //   console.debug('[PINATA] Alpready pinned:', ipfsHashes[i].hash);
      // }
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
        },
      });
      this.auth = auth.status === 200;
    } catch (error) {
      this.auth = false;
    }
  }

  async pin(hashToPin: String) {
    const pinataApiKey = this.context.configStore.getLocalConfig().pinata;
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
      },
    });
  }
}
