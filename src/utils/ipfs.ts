import contentHash from 'content-hash';

export const descriptionHashToIPFSHash = function (descriptionHash) {
  try {
    if (contentHash.getCodec(descriptionHash) === 'ipfs-ns') {
      return contentHash.decode(descriptionHash);
    } else {
      return descriptionHash;
    }
  } catch (error) {
    return descriptionHash;
  }
};
