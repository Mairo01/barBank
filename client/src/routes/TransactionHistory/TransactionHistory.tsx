import {ReactElement, useEffect, useState} from 'react'
import authService from "../../services/authService";
import {Transaction} from "../../Interfaces";
import './TransactionHistory.css';

export default function TransactionHistory(): ReactElement {
  const [userTransactions, setUserTransactions] = useState<Array<Transaction> | string>()
  const dateFormat = (date: Date) => new Date(date).toLocaleString()
  const balanceFormat = (amount: number, currency: string): string =>
    (amount / 100).toLocaleString('fi-FI', { style: 'currency', currency: currency })

  useEffect((): void => {
    const transactionHistory = () => (authService.transactionHistory())

    transactionHistory()
      .then(r => setUserTransactions(r.data))
      .catch(() => setUserTransactions("Could not retrieve transaction history"))
  }, [])

  const userDetailsTemplate = (): JSX.Element[] | JSX.Element => {
    return typeof userTransactions === "object"
      ? userTransactions.map((transaction: Transaction, index: number) =>
          <div className="transaction" key={"transaction-" + index}>
            <div className="transaction-status"> Status: { transaction.status }</div>
            <div className="transaction-id"> ID: { transaction.id }</div>
            <div className="transaction-date"> Date: { dateFormat(transaction.createdAt) }</div>
            <div className="transaction-receiver"> Receiver: { transaction.receiverName }</div>
            <div className="transaction-receiverNr"> Receiver Account: { transaction.accountTo }</div>
            <div className="transaction-amount"> Amount: { balanceFormat(transaction.amount, transaction.currency) }</div>
            <div className="transaction-explanation"> Explanation: { transaction.explanation }</div>
          </div>
        )
      : <div>{ userTransactions }</div>
  }

  return (
    <div>
      <h3>Transaction history</h3>
        <div className="transaction-history">
          { userDetailsTemplate() }
        </div>
    </div>
  )
}
