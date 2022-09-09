import contentHash from 'content-hash';

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
