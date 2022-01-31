import axios, { AxiosResponse } from "axios";

export const getIPFSFile = async function (ipfsHash, timeout = 1000): Promise<AxiosResponse<any>> {

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
};