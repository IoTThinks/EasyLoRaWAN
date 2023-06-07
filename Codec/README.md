# Compatible codecs for Easy LoRaWAN Cloud
The codecs will be used in this guide: https://iotthinks.com/add-a-lorawan-device-in-to-easy-lorawan-cloud/
- The codecs in this folder is COMFIRMED to work with Easy LoRaWAN Cloud

The below sample codecs are COMPATIBLE with Easy LoRaWAN Cloud.
- From TTN: https://github.com/IoTThinks/lorawan-devices/tree/master/vendor
- From Dragino: https://www.dropbox.com/sh/sa4uitwn6xdku9u/AACUA890oj5dl8rETYO2icdBa?dl=0
- From RAK Wireless: https://github.com/RAKWireless/RAKwireless_Standardized_Payload

### Codec Format
A valid codec for Easy LoRaWAN Cloud is below:
```
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
```

### Conversion of Codec Formats
If you have a codec for ChirpStack v3, you need to put the below wrapper function to convert a codec to ChirpStack v4.
Easy LoRaWAN uses ChirpStack v4

```
// V3
function Decode(fPort, bytes, variables) {
   ...
}

// Converter from ChirpStack v3 to ChirpStack v4 / Easy LoRaWAN Cloud
function decodeUplink(input) {
   // Wrapper function for ChirpStack v4
   return {
      data: Decode(input.fPort, input.bytes, input.variables)
   };
}
```
