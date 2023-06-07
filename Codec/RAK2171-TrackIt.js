// Reference: https://github.com/RAKWireless/RAKwireless_Standardized_Payload/blob/main/RAK2171-TrackIt.js
// For TTN and Datacake
function Decoder(bytes, fPort) {
	return Decode(fPort, bytes);
}

// Converter from ChirpStack v3 to ChirpStack v4 / Easy LoRaWAN Cloud
function decodeUplink(input) {
   // Wrapper function for ChirpStack v4
   return {
      data: Decode(input.fPort, input.bytes, input.variables)
   };
}

// For Chirpstack
function Decode(fPort, bytes) {
	var decoded = {};

	// Adjust time zone only in older RAK2171 firmware versions!
	// adjust time zone, here Asia/Manila = +8H
	var my_time_zone = 0;
	// (8 * 60 * 60);

	decoded.num = bytes[1];
	decoded.app_id = (bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
	decoded.dev_id = (bytes[6] << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9];
	switch (bytes[0]) {
		case 0xCA: // No Location fix
			decoded.acc = 0;
			decoded.fix = 0;
			decoded.batt = bytes[10];
			decoded.time = ((bytes[11] << 24) | (bytes[12] << 16) | (bytes[13] << 8) | bytes[14]);
			// adjust time zone
			decoded.time = decoded.time + my_time_zone;
			var dev_date = new Date(decoded.time * 1000);
			decoded.time_stamp = dev_date.getHours() + ":" + dev_date.getMinutes();
			decoded.date_stamp = dev_date.getDate() + "." + (dev_date.getMonth() + 1) + "." + dev_date.getFullYear();
			decoded.stat = bytes[15] & 0x03;
			decoded.gps = bytes[15] & 0x0C;
			break;
		case 0xCB: // Location fix
			decoded.fix = 1;
			decoded.batt = bytes[20];
			decoded.time = ((bytes[21] << 24) | (bytes[22] << 16) | (bytes[23] << 8) | bytes[24]);
			// adjust time zone
			decoded.time = decoded.time + my_time_zone;
			var dev_date = new Date(decoded.time * 1000);
			decoded.time_stamp = dev_date.getHours() + ":" + dev_date.getMinutes();
			decoded.date_stamp = dev_date.getDate() + "." + (dev_date.getMonth() + 1) + "." + dev_date.getFullYear();
			decoded.stat = bytes[25] & 0x03;
			decoded.gps = bytes[25] & 0x0C;
			decoded.lng = (((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]) * 0.000001).toFixed(6);
			decoded.lat = (((bytes[14] << 24) | (bytes[15] << 16) | (bytes[16] << 8) | bytes[17]) * 0.000001).toFixed(6);
			decoded.acc = bytes[18];
			decoded.gps_start = bytes[19];
			decoded.location = "(" + decoded.latitude + "," + decoded.longitude + ")";
			break;
		case 0xCC: // SOS 
			decoded.sos = 1;
			decoded.lng = (((bytes[10] << 24) | (bytes[11] << 16) | (bytes[12] << 8) | bytes[13]) * 0.000001).toFixed(6);
			decoded.lat = (((bytes[14] << 24) | (bytes[15] << 16) | (bytes[16] << 8) | bytes[17]) * 0.000001).toFixed(6);
			if (bytes.length > 18) {
				var i;
				for (i = 18; i < 28; i++) {
					decoded.name += bytes[i].toString();
				}
				for (i = 28; i < 40; i++) {
					decoded.country += bytes[i].toString();
				}
				for (i = 39; i < 50; i++) {
					decoded.phone += bytes[i].toString();
				}
			}
			decoded.location = "(" + decoded.latitude + "," + decoded.longitude + ")";
			break;
		case 0xCD:
			decoded.sos = 0;
			break;
		case 0xCE:
			decoded.alarm = 0x01;
			decoded.alarm_lvl = bytes[10];
			break;
	}
	return decoded;
}