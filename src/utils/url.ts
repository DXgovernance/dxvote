export const resolveUri = (uriToResolve: string) => {
  let match = new RegExp(/([a-z]+):\/\/(.*)/).exec(uriToResolve);
  if (!match || match.length !== 3) return null;

  const scheme = match[1];
  const path = match[2];

  switch (scheme) {
    case 'ipfs':
      return `https://gateway.pinata.cloud/ipfs/${path}`;
    case 'ipns':
      return `https://gateway.pinata.cloud/ipns/${path}`;
    case 'http':
    case 'https':
      return uriToResolve;
    default:
      return null;
  }
};
