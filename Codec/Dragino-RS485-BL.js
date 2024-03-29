// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
function decodeUplink(input) {
  var bytes = input.bytes;
  
  var BatV = (bytes[0] << 8 | bytes[1]) / 1000 + 0.277;
  var PayVER = bytes[2];
  // If AT+DATAUP=1, PayloadCount=1 byte, payload#=1 byte
  var Temp = (bytes[3] << 8 | bytes[4]) / 10;
  var Humid = (bytes[5] << 8 | bytes[6]) / 10;
  
  return {"data": {"BatV":BatV, "PayVER":PayVER, "Temp":Temp, "Humid":Humid}};
}

// Encode downlink function.
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.
function encodeDownlink(input) {
  return {bytes: []};
}
