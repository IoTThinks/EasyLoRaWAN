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
  
  var latitude;//gps latitude,units: °
  latitude=(bytes[0]<<24 | bytes[1]<<16 | bytes[2]<<8 | bytes[3])/1000000;//gps latitude,units: °

  var longitude;
  longitude=(bytes[4]<<24 | bytes[5]<<16 | bytes[6]<<8 | bytes[7])/1000000;//gps longitude,units: °

  var alarm=(bytes[8] & 0x40)?"TRUE":"FALSE";//Alarm status
  var batV=(((bytes[8] & 0x3f) <<8) | bytes[9])/1000;//Battery,units:V

  var motion_mode;
  if((bytes[10] & 0xC0)==0x40)
  {
    motion_mode="Move";
  }
  else if((bytes[10] & 0xC0) ==0x80)
  {
    motion_mode="Collide";
  }
  else if((bytes[10] & 0xC0) ==0xC0)
  {
    motion_mode="User";
  }
  else
  {
    motion_mode="Disable";
  } //mode of motion


  var led_updown=(bytes[10] & 0x20)?"ON":"OFF";//LED status for position,uplink and downlink
  var Firmware = 160+(bytes[10] & 0x1f);  // Firmware version; 5 bits 
  
  /* AT+SGM=0 to enable. Longer message
  var roll=(bytes[11]<<24>>16 | bytes[12])/100;//roll,units: °
  var pitch=(bytes[13]<<24>>16 | bytes[14])/100; //pitch,units: °
  var hdop = 0;

  if(bytes[15] > 0)
  {
     hdop =bytes[15]/100; //hdop,units: °
  }
  else
  {
     hdop =bytes[15];
  }

  var altitude =(bytes[16]<<24>>16 | bytes[17]) / 100; //Altitude,units: °
  */
  
  if (latitude != 0 || longitude != 0) {
    return {"data": {
    Latitude: latitude,
    Longitude: longitude,
    // Roll: roll,
    // Pitch:pitch,
    BatV:batV,
    ALARM_status:alarm,
    MD:motion_mode,
    LON:led_updown,
    FW:Firmware //,
    // HDOP:hdop,
    // Altitude:altitude
    }};
  }
  else {
    return {"data": {
    // Ignore GPS(0,0)
    // Latitude: latitude,
    // Longitude: longitude,
    // Roll: roll,
    // Pitch:pitch,
    BatV:batV,
    ALARM_status:alarm,
    MD:motion_mode,
    LON:led_updown,
    FW:Firmware// ,
    // HDOP:hdop
    // Altitude:altitude
    }};
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
  return {bytes: []};
}
