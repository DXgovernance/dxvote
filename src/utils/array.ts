export const flatten = (arr: any[]) =>
  arr.reduce(
    (acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val),
    []
  );

export const arrayBufferHex = arrayBuffer => {
  return Array.prototype.map
    .call(new Uint8Array(arrayBuffer), n => n.toString(16).padStart(2, '0'))
    .join('');
};
