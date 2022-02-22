import BigNumber from 'bignumber.js';

export default function nominate(input: string, paramDenomination?: number) {
  const parts = input.toString().split('.');
  const denomination = paramDenomination !== undefined ? paramDenomination : 18;

  if (parts[1]) {
    // remove trailing zeros
    while (parts[1].substring(parts[1].length - 1) === '0' && parts[1].length > 1) {
      parts[1] = parts[1].substring(0, parts[1].length - 1);
    }
  }

  let count = parts[1] ? denomination - parts[1].length : denomination;

  count = count < 0 ? 0 : count;

  let transformed = parts.join('') + '0'.repeat(count);

  // remove beginning zeros
  while (transformed.substring(0, 1) === '0' && transformed.length > 1) {
    transformed = transformed.substring(1);
  }

  return transformed;
}

export const nominateValToHex = (value: string) => {
  let val = value && value.length > 0 ? new BigNumber(nominate(value)).toString(16) : '0';

  if (val.length % 2 !== 0) {
    val = '0' + val;
  }

  return val;
};

export const toHex = (value: string) => {
  
  let val = value ? new BigNumber(value).toString(16) : '0';
  if (val.length % 2 !== 0) {
    val = '0' + val;
  }
  return val;

};

export const  base64ToHex = (str:string) => {
    const raw = atob(str);
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16);
      result += (hex.length === 2 ? hex : '0' + hex);
    }
    return result.toUpperCase();
}

export const  lkmexDates = (str:string) => {
  let offset = 0;
  let currentEpoch = 188
  let epochDurationHours = 2 // For tesnet 2
  
  const buff = Buffer.from(str, "base64");
  const nbElems = parseInt(buff.toString("hex", offset, (offset += 4)), 16);
  let response: any = {}
  if(nbElems > 0 ){
      for (let i = 0; i < nbElems; i++) {
        let epoch = parseInt(buff.toString("hex", offset, (offset += 8)), 16);
        epoch = epoch + 24;
        const percent = parseInt(buff.toString("hex", offset, (offset += 8)), 16) / 1000    
        let remainingEpochs = epoch - currentEpoch;
        const newDate = new Date();
        newDate.setHours(newDate.getHours() + (remainingEpochs*epochDurationHours));
        console.log(newDate);
        let key = newDate.toLocaleString('en', { month: 'long' }) + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();

        response[key] = percent
      }
  }
  return response
}

export const buf2hex = (buffer: any) => { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
}

export const hex2a = (hexx: any) => {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}