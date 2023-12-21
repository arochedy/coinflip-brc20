import GetCookie from "@/hooks/cookies/getCookie";
import axios from "axios";

export const DepositBTC = async (txnId: string, address: string) => {
  const val = GetCookie('userId');
  const userId = parseInt(val != '' ? val : '0');
  return await axios.post('https://flickthebean.onrender.com/exchange/deposit_btc', {
    userId: userId,
    transactionId: txnId,
    address: address,
  })
}

export const DepositARC = async (txnId: string, address: string) => {
  const val = GetCookie('userId');
  const userId = parseInt(val != '' ? val : '0');
  console.log(userId);
  return await axios.post('https://flickthebean.onrender.com/exchange/deposit_arc', {
    userId: userId,
    transactionId: txnId,
    address: address,
  })
}

export const WithdrawARC = async (txnId: string, address: string, withdrawAddress: string, amount: number) => {
  const val = GetCookie('userId');
  const userId = parseInt(val != '' ? val : '0');
  return await axios.post('https://flickthebean.onrender.com/exchange/withdraw_arc', {
    userId: userId,
    transactionId: txnId,
    address: address,
    withdrawAddress: withdrawAddress,
    amount: amount,
  })
}