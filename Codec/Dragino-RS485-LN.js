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
  var bytes=input.bytes;
  
  //Payload Formats of RS485_LN Deceive, for TTN/ChirpStack
  if(bytes.length > 6) // Telemetry, by right should check by fport
  {
    // uplink from RS485 has payload version at bytes[0]
    var cs_temp = (bytes[1] << 8 | bytes[2]) / 10;

    // Javascript does not support binary 0bxxxx  
    var cs_al1_status = (bytes[3] & 0x04)? true : false; // 0b0100
    var cs_al2_status = (bytes[3] & 0x08)? true : false; // 0b1000
    
    // For Temperature and Humid of SHT20
    var cs_temp_sht20 = (bytes[4] << 8 | bytes[5]) / 10 - 2.9; // To offset down 2.9 degree
    var cs_humid_sht20 = (bytes[6] << 8 | bytes[7]) / 10;
    
    // Voltage and current
    var cs_voltage = (bytes[8] << 8 | bytes[9]) / 10;
    var cs_current = (bytes[10] << 8 | bytes[11]) / 100;
    var cs_kW = cs_voltage * cs_current / 1000;
    
    // kWh
    var cs_exportKWh = (bytes[12] << 24 | bytes[13] << 16 | bytes[14] << 8 | bytes[15]) / 100;
    var cs_importKWh = (bytes[16] << 24 | bytes[17] << 16 | bytes[18] << 8 | bytes[19]) / 100;
    var cs_totalKWh = cs_exportKWh + cs_importKWh;
    
    return { data: {"cs_temp":cs_temp, "cs_al1_status":cs_al1_status, "cs_al2_status":cs_al2_status, 
            "cs_temp_sht20":cs_temp_sht20, "cs_humid_sht20":cs_humid_sht20,
            "cs_voltage":cs_voltage, "cs_current":cs_current, "cs_kW":cs_kW,
            "cs_exportKWh":cs_exportKWh, "cs_importKWh":cs_importKWh, "cs_totalKWh":cs_totalKWh}
           };
  }
  else if(bytes.length == 6) // return from RPC commands
  {
    // Uplink from RPC response does not have payload version at bytes[0]
    // AL1: On OK  [0x01,0x06,0x20,0x01,0x03,0xe8]    
    if(bytes[0] == 0x01 && bytes[1] == 0x06 && bytes[2] == 0x20 && 
       bytes[3] == 0x01 && bytes[4] == 0x03 && bytes[5] == 0xe8)
    {
      return { data: {"cs_al1_status": true}};
    }
    // AL1: Off OK [0x01,0x06,0x20,0x01,0x00,0x00]
    else if(bytes[0] == 0x01 && bytes[1] == 0x06 && bytes[2] == 0x20 && 
       bytes[3] == 0x01 && bytes[4] == 0x00 && bytes[5] == 0x00)
    {
      return { data: {"cs_al1_status": false}};
    }
    // AL2: On OK  [0x01,0x06,0x20,0x03,0x03,0xe8]    
    if(bytes[0] == 0x01 && bytes[1] == 0x06 && bytes[2] == 0x20 && 
       bytes[3] == 0x03 && bytes[4] == 0x03 && bytes[5] == 0xe8)
    {
      return { data: {"cs_al2_status": true}};
    }
    // AL2: Off OK [0x01,0x06,0x20,0x03,0x00,0x00]
    else if(bytes[0] == 0x01 && bytes[1] == 0x06 && bytes[2] == 0x20 && 
       bytes[3] == 0x03 && bytes[4] == 0x00 && bytes[5] == 0x00)
    {
      return { data: {"cs_al2_status": false}};
    }
    else return { data: {"byte0": bytes[0], "byte1": bytes[1], "byte2": bytes[2], 
                 "byte3": bytes[3], "byte4": bytes[4], "byte5": bytes[5]}};
  }
  else // Unknown
  {   
     return {data: {}};
  }
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
  var obj=input.data;
  if(obj["method"] === "setAL1Value")
  {
    if(obj["params"])
    {
      // return [0xa8,0x01,0x06,0x01,0x06,0x20,0x01,0x03,0xe8,0x00]; // On
      return { bytes: [0xa8,0x01,0x06,0x01,0x06,0x20,0x01,0x03,0xe8,0x06]}; // On, to return 6-byte uplink
    }
    else
    {
      // return [0xa8,0x01,0x06,0x01,0x06,0x20,0x01,0x00,0x00,0x00]; // Off
      return {bytes: [0xa8,0x01,0x06,0x01,0x06,0x20,0x01,0x00,0x00,0x06]}; // Off, to return 6-byte uplink
    }
  }
  else if(obj["method"] === "setAL2Value")
  {
    if(obj["params"])
    {
      // a801060106200303e806
      // qAEGAQYgAwPoBg==
      // return [0xa8,0x01,0x06,0x01,0x06,0x20,0x03,0x03,0xe8,0x00]; // On
      return {bytes: [0xa8,0x01,0x06,0x01,0x06,0x20,0x03,0x03,0xe8,0x06]}; // On, to return 6-byte uplink
    }
    else
    {
      // a8010601062003000006
      // qAEGAQYgAwAABg==
      // return [0xa8,0x01,0x06,0x01,0x06,0x20,0x03,0x00,0x00,0x00]; // Off
      return {bytes: [0xa8,0x01,0x06,0x01,0x06,0x20,0x03,0x00,0x00,0x06]}; // Off, to return 6-byte uplink
    }
  }
  else if(obj["method"] === "getAL1Value" || obj["method"] === "getAL2Value")
  {
    return {bytes: [0x08,0xff]}; // To uplink all at+command immediately
  }
  
  // Should not reach here
  return {bytes: []};
}
