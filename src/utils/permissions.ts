
const binaryToHex = function(binaryString) {
  const lookup = {
    "0000": "0",
    "0001": "1",
    "0010": "2",
    "0011": "3",
    "0100": "4",
    "0101": "5",
    "0110": "6",
    "0111": "7",
    "1000": "8",
    "1001": "9",
    "1010": "A",
    "1011": "B",
    "1100": "C",
    "1101": "D",
    "1110": "E",
    "1111": "F"
  };
  var ret = "";
  binaryString = binaryString.split(" ");
  for (var i = 0; i < binaryString.length; i++) {
    ret += lookup[ binaryString[ i ] ];
  }
  return ret;
};

const hexToBinary = function(hexString) {
  hexString = hexString.replace(/^0x+/, '');
  const lookup = {
    "0": "0000",
    "1": "0001",
    "2": "0010",
    "3": "0011",
    "4": "0100",
    "5": "0101",
    "6": "0110",
    "7": "0111",
    "8": "1000",
    "9": "1001",
    "a": "1010",
    "b": "1011",
    "c": "1100",
    "d": "1101",
    "e": "1110",
    "f": "1111",
    "A": "1010",
    "B": "1011",
    "C": "1100",
    "D": "1101",
    "E": "1110",
    "F": "1111"
  };

  var ret = "";
  for (var i = 0, len = hexString.length; i < len; i++) {
    if (hexString[ i ] != "0")
      ret += lookup[ hexString[ i ] ];
  }
  return ret;
};

// All 0: Not registered,
// 1st bit: Flag if the scheme is registered,
// 2nd bit: Scheme can register other schemes
// 3rd bit: Scheme can add/remove global constraints
// 4th bit: Scheme can upgrade the controller
// 5th bit: Scheme can call genericCall on behalf of the organization avatar
export const encodePermission = function(permissions) {
  const canGenericCall = permissions.canGenericCall || false;
  const canUpgrade = permissions.canUpgrade || false;
  const canChangeConstraints = permissions.canChangeConstraints || false;
  const canRegisterSchemes = permissions.canRegisterSchemes || false;
  const permissionBytes = `000${canGenericCall ? 1 : 0} ${canUpgrade ? 1 : 0}${canChangeConstraints ? 1 : 0}${canRegisterSchemes ? 1 : 0}1`;
  return "0x000000" + binaryToHex(permissionBytes);
}
export const decodePermission = function(permission) {
  permission = hexToBinary(permission);
  return {
    canGenericCall: permission.length > 3 && permission[ 4 ] == "1",
    canUpgrade: permission.length > 3 && permission[ 5 ] == "1",
    canChangeConstraints: permission.length > 3 && permission[ 6 ] == "1",
    canRegisterSchemes: permission.length > 3 && permission[ 7 ] == "1"
  };
}
