interface LogInData {
  username: string,
  password: string
}

interface RegisterData{
  fullName: string,
  username: string,
  password: string
}

interface Transaction {
  accountFrom: string,
  accountTo: string,
  createdAt: Date,
  currency: string,
  explanation: string,
  amount: number,
  id: string,
  receiverName: string,
  senderName: string,
  status: string,
  statusDetail: string
}

interface TransactionData {
  "explanation": string,
  "amount": number,
  "accountTo": string,
  "accountFrom": string
}

interface UserDetails {
  "name": string,
  "username": string,
  "account": {
    "name": "Main",
    "number": string,
    "balance": number,
    "currency": string
  }
}

export type {
  LogInData,
  RegisterData,
  Transaction,
  TransactionData,
  UserDetails
}
