// Decode uplink function.
//
// Input is an object with the following fields:
// - bytes = Byte array containing the uplink payload, e.g. [255, 230, 255, 0]
// - fPort = Uplink fPort.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - data = Object representing the decoded payload.
// AT configuration for Dragino RS485-BL and RS485 PM 1.0/2.5/10 sensor
// AT+5VT=3000
// AT+MBFUN=1
// AT+BAUDR=9600
// AT+COMMAND1=01 03 00 00 00 03 ,1     AT+SEARCH1=0,0     AT+DATACUT1=0,0,0     AT+CMDDL1=2000
function decodeUplink(input) {
  var bytes = input.bytes;

  // Only accept fPort=2. Ignore fPort=4
  if(input.fPort != 2) {
    return {"data": {}};
  }
  
  var BatV = (bytes[0] << 8 | bytes[1]) / 1000 + 0.277;
  var PayVER = bytes[2];
  // If AT+DATAUP=1, PayloadCount=1 byte, payload#=1 byte
  var PM2_5 = bytes[3] == 0xff && bytes[4] == 0xff? -1: bytes[3] << 8 | bytes[4];
  var PM10  = bytes[5] == 0xff && bytes[6] == 0xff? -1: bytes[5] << 8 | bytes[6];
  var PM1_0 = bytes[7] == 0xff && bytes[8] == 0xff? -1: bytes[7] << 8 | bytes[8];  
    return {
    data: {
      "BatV": BatV, "PM2_5": PM2_5, "PM10": PM10, "PM1_0": PM1_0
    }
  };
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
