/* eslint-disable no-restricted-globals */
import { replace } from 'lodash';
import numeral from 'numeral';

// ----------------------------------------------------------------------

export function fCurrency(number) {
  return numeral(number).format(Number.isInteger(number) ? '$0,0' : '$0,0.00');
}

export function fPercent(number) {
  return numeral(number / 100).format('0.0%');
}

export function fNumber(number) {
  return numeral(number).format();
}

export function fShortenNumber(number) {
  return replace(numeral(number).format('0.00a'), '.00', '');
}

export function fData(number) {
  return numeral(number).format('0.0 b');
}

export function formatMoney(amount) {
  // Convert amount to a number if it's not already
  amount = parseFloat(amount);

  // Check if amount is a valid number
  if (isNaN(amount)) {
    return 'Invalid amount';
  }

  // Format the amount with 2 decimal places and comma separator
  const formattedAmount = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');

  // Add currency symbol
  return `₦${formattedAmount}`;
}


export const formatNumber = (num) => {
  if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)  }B`;
  } if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)  }M`;
  } if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)  }K`;
  } 
      return num.toString();
  
}