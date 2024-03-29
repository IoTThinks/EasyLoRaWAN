// Dragino RS485-BL with 7-in-1 Soil sensor
// https://epcb.vn/products/cam-bien-dat-7-trong-1-es-soil-7-in-1-rs485-modbus-rtu
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

  // Only accept fPort=2. Ignore fPort=4
  if(input.fPort != 2) {
    return {"data": {}};
  }
  
  var BatV = (bytes[0] << 8 | bytes[1]) / 1000 + 0.277;
  var PayVER = bytes[2];
  // If AT+DATAUP=1, PayloadCount=1 byte, payload#=1 byte
  var Soil_pH = +((bytes[3] << 8 | bytes[4]) / 100).toFixed(2);
  var Soil_Humid = +((bytes[5] << 8 | bytes[6]) / 10).toFixed(2); // % 
  var Soil_Temp = +((bytes[7] << 8 | bytes[8]) / 10).toFixed(2); // *C
  var Soil_EC = bytes[9] << 8 | bytes[10]; // uS/cm
  
  var Soil_N = bytes[11] << 8 | bytes[12]; // mg/kg
  var Soil_P = bytes[13] << 8 | bytes[14]; // mg/kg
  var Soil_K = bytes[15] << 8 | bytes[16]; // mg/kg
   
  
  return {"data": {"BatV":BatV, "PayVER":PayVER, "Soil_pH":Soil_pH, "Soil_Humid":Soil_Humid,
                  "Soil_Temp":Soil_Temp, "Soil_EC":Soil_EC, "Soil_N":Soil_N, "Soil_P":Soil_P,
                  "Soil_K":Soil_K}};
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
