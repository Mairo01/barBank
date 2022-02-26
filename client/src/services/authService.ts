import axios, {AxiosPromise} from "axios";
import authHeader from "./authHeader";
import {LogInData, RegisterData, Transaction, TransactionData, UserDetails} from "../Interfaces";

function accountInfo(): AxiosPromise<UserDetails> {
  return axios.get('/users/current', { headers: authHeader() })
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem("user")
}

function logIn(user: LogInData): AxiosPromise {
  return axios.post('/sessions', {
    username: user.username,
    password: user.password
  })
}

function logOut(): AxiosPromise {
  return axios.delete('/sessions',
    { headers: authHeader() })
    .finally(() => localStorage.removeItem("user"))
}

function register(user: RegisterData): AxiosPromise {
  return axios.post('/users', {
    name: user.fullName,
    username: user.username,
    password: user.password
  })
}

async function transferFunds(transaction: TransactionData): Promise<AxiosPromise> {
  const user = await accountInfo().then(r => r.data)

  axios.defaults.headers.common = authHeader()
  return axios.post('/transactions', {
    "explanation": transaction.explanation,
    "amount": (transaction.amount * 100).toFixed(0),
    "accountTo": transaction.accountTo,
    "accountFrom": user.account.number,
  })
}

function transactionHistory(): AxiosPromise<Array<Transaction>> {
  return axios.get('/transactions/', { headers: authHeader() })
}

export default {
  logIn,
  logOut,
  register,
  isLoggedIn,
  accountInfo,
  transferFunds,
  transactionHistory
}
