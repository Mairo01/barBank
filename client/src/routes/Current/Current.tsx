import {ReactElement, useEffect, useState} from "react";
import authService from "../../services/authService";
import './Current.css';
import {UserDetails} from "../../Interfaces";

export default function Current(): ReactElement {
  const [userDetails, setUserDetails] = useState<UserDetails | string>("")
  const balanceFormat = (balance: number, currency: string): string =>
    (balance / 100).toLocaleString('fi-FI', { style: 'currency', currency: currency })

  useEffect(() => {
    const user = (): void => {
      authService.accountInfo()
        .then(r => setUserDetails(r.data))
        .catch(e => setUserDetails(e.response.data.error))
    }

    user()
  }, [])

  const userDetailsTemplate = (): JSX.Element => {
    return typeof userDetails === "object"
        ? <div className="user-details">
            <div>Account type: { userDetails.account.name }</div>
            <div>Account number: { userDetails.account.number }</div>
            <div>Name: { userDetails.name }</div>
            <div>Username: { userDetails.username }</div>
            <div>Balance: { balanceFormat(userDetails.account.balance, userDetails.account.currency) }</div>
          </div>
        : <div>{ userDetails }</div>
  }

  return (
    <div>
      <h3>Account Information</h3>
      { userDetailsTemplate() }
    </div>
  )
}
