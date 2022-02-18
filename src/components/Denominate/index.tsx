import React from 'react';
import { useContext } from '../../context';
import denominate from './formatters';
import BigNumber from "bignumber.js";

interface DenominateType {
  value: string;
  ticker?: string;
  showLastNonZeroDecimal?: boolean;
  showErd?: boolean;
  decimals?: number;
}

const Denominate = ({
  value,
  ticker = 'eGLD',
  showLastNonZeroDecimal = false,
  showErd = true,
  decimals,
}: DenominateType) => {
  const { denomination, decimals: configDecimals } = useContext();

  decimals = decimals !== undefined ? decimals : configDecimals;

  const denominatedValue = denominate({
    input: (new BigNumber(value)).toFixed(),
    denomination,
    decimals,
    showLastNonZeroDecimal,
  });

  const valueParts = denominatedValue.split('.');
  const hasNoDecimals = valueParts.length === 1;
  const isNotZero = denominatedValue !== '0';

  if (decimals > 0 && hasNoDecimals && isNotZero) {
    let zeros = '';

    for (let i = 1; i <= decimals; i++) {
      zeros = zeros + '0';
    }

    valueParts.push(zeros);
  }

  return (
    <span data-testid="denominateComponent">
      <span className="int-amount">{valueParts[0]}</span>
      {valueParts.length > 1 && <span className="decimals">.{valueParts[1]}</span>}
      <br className='d-block d-sm-none'/>
      {showErd && <span className="symbol">&nbsp;{ticker}</span> }
    </span>
  );
};

export default Denominate;
