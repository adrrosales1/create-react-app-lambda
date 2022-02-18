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
    let dateCodes: any = {'34': '2022-12', '36': '2023-01', '38': '2023-02', '3A': '2023-03', '3B': '2023-03', '3C': '2023-04', '3D': '2023-05', '3E': '2023-05', '3F': '2023-06', '40': '2023-06', '41': '2023-06', '42': '2023-07'}
    let separeted = base64ToHex(str).slice(8).slice(0, -2).match(/.{1,18}/g)
    let response: any = {}
    if(separeted?.length != null ){
        for (const n of separeted) {
            let useful = n.slice(13)
            let date = dateCodes[useful.slice(0, -3)] ? dateCodes[useful.slice(0, -3)] : "???";
            let percentage = parseInt(useful.slice(3), 16);
            response[date] = (response[date] ? response[date] : 0) + percentage
        }
    }
    return response
}
