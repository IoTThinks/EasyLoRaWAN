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
    return {
        data: Decoder(input.bytes, input.fPort)
    };
}

function datalog(i,bytes){
  var aa= parseFloat(((bytes[3+i]<<24>>16 | bytes[4+i])/10).toFixed(1));
  var bb= parseFloat(((bytes[5+i]<<8 | bytes[6+i])/10).toFixed(1));
  var cc= getMyDate((bytes[7+i]<<24 | bytes[8+i]<<16 | bytes[9+i]<<8 | bytes[10+i]).toString(10));
  var string='['+aa+','+bb+','+cc+']'+',';  
  
  return string;
}

function getzf(c_num){ 
  if(parseInt(c_num) < 10)
    c_num = '0' + c_num; 

  return c_num; 
}

function getMyDate(str){ 
  var c_Date;
  if(str > 9999999999)
    c_Date = new Date(parseInt(str));
  else 
    c_Date = new Date(parseInt(str) * 1000);
  
  var c_Year = c_Date.getFullYear(), 
  c_Month = c_Date.getMonth()+1, 
  c_Day = c_Date.getDate(),
  c_Hour = c_Date.getHours(), 
  c_Min = c_Date.getMinutes(), 
  c_Sen = c_Date.getSeconds();
  var c_Time = c_Year +'-'+ getzf(c_Month) +'-'+ getzf(c_Day) +' '+ getzf(c_Hour) +':'+ getzf(c_Min) +':'+getzf(c_Sen); 
  
  return c_Time;
}

function Decoder(bytes, port) {
  //LSN50_v2_S31_S31B Decode   
  if(port==0x02)
  {
    var decode = {};
    var mode=(bytes[6] & 0x7C)>>2;
    if(mode==0)
    {
      decode.BatV=(bytes[0]<<8 | bytes[1])/1000;
      decode.EXTI_Trigger=(bytes[6] & 0x01)? "TRUE":"FALSE";
      decode.Door_status=(bytes[6] & 0x80)? "CLOSE":"OPEN";     
      decode.TempC_SHT31= parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(1));
      decode.Hum_SHT31=parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));
      decode.Data_time= getMyDate((bytes[2]<<24 | bytes[3]<<16 | bytes[4]<<8 | bytes[5]).toString(10));         
    }
    else if(mode==31)
    {
      decode.SHTEMP_MIN= bytes[7]<<24>>24;
      decode.SHTEMP_MAX= bytes[8]<<24>>24;
      decode.SHHUM_MIN= bytes[9];
      decode.SHHUM_MAX= bytes[10];         
    }
    
    if(bytes.length==11)
      return decode;
  }
  else if(port==3)  
  {
    for(var i=0;i<bytes.length;i=i+11)
    {
      var data= datalog(i,bytes);
      if(i=='0')
        data_sum=data;
      else
        data_sum+=data;
    }
    return{
    DATALOG:data_sum
    };    
  }
  else if(port==5)
  {
  	var freq_band;
  	var sub_band;
  	
    if(bytes[0]==0x01)
        freq_band="EU868";
  	else if(bytes[0]==0x02)
        freq_band="US915";
  	else if(bytes[0]==0x03)
        freq_band="IN865";
  	else if(bytes[0]==0x04)
        freq_band="AU915";
  	else if(bytes[0]==0x05)
        freq_band="KZ865";
  	else if(bytes[0]==0x06)
        freq_band="RU864";
  	else if(bytes[0]==0x07)
        freq_band="AS923";
  	else if(bytes[0]==0x08)
        freq_band="AS923_1";
  	else if(bytes[0]==0x09)
        freq_band="AS923_2";
  	else if(bytes[0]==0x0A)
        freq_band="AS923_3";
  	else if(bytes[0]==0x0F)
        freq_band="AS923_4";
  	else if(bytes[0]==0x0B)
        freq_band="CN470";
  	else if(bytes[0]==0x0C)
        freq_band="EU433";
  	else if(bytes[0]==0x0D)
        freq_band="KR920";
  	else if(bytes[0]==0x0E)
        freq_band="MA869";
  	
    if(bytes[1]==0xff)
      sub_band="NULL";
	  else
      sub_band=bytes[1];

	  var firm_ver= (bytes[2]&0x0f)+'.'+(bytes[3]>>4&0x0f)+'.'+(bytes[3]&0x0f);
	  
	  var tdc_time= bytes[4]<<16 | bytes[5]<<8 | bytes[6];
	  
  	return {
      FIRMWARE_VERSION:firm_ver,
      FREQUENCY_BAND:freq_band,
      SUB_BAND:sub_band,
      TDC_sec:tdc_time,
  	}
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
  return {
    bytes: [225, 230, 255, 0]
  };
}
