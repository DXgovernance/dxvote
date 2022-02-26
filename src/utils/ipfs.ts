import axios, { AxiosResponse } from 'axios';
import contentHash from 'content-hash';

export const getIPFSFile = async function (
  ipfsHash,
  timeout = 1000
): Promise<AxiosResponse<any>> {
  try {
    return await Promise.any([
      axios.request({
        url: 'https://ipfs.io/ipfs/' + ipfsHash,
        method: 'GET',
        timeout: timeout,
      }),
      axios.request({
        url: 'https://gateway.ipfs.io/ipfs/' + ipfsHash,
        method: 'GET',
        timeout: timeout,
      }),
      axios.request({
        url: 'https://gateway.pinata.cloud/ipfs/' + ipfsHash,
        method: 'GET',
        timeout: timeout,
      }),
      axios.request({
        url: 'https://dweb.link/ipfs/' + ipfsHash,
        method: 'GET',
        timeout: timeout,
      }),
      axios.request({
        url: 'https://infura-ipfs.io/ipfs/' + ipfsHash,
        method: 'GET',
        timeout: timeout,
      }),
    ]);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export const descriptionHashToIPFSHash = function (descriptionHash) {
  try {
    if (contentHash.getCodec(descriptionHash) === 'ipfs-ns')
      return contentHash.decode(descriptionHash);
    else if (
      descriptionHash.length > 1 &&
      descriptionHash.substring(0, 2) !== 'Qm'
    )
      return descriptionHash;
    else return '';
  } catch (error) {
    return '';
  }
};

export const ipfsHashToDescriptionHash = function (ipfsHash) {
  try {
    if (ipfsHash.length > 1 && ipfsHash.substring(0, 2) === 'Qm')
      return contentHash.fromIpfs(ipfsHash);
    else if (contentHash.getCodec(ipfsHash) === 'ipfs-ns') return ipfsHash;
    else return '';
  } catch (error) {
    return '';
  }
};
