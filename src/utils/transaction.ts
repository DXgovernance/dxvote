export function shortenTransactionHash(hash, digits = 4) {
  return `${hash.substring(0, digits + 2)}...${hash.substring(66 - digits)}`;
}
