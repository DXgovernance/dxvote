
export const lookUpContractWithSourcify = async ({ chainId, address }) => {
    const baseUrl = `https://sourcify.dev/server/files/any`;
    const url = `${baseUrl}/${chainId}/${address}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    if (!json.files) return null;
    return JSON.parse(json.files.find(f => f.name === 'metadata.json').content)
      .output.abi;
  };